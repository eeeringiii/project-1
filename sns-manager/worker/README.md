# note 自動公開ワーカー

承認済み→予約済み（`status=scheduled`）で予定時刻を過ぎた **note（note.com）** 投稿を、
ヘッドレスブラウザ（Playwright）でログインして自動公開する Node ワーカーです。

> **なぜ別ワーカーなのか**：note には公式の記事投稿APIが無く、公開はブラウザ自動操作に
> 頼るしかありません。**Vercel のサーバーレス関数では Chromium を起動できない**ため、
> アプリ本体（`sns-manager/`）とは切り離し、独自の `package.json` / `node_modules` を持つ
> このワーカーを Node ランタイム（GitHub Actions / 常駐サーバー等）で実行します。

## 正直な制約

- note 側の **UI変更・2要素認証・CAPTCHA** で壊れます。完全自動公開は非推奨で、
  基本は「AIが下書き自動生成 → 人が承認 → このワーカーで公開」です。
- 自動ログインするアカウントは **2要素認証を無効**にしておく必要があります。
- `note-driver.ts` のセレクタは **参考値**です。note の現行UIに合わせて `TODO(note-ui)`
  箇所を必ず確認・調整してください。
- 認証情報はログに出力しません。失敗時スクショ（`NOTE_ERROR_SCREENSHOT`）には
  入力画面が写る場合があるため取り扱いに注意してください。

## 必要な環境変数

| 変数 | 用途 |
| --- | --- |
| `SUPABASE_URL`（または `NEXT_PUBLIC_SUPABASE_URL`） | Supabase プロジェクトURL |
| `SUPABASE_SERVICE_ROLE_KEY` | service role キー（RLSを跨ぐため厳重管理） |
| `NOTE_EMAIL` | note ログインメール |
| `NOTE_PASSWORD` | note ログインパスワード |
| `NOTE_HEADLESS`（任意） | `false` でヘッドフル（デバッグ用）。既定 `true` |
| `NOTE_TIMEOUT_MS`（任意） | 各操作のタイムアウト(ms)。既定 30000 |
| `NOTE_ERROR_SCREENSHOT`（任意） | 失敗時スクショの保存先パス |
| `NOTE_BASE_URL`（任意） | note のベースURL。既定 `https://note.com` |

## ローカル実行

```bash
cd sns-manager/worker
npm install
npx playwright install chromium   # ブラウザ本体（初回のみ）
export SUPABASE_URL=...            # 認証情報はシェル履歴に残さない運用を推奨
export SUPABASE_SERVICE_ROLE_KEY=...
export NOTE_EMAIL=...
export NOTE_PASSWORD=...
npm run publish-notes
```

デバッグ時は `NOTE_HEADLESS=false` で実際のブラウザ操作を目視できます。

## CI（GitHub Actions）での定期実行

`.github/workflows/note-publish.yml` が 15分ごと（および手動）に本ワーカーを実行します。
上表の値をリポジトリの **Actions Secrets** に登録してください（値そのものはコードに置かない）。

## 動作

1. `social_posts` から `platform='note'` かつ `status='scheduled'` かつ予定時刻を過ぎた投稿を取得。
2. 公開直前に `status='publishing'` へ更新（多重実行の簡易ガード）。
3. `publishPostToNote()`（アプリ本体の `src/services/note-publisher.ts`）で承認ガード・
   入力検証を通したうえで、Playwright driver がログイン→公開。
4. 成功なら `status='published'` と公開URLを、失敗なら `status='failed'` とエラーを書き戻す。

承認前（`scheduled` 未満）や本人未承認の投稿は `publishPostToNote()` 内で拒否されます。
