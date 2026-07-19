import { describe, expect, it } from "vitest";
import { buildPost } from "./__helpers";
import {
  checkPost,
  detectWeekdayMismatch,
  detectCrowdedDay,
} from "./warnings";

describe("warnings.checkPost", () => {
  it("解禁日時より前の公開をエラーとして検出する", () => {
    const post = buildPost({
      embargoAt: "2026-07-25T00:00:00+09:00",
      scheduledAt: "2026-07-24T20:00:00+09:00",
    });
    const w = checkPost({ post });
    expect(w.some((x) => x.code === "before_embargo" && x.level === "error")).toBe(
      true,
    );
  });

  it("解禁日時以降の公開は警告しない", () => {
    const post = buildPost({
      embargoAt: "2026-07-25T00:00:00+09:00",
      scheduledAt: "2026-07-25T12:00:00+09:00",
    });
    const w = checkPost({ post });
    expect(w.some((x) => x.code === "before_embargo")).toBe(false);
  });

  it("本人確認が必要なのに未承認で承認済み以降はエラー", () => {
    const post = buildPost({
      status: "approved",
      requiresArtistApproval: true,
      artistApprovedAt: null,
    });
    const w = checkPost({ post });
    expect(w.some((x) => x.code === "artist_not_approved")).toBe(true);
  });

  it("文字数制限超過を検出する（X=140）", () => {
    const post = buildPost({ platform: "x", body: "あ".repeat(200) });
    const w = checkPost({ post });
    expect(w.some((x) => x.code === "too_long" && x.level === "error")).toBe(true);
  });

  it("会場名未設定（イベント日時あり）を警告する", () => {
    const post = buildPost();
    const w = checkPost({
      post,
      source: {
        id: "s",
        artistId: "a",
        campaignId: null,
        title: "",
        sourceText: "",
        purpose: "",
        relatedUrl: null,
        embargoAt: null,
        eventAt: "2026-07-27T19:00:00+09:00",
        venueName: null,
        productName: null,
        productPrice: null,
        notes: null,
        aiInstruction: null,
        requiresArtistApproval: false,
        targetPlatforms: ["x"],
        createdBy: "u",
        createdAt: "",
        updatedAt: "",
      },
    });
    expect(w.some((x) => x.code === "missing_venue")).toBe(true);
  });
});

describe("warnings.detectWeekdayMismatch", () => {
  it("日付と曜日が一致しない場合に検出する", () => {
    // 2026-07-25 は土曜日。誤って（金）と書いた場合
    expect(detectWeekdayMismatch("2026年7月25日（金）")).not.toBeNull();
  });

  it("正しい曜日なら null", () => {
    expect(detectWeekdayMismatch("2026年7月25日（土）")).toBeNull();
  });
});

describe("warnings.detectCrowdedDay", () => {
  it("しきい値(4)以上で true", () => {
    expect(detectCrowdedDay(4)).toBe(true);
    expect(detectCrowdedDay(3)).toBe(false);
  });
});
