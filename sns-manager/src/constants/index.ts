/**
 * ドメイン定数
 *
 * 媒体・ステータス・権限などの表示ラベルと、承認フロー・権限マトリクスを一元管理する。
 * UIは色だけに依存せず、テキスト＋アイコンでも状態を判別できるようにする。
 */
import type {
  ApprovalType,
  CampaignStatus,
  MediaCategory,
  Platform,
  PostStatus,
  PublishingJobStatus,
  UserRole,
} from "@/types/domain";

export const APP_NAME = "SNS統合運用ツール";
export const TIME_ZONE = "Asia/Tokyo";

// ---- 媒体 ----

export const PLATFORMS: Platform[] = [
  "x",
  "instagram",
  "tiktok",
  "youtube",
  "website",
];

export const PLATFORM_LABELS: Record<Platform, string> = {
  x: "X",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  website: "HP",
};

/** 媒体別の本文文字数上限（重要情報チェックで使用） */
export const PLATFORM_MAX_LENGTH: Record<Platform, number> = {
  x: 140,
  instagram: 2200,
  tiktok: 2200,
  youtube: 5000,
  website: 100000,
};

/** 媒体ごとに生成する投稿タイプ（value: ラベル） */
export const PLATFORM_POST_TYPES: Record<
  Platform,
  { value: string; label: string }[]
> = {
  x: [
    { value: "official_announcement", label: "公式告知文" },
    { value: "casual", label: "カジュアル版" },
    { value: "artist_voice", label: "アーティスト本人投稿風" },
    { value: "reminder", label: "リマインド投稿" },
    { value: "day_of", label: "当日投稿" },
    { value: "after_event", label: "終了後投稿" },
  ],
  instagram: [
    { value: "feed", label: "フィード投稿文" },
    { value: "reel", label: "リール投稿文" },
    { value: "story", label: "ストーリー用短文" },
    { value: "carousel", label: "カルーセル構成案" },
    { value: "reminder", label: "リマインド投稿文" },
  ],
  tiktok: [
    { value: "caption", label: "キャプション" },
    { value: "hook", label: "動画冒頭のフック" },
    { value: "structure", label: "動画構成" },
    { value: "cta", label: "CTA" },
  ],
  youtube: [
    { value: "long_title", label: "長尺動画タイトル" },
    { value: "shorts_title", label: "Shortsタイトル" },
    { value: "description", label: "概要欄" },
    { value: "chapters", label: "チャプター案" },
  ],
  website: [
    { value: "news", label: "NEWS記事" },
    { value: "page", label: "ページ" },
    { value: "ogp", label: "OGP/シェア文" },
  ],
};

export const POST_TYPE_LABELS: Record<string, string> = Object.values(
  PLATFORM_POST_TYPES,
).reduce<Record<string, string>>((acc, list) => {
  list.forEach((t) => {
    acc[t.value] = t.label;
  });
  return acc;
}, {});

// ---- ステータス ----

export const POST_STATUSES: PostStatus[] = [
  "draft",
  "ai_generated",
  "staff_review",
  "artist_review",
  "revision_requested",
  "approved",
  "scheduled",
  "publishing",
  "published",
  "failed",
  "cancelled",
];

export const STATUS_LABELS: Record<PostStatus, string> = {
  draft: "下書き",
  ai_generated: "AI生成済み",
  staff_review: "担当者確認中",
  artist_review: "本人確認中",
  revision_requested: "修正依頼",
  approved: "承認済み",
  scheduled: "予約済み",
  publishing: "投稿処理中",
  published: "投稿完了",
  failed: "投稿エラー",
  cancelled: "取り消し",
};

/**
 * ステータスの見た目の分類（色＋アイコン記号）。
 * 色に依存させないため、記号（symbol）も併用する。
 */
export const STATUS_TONE: Record<
  PostStatus,
  { tone: "neutral" | "info" | "warning" | "success" | "danger"; symbol: string }
