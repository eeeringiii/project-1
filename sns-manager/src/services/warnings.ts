/**
 * 投稿前チェック（警告判定）サービス
 *
 * 要件の「重要情報のチェック機能」に対応。投稿確認画面などで、
 * 投稿ごとの警告一覧を返す。承認前投稿を自動公開しないための最後の砦。
 */
import { PLATFORM_MAX_LENGTH } from "@/constants";
import type {
  ContentSource,
  MediaAsset,
  SocialPost,
} from "@/types/domain";
import { toJst, weekdayJa } from "@/lib/date";

export type WarningLevel = "error" | "warning";

export interface PostWarning {
  level: WarningLevel;
  code: string;
  message: string;
}

interface CheckContext {
  post: SocialPost;
  source?: ContentSource | null;
  assets?: MediaAsset[];
  /** 同一媒体・同一元情報の他投稿（重複投稿チェック用） */
  siblings?: SocialPost[];
}

export function checkPost(ctx: CheckContext): PostWarning[] {
  const { post, source, assets = [], siblings = [] } = ctx;
  const warnings: PostWarning[] = [];
  const now = toJst(new Date());

  // 解禁日時より前の公開
  const embargo = post.embargoAt ?? source?.embargoAt ?? null;
  if (embargo && post.scheduledAt) {
    if (toJst(post.scheduledAt) < toJst(embargo)) {
      warnings.push({
        level: "error",
        code: "before_embargo",
        message: "解禁日時より前に公開が設定されています。",
      });
    }
  }

  // 過去日時への予約
  if (
    post.scheduledAt &&
    toJst(post.scheduledAt) < now &&
    (post.status === "scheduled" || post.status === "approved")
  ) {
    warnings.push({
      level: "error",
      code: "past_schedule",
      message: "公開予定日時が過去になっています。",
    });
  }

  // URL未設定（関連URLが元情報にあるのに本文/投稿に無い）
  const hasUrl = /https?:\/\//.test(post.body) || Boolean(post.publishedUrl);
  if (source?.relatedUrl && !hasUrl) {
    warnings.push({
      level: "warning",
      code: "missing_url",
      message: "関連URLが本文に含まれていません。",
    });
  }

  // 日付と曜日の不一致（本文内の「M月D日（X）」を検証）
  const mismatch = detectWeekdayMismatch(`${post.title}\n${post.body}`);
  if (mismatch) {
    warnings.push({
      level: "warning",
      code: "weekday_mismatch",
      message: `日付と曜日が一致していません: ${mismatch}`,
    });
  }

  // 会場名未設定（イベント日時があるのに会場が無い）
  if (source?.eventAt && !source.venueName) {
    warnings.push({
      level: "warning",
      code: "missing_venue",
      message: "イベント日時がありますが会場名が未設定です。",
    });
  }

  // 商品価格未設定（商品名があるのに価格が無い）
  if (source?.productName && source.productPrice == null) {
    warnings.push({
      level: "warning",
      code: "missing_price",
      message: "商品名がありますが価格が未設定です。",
    });
  }

  // 本人確認が必要なのに未承認
  if (
    post.requiresArtistApproval &&
    !post.artistApprovedAt &&
    ["approved", "scheduled", "publishing", "published"].includes(post.status)
  ) {
    warnings.push({
      level: "error",
      code: "artist_not_approved",
      message: "本人確認が必要ですが、本人承認がありません。",
    });
  }

  // 使用期限切れ素材の使用
  const expired = assets.filter(
    (a) =>
      post.mediaAssetIds.includes(a.id) &&
      a.usageEndAt &&
      toJst(a.usageEndAt) < now,
  );
  if (expired.length > 0) {
    warnings.push({
      level: "error",
      code: "expired_asset",
      message: `使用期限切れの素材が使用されています: ${expired
        .map((a) => a.fileName)
        .join(", ")}`,
    });
  }

  // 文字数制限超過
  const max = PLATFORM_MAX_LENGTH[post.platform];
  if (post.body.length > max) {
    warnings.push({
      level: "error",
      code: "too_long",
      message: `本文が${post.platform.toUpperCase()}の文字数上限(${max})を超えています（現在${post.body.length}）。`,
    });
  }

  // 同じ媒体への重複投稿（同一元情報・同一媒体・同一投稿タイプ）
  const dup = siblings.filter(
    (s) =>
      s.id !== post.id &&
      s.platform === post.platform &&
      s.postType === post.postType &&
      s.contentSourceId === post.contentSourceId &&
      s.status !== "cancelled",
  );
  if (dup.length > 0) {
    warnings.push({
      level: "warning",
      code: "duplicate_post",
      message: "同じ媒体・投稿タイプの重複投稿が存在します。",
    });
  }

  return warnings;
}

/**
 * 「7月25日（土）」のような表記で、日付と曜日が一致しない箇所を検出。
 * 年が省略されている場合は現在年で補完する。
 */
export function detectWeekdayMismatch(text: string): string | null {
  const re = /(\d{4}年)?\s?(\d{1,2})月\s?(\d{1,2})日\s?（([日月火水木金土])）/g;
  const map = ["日", "月", "火", "水", "木", "金", "土"];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const year = m[1] ? parseInt(m[1], 10) : new Date().getFullYear();
    const month = parseInt(m[2], 10);
    const day = parseInt(m[3], 10);
    const stated = m[4];
    const d = new Date(year, month - 1, day);
    if (map[d.getDay()] !== stated) {
      return `${month}月${day}日は「${map[d.getDay()]}」ですが「${stated}」と記載`;
    }
  }
  return null;
}

/** カレンダー用: 同日に投稿が集中しているか（しきい値以上） */
export function detectCrowdedDay(count: number, threshold = 4): boolean {
  return count >= threshold;
}

/** 曜日の妥当性（date と weekday）を検証 */
export function isWeekdayConsistent(iso: string, weekday: string): boolean {
  return weekdayJa(iso) === weekday;
}
