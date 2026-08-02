/**
 * ドメイン型（camelCase） ↔ DB行型（snake_case）の相互変換
 * repository の境界でのみ使用する。
 */
import type {
  AiGenerationLog,
  Artist,
  BrandRule,
  Campaign,
  ContentSource,
  MediaAsset,
  PostVersion,
  PublishingJob,
  PublishingResult,
  SocialPost,
  StatusHistory,
  User,
} from "@/types/domain";
import type {
  AiGenerationLogRow,
  ArtistRow,
  BrandRuleRow,
  CampaignRow,
  ContentSourceRow,
  MediaAssetRow,
  PostVersionRow,
  PublishingJobRow,
  PublishingResultRow,
  SocialPostRow,
  StatusHistoryRow,
  UserRow,
} from "@/types/database";

// ---- from Row (DB → domain) ----

export const userFromRow = (r: UserRow): User => ({
  id: r.id,
  name: r.name,
  email: r.email,
  role: r.role,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const artistFromRow = (r: ArtistRow): Artist => ({
  id: r.id,
  name: r.name,
  stageName: r.stage_name ?? "",
  profile: r.profile ?? "",
  brandConcept: r.brand_concept ?? "",
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const campaignFromRow = (r: CampaignRow): Campaign => ({
  id: r.id,
  artistId: r.artist_id,
  name: r.name,
  description: r.description ?? "",
  startAt: r.start_at,
  endAt: r.end_at,
  status: r.status,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const contentSourceFromRow = (r: ContentSourceRow): ContentSource => ({
  id: r.id,
  artistId: r.artist_id,
  campaignId: r.campaign_id,
  title: r.title,
  sourceText: r.source_text,
  purpose: r.purpose ?? "",
  relatedUrl: r.related_url,
  embargoAt: r.embargo_at,
  eventAt: r.event_at,
  venueName: r.venue_name,
  productName: r.product_name,
  productPrice: r.product_price,
  notes: r.notes,
  aiInstruction: r.ai_instruction,
  requiresArtistApproval: r.requires_artist_approval,
  targetPlatforms: r.target_platforms ?? [],
  createdBy: r.created_by ?? "",
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const mediaAssetFromRow = (r: MediaAssetRow): MediaAsset => ({
  id: r.id,
  artistId: r.artist_id,
  campaignId: r.campaign_id,
  category: r.category,
  fileName: r.file_name,
  fileUrl: r.file_url,
  fileType: r.file_type ?? "",
  mimeType: r.mime_type ?? "",
  fileSize: r.file_size ?? 0,
  width: r.width,
  height: r.height,
  duration: r.duration,
  usageStartAt: r.usage_start_at,
  usageEndAt: r.usage_end_at,
  allowedPlatforms: r.allowed_platforms ?? [],
  rightsNote: r.rights_note,
  creditText: r.credit_text,
  tags: r.tags ?? [],
  notes: r.notes,
  createdBy: r.created_by ?? "",
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const socialPostFromRow = (r: SocialPostRow): SocialPost => ({
  id: r.id,
  artistId: r.artist_id,
  campaignId: r.campaign_id,
  contentSourceId: r.content_source_id,
  platform: r.platform,
  postType: r.post_type,
  title: r.title ?? "",
  body: r.body ?? "",
  hashtags: r.hashtags ?? [],
  imageTextSuggestions: r.image_text_suggestions ?? [],
  importantFacts: r.important_facts ?? [],
  scheduledAt: r.scheduled_at,
  embargoAt: r.embargo_at,
  status: r.status,
  requiresArtistApproval: r.requires_artist_approval,
  artistApprovedAt: r.artist_approved_at,
  approvedBy: r.approved_by,
  approvedAt: r.approved_at,
  publishedAt: r.published_at,
  publishedUrl: r.published_url,
  errorMessage: r.error_message,
  mediaAssetIds: [], // post_media から別途ロード
  createdBy: r.created_by ?? "",
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const postVersionFromRow = (r: PostVersionRow): PostVersion => ({
  id: r.id,
  socialPostId: r.social_post_id,
  versionNumber: r.version_number,
  title: r.title ?? "",
  body: r.body ?? "",
  hashtags: r.hashtags ?? [],
  changedBy: r.changed_by ?? "",
  changeSummary: r.change_summary ?? "",
  createdAt: r.created_at,
});

export const statusHistoryFromRow = (r: StatusHistoryRow): StatusHistory => ({
  id: r.id,
  socialPostId: r.social_post_id,
  previousStatus: r.previous_status,
  newStatus: r.new_status,
  changedBy: r.changed_by ?? "",
  comment: r.comment,
  createdAt: r.created_at,
});

export const brandRuleFromRow = (r: BrandRuleRow): BrandRule => ({
  id: r.id,
  artistId: r.artist_id,
  ruleType: r.rule_type,
  ruleName: r.rule_name,
  ruleValue: r.rule_value ?? "",
  platform: r.platform,
  isActive: r.is_active,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

// ---- to Row (domain → DB, insert/update payload) ----

export const contentSourceToRow = (c: ContentSource): ContentSourceRow => ({
  id: c.id,
  artist_id: c.artistId,
  campaign_id: c.campaignId,
  title: c.title,
  source_text: c.sourceText,
  purpose: c.purpose,
  related_url: c.relatedUrl,
  embargo_at: c.embargoAt,
  event_at: c.eventAt,
  venue_name: c.venueName,
  product_name: c.productName,
  product_price: c.productPrice,
  notes: c.notes,
  ai_instruction: c.aiInstruction,
  requires_artist_approval: c.requiresArtistApproval,
  target_platforms: c.targetPlatforms,
  created_by: c.createdBy || null,
  created_at: c.createdAt,
  updated_at: c.updatedAt,
});

export const socialPostToRow = (p: SocialPost): SocialPostRow => ({
  id: p.id,
  artist_id: p.artistId,
  campaign_id: p.campaignId,
  content_source_id: p.contentSourceId,
  platform: p.platform,
  post_type: p.postType,
  title: p.title,
  body: p.body,
  hashtags: p.hashtags,
  image_text_suggestions: p.imageTextSuggestions,
  important_facts: p.importantFacts,
  scheduled_at: p.scheduledAt,
  embargo_at: p.embargoAt,
  status: p.status,
  requires_artist_approval: p.requiresArtistApproval,
  artist_approved_at: p.artistApprovedAt,
  approved_by: p.approvedBy,
  approved_at: p.approvedAt,
  published_at: p.publishedAt,
  published_url: p.publishedUrl,
  error_message: p.errorMessage,
  created_by: p.createdBy || null,
  created_at: p.createdAt,
  updated_at: p.updatedAt,
});

export const mediaAssetToRow = (a: MediaAsset): MediaAssetRow => ({
  id: a.id,
  artist_id: a.artistId,
  campaign_id: a.campaignId,
  category: a.category,
  file_name: a.fileName,
  file_url: a.fileUrl,
  file_type: a.fileType,
  mime_type: a.mimeType,
  file_size: a.fileSize,
  width: a.width,
  height: a.height,
  duration: a.duration,
  usage_start_at: a.usageStartAt,
  usage_end_at: a.usageEndAt,
  allowed_platforms: a.allowedPlatforms,
  rights_note: a.rightsNote,
  credit_text: a.creditText,
  tags: a.tags,
  notes: a.notes,
  created_by: a.createdBy || null,
  created_at: a.createdAt,
  updated_at: a.updatedAt,
});

export const brandRuleToRow = (r: BrandRule): BrandRuleRow => ({
  id: r.id,
  artist_id: r.artistId,
  rule_type: r.ruleType,
  rule_name: r.ruleName,
  rule_value: r.ruleValue,
  platform: r.platform,
  is_active: r.isActive,
  created_at: r.createdAt,
  updated_at: r.updatedAt,
});

export const aiLogFromRow = (r: AiGenerationLogRow): AiGenerationLog => ({
  id: r.id,
  artistId: r.artist_id,
  contentSourceId: r.content_source_id,
  platformSummary: r.platform_summary,
  model: r.model,
  usedMock: r.used_mock,
  postCount: r.post_count,
  ok: r.ok,
  errorMessage: r.error_message,
  createdBy: r.created_by ?? "",
  createdAt: r.created_at,
});

export const aiLogToRow = (l: AiGenerationLog): AiGenerationLogRow => ({
  id: l.id,
  artist_id: l.artistId,
  content_source_id: l.contentSourceId,
  platform_summary: l.platformSummary,
  model: l.model,
  used_mock: l.usedMock,
  post_count: l.postCount,
  ok: l.ok,
  error_message: l.errorMessage,
  created_by: l.createdBy || null,
  created_at: l.createdAt,
});

export const publishingJobFromRow = (r: PublishingJobRow): PublishingJob => ({
  id: r.id,
  socialPostId: r.social_post_id,
  platform: r.platform,
  scheduledAt: r.scheduled_at,
  status: r.status,
  retryCount: r.retry_count,
  lastError: r.last_error,
  startedAt: r.started_at,
  completedAt: r.completed_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const publishingJobToRow = (j: PublishingJob): PublishingJobRow => ({
  id: j.id,
  social_post_id: j.socialPostId,
  platform: j.platform,
  scheduled_at: j.scheduledAt,
  status: j.status,
  retry_count: j.retryCount,
  last_error: j.lastError,
  started_at: j.startedAt,
  completed_at: j.completedAt,
  created_at: j.createdAt,
  updated_at: j.updatedAt,
});

export const publishingResultFromRow = (
  r: PublishingResultRow,
): PublishingResult => ({
  id: r.id,
  publishingJobId: r.publishing_job_id,
  externalPostId: r.external_post_id,
  publishedUrl: r.published_url,
  responseData: r.response_data,
  createdAt: r.created_at,
});

export const publishingResultToRow = (
  r: PublishingResult,
): PublishingResultRow => ({
  id: r.id,
  publishing_job_id: r.publishingJobId,
  external_post_id: r.externalPostId,
  published_url: r.publishedUrl,
  response_data: r.responseData,
  created_at: r.createdAt,
});

export const campaignToRow = (c: Campaign): CampaignRow => ({
  id: c.id,
  artist_id: c.artistId,
  name: c.name,
  description: c.description,
  start_at: c.startAt,
  end_at: c.endAt,
  status: c.status,
  created_at: c.createdAt,
  updated_at: c.updatedAt,
});

export const postVersionToRow = (v: PostVersion): PostVersionRow => ({
  id: v.id,
  social_post_id: v.socialPostId,
  version_number: v.versionNumber,
  title: v.title,
  body: v.body,
  hashtags: v.hashtags,
  changed_by: v.changedBy || null,
  change_summary: v.changeSummary,
  created_at: v.createdAt,
});

export const statusHistoryToRow = (h: StatusHistory): StatusHistoryRow => ({
  id: h.id,
  social_post_id: h.socialPostId,
  previous_status: h.previousStatus,
  new_status: h.newStatus,
  changed_by: h.changedBy || null,
  comment: h.comment,
  created_at: h.createdAt,
});
