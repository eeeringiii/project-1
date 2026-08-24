/**
 * note（note.com）向け Playwright driver（NotePublishDriver 実装）
 *
 * ⚠️ 重要な前提（正直に）:
 * - note には公式の記事投稿APIが無いため、ログイン〜公開をブラウザ自動操作で行う。
 * - 下記セレクタは note の *現行UIに合わせて要調整* の参考値。note 側のUI変更で壊れる。
 * - 2要素認証・CAPTCHA が有効なアカウントは自動ログインできない（事前に無効化が必要）。
 * - Vercel サーバーレスでは Chromium を起動できない。Node ランタイムで実行すること。
 * - 認証情報はログへ出力しない。失敗時のスクショにも入力値が写り込みうる点に注意。
 */
import { chromium, type Browser, type Page } from "playwright";
import type {
  NoteCredentials,
  NotePublishDriver,
  NotePublishInput,
  NotePublishResult,
} from "@/services/note-publisher";

/** driver の挙動設定（すべて任意・環境変数で上書き可能） */
export interface NoteDriverOptions {
  /** ヘッドレス実行（既定 true）。デバッグ時は false */
  headless?: boolean;
  /** 各操作のタイムアウト(ms)（既定 30000） */
  timeoutMs?: number;
  /** 失敗時にスクショを保存するパス（任意） */
  screenshotOnErrorPath?: string;
  /** note のベースURL（既定 https://note.com） */
  baseUrl?: string;
}

const DEFAULTS = {
  headless: true,
  timeoutMs: 30_000,
  baseUrl: "https://note.com",
};

/**
 * 環境変数から driver 設定を読む。
 * NOTE_HEADLESS=false でヘッドフル、NOTE_TIMEOUT_MS で個別タイムアウト。
 */
export function noteDriverOptionsFromEnv(
  env: Record<string, string | undefined> = process.env,
): NoteDriverOptions {
  return {
    headless: env.NOTE_HEADLESS !== "false",
    timeoutMs: env.NOTE_TIMEOUT_MS ? Number(env.NOTE_TIMEOUT_MS) : undefined,
    screenshotOnErrorPath: env.NOTE_ERROR_SCREENSHOT,
    baseUrl: env.NOTE_BASE_URL,
  };
}

/** note の記事URLから記事ID（末尾 n/xxxx）を抜き出す */
export function extractNoteId(url: string): string {
  const m = url.match(/\/n\/([A-Za-z0-9]+)/);
  return m ? `n/${m[1]}` : url;
}

/**
 * NotePublishDriver の Playwright 実装を生成する。
 * publishArticle 内のセレクタは note の現行UIに合わせて調整すること（TODO 参照）。
 */
export function createNoteDriver(
  options: NoteDriverOptions = {},
): NotePublishDriver {
  const opts = { ...DEFAULTS, ...clean(options) };

  return {
    async publishArticle(
      credentials: NoteCredentials,
      input: NotePublishInput,
    ): Promise<NotePublishResult> {
      const browser: Browser = await chromium.launch({
        headless: opts.headless,
      });
      let page: Page | undefined;
      try {
        page = await browser.newPage();
        page.setDefaultTimeout(opts.timeoutMs);

        await login(page, credentials, opts.baseUrl);
        const url = await writeArticle(page, input, opts.baseUrl);

        return {
          externalPostId: extractNoteId(url),
          url,
          published: input.publish,
        };
      } catch (e) {
        if (page && opts.screenshotOnErrorPath) {
          await page
            .screenshot({ path: opts.screenshotOnErrorPath, fullPage: true })
            .catch(() => undefined);
        }
        // 認証情報は含めず、原因のみを投げる（呼び出し側で driver_error に包まれる）
        throw new Error(e instanceof Error ? e.message : String(e));
      } finally {
        await browser.close();
      }
    },
  };
}

// ── 内部実装（セレクタは要調整）─────────────────────────────

async function login(
  page: Page,
  credentials: NoteCredentials,
  baseUrl: string,
): Promise<void> {
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });

  // TODO(note-ui): メール/パスワードの入力欄セレクタは現行UIに合わせて要確認。
  await page.fill('input[type="email"], input[name="email"]', credentials.email);
  await page.fill(
    'input[type="password"], input[name="password"]',
    credentials.password,
  );

  // TODO(note-ui): ログインボタンのセレクタ。文言変更に注意。
  await page.click('button[type="submit"]');

  // ログイン完了（トップ or マイページへの遷移）を待つ。
  await page.waitForLoadState("networkidle");
}

async function writeArticle(
  page: Page,
  input: NotePublishInput,
  baseUrl: string,
): Promise<string> {
  // 新規テキスト記事エディタ。TODO(note-ui): 実際の新規作成URL/導線を確認。
  await page.goto(`${baseUrl}/notes/new`, { waitUntil: "domcontentloaded" });

  // タイトル。TODO(note-ui): placeholder 文言・要素種別を確認。
  await page.fill(
    '[placeholder="記事タイトル"], textarea[placeholder*="タイトル"]',
    input.title,
  );

  // 本文（contenteditable）。TODO(note-ui): エディタ本体のセレクタを確認。
  const body = page.locator('[contenteditable="true"]').first();
  await body.click();
  await body.type(input.body);

  if (!input.publish) {
    // 下書き保存でとめる。TODO(note-ui): 「下書き保存」導線を確認。
    await page.click('text=下書き保存');
    await page.waitForLoadState("networkidle");
    return page.url();
  }

  // 公開フロー。TODO(note-ui): 「公開に進む」→ タグ入力 →「投稿する」の各導線を確認。
  await page.click('text=公開に進む');

  for (const tag of input.hashtags) {
    const normalized = tag.replace(/^#/, "");
    if (!normalized) continue;
    // TODO(note-ui): タグ入力欄のセレクタを確認。
    const tagInput = page.locator('input[placeholder*="ハッシュタグ"]').first();
    if (await tagInput.count()) {
      await tagInput.fill(normalized);
      await tagInput.press("Enter");
    }
  }

  // TODO(note-ui): 最終公開ボタン（「投稿する」/「公開する」）の文言を確認。
  await page.click('text=投稿する');
  await page.waitForLoadState("networkidle");

  return page.url();
}

/** undefined を除いた設定を返す（既定値とマージするため） */
function clean(o: NoteDriverOptions): NoteDriverOptions {
  return Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== undefined),
  ) as NoteDriverOptions;
}
