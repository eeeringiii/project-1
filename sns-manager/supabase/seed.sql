-- =============================================================
-- デモ用シードデータ（Phase 2）
-- Supabase SQL Editor もしくは `supabase db reset` 後に実行する。
-- 注意:
--   * users は auth.users への外部キーがあるため、ここでは投入しない。
--     サインアップ後に「ユーザー登録手順」（README参照）で users / artist_members を追加する。
--   * created_by 等は NULL で投入（サインアップ済みユーザーのUUIDに後から更新可）。
--   * SQL Editor は service role 実行のため RLS を回避してINSERTできる。
-- =============================================================

-- 固定UUID（デモ用）
-- アーティスト
insert into artists (id, name, stage_name, profile, brand_concept)
values (
  '00000000-0000-0000-0000-0000000000a1',
  'サンプルアーティスト', 'SAMPLE',
  '架空のソロアーティスト。※本番の正式名称は未確定のため仮の値。',
  '等身大の言葉と洗練されたサウンドで日常に彩りを。'
)
on conflict (id) do nothing;

-- キャンペーン
insert into campaigns (id, artist_id, name, description, status) values
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000a1', '新曲リリース', 'ニューシングル「アオイロ」配信リリース。', 'active'),
  ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000a1', 'ライブ開催', 'ワンマンライブ『SAMPLE LIVE 2026』', 'active'),
  ('00000000-0000-0000-0000-0000000000c3', '00000000-0000-0000-0000-0000000000a1', 'グッズ販売', 'オフィシャルグッズ 受注販売。', 'planning')
on conflict (id) do nothing;

-- ブランドルール
insert into brand_rules (artist_id, rule_type, rule_name, rule_value, is_active) values
  ('00000000-0000-0000-0000-0000000000a1', 'artist_name', 'アーティスト名', 'サンプルアーティスト', true),
  ('00000000-0000-0000-0000-0000000000a1', 'artist_hashtag', '共通ハッシュタグ', '#サンプルアーティスト', true),
  ('00000000-0000-0000-0000-0000000000a1', 'tone_official', '公式アカウントの口調', '丁寧・簡潔。過度な絵文字は避ける。', true),
  ('00000000-0000-0000-0000-0000000000a1', 'ng_word', 'NGワード', '限定,絶対,必ず', true),
  ('00000000-0000-0000-0000-0000000000a1', 'required_notice', '必須表記', '©SAMPLE', true)
on conflict do nothing;

-- 元コンテンツ
insert into content_sources
  (id, artist_id, campaign_id, title, source_text, purpose, related_url, requires_artist_approval, target_platforms)
values (
  '00000000-0000-0000-0000-0000000000e1',
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-0000000000c1',
  'ニューシングル「アオイロ」配信リリース',
  'サンプルアーティストのニューシングル「アオイロ」が全配信サービスでリリース。',
  '配信リリースの告知と初動再生の最大化',
  'https://example.com/release/aoiro',
  true,
  array['x','instagram','tiktok','youtube','website']::platform[]
)
on conflict (id) do nothing;

-- 投稿（各媒体・混在ステータスの一部）
insert into social_posts
  (artist_id, campaign_id, content_source_id, platform, post_type, title, body, hashtags, status, requires_artist_approval)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000e1', 'x', 'official_announcement', 'アオイロ配信告知（X・公式）', 'ニューシングル「アオイロ」配信スタート🌊', array['#サンプルアーティスト','#アオイロ'], 'approved', true),
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000c2', null, 'instagram', 'feed', 'ライブ告知（IG）', 'ワンマンライブ開催決定🎉', array['#サンプルアーティスト'], 'staff_review', false),
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000e1', 'website', 'news', 'NEWS: アオイロ配信リリース', 'ニューシングル「アオイロ」を配信リリースいたします。', array[]::text[], 'scheduled', false)
on conflict do nothing;
