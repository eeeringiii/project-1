/**
 * note 自動公開ワーカー エントリポイント
 *
 * 承認済み→予約済み（status=scheduled）で予定時刻を過ぎた note 投稿を取得し、
 * Playwright driver 経由で公開する。結果は social_posts に書き戻す。
 *
 * 実行前提:
 * - Node ランタイム（GitHub Actions / 常駐ワーカー等）。Vercel サーバーレス不可。
 * - 環境変数:
 *     SUPABASE_URL（または NEXT_PUBLIC_SUPABASE_URL）
 *     SUPABASE_SERVICE_ROLE_KEY
 *     NOTE_EMAIL / NOTE_PASSWORD
 *     （任意）NOTE_HEADLESS / NOTE_TIMEOUT_MS / NOTE_ERROR_SCREENSHOT / NOTE_BASE_URL
 *
 * 使い方: `npm run publish-notes`
 */
import { createClient } from "@supabase/supabase-js";
import {
  socialPostFromRow,
  socialPostToRow,
} from "@/repositories/supabase/mappers";
import {
  isNoteAutoPublishConfigured,
  NotePublishError,
  publishPostToNote,
} from "@/services/note-publisher";
import type { SocialPostRow } from "@/types/database";
import { createNoteDriver, noteDriverOptionsFromEnv } from "./note-driver";

function requireEnv(...names: string[]): string {
  for (const n of names) {
    const v = process.env[n];
    if (v && v.trim()) return v.trim();
  }
  throw new Error(`環境変数 ${names.join(" / ")} が未設定です。`);
}

async function main(): Promise<void> {
  const supabaseUrl = requireEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!isNoteAutoPublishConfigured()) {
    throw new Error(
      "note の認証情報（NOTE_EMAIL / NOTE_PASSWORD）が未設定です。処理を中止します。",
    );
  }

  const sb = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const nowIso = new Date().toISOString();

  // 承認済み→予約済み（scheduled）かつ予定時刻を過ぎた note 投稿を取得
  const { data: rows, error } = await sb
    .from("social_posts")
    .select("*")
    .eq("platform", "note")
    .eq("status", "scheduled")
    .lte("scheduled_at", nowIso);

  if (error) throw new Error(`投稿の取得に失敗: ${error.message}`);

  const posts = ((rows ?? []) as SocialPostRow[]).map(socialPostFromRow);
  console.log(`[note-worker] 対象 ${posts.length} 件（${nowIso}）`);

  const driver = createNoteDriver(noteDriverOptionsFromEnv());
  let succeeded = 0;
  let failed = 0;

  for (const post of posts) {
    const startedIso = new Date().toISOString();
    try {
      // 公開前に「投稿処理中」へ（多重実行の簡易ガード）
      await sb
        .from("social_posts")
        .update({ status: "publishing", updated_at: startedIso })
        .eq("id", post.id)
        .eq("status", "scheduled");

      const result = await publishPostToNote(post, driver, { publish: true });

      const doneIso = new Date().toISOString();
      await sb.from("social_posts").upsert(
        socialPostToRow({
          ...post,
          status: "published",
          publishedAt: doneIso,
          publishedUrl: result.url,
          errorMessage: null,
          updatedAt: doneIso,
        }),
      );
      succeeded += 1;
      console.log(`[note-worker] 公開成功 post=${post.id} url=${result.url}`);
    } catch (e) {
      const message =
        e instanceof NotePublishError
          ? `[${e.code}] ${e.message}`
          : e instanceof Error
            ? e.message
            : String(e);
      const doneIso = new Date().toISOString();
      await sb.from("social_posts").upsert(
        socialPostToRow({
          ...post,
          status: "failed",
          errorMessage: message,
          updatedAt: doneIso,
        }),
      );
      failed += 1;
      // 認証情報は message に含めない設計（driver 側でも除外済み）
      console.error(`[note-worker] 公開失敗 post=${post.id}: ${message}`);
    }
  }

  console.log(
    `[note-worker] 完了: 成功 ${succeeded} / 失敗 ${failed} / 対象 ${posts.length}`,
  );
  if (failed > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(`[note-worker] 異常終了: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
