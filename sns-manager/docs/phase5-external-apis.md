# Phase 5：外部SNS API連携 設計（実装しない・設計のみ）

> 本ドキュメントは**設計のみ**。指示があるまで実装は開始しない。
> すべての連携は**サーバーサイド**（Route Handler / ジョブワーカー）で行い、トークン等の機密は
> クライアントへ露出させず、**平文でDB保存しない**（Supabase Vault / KMS で暗号化管理）。

各サービス共通の整理観点：必要なAPI / 認証 / 権限 / 審査 / 投稿可能コンテンツ / API制限 / 料金 / エラー処理 / トークン更新 / セキュリティリスク。

---

## 1. X（旧Twitter）

- **必要なAPI**: X API v2（`POST /2/tweets`、メディアは v1.1 `media/upload` または v2 メディアエンドポイント）。
- **認証**: OAuth 2.0 Authorization Code + PKCE（ユーザーコンテキスト）。
- **必要な権限（scope）**: `tweet.read`, `tweet.write`, `users.read`, `offline.access`（リフレッシュトークン取得）, メディアアップロード権限。
- **審査**: 開発者アカウント審査あり。用途申請が必要。
- **投稿可能コンテンツ**: テキスト（〜280字/日本語は実質140字目安）、画像・動画・GIF、スレッド。
- **API制限**: プラン依存の月間投稿上限・レート制限。無料枠は書き込みが極めて限定的。
- **料金**: Free / Basic / Pro などの有料階層。運用規模に応じて Basic 以上が現実的。
- **エラー処理**: 429（レート制限→`x-rate-limit-reset` に従いバックオフ）、401/403（トークン失効→再認証）、重複投稿検出。
- **トークン更新**: `offline.access` のリフレッシュトークンで更新。失効時は再認可フロー。
- **セキュリティリスク**: トークン漏洩による成りすまし投稿。scope 最小化・保管暗号化・失効時即時無効化。

## 2. Instagram（Instagram Graph API）

- **必要なAPI**: Instagram Graph API（Facebookプラットフォーム）。コンテナ作成 `POST /{ig-user-id}/media` → 公開 `POST /{ig-user-id}/media_publish`。
- **認証**: Facebook Login（OAuth 2.0）。**プロアカウント**かつ Facebookページ連携が前提。
- **必要な権限**: `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`, `business_management` 等。
- **審査**: App Review 必須（本番権限）。ビジネス認証が必要な場合あり。
- **投稿可能コンテンツ**: フィード画像/動画、リール、カルーセル。ストーリーは制約あり。画像/動画は公開URL経由。
- **API制限**: 24時間あたりの公開数上限（例: 25件/日程度）、レート制限。
- **料金**: API利用自体は無料（Metaプラットフォーム規約に従う）。
- **エラー処理**: メディア処理の非同期ステータス確認（`status_code`）、公開前のコンテナ検証、権限失効。
- **トークン更新**: 短期トークン→長期トークン（約60日）へ交換し、定期リフレッシュ。
- **セキュリティリスク**: ページ/ビジネス資産への広範なアクセス。権限最小化と資産スコープの限定。

## 3. TikTok（Content Posting API）

- **必要なAPI**: TikTok Content Posting API（Direct Post もしくは Upload）。
- **認証**: OAuth 2.0（TikTok for Developers）。
- **必要な権限（scope）**: `video.upload`, `video.publish`（Direct Post は追加審査・許可が必要）。
- **審査**: アプリ審査あり。Direct Post 利用には追加の許可申請。未許可時は「下書き送り」までの場合がある。
- **投稿可能コンテンツ**: 縦型動画（一定の解像度/長さ/コーデック要件）、キャプション、一部フォトモード。
- **API制限**: レート制限、動画サイズ・長さ・形式の制約。
- **料金**: API利用は無料（規約順守が前提）。
- **エラー処理**: アップロード進捗/公開ステータスのポーリング、コーデック不適合の事前検証。
- **トークン更新**: リフレッシュトークンで更新。
- **セキュリティリスク**: 動画アップロード権限の悪用。アップロード元検証・トークン保護。

## 4. YouTube（YouTube Data API v3）

- **必要なAPI**: YouTube Data API v3（`videos.insert` で動画アップロード、`thumbnails.set`、`playlistItems.insert`）。
- **認証**: Google OAuth 2.0（ユーザーコンテキスト）。
- **必要な権限（scope）**: `https://www.googleapis.com/auth/youtube.upload`, `youtube`, `youtube.force-ssl`。
- **審査**: OAuth同意画面の審査。アップロード枠拡大には監査申請が必要な場合あり。
- **投稿可能コンテンツ**: 長尺動画・Shorts（`#Shorts`）、タイトル・概要・タグ・公開設定・サムネイル・再生リスト。
- **API制限**: 1日あたりのクォータ（`videos.insert` は高コスト＝約1600ユニット/回）。既定1万ユニット/日。
- **料金**: 標準クォータは無料。超過は割当増加申請。
- **エラー処理**: 再開可能アップロード（resumable upload）、クォータ超過（`quotaExceeded`）時の翌日リトライ。
- **トークン更新**: リフレッシュトークンで更新。
- **セキュリティリスク**: チャンネルへの全アップロード権限。scope最小化・トークン暗号化・監査ログ。

