-- =============================================================
-- AI生成ログ
-- AI生成の前後の要約（対象媒体・モデル・件数・成否）を保存する。
-- ※ APIキーや完全なプロンプト・機密情報は保存しない（要約のみ）。
-- =============================================================

create table ai_generation_logs (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artists(id) on delete cascade,
  content_source_id uuid references content_sources(id) on delete set null,
  platform_summary text not null,
  model text,
  used_mock boolean not null default false,
  post_count integer not null default 0,
  ok boolean not null default true,
  error_message text,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create index idx_ai_logs_artist on ai_generation_logs(artist_id);
create index idx_ai_logs_source on ai_generation_logs(content_source_id);

alter table ai_generation_logs enable row level security;

create policy ai_logs_select on ai_generation_logs for select
  using (fn_is_member(artist_id));
create policy ai_logs_insert on ai_generation_logs for insert
  with check (fn_is_member(artist_id) and fn_can_write());
