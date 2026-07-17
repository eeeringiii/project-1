/**
 * ドメイン型定義
 *
 * DB設計（supabase/migrations）と1:1で対応する中核型。
 * UIコンポーネントやサービス層はこの型を参照する。
 * Phase 2 で Supabase の生成型に差し替えても、この型を維持できるよう設計する。
 */

// ---- 列挙型（定数と対応: src/constants） ----

export type UserRole = "admin" | "manager" | "staff" | "artist" | "viewer";

export type Platform = "x" | "instagram" | "tiktok" | "youtube" | "website";

export type PostStatus =
  | "draft"
  | "ai_generated"
  | "staff_review"
  | "artist_review"
  | "revision_requested"
  | "approved"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed"
  | "cancelled";

export type ApprovalType = "staff" | "artist" | "final";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export type CampaignStatus = "planning" | "active" | "finished" | "archived";

export type MediaCategory =
  | "artist_photo"
  | "announcement_image"
  | "jacket"
  | "logo"
  | "video"
  | "mv"
  | "live_footage"
  | "thumbnail"
  | "press"
  | "product_image";

export type PublishingJobStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

// ---- エンティティ ----

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Artist {
  id: string;
  name: string;
  stageName: string;
  profile: string;
  brandConcept: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  artistId: string;
  name: string;
  description: string;
  startAt: string | null;
  endAt: string | null;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContentSource {
  id: string;
  artistId: string;
  campaignId: string | null;
  title: string;
  sourceText: string;
  purpose: string;
  relatedUrl: string | null;
  embargoAt: string | null;
  eventAt: string | null;
  venueName: string | null;
  productName: string | null;
  productPrice: number | null;
  notes: string | null;
  aiInstruction: string | null;
  requiresArtistApproval: boolean;
  targetPlatforms: Platform[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  artistId: string;
  campaignId: string | null;
  category: MediaCategory;
  fileName: string;
  fileUrl: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  usageStartAt: string | null;
  usageEndAt: string | null;
  allowedPlatforms: Platform[];
  rightsNote: string | null;
  creditText: string | null;
  tags: string[];
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportantFact {
  label: string;
  value: string;
}

export interface SocialPost {
  id: string;
  artistId: string;
  campaignId: string | null;
  contentSourceId: string | null;
  platform: Platform;
  postType: string;
  title: string;
  body: string;
  hashtags: string[];
  imageTextSuggestions: string[];
  importantFacts: ImportantFact[];
  scheduledAt: string | null;
  embargoAt: string | null;
  status: PostStatus;
  requiresArtistApproval: boolean;
  artistApprovedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  publishedAt: string | null;
  publishedUrl: string | null;
  errorMessage: string | null;
  mediaAssetIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostVersion {
  id: string;
  socialPostId: string;
  versionNumber: number;
  title: string;
  body: string;
  hashtags: string[];
  changedBy: string;
  changeSummary: string;
  createdAt: string;
}

export interface Approval {
  id: string;
  socialPostId: string;
  approvalType: ApprovalType;
  status: ApprovalStatus;
  requestedBy: string;
  requestedTo: string | null;
  comment: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistory {
  id: string;
  socialPostId: string;
  previousStatus: PostStatus | null;
  newStatus: PostStatus;
  changedBy: string;
  comment: string | null;
  createdAt: string;
}

export interface BrandRule {
  id: string;
  artistId: string;
  ruleType: string;
  ruleName: string;
  ruleValue: string;
  platform: Platform | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublishingJob {
  id: string;
  socialPostId: string;
  platform: Platform;
  scheduledAt: string;
  status: PublishingJobStatus;
  retryCount: number;
  lastError: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
