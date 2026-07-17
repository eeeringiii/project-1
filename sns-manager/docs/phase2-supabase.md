# Phase 2：Supabase 連携 セットアップ手順

このアプリは **2モード**で動作します。

| モード | 条件 | 挙動 |
| --- | --- | --- |
| モック | `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` 未設定 | localStorage にモックデータを保存（Phase 1 と同じ） |
| Supabase | 上記2つが設定済み | 起動時にDBからロード、各操作をDBへ書き込みスルー、認証は Supabase Auth |

コードは「接続レディ」の状態です。以下を行うだけで実インスタンスに接続できます。

## 1. Supabase プロジェクト作成

1. [supabase.com](https://supabase.com) でプロジェクトを作成。
2. `Project Settings → API` から以下を取得：
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`（**サーバー専用・秘匿**）

## 2. マイグレーション適用

`supabase/migrations/` を順に適用します。

- Supabase CLI を使う場合：
  ```bash
  supabase link --project-ref <your-ref>
  supabase db push          # 0001 → 0002 → 0003 の順で適用
  psql "$DATABASE_URL" -f supabase/seed.sql   # 任意: デモデータ投入
  ```
- もしくは SQL Editor に `0001_init.sql` → `0002_rls.sql` → `0003_storage.sql` → （任意）`seed.sql` を貼り付けて実行。

`0003_storage.sql` で公開バケット `media` が作成されます。

## 3. 環境変数

```bash
cp .env.example .env.local
# .env.local を編集して 1. で取得した値を設定
```

`NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が設定されると、アプリは自動的に Supabase モードになります。

## 4. ユーザー登録（重要）

`users` テーブルは `auth.users` を参照します。RLS は `users.role` と `artist_members` を見て権限判定するため、**サインアップ後にアプリ用ユーザー行と担当関係を作成**します。

1. アプリの `/login` からサインアップ（または Supabase ダッシュボードの Authentication でユーザー作成）。
2. 作成された auth ユーザーの UUID を控える（Authentication → Users）。
3. SQL Editor で以下を実行（`<AUTH_UID>` を置換）：
   ```sql
   insert into users (id, name, email, role)
   values ('<AUTH_UID>', 'マネージャー 花子', 'manager@example.com', 'manager');

   insert into artist_members (artist_id, user_id)
   values ('00000000-0000-0000-0000-0000000000a1', '<AUTH_UID>');
   ```
   > `role` は `admin / manager / staff / artist / viewer` から選択。
   > `artist_id` は `seed.sql` のデモアーティストUUID。

これで、そのユーザーは対象アーティストのデータを RLS 経由で読み書きできます。

## 5. 動作確認

```bash
npm run dev
```

- `/login` から Supabase 認証でログイン
- リロードしてもデータが保持される（DB永続）
- 権限（role）により操作可否が変わる（RLS＋UI制御）
- 素材追加でファイルが `media` バケットにアップロードされ、公開URLで表示される

## メモ / 今後の厳密化

- 現状 `currentUser` は起動時に `users` 先頭を暫定選択。Phase 2 の仕上げで `auth.uid()` と厳密に紐付け予定。
- 列単位の権限（artist は本人承認関連の列のみ更新）は、RPC（SECURITY DEFINER 関数）へ寄せて厳密化予定。
- service role は予約投稿ジョブ（Phase 4）等のサーバー処理でのみ使用。
