import "server-only";

/**
 * note（note.com）自動公開アダプタ
 *
 * note には公式の「記事投稿API」が存在しない。そのため実際の公開は、
 * ヘッドレスブラウザ（Playwright 等）でログイン → エディタ操作 → 公開、という
 * 自動操作に頼るしかない。本モジュールはその「統合境界（driver）」を型付きで定義し、
 * 認証情報の取得・入力検証・冪等性のためのガードといった *検証可能な部分* を担う。
 * 実ブラウザ操作そのものは NotePublishDriver 実装（別途 Node 環境で用意）に委譲する。
 *
 * ── 正直な制約（実装・運用時に必ず理解しておくこと）──────────────
 * 1. 認証情報（メール/パスワード）は環境変数から読む。コードに直書きしない。
 * 2. Vercel のサーバーレス関数では Chromium を起動できない。実公開は常駐ワーカー /
 *    GitHub Actions / セルフホスト等の Node ランタイムで実行する。
 * 3. note 側の UI 変更・2要素認証・CAPTCHA により壊れうる。成功は保証されない。
 * 4. 承認前の投稿は絶対に公開しない。呼び出し側で承認済み（approved/scheduled 以降・
 *    本人確認が必要なら本人承認済み）であることを保証すること。ここでもガードする。
 */
import { z } from "zod";
import type { SocialPost } from "@/types/domain";

/** 環境変数マップ（process.env 互換の最小形。テストで部分指定できる） */
type EnvLike = Record<string, string | undefined>;

/** 環境変数から読む note ログイン認証情報 */
export interface NoteCredentials {
  email: string;
  password: string;
}

/**
 * 環境変数から note の認証情報を取得する。
 * 未設定（どちらか欠け）の場合は null を返す（自動公開は無効扱い）。
 * NEXT_PUBLIC_ を付けないこと。クライアントへ絶対に露出させない。
 */
export function getNoteCredentials(
  env: EnvLike = process.env,
): NoteCredentials | null {
  const email = env.NOTE_EMAIL?.trim();
  const password = env.NOTE_PASSWORD;
  if (!email || !password) return null;
  return { email, password };
}

/** note 自動公開が構成済みか（認証情報が揃っているか） */
export function isNoteAutoPublishConfigured(
  env: EnvLike = process.env,
): boolean {
  return getNoteCredentials(env) !== null;
}

/** driver へ渡す公開入力 */
export interface NotePublishInput {
  /** 記事タイトル */
  title: string;
  /** 記事本文（プレーンテキスト/Markdown想定。driver 側でエディタへ流し込む） */
  body: string;
  /** note のハッシュタグ（# は付けても付けなくても driver 側で正規化） */
  hashtags: string[];
  /** true: 公開まで行う / false: 下書き保存でとめる */
  publish: boolean;
}

/** driver からの公開結果 */
export interface NotePublishResult {
  /** note 側の記事ID（URL 末尾の n/xxxx 等） */
  externalPostId: string;
  /** 公開/下書きのURL */
  url: string;
  /** 公開まで到達したか（false は下書き止まり） */
  published: boolean;
}

/**
 * 実ブラウザ操作の抽象。Playwright 実装などをここに差し込む。
 * このインターフェースを介すことで、オーケストレーション部分をブラウザ無しでテストできる。
 */
export interface NotePublishDriver {
  publishArticle(
    credentials: NoteCredentials,
    input: NotePublishInput,
  ): Promise<NotePublishResult>;
}

/** 公開入力のバリデーション（Zod）。AI生成/ユーザー入力どちらも検証する。 */
export const notePublishInputSchema = z.object({
  title: z.string().trim().min(1, "タイトルが空です"),
  body: z.string().trim().min(1, "本文が空です"),
  hashtags: z.array(z.string()).default([]),
  publish: z.boolean().default(false),
});

/** 公開してよいステータスか（承認前の自動公開を防ぐ最後の砦） */
const PUBLISHABLE_STATUSES: SocialPost["status"][] = [
  "approved",
  "scheduled",
  "publishing",
];

export class NotePublishError extends Error {
  constructor(
    message: string,
    readonly code:
      | "not_configured"
      | "not_approved"
      | "artist_not_approved"
      | "invalid_input"
      | "driver_error",
  ) {
    super(message);
    this.name = "NotePublishError";
  }
}

/** SocialPost から driver 入力を組み立てる */
export function toNotePublishInput(
  post: SocialPost,
  publish: boolean,
): NotePublishInput {
  return {
    title: post.title,
    body: post.body,
    hashtags: post.hashtags,
    publish,
  };
}

/**
 * note へ記事を公開（または下書き保存）する。
 *
 * 検証可能な責務のみをここで担う:
 *  - 認証情報の存在チェック（未設定なら not_configured で失敗）
 *  - 承認ガード（承認前の自動公開を拒否）
 *  - 入力の Zod 検証
 * 実際のブラウザ操作は driver に委譲する。driver 例外は driver_error で包む。
 *
 * @param post   公開対象の投稿（承認済みであること）
 * @param driver 実公開を行う driver（Playwright 実装など）
 * @param opts.publish true で公開、false で下書き保存（既定 true）
 * @param opts.env    認証情報を読む環境（テスト差し替え用）
 */
export async function publishPostToNote(
  post: SocialPost,
  driver: NotePublishDriver,
  opts: { publish?: boolean; env?: EnvLike } = {},
): Promise<NotePublishResult> {
  const { publish = true, env = process.env } = opts;

  if (post.platform !== "note") {
    throw new NotePublishError(
      `note 以外の媒体（${post.platform}）は publishPostToNote では扱えません。`,
      "invalid_input",
    );
  }

  const credentials = getNoteCredentials(env);
  if (!credentials) {
    throw new NotePublishError(
      "note の認証情報（NOTE_EMAIL / NOTE_PASSWORD）が未設定です。",
      "not_configured",
    );
  }

  // 承認前の自動公開を拒否（公開する場合のみ厳格にチェック）
  if (publish) {
    if (!PUBLISHABLE_STATUSES.includes(post.status)) {
      throw new NotePublishError(
        `承認前の投稿（status=${post.status}）は公開できません。`,
        "not_approved",
      );
    }
    if (post.requiresArtistApproval && !post.artistApprovedAt) {
      throw new NotePublishError(
        "本人確認が必要ですが、本人承認がありません。",
        "artist_not_approved",
      );
    }
  }

  const parsed = notePublishInputSchema.safeParse(
    toNotePublishInput(post, publish),
  );
  if (!parsed.success) {
    throw new NotePublishError(
      `公開入力が不正です: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      "invalid_input",
    );
  }

  try {
    return await driver.publishArticle(credentials, parsed.data);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    throw new NotePublishError(
      `note への公開処理に失敗しました: ${detail}`,
      "driver_error",
    );
  }
}
