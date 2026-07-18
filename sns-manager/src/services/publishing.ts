/**
 * 予約投稿ジョブの実行サービス（Phase 4: モック実行）
 *
 * 現段階では実際のSNS API連携は行わず、投稿処理をモックする。
 * 承認済み→予約済みの投稿を publishing_jobs としてキューし、予定時刻を過ぎたら実行する。
 * 成功時は publishing_results を保存し投稿を published に、失敗時は retry_count を増やし failed にする。
 *
 * Phase 5 で runJob の内部を各SNSの実APIコールに差し替える（インターフェースは維持）。
 */
import { PLATFORM_LABELS } from "@/constants";
import type {
  Platform,
  PublishingJob,
  PublishingResult,
  SocialPost,
} from "@/types/domain";

export const MAX_RETRY = 3;

let seq = 0;
function genId(prefix: string): string {
  seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${seq}`;
}

/** 予定時刻を過ぎていて実行対象になるジョブか */
export function isDue(job: PublishingJob, now: Date = new Date()): boolean {
  if (job.status !== "queued") return false;
  return new Date(job.scheduledAt).getTime() <= now.getTime();
}

/** 失敗ジョブが再試行可能か */
export function canRetry(job: PublishingJob): boolean {
  return job.status === "failed" && job.retryCount < MAX_RETRY;
}

/** 投稿から予約ジョブを生成 */
export function createJob(post: SocialPost): PublishingJob {
  const nowIso = new Date().toISOString();
  return {
    id: genId("job"),
    socialPostId: post.id,
    platform: post.platform,
    scheduledAt: post.scheduledAt ?? nowIso,
    status: "queued",
    retryCount: 0,
    lastError: null,
    startedAt: null,
    completedAt: null,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

/** モックの外部投稿ID・URLを生成 */
function mockExternalRef(platform: Platform) {
  const id = `${platform}_${Math.random().toString(36).slice(2, 10)}`;
  const base: Record<Platform, string> = {
    x: "https://x.com/sample_artist/status/",
    instagram: "https://instagram.com/p/",
    tiktok: "https://tiktok.com/@sample/video/",
    youtube: "https://youtu.be/",
    website: "https://example.com/news/",
  };
  return { externalPostId: id, publishedUrl: `${base[platform]}${id}` };
}

export interface RunOutcome {
  job: PublishingJob;
  post: SocialPost;
  result: PublishingResult | null;
}

/**
 * ジョブを1件実行（モック）。
 * @param outcome テスト用に成否を固定できる（未指定なら確率的に成功/失敗）
 */
export function runJob(
  job: PublishingJob,
  post: SocialPost,
  outcome?: "success" | "fail",
): RunOutcome {
  const nowIso = new Date().toISOString();
  // 失敗確率（モック）: 未指定時は 15%
  const succeeded =
    outcome === undefined ? Math.random() > 0.15 : outcome === "success";

  if (succeeded) {
    const ref = mockExternalRef(job.platform);
    const result: PublishingResult = {
      id: genId("res"),
      publishingJobId: job.id,
      externalPostId: ref.externalPostId,
      publishedUrl: ref.publishedUrl,
      responseData: { mock: true, platform: job.platform },
      createdAt: nowIso,
    };
    return {
      job: {
        ...job,
        status: "succeeded",
        startedAt: job.startedAt ?? nowIso,
        completedAt: nowIso,
        lastError: null,
        updatedAt: nowIso,
      },
      post: {
        ...post,
        status: "published",
        publishedAt: nowIso,
        publishedUrl: ref.publishedUrl,
        errorMessage: null,
        updatedAt: nowIso,
      },
      result,
    };
  }

  // 失敗
  const errorMessage = `（モック）${PLATFORM_LABELS[job.platform]}への投稿でエラーが発生しました。`;
  return {
    job: {
      ...job,
      status: "failed",
      startedAt: job.startedAt ?? nowIso,
      completedAt: nowIso,
      retryCount: job.retryCount + 1,
      lastError: errorMessage,
      updatedAt: nowIso,
    },
    post: {
      ...post,
      status: "failed",
      errorMessage,
      updatedAt: nowIso,
    },
    result: null,
  };
}

/** 失敗ジョブを再キュー（retry_count は維持） */
export function requeue(job: PublishingJob): PublishingJob {
  return {
    ...job,
    status: "queued",
    lastError: null,
    startedAt: null,
    completedAt: null,
    updatedAt: new Date().toISOString(),
  };
}
