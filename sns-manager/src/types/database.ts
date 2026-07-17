/**
 * Supabase テーブルの行型（snake_case）
 *
 * supabase/migrations のスキーマに対応。アプリのドメイン型（camelCase, types/domain.ts）とは
 * repositories/supabase の mapper 層で相互変換する。
 *
 * ※ 本番では `supabase gen types typescript` で自動生成した型に置き換え可能。
 *   ここでは実インスタンス無しでも型安全に開発できるよう手書きの行型を用意する。
 */
import type {
  ApprovalStatus,
  ApprovalType,
  CampaignStatus,
  MediaCategory,
  Platform,
  PostStatus,
  PublishingJobStatus,
  UserRole,
} from "./domain";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ArtistRow {
  id: string;
  name: string;
  stage_name: string | null;
  profile: string | null;
  brand_concept: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignRow {
  id: string;
  artist_id: string;
  name: string;
  description: string | null;
  start_at: string | null;
  end_at: string | null;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
}

export interface ContentSourceRow {
  id: string;
  artist_id: string;
  campaign_id: string | null;
  title: string;
  source_text: string;
  purpose: string | null;
  related_url: string | null;
  embargo_at: string | null;
  event_at: string | null;
  venue_name: string | null;
  product_name: string | null;
  product_price: number | null;
  notes: string | null;
  ai_instruction: string | null;
  requires_artist_approval: boolean;
  target_platforms: Platform[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaAssetRow {
  id: string;
  artist_id: string;
  campaign_id: string | null;
  category: MediaCategory;
  file_name: string;
  file_url: string;
  file_type: string | null;
  mime_type: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  usage_start_at: string | null;
  usage_end_at: string | null;
  allowed_platforms: Platform[];
  rights_note: string | null;
  credit_text: string | null;
  tags: string[];
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialPostRow {
  id: string;
  artist_id: string;
  campaign_id: string | null;
  content_source_id: string | null;
  platform: Platform;
  post_type: string;
  title: string | null;
  body: string | null;
  hashtags: string[];
  image_text_suggestions: string[];
  important_facts: { label: string; value: string }[];
  scheduled_at: string | null;
  embargo_at: string | null;
  status: PostStatus;
  requires_artist_approval: boolean;
  artist_approved_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  published_at: string | null;
  published_url: string | null;
  error_message: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostVersionRow {
  id: string;
  social_post_id: string;
  version_number: number;
  title: string | null;
  body: string | null;
  hashtags: string[];
  changed_by: string | null;
  change_summary: string | null;
  created_at: string;
}

export interface StatusHistoryRow {
  id: string;
  social_post_id: string;
  previous_status: PostStatus | null;
  new_status: PostStatus;
  changed_by: string | null;
  comment: string | null;
  created_at: string;
}

export interface ApprovalRow {
  id: string;
  social_post_id: string;
  approval_type: ApprovalType;
  status: ApprovalStatus;
  requested_by: string | null;
  requested_to: string | null;
  comment: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandRuleRow {
  id: string;
  artist_id: string;
  rule_type: string;
  rule_name: string;
  rule_value: string | null;
  platform: Platform | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublishingJobRow {
  id: string;
  social_post_id: string;
  platform: Platform;
  scheduled_at: string;
  status: PublishingJobStatus;
  retry_count: number;
  last_error: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
