/**
 * 承認・ステータス遷移サービス
 *
 * 承認フロー（下書き→AI生成→担当者確認→[本人確認]→承認→予約→投稿処理→完了）を
 * ステートマシンとして表現する。差し戻し時は revision_requested へ。
 *
 * 純粋関数として遷移可否を判定し、状態変更に伴う StatusHistory / PostVersion を生成する。
 */
import { STATUS_TRANSITIONS } from "@/constants";
import type {
  PostStatus,
  PostVersion,
  SocialPost,
  StatusHistory,
} from "@/types/domain";

let seq = 0;
function genId(prefix: string): string {
  seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${seq}`;
}

/** current から next へ遷移できるか（本人確認要否を考慮） */
export function canTransition(
  post: SocialPost,
  next: PostStatus,
): boolean {
  const allowed = STATUS_TRANSITIONS[post.status] ?? [];
  if (!allowed.includes(next)) return false;

  // 担当者確認 → 承認 は、本人確認が必要な場合は不可（本人確認を経由する）
  if (
    post.status === "staff_review" &&
    next === "approved" &&
    post.requiresArtistApproval &&
    !post.artistApprovedAt
  ) {
    return false;
  }
  return true;
}

/** staff_review の次に推奨される遷移先 */
export function nextAfterStaffReview(post: SocialPost): PostStatus {
  return post.requiresArtistApproval ? "artist_review" : "approved";
}

export interface TransitionResult {
  post: SocialPost;
  history: StatusHistory;
}

/**
 * ステータスを遷移させ、更新後の投稿と履歴レコードを返す（副作用なし）。
 */
export function transition(params: {
  post: SocialPost;
  next: PostStatus;
  userId: string;
  comment?: string;
}): TransitionResult {
  const { post, next, userId, comment } = params;
  const now = new Date().toISOString();

  const updated: SocialPost = {
    ...post,
    status: next,
    updatedAt: now,
  };

  // 本人承認
  if (next === "approved" && post.status === "artist_review") {
    updated.artistApprovedAt = now;
  }
  if (next === "approved") {
    updated.approvedBy = userId;
    updated.approvedAt = now;
  }
  if (next === "published") {
    updated.publishedAt = now;
  }
  if (next === "revision_requested") {
    // 差し戻しでは承認情報をクリア
    updated.approvedBy = null;
    updated.approvedAt = null;
  }

  const history: StatusHistory = {
    id: genId("hist"),
    socialPostId: post.id,
    previousStatus: post.status,
    newStatus: next,
    changedBy: userId,
    comment: comment ?? null,
    createdAt: now,
  };

  return { post: updated, history };
}

/** 本文編集時のバージョン履歴レコードを生成 */
export function makeVersion(params: {
  post: SocialPost;
  versionNumber: number;
  userId: string;
  changeSummary: string;
}): PostVersion {
  const { post, versionNumber, userId, changeSummary } = params;
  return {
    id: genId("ver"),
    socialPostId: post.id,
    versionNumber,
    title: post.title,
    body: post.body,
    hashtags: post.hashtags,
    changedBy: userId,
    changeSummary,
    createdAt: new Date().toISOString(),
  };
}
