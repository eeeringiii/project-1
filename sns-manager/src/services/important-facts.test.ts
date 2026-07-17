import { describe, expect, it } from "vitest";
import { extractFromText } from "./important-facts";

describe("important-facts.extractFromText", () => {
  it("URLを抽出する", () => {
    const facts = extractFromText("詳細は https://example.com/live をご覧ください");
    expect(facts.some((f) => f.label === "URL")).toBe(true);
  });

  it("日付・金額を抽出する", () => {
    const facts = extractFromText("7月25日発売 3,000円");
    expect(facts.some((f) => f.label === "日付")).toBe(true);
    expect(facts.some((f) => f.label === "金額")).toBe(true);
  });

  it("時間を抽出する", () => {
    const facts = extractFromText("開場は18:30です");
    expect(facts.some((f) => f.label === "時間")).toBe(true);
  });

  it("重複は排除される", () => {
    const facts = extractFromText("7月25日 7月25日");
    const dates = facts.filter((f) => f.label === "日付");
    expect(dates.length).toBe(1);
  });
});