> = {
  draft: { tone: "neutral", symbol: "○" },
  ai_generated: { tone: "info", symbol: "✦" },
  staff_review: { tone: "info", symbol: "◐" },
  artist_review: { tone: "warning", symbol: "◑" },
  revision_requested: { tone: "warning", symbol: "↺" },
  approved: { tone: "success", symbol: "✓" },
  scheduled: { tone: "info", symbol: "◷" },
  publishing: { tone: "info", symbol: "→" },
  published: { tone: "success", symbol: "●" },
  failed: { tone: "danger", symbol: "！" },
  cancelled: { tone: "neutral", symbol: "×" },
};

/**
 * 承認フロー：現ステータスから遷移可能な次ステータス。
 * requires_artist_approval に応じて staff_review の次が変わる点はサービス層で判定。
 */
export const STATUS_TRANSITIONS: Record<PostStatus, PostStatus[]> = {
  draft: ["ai_generated", "staff_review", "cancelled"],
  ai_generated: ["staff_review", "draft", "cancelled"],
  staff_review: ["artist_review", "approved", "revision_requested", "cancelled"],
  artist_review: ["approved", "revision_requested", "cancelled"],
  revision_requested: ["draft", "staff_review", "cancelled"],
  approved: ["scheduled", "revision_requested", "cancelled"],
  scheduled: ["publishing", "approved", "cancelled"],
  publishing: ["published", "failed"],
  published: [],
  failed: ["scheduled", "cancelled"],
  cancelled: ["draft"],
};

// ---- 権限（role） ----

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "管理者",
  manager: "マネージャー",
  staff: "担当者",
  artist: "アーティスト本人",
  viewer: "閲覧者",
};

export type Permission =
  | "post.create"
  | "post.edit"
  | "post.request_review"
  | "post.approve"
  | "post.artist_approve"
  | "calendar.edit"
  | "media.manage"
  | "brand.manage"
  | "user.manage"
  | "analytics.view";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "post.create",
    "post.edit",
    "post.request_review",
    "post.approve",
    "post.artist_approve",
    "calendar.edit",
    "media.manage",
    "brand.manage",
    "user.manage",
    "analytics.view",
  ],
  manager: [
    "post.create",
    "post.edit",
    "post.request_review",
    "post.approve",
    "calendar.edit",
    "media.manage",
    "analytics.view",
  ],
  staff: ["post.create", "post.edit", "post.request_review", "media.manage"],
  artist: ["post.artist_approve"],
  viewer: [],
};

// ---- キャンペーン ----

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  planning: "準備中",
  active: "実施中",
  finished: "終了",
  archived: "アーカイブ",
};

// ---- 素材カテゴリ ----

export const MEDIA_CATEGORY_LABELS: Record<MediaCategory, string> = {
  artist_photo: "アーティスト写真",
  announcement_image: "告知画像",
  jacket: "ジャケット写真",
  logo: "ロゴ",
  video: "動画",
  mv: "MV",
  live_footage: "ライブ映像",
  thumbnail: "サムネイル",
  press: "プレス素材",
  product_image: "商品画像",
};

// ---- 承認タイプ ----

export const APPROVAL_TYPE_LABELS: Record<ApprovalType, string> = {
  staff: "担当者確認",
  artist: "本人確認",
  final: "最終承認",
};

// ---- 配信ジョブ ----

export const PUBLISHING_JOB_STATUS_LABELS: Record<PublishingJobStatus, string> = {
  queued: "待機中",
  running: "実行中",
  succeeded: "成功",
  failed: "失敗",
  cancelled: "取消",
};

export const PUBLISHING_JOB_TONE: Record<
  PublishingJobStatus,
  "neutral" | "info" | "warning" | "success" | "danger"
> = {
  queued: "info",
  running: "info",
  succeeded: "success",
  failed: "danger",
  cancelled: "neutral",
};
