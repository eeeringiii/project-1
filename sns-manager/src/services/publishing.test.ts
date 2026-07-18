import { describe, expect, it } from "vitest";
import { buildPost } from "./__helpers";
import {
  canRetry,
  createJob,
  isDue,
  MAX_RETRY,
  requeue,
  runJob,
} from "./publishing";

describe("publishing.isDue", () => {
  it("予定時刻を過ぎた queued は実行対象", () => {
    const post = buildPost({ scheduledAt: "2020-01-01T00:00:00Z" });
    const job = createJob(post);
    expect(isDue(job, new Date("2020-02-01T00:00:00Z"))).toBe(true);
  });
  it("未来の予定は対象外", () => {
    const post = buildPost({ scheduledAt: "2999-01-01T00:00:00Z" });
    const job = createJob(post);
    expect(isDue(job, new Date("2020-01-01T00:00:00Z"))).toBe(false);
  });
  it("queued 以外は対象外", () => {
    const post = buildPost({ scheduledAt: "2020-01-01T00:00:00Z" });
    const job = { ...createJob(post), status: "succeeded" as const };
    expect(isDue(job, new Date("2020-02-01T00:00:00Z"))).toBe(false);
  });
});

describe("publishing.runJob", () => {
  it("成功時: ジョブ succeeded・投稿 published・結果生成", () => {
    const post = buildPost({ status: "scheduled" });
    const job = createJob(post);
    const out = runJob(job, post, "success");
    expect(out.job.status).toBe("succeeded");
    expect(out.post.status).toBe("published");
    expect(out.post.publishedUrl).toBeTruthy();
    expect(out.result).not.toBeNull();
    expect(out.result?.externalPostId).toBeTruthy();
  });

  it("失敗時: ジョブ failed・投稿 failed・retry_count 増加・結果なし", () => {
    const post = buildPost({ status: "scheduled" });
    const job = createJob(post);
    const out = runJob(job, post, "fail");
    expect(out.job.status).toBe("failed");
    expect(out.job.retryCount).toBe(1);
    expect(out.post.status).toBe("failed");
    expect(out.post.errorMessage).toBeTruthy();
    expect(out.result).toBeNull();
  });
});

describe("publishing.canRetry / requeue", () => {
  it("失敗かつ上限未満なら再試行可能", () => {
    const post = buildPost();
    const job = { ...createJob(post), status: "failed" as const, retryCount: 1 };
    expect(canRetry(job)).toBe(true);
  });
  it("上限到達なら再試行不可", () => {
    const post = buildPost();
    const job = {
      ...createJob(post),
      status: "failed" as const,
      retryCount: MAX_RETRY,
    };
    expect(canRetry(job)).toBe(false);
  });
  it("requeue で queued に戻りエラーがクリアされる", () => {
    const post = buildPost();
    const job = {
      ...createJob(post),
      status: "failed" as const,
      lastError: "err",
      retryCount: 1,
    };
    const re = requeue(job);
    expect(re.status).toBe("queued");
    expect(re.lastError).toBeNull();
    expect(re.retryCount).toBe(1); // 回数は維持
  });
});
