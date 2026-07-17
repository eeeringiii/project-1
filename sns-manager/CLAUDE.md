# CLAUDE.md — SNS統合運用ツール 開発ルール

このファイルは `sns-manager/` アプリの開発における必須ルールです。作業前に必ず確認してください。

## プロジェクトの目的

所属アーティスト向けのSNS統合運用ツール。1つの告知情報から各媒体（X / Instagram / TikTok / YouTube / HP）の投稿案をAIが生成し、担当者・本人の確認/承認を経て、予約投稿・カレンダー管理を行う。現時点の所属アーティストは1名だが、**将来的に複数アーティストへ拡張できる設計**（全データは `artist_id` を起点に持つ）。

## 使用技術

- Next.js 16（App Router）/ React 19 / TypeScript
- Tailwind CSS v4
- Zod / date-fns（Asia/Tokyo）/ lucide-react
- Vitest
- Phase 2 以降: Supabase（Auth / PostgreSQL / Storage・RLS）、Anthropic API

## コーディング規約

- **UI言語は日本語**。ユーザー向け文言はすべて日本語にする。
- **TypeScriptで `any` を原則使用しない**。型は `src/types` に定義し使い回す。
- **APIキー・シークレットをコードへ直接書かない**。環境変数（`.env.local`）から読む。
- **APIキーやシークレットをクライアント側に露出させない**。`NEXT_PUBLIC_` を付けてよいのは公開可能な値のみ。
- **外部API連携（Anthropic / SNS）は必ずサーバーサイド**（Route Handler / Server Action）で行う。
- **ユーザー入力は Zod で検証する**（`src/schemas`）。AI出力も Zod で検証する。
- **日付はタイムゾーンを考慮する。標準タイムゾーンは Asia/Tokyo**。日付処理は `src/lib/date.ts` を経由する。
- **日付と曜日の不一致をチェックする**（`services/warnings.ts`）。
- **未解禁情報をログや画面に不用意に表示しない**。解禁日時前の公開は警告する。
- **承認前の投稿を自動公開しない**。公開は承認済み→予約済みを経てのみ。

## ディレクトリルール

- UIコンポーネント（`components/`, `features/`）と**ビジネスロジック（`services/`）を分離する**。
- データアクセスは `repositories/` に集約する（Phase 1 は `store.tsx`、Phase 2 で Supabase へ差し替え。`useStore()` の公開IFは維持）。
- 定数・ラベルは `constants/` に一元化し、画面へ文字列を直書きしない。
- モックデータは `mock/` にのみ置く。

## 命名規則

- ファイル: コンポーネントは PascalCase（`PostListView.tsx`）、それ以外は kebab/camel（`status-flow.ts`）。
- 型・インターフェース: PascalCase。関数・変数: camelCase。定数: UPPER_SNAKE_CASE。
- ドメイン型のフィールドは camelCase、DB（SQL）は snake_case。境界（repository）で変換する。

## 変更時の必須手順

- **変更前に既存コードを確認する**。同種のUI/ロジックが既にあれば再利用する。
- **重複コンポーネント／重複ロジックを作らない**。
- **既存機能を壊さない**（特に他プロジェクト `taisei-site/`・`app/` には触れない）。
- **各実装後に型チェックを実行する**：`npm run typecheck`
- **各実装後に Lint を実行する**：`npm run lint`
- **各フェーズ後にビルドする**：`npm run build`
- **エラーを放置したまま次へ進まない**。原因を調査し修正してから進む。
- **データベース変更時はマイグレーションを作る**（`supabase/migrations/`）。
- 一度にすべてを実装せず、**フェーズごとに実装する**。

## ステータスと承認フロー

ステータス: `draft / ai_generated / staff_review / artist_review / revision_requested / approved / scheduled / publishing / published / failed / cancelled`

フロー: 下書き → AI生成済み → 担当者確認中 →（本人確認が必要な場合のみ）本人確認中 → 承認済み → 予約済み → 投稿処理中 → 投稿完了。差し戻し時は `revision_requested` にしコメントを残す。遷移ロジックは `services/status-flow.ts` に集約。

## 権限（role）

`admin / manager / staff / artist / viewer`。UI操作可否は `services/permissions.ts` の `can()` で判定。Phase 2 では Supabase RLS がサーバー側の最終防衛線。

## 仮の値として扱うもの（勝手に確定しない）

本番ドメイン / アーティストの正式名称 / SNSアカウントID / APIキー / 本番のSupabase情報 / SNS APIのアクセストークン / 外部公開設定。これらはすべて仮値のまま実装する。
