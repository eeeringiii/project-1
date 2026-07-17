import { describe, expect, it } from "vitest";
import { buildSystemPrompt, buildUserPrompt } from "./ai-prompt";
import type { BrandRule, ContentSource } from "@/types/domain";

const source: ContentSource = {
  id: "s1",
  artistId: "a1",
  campaignId: null,
  title: "アオイロ配信",
  sourceText: "7月25日配信",
  purpose: "初動最大化",
  relatedUrl: "https://e.com",
  embargoAt: "2026-07-25T00:00:00+09:00",
  eventAt: null,
  venueName: null,
  productName: null,
  productPrice: null,
  notes: null,
  aiInstruction: "爽やかに",
  requiresArtistApproval: true,
  targetPlatforms: ["x", "instagram"],
  createdBy: "u1",
  createdAt: "",
  updatedAt: "",
};

const rules: BrandRule[] = [
  {
    id: "r1",
    artistId: "a1",
    ruleType: "ng_word",
    ruleName: "NGワード",
    ruleValue: "限定,絶対",
    platform: null,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "r2",
    artistId: "a1",
    ruleType: "tone_official",
    ruleName: "口調",
    ruleValue: "丁寧",
    platform: "instagram",
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "r3",
    artistId: "a1",
    ruleType: "cta",
    ruleName: "CTA",
    ruleValue: "IG限定ルール",
    platform: "instagram",
    isActive: false, // 無効は含めない
    createdAt: "",
    updatedAt: "",
  },
];

describe("ai-prompt", () => {
  it("systemプロンプトにJSON厳守と解禁配慮が含まれる", () => {
    const sys = buildSystemPrompt();
    expect(sys).toContain("JSON");
    expect(sys).toContain("解禁");
  });

  it("userプロンプトに告知情報・解禁日時・NGワードが含まれる", () => {
    const p = buildUserPrompt(source, rules, "x");
    expect(p).toContain("アオイロ配信");
    expect(p).toContain("解禁日時");
    expect(p).toContain("限定,絶対");
    expect(p).toContain('"platform": "x"');
  });

  it("媒体別ルールは対象媒体のみ適用され、無効ルールは除外される", () => {
    const igPrompt = buildUserPrompt(source, rules, "instagram");
    expect(igPrompt).toContain("丁寧"); // instagram向けの有効ルール
    expect(igPrompt).not.toContain("IG限定ルール"); // 無効ルール

    const xPrompt = buildUserPrompt(source, rules, "x");
    expect(xPrompt).not.toContain("丁寧"); // instagram専用ルールはXに出ない
  });

  it("postTypes 指定で一部再生成のプロンプトになる", () => {
    const p = buildUserPrompt(source, rules, "x", ["reminder"]);
    expect(p).toContain("リマインド投稿");
    expect(p).not.toContain("公式告知文");
  });
});
