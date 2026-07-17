import { describe, expect, it } from "vitest";
import { buildPost } from "@/services/__helpers";
import {
  brandRuleFromRow,
  brandRuleToRow,
  contentSourceFromRow,
  contentSourceToRow,
  mediaAssetFromRow,
  mediaAssetToRow,
  socialPostFromRow,
  socialPostToRow,
} from "./mappers";
import type { BrandRule, ContentSource, MediaAsset } from "@/types/domain";

describe("mappers round-trip", () => {
  it("SocialPost: toRow → fromRow で内容が保持される", () => {
    const post = buildPost({
      title: "タイトル",
      body: "本文\n改行",
      hashtags: ["#a", "#b"],
      importantFacts: [{ label: "日時", value: "7/25" }],
      status: "approved",
      mediaAssetIds: [], // fromRow は post_media から別途復元するため空で比較
    });
    const back = socialPostFromRow(socialPostToRow(post));
    expect(back).toEqual(post);
  });

  it("ContentSource: snake_case へ正しく変換される", () => {
    const src: ContentSource = {
      id: "src_1",
      artistId: "artist_1",
      campaignId: "camp_1",
      title: "t",
      sourceText: "s",
      purpose: "p",
      relatedUrl: "https://e.com",
      embargoAt: "2026-07-25T00:00:00Z",
      eventAt: null,
      venueName: "会場",
      productName: null,
      productPrice: 3000,
      notes: null,
      aiInstruction: null,
      requiresArtistApproval: true,
      targetPlatforms: ["x", "website"],
      createdBy: "user_1",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z",
    };
    const row = contentSourceToRow(src);
    expect(row.artist_id).toBe("artist_1");
    expect(row.related_url).toBe("https://e.com");
    expect(row.requires_artist_approval).toBe(true);
    expect(row.target_platforms).toEqual(["x", "website"]);
    expect(contentSourceFromRow(row)).toEqual(src);
  });

  it("MediaAsset: 数値・配列・null が保持される", () => {
    const asset: MediaAsset = {
      id: "a1",
      artistId: "artist_1",
      campaignId: null,
      category: "jacket",
      fileName: "j.png",
      fileUrl: "https://e.com/j.png",
      fileType: "image",
      mimeType: "image/png",
      fileSize: 1234,
      width: 1000,
      height: 1000,
      duration: null,
      usageStartAt: null,
      usageEndAt: "2026-08-01T00:00:00Z",
      allowedPlatforms: ["instagram"],
      rightsNote: null,
      creditText: "©X",
      tags: ["ジャケ"],
      notes: null,
      createdBy: "user_1",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z",
    };
    expect(mediaAssetFromRow(mediaAssetToRow(asset))).toEqual(asset);
  });

  it("BrandRule: platform null / boolean が保持される", () => {
    const rule: BrandRule = {
      id: "r1",
      artistId: "artist_1",
      ruleType: "ng_word",
      ruleName: "NGワード",
      ruleValue: "限定,絶対",
      platform: null,
      isActive: true,
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z",
    };
    expect(brandRuleFromRow(brandRuleToRow(rule))).toEqual(rule);
  });
});
