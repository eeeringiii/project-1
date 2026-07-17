# SNS統合運用ツール（アーティスト事務所向け）

所属アーティスト向けに、**1つの告知情報から各SNS媒体（X / Instagram / TikTok / YouTube / HP）の投稿案をAIが自動生成し、担当者・本人の確認/承認を経て、予約投稿・カレンダー管理**まで行うための統合運用ツールです。

> このリポジトリの `sns-manager/` は、既存の `taisei-site/`（アーティストHP）や `app/`（別アプリ）とは独立した Next.js アプリです。他プロジェクトには影響しません。

## 動作モード（重要）

このアプリは環境変数の有無で自動的に切り替わります。**どちらのモードでもUI・操作は同一**です。

| モード | 条件 | データの保存先 | 認証 |
| --- | --- | --- | --- |
| **モック**（既定） | Supabase未設定 | ブラウザの localStorage | モック認証 |
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` 設定時 | Supabase PostgreSQL / Storage | Supabase Auth |

Supabase接続の手順は [`docs/phase2-supabase.md`](./docs/phase2-supabase.md) を参照してください（マイグレーション適用・ユーザー登録・バケット作成込み）。

**AI生成（Phase 3）**：`ANTHROPIC_API_KEY` を設定すると、サーバー(`/api/generate`)経由で Anthropic API を媒体ごとに呼び出し、ブランドルールを反映した投稿案を生成します（Zod検証・一部再生成・生成履歴つき）。未設定時はモック生成にフォールバックするため、キーなしでも動作確認できます。APIキーはサーバーサイドのみで扱い、クライアントには露出しません。

## Phase 1（モックMVP）で実装済みの機能

外部SNS API・Supabase・Anthropic API に未接続でも、**モックデータで一通り操作できる**状態です。

- ✅ ログイン（モック認証）／未ログイン時のアクセス制御
- ✅ ダッシュボード（当日・今週の予定、確認待ち件数、媒体別、最近の投稿、キャンペーン、ステータス一覧）
- ✅ コンテンツ新規作成（元情報・対象媒体・素材アップロードUI）
- ✅ AI投稿生成（**モック生成**、媒体・投稿タイプ別、生成後編集可）
- ✅ 投稿編集（本文/タイトル/ハッシュタグ/公開日時/本人確認、プレビュー、下書き保存）
- ✅ 承認フロー（確認依頼→担当者確認→本人確認→承認→予約、差し戻し＋コメント）
- ✅ 投稿一覧（検索・媒体/ステータス/日付/キャンペーンフィルター・並び替え・一括ステータス変更）
- ✅ カレンダー（月/週表示、媒体・ステータス切替、ドラッグ&ドロップで日時変更、集中・解禁前の警告）
- ✅ 素材管理（カテゴリ別、権利/クレジット/使用期限、期限切れ警告）
- ✅ ブランドルール設定（口調・NGワード・必須表記など、AI生成の参照ルール）
- ✅ 重要情報の抽出と投稿前チェック（解禁前公開・文字数超過・日付/曜日不一致 など）
- ✅ 権限（admin / manager / staff / artist / viewer）によるUI操作制御
- ✅ レスポンシブ（PC / スマートフォン）

## 技術構成

- Next.js 16（App Router, Turbopack）/ React 19 / TypeScript
- Tailwind CSS v4
- Zod（入力・AI出力検証）/ date-fns（Asia/Tokyo）/ lucide-react（アイコン）
- Vitest（ドメインロジックのユニットテスト）
- Phase 2 以降: Supabase（Auth / PostgreSQL / Storage・RLS）、Anthropic API（サーバーサイド）
- デプロイ想定: Vercel

## セットアップ

```bash
cd sns-manager
npm install
cp .env.example .env.local   # 値は各自で設定（Phase 2以降で使用）
npm run dev                  # http://localhost:3000
```

ログイン画面では、任意のメールアドレスとパスワード（4文字以上）でログインできます（モック認証）。
ヘッダー右上で「操作ユーザー（権限）」を切り替えると、権限ごとの操作制御を確認できます。
ヘッダーのリセットボタンでモックデータを初期状態に戻せます。

## スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー |
| `npm run lint` | ESLint |
| `npm run typecheck` | 型チェック（`tsc --noEmit`） |
| `npm run test` | Vitest（ドメインロジック） |

## ディレクトリ構成

```
sns-manager/
├── src/
│   ├── app/                  # App Router（(app) グループ配下が認証必須画面）
│   ├── components/
│   │   ├── ui/               # 汎用UI（Card/Button/Modal/Toast/Badge...）
│   │   └── layout/           # Sidebar / Header / AppShell / nav
│   ├── features/             # 画面単位のドメインUI（dashboard/content/posts/calendar/media/brand）
│   ├── services/             # ドメインロジック（承認フロー・警告・重要情報抽出・権限・AI生成）
│   ├── repositories/         # データアクセス（Phase1=store.tsx / Phase2=Supabase差替）
│   ├── schemas/              # Zodスキーマ
│   ├── types/                # 型定義
│   ├── constants/            # 媒体/ステータス/権限などの定数・ラベル
│   ├── mock/                 # モックデータ（seed）
│   └── lib/                  # 汎用ユーティリティ（date / auth）
├── supabase/migrations/      # マイグレーションSQL（Phase 2で適用）
└── docs/                     # 設計ドキュメント（Phase 5 外部連携設計など）
```

UI / ドメインロジック / データアクセス / バリデーション / 型 / 定数 / モックを分離しています。

## データの持続について

- **モックモード**：ブラウザの `localStorage` に保存（リロード後も保持）。アップロード画像/動画はセッション内のローカルプレビューのみ。
- **Supabaseモード**：全データを PostgreSQL に永続化（RLS適用）。素材は Storage バケット `media` にアップロードし公開URLで参照。認証は Supabase Auth。

## 実装フェーズ

| フェーズ | 内容 | 状態 |
| --- | --- | --- |
| Phase 1 | 画面とモックデータ | ✅ 完了 |
| Phase 2 | Supabase 連携（Auth/DB/Storage/RLS/CRUD） | ✅ 接続レディ（`.env.local` 設定で有効化） |
| Phase 3 | Anthropic API 連携（媒体別プロンプト/Zod検証/再生成/履歴） | ✅ 実装済み（`ANTHROPIC_API_KEY` 未設定時はモック生成） |
| Phase 4 | 予約投稿ジョブ基盤（モック実行・リトライ・結果保存） | 予定 |
| Phase 5 | 外部SNS API 連携（**設計のみ**、`docs/phase5-external-apis.md`） | 設計 |

詳細な開発ルールは [`CLAUDE.md`](./CLAUDE.md) を参照してください。
