-- =============================================================
-- Row Level Security（RLS）ポリシー
-- 権限設計（admin / manager / staff / artist / viewer）に対応。
-- サーバー側の最終防衛線。UI側の permissions.ts と役割を合わせる。
--
-- 注意: 列単位の制御（例: artist は本人承認に関わる列のみ更新）は
--       Phase 2 で SECURITY DEFINER 関数（RPC）経由の更新に寄せて厳密化する。
--       ここでは行レベルの基本ポリシーを定義する。
-- =============================================================

-- ---- ヘルパ関数 ----
create or replace function fn_current_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from users where id = auth.uid();
$$;

-- 対象アーティストの担当メンバーか（admin は常に true）
create or replace function fn_is_member(target_artist uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select
    fn_current_role() = 'admin'
    or exists (
      select 1 from artist_members m
      where m.artist_id = target_artist and m.user_id = auth.uid()
    );
$$;

create or replace function fn_can_write()
returns boolean language sql stable as $$
  select fn_current_role() in ('admin', 'manager', 'staff');
$$;

create or replace function fn_can_approve()
returns boolean language sql stable as $$
  select fn_current_role() in ('admin', 'manager');
$$;

-- ---- RLS 有効化 ----
alter table users enable row level security;
alter table artists enable row level security;
alter table artist_members enable row level security;
alter table campaigns enable row level security;
alter table content_sources enable row level security;
alter table media_assets enable row level security;
alter table social_posts enable row level security;
alter table post_media enable row level security;
alter table post_versions enable row level security;
alter table approvals enable row level security;
alter table status_histories enable row level security;
alter table social_accounts enable row level security;
alter table brand_rules enable row level security;
alter table prompt_templates enable row level security;
alter table publishing_jobs enable row level security;
alter table publishing_results enable row level security;
alter table analytics_daily enable row level security;

-- ---- users ----
create policy users_select_self_or_admin on users for select
  using (id = auth.uid() or fn_current_role() = 'admin');
create policy users_admin_write on users for all
  using (fn_current_role() = 'admin') with check (fn_current_role() = 'admin');

-- ---- artists / artist_members ----
create policy artists_select on artists for select
  using (fn_is_member(id));
create policy artists_admin_write on artists for all
  using (fn_current_role() = 'admin') with check (fn_current_role() = 'admin');

create policy members_select on artist_members for select
  using (fn_is_member(artist_id));
create policy members_admin_write on artist_members for all
  using (fn_current_role() = 'admin') with check (fn_current_role() = 'admin');

-- ---- campaigns ----
create policy campaigns_select on campaigns for select using (fn_is_member(artist_id));
create policy campaigns_write on campaigns for all
  using (fn_is_member(artist_id) and fn_can_write())
  with check (fn_is_member(artist_id) and fn_can_write());

-- ---- content_sources ----
create policy content_select on content_sources for select using (fn_is_member(artist_id));
create policy content_write on content_sources for all
  using (fn_is_member(artist_id) and fn_can_write())
  with check (fn_is_member(artist_id) and fn_can_write());

-- ---- media_assets ----
create policy media_select on media_assets for select using (fn_is_member(artist_id));
create policy media_write on media_assets for all
  using (fn_is_member(artist_id) and fn_can_write())
  with check (fn_is_member(artist_id) and fn_can_write());

-- ---- social_posts ----
-- 閲覧: 全メンバー。作成/編集: 書き込み権限者。
-- artist ロールは本人確認のため、自アーティストの投稿を閲覧・更新できる（列制御はRPCで厳密化）。
create policy posts_select on social_posts for select using (fn_is_member(artist_id));
create policy posts_insert on social_posts for insert
  with check (fn_is_member(artist_id) and fn_can_write());
create policy posts_update on social_posts for update
  using (
    fn_is_member(artist_id)
    and (fn_can_write() or fn_current_role() = 'artist')
  )
  with check (fn_is_member(artist_id));
create policy posts_delete on social_posts for delete
  using (fn_is_member(artist_id) and fn_can_approve());

-- ---- 子テーブル（social_post 経由でアーティスト判定） ----
create or replace function fn_post_member(post_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select fn_is_member(sp.artist_id) from social_posts sp where sp.id = post_id;
$$;

create policy post_media_select on post_media for select using (fn_post_member(social_post_id));
create policy post_media_write on post_media for all
  using (fn_post_member(social_post_id) and fn_can_write())
  with check (fn_post_member(social_post_id) and fn_can_write());

create policy versions_select on post_versions for select using (fn_post_member(social_post_id));
create policy versions_insert on post_versions for insert
  with check (fn_post_member(social_post_id));

create policy approvals_select on approvals for select using (fn_post_member(social_post_id));
create policy approvals_write on approvals for all
  using (fn_post_member(social_post_id))
  with check (fn_post_member(social_post_id));

create policy histories_select on status_histories for select using (fn_post_member(social_post_id));
create policy histories_insert on status_histories for insert
  with check (fn_post_member(social_post_id));

-- ---- social_accounts / brand_rules / prompt_templates ----
create policy accounts_select on social_accounts for select using (fn_is_member(artist_id));
create policy accounts_admin_write on social_accounts for all
  using (fn_is_member(artist_id) and fn_current_role() in ('admin','manager'))
  with check (fn_is_member(artist_id) and fn_current_role() in ('admin','manager'));

create policy rules_select on brand_rules for select using (fn_is_member(artist_id));
create policy rules_write on brand_rules for all
  using (fn_is_member(artist_id) and fn_current_role() in ('admin'))
  with check (fn_is_member(artist_id) and fn_current_role() in ('admin'));

create policy templates_select on prompt_templates for select
  using (artist_id is null or fn_is_member(artist_id));
create policy templates_admin_write on prompt_templates for all
  using (fn_current_role() = 'admin') with check (fn_current_role() = 'admin');

-- ---- publishing / analytics ----
create policy jobs_select on publishing_jobs for select using (fn_post_member(social_post_id));
create policy jobs_write on publishing_jobs for all
  using (fn_post_member(social_post_id) and fn_can_write())
  with check (fn_post_member(social_post_id) and fn_can_write());

create policy results_select on publishing_results for select
  using (exists (select 1 from publishing_jobs j where j.id = publishing_job_id and fn_post_member(j.social_post_id)));

create policy analytics_select on analytics_daily for select using (fn_post_member(social_post_id));
create policy analytics_write on analytics_daily for all
  using (fn_post_member(social_post_id) and fn_current_role() in ('admin','manager'))
  with check (fn_post_member(social_post_id) and fn_current_role() in ('admin','manager'));
