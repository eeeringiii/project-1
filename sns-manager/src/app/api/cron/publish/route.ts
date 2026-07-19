import "server-only";

/**
 * 予約投稿の配信cron（Phase 4）
 *
 * Vercel Cron から定期的に呼ばれ、予定時刻を過ぎた queued ジョブをモック実行する。
 * - 認証: Authorization: Bearer <CRON_SECRET>（Vercel Cron が自動付与）
 * - Supabase 未設定時は何もしない（モックモードはクライアント側で手動実行）
 * - 実際のSNS API連携は行わない（Phase 5 で runJob 内部を差し替え）
 *
 * service role を使うため RLS を跨いで全ジョブを処理できる。機密はレスポンスに含めない。
 */
import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/server";
import {
  publishingJobFromRow,
  publishingJobToRow,
  publishingResultToRow,
  socialPostFromRow,
  socialPostToRow,
} from "@/repositories/supabase/mappers";
import { runJob } from "@/services/publishing";
import type { PublishingJobRow, SocialPostRow } from "@/types/database";

export async function GET(request: Request) {
  // 認証
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const sb = getServiceRoleClient();
  if (!sb) {
    return NextResponse.json({
      ok: true,
      skipped: "Supabase未設定のためスキップ（モックモードはクライアントで手動実行）",
    });
  }

  const nowIso = new Date().toISOString();

  // 予定時刻を過ぎた待機中ジョブを取得
  const { data: jobRows, error } = await sb
    .from("publishing_jobs")
    .select("*")
    .eq("status", "queued")
    .lte("scheduled_at", nowIso);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let succeeded = 0;
  let failed = 0;

  for (const jr of (jobRows ?? []) as PublishingJobRow[]) {
    const job = publishingJobFromRow(jr);
    const { data: postRow } = await sb
      .from("social_posts")
      .select("*")
      .eq("id", job.socialPostId)
      .single();
    if (!postRow) continue;
    const post = socialPostFromRow(postRow as SocialPostRow);

    const outcome = runJob(job, post);
    await sb.from("publishing_jobs").upsert(publishingJobToRow(outcome.job));
    await sb.from("social_posts").upsert(socialPostToRow(outcome.post));
    if (outcome.result) {
      await sb
        .from("publishing_results")
        .insert(publishingResultToRow(outcome.result));
      succeeded += 1;
    } else {
      failed += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    processed: (jobRows ?? []).length,
    succeeded,
    failed,
    at: nowIso,
  });
}