## 5. オリジナルHP（自社API）

- **必要なAPI**: 自社CMS/HP側に「記事公開API」を用意（例: `POST /api/news` with 署名付きリクエスト）。
- **認証**: サーバー間の APIキー or 署名（HMAC）。相互TLSも検討。
- **必要な権限**: 記事の作成/更新/公開権限（発行トークンをロール限定）。
- **審査**: なし（自社管理）。
- **投稿可能コンテンツ**: NEWS記事（タイトル/本文/OGP/公開日時/画像）、ページ、メタ情報。
- **API制限**: 自社設定（レート・本文サイズ）。
- **料金**: ホスティング費のみ。
- **エラー処理**: 冪等キーで重複公開防止、公開日時の予約、失敗時リトライ。
- **トークン更新**: APIキーのローテーション運用。
- **セキュリティリスク**: 公開APIの不正利用。IP制限・署名検証・監査ログ・最小権限トークン。

## 6. note（note.com）

> **重要（正直な制約）**: note には**公式の記事投稿APIが存在しない**。他媒体のような
> OAuth + REST での自動投稿はできず、実公開は**ヘッドレスブラウザ自動操作**
> （Playwright 等でログイン→エディタ入力→公開）に頼るしかない。この方式は
> note 側のUI変更・2要素認証・CAPTCHA で壊れうるため、**完全自動公開は非推奨**であり
> 「AIが記事下書きを自動生成 → 人が承認 → （任意で）自動公開」を基本線とする。

- **必要なAPI**: 公式APIなし。ヘッドレスブラウザ（Playwright/Chromium）による自動操作で代替。
- **認証**: note のメール/パスワードによる**フォームログイン**。`NOTE_EMAIL` / `NOTE_PASSWORD`
  を環境変数で管理（コード・DB に平文で置かない。可能なら暗号化ストアへ）。2要素認証が
  有効なアカウントは自動ログイン不可（無効化 or 手動介入が必要）。
- **必要な権限**: 本人アカウントのログイン権限のみ。第三者アカウントの自動操作はしない。
- **審査**: なし（ただし note 利用規約の自動化に関する条項を必ず確認する）。
- **投稿可能コンテンツ**: 記事（タイトル・本文・見出し・画像・タグ）、下書き保存、公開。
- **実行環境**: **Vercel のサーバーレス関数では Chromium を起動できない**。実公開は
  常駐ワーカー / GitHub Actions / セルフホスト等の Node ランタイムで実行する。
- **エラー処理**: セレクタ変更・タイムアウト・ログイン失敗を検知し `driver_error` として
  ジョブを失敗にする。二重公開防止のため公開後URLを冪等キーとして保存する。
- **セキュリティリスク**: ログイン情報の漏洩＝アカウント乗っ取り。環境変数の保護、
  ログへの認証情報出力禁止、失効時の即時ローテーション。

### アダプタ実装（`src/services/note-publisher.ts`）

検証可能な責務（認証情報の取得・承認ガード・入力のZod検証・driver例外の包装）を
サービス側に実装済み。実ブラウザ操作は `NotePublishDriver` インターフェースへ委譲する
ため、ブラウザ無しでオーケストレーションをテストできる（`note-publisher.test.ts`）。

Node 環境で下記のような Playwright driver を用意して差し込む（**セレクタは note の
現行UIに合わせて要調整**。以下は構造の参考）:

```ts
// 例: node-worker 側でのみ import（アプリ本体には含めない）
import { chromium } from "playwright";
import type { NotePublishDriver } from "@/services/note-publisher";

export const playwrightNoteDriver: NotePublishDriver = {
  async publishArticle(creds, input) {
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      await page.goto("https://note.com/login");
      await page.fill('input[type="email"]', creds.email);
      await page.fill('input[type="password"]', creds.password);
      await page.click('button[type="submit"]');
      // …記事作成画面へ遷移し、タイトル/本文/タグを入力…
      // input.publish が true なら公開、false なら下書き保存
      // …公開後の記事URL・IDを取得して返す（セレクタは要調整）…
      return { externalPostId: "n/xxxx", url: "https://note.com/.../n/xxxx", published: input.publish };
    } finally {
      await browser.close();
    }
  },
};
```

呼び出し側は承認済み（`approved`/`scheduled` 以降）の投稿のみを渡すこと。
`publishPostToNote` 内でも承認前・本人未承認は拒否する。

---

## 共通設計方針

- 連携は `publishing_jobs` をキューとして実行し、結果を `publishing_results` に保存する（Phase 4 の基盤を利用）。
- トークンは `social_accounts` に平文保存せず、暗号化ストア（Supabase Vault 等）に保管し、参照キーのみ持つ。
- すべての外部呼び出しに**指数バックオフ**と**冪等キー**を導入し、二重投稿を防止する。
- 未解禁（embargo前）投稿は公開しない。承認済み→予約済みを経た投稿のみジョブ化する。
- 監査のため、各公開の要求/結果（機密を除く）をログに残す。
