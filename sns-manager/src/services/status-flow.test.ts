import { describe, expect, it } from "vitest";
import { buildPost } from "./__helpers";
import {
  canTransition,
  nextAfterStaffReview,
  transition,
  makeVersion,
} from "./status-flow";

describe("status-flow.canTransition", () => {
  it("draft から staff_review へ遷移できる", () => {
    expect(canTransition(buildPost({ status: "draft" }), "staff_review")).toBe(
      true,
    );
  });

  it("published からは遷移できない", () => {
    expect(canTransition(buildPost({ status: "published" }), "scheduled")).toBe(
      false,
    );
  });

  it("本人確認が必要な場合、担当者確認から直接承認できない", () => {
    const post = buildPost({
      status: "staff_review",
      requiresArtistApproval: true,
      artistApprovedAt: null,
    });
    expect(canTransition(post, "approved")).toBe(false);
  });

  it("本人確認が不要なら担当者確認から承認できる", () => {
    const post = buildPost({
      status: "staff_review",
      requiresArtistApproval: false,
    });
    expect(canTransition(post, "approved")).toBe(true);
  });
});

describe("status-flow.nextAfterStaffReview", () => {
  it("本人確認が必要なら artist_review", () => {
    expect(
      nextAfterStaffReview(buildPost({ requiresArtistApproval: true })),
    ).toBe("artist_review");
  });
  it("不要なら approved", () => {
    expect(
      nextAfterStaffReview(buildPost({ requiresArtistApproval: false })),
    ).toBe("approved");
  });
});

describe("status-flow.transition", () => {
  it("本人承認で artistApprovedAt を記録する", () => {
    const post = buildPost({ status: "artist_review" });
    const { post: updated, history } = transition({
      post,
      next: "approved",
      userId: "user_artist",
    });
    expect(updated.status).toBe("approved");
    expect(updated.artistApprovedAt).not.toBeNull();
    expect(updated.approvedBy).toBe("user_artist");
    expect(history.previousStatus).toBe("artist_review");
    expect(history.newStatus).toBe("approved");
  });

  it("差し戻しで承認情報をクリアしコメントを残す", () => {
    const post = buildPost({
      status: "artist_review",
      approvedBy: "x",
      approvedAt: "2026-01-01",
    });
    const { post: updated, history } = transition({
      post,
      next: "revision_requested",
      userId: "user_artist",
      comment: "修正して",
    });
    expect(updated.status).toBe("revision_requested");
    expect(updated.approvedBy).toBeNull();
    expect(history.comment).toBe("修正して");
  });

  it("published で publishedAt を記録する", () => {
    const { post: updated } = transition({
      post: buildPost({ status: "publishing" }),
      next: "published",
      userId: "system",
    });
    expect(updated.publishedAt).not.toBeNull();
  });
});

describe("status-flow.makeVersion", () => {
  it("バージョン番号と内容を保持する", () => {
    const post = buildPost({ title: "T", body: "B" });
    const v = makeVersion({
      post,
      versionNumber: 2,
      userId: "u",
      changeSummary: "編集",
    });
    expect(v.versionNumber).toBe(2);
    expect(v.title).toBe("T");
    expect(v.changeSummary).toBe("編集");
  });
});
