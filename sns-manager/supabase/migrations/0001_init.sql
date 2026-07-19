-- =============================================================
-- SNS統合運用ツール 初期スキーマ
-- Phase 2 で Supabase に適用する。
-- 方針:
--   * 全エンティティは artist_id を起点に持ち、将来の複数アーティスト対応に備える
--   * 機密情報（アクセストークン等）は平文で保存しない
--   * updated_at は共通トリガで自動更新
-- =============================================================

create extension if not exists "pgcrypto";

-- ---- 列挙型 ----
create type user_role as enum ('admin', 'manager', 'staff', 'artist', 'viewer');
create type platform as enum ('x', 'instagram', 'tiktok', 'youtube', 'website');
create type post_status as enum (
  'draft', 'ai_generated', 'staff_review', 'artist_review', 'revision_requested',
  'approved', 'scheduled', 'publishing', 'published', 'failed', 'cancelled'
);
create type approval_type as enum ('staff', 'artist', 'final');
create type approval_status as enum ('pending', 'approved', 'rejected');
create type campaign_status as enum ('planning', 'active', 'finished', 'archived');
create type media_category as enum (
  'artist_photo', 'announcement_image', 'jacket', 'logo', 'video',
  'mv', 'live_footage', 'thumbnail', 'press', 'product_image'
);
create type publishing_job_status as enum (
  'queued', 'running', 'succeeded', 'failed', 'cancelled'
);

-- ---- 共通: updated_at 自動更新トリガ ----
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---- users（Supabase auth.users と 1:1） ----
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role user_role not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- artists ----
create table artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stage_name text,
  profile text,
  brand_concept text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 将来の複数アーティスト対応: ユーザーとアーティストの担当関係
create table artist_members (
  artist_id uuid not null references artists(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (artist_id, user_id)
);

-- ---- campaigns ----
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artists(id) on delete cascade,
  name text not null,
  description text,
  start_at timestamptz,
  end_at timestamptz,
  status campaign_status not null default 'planning',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- content_sources ----
create table content_sources (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artists(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  title text not null,
  source_text text not null,
  purpose text,
  related_url text,
  embargo_at timestamptz,
  event_at timestamptz,
  venue_name text,
  product_name text,
  product_price integer,
  notes text,
  ai_instruction text,
  requires_artist_approval boolean not null default false,
  target_platforms platform[] not null default '{}',
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- media_assets ----
create table media_assets (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artists(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  category media_category not null,
  file_name text not null,
  file_url text not null,
  file_type text,
  mime_type text,
  file_size bigint,
  width integer,
  height integer,
  duration integer,
  usage_start_at timestamptz,
  usage_end_at timestamptz,
  allowed_platforms platform[] not null default '{}',
  rights_note text,
  credit_text text,
  tags text[] not null default '{}',
  notes text,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- social_posts ----
create table social_posts (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artists(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  content_source_id uuid references content_sources(id) on delete set null,
  platform platform not null,
  post_type text not null,
  title text,
  body text,
  hashtags text[] not null default '{}',
  image_text_suggestions text[] not null default '{}',
  important_facts jsonb not null default '[]',
  scheduled_at timestamptz,
  embargo_at timestamptz,
  status post_status not null default 'draft',
  requires_artist_approval boolean not null default false,
  artist_approved_at timestamptz,
  approved_by uuid references users(id),
  approved_at timestamptz,
  published_at timestamptz,
  published_url text,
  error_message text,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- post_media（投稿と素材の中間） ----
create table post_media (
  id uuid primary key default gen_random_uuid(),
  social_post_id uuid not null references social_posts(id) on delete cascade,
  media_asset_id uuid not null references media_assets(id) on delete cascade,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (social_post_id, media_asset_id)
);

-- ---- post_versions ----
create table post_versions (
  id uuid primary key default gen_random_uuid(),
  social_post_id uuid not null references social_posts(id) on delete cascade,
  version_number integer not null,
  title text,
  body text,
  hashtags text[] not null default '{}',
  changed_by uuid references users(id),
  change_summary text,
  created_at timestamptz not null default now()
);

-- ---- approvals ----
create table approvals (
  id uuid primary key default gen_random_uuid(),
  social_post_id uuid not null references social_posts(id) on delete cascade,
  approval_type approval_type not null,
  status approval_status not null default 'pending',
  requested_by uuid references users(id),
  requested_to uuid references users(id),
  comment text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- status_histories ----
create table status_histories (
  id uuid primary key default gen_random_uuid(),
  social_post_id uuid not null references social_posts(id) on delete cascade,
  previous_status post_status,
  new_status post_status not null,
  changed_by uuid references users(id),
  comment text,
  created_at timestamptz not null default now()
);

-- ---- social_accounts（機密トークンは保存しない） ----
create table social_accounts (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artists(id) on delete cascade,
  platform platform not null,
  account_name text,
  account_identifier text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table social_accounts is
  'アクセストークン等の機密情報はここに平文保存しない。Supabase Vault 等で別管理する。';

-- ---- brand_rules ----
create table brand_rules (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artists(id) on delete cascade,
  rule_type text not null,
  rule_name text not null,
  rule_value text,
  platform platform,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- prompt_templates ----
create table prompt_templates (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references artists(id) on delete cascade,
  platform platform not null,
  post_type text not null,
  name text not null,
  system_prompt text,
  user_prompt_template text,
  version integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- publishing_jobs ----
create table publishing_jobs (
  id uuid primary key default gen_random_uuid(),
  social_post_id uuid not null references social_posts(id) on delete cascade,
  platform platform not null,
  scheduled_at timestamptz not null,
  status publishing_job_status not null default 'queued',
  retry_count integer not null default 0,
  last_error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- publishing_results ----
create table publishing_results (
  id uuid primary key default gen_random_uuid(),
  publishing_job_id uuid not null references publishing_jobs(id) on delete cascade,
  external_post_id text,
  published_url text,
  response_data jsonb,
  created_at timestamptz not null default now()
);

-- ---- analytics_daily ----
create table analytics_daily (
  id uuid primary key default gen_random_uuid(),
  social_post_id uuid not null references social_posts(id) on delete cascade,
  platform platform not null,
  date date not null,
  impressions integer,
  views integer,
  likes integer,
  comments integer,
  shares integer,
  saves integer,
  clicks integer,
  followers_gained integer,
  watch_time integer,
  average_view_duration integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (social_post_id, date)
);

-- ---- インデックス ----
create index idx_campaigns_artist on campaigns(artist_id);
create index idx_content_sources_artist on content_sources(artist_id);
create index idx_media_assets_artist on media_assets(artist_id);
create index idx_social_posts_artist on social_posts(artist_id);
create index idx_social_posts_status on social_posts(status);
create index idx_social_posts_scheduled on social_posts(scheduled_at);
create index idx_social_posts_platform on social_posts(platform);
create index idx_post_versions_post on post_versions(social_post_id);
create index idx_status_histories_post on status_histories(social_post_id);
create index idx_approvals_post on approvals(social_post_id);
create index idx_publishing_jobs_status on publishing_jobs(status);
create index idx_analytics_post_date on analytics_daily(social_post_id, date);

-- ---- updated_at トリガ ----
do $$
declare t text;
begin
  foreach t in array array[
    'users','artists','campaigns','content_sources','media_assets','social_posts',
    'approvals','social_accounts','brand_rules','prompt_templates','publishing_jobs',
    'analytics_daily'
  ] loop
    execute format(
      'create trigger trg_%1$s_updated_at before update on %1$s
       for each row execute function set_updated_at();', t
    );
  end loop;
end $$;
