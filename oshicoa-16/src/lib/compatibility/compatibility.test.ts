import { describe, it, expect } from "vitest";
import { ALL_TYPE_CODES } from "@/types";
import { computeCompatibility, overallScore, decodeAxes } from "@/lib/compatibility/computeCompatibility";
import { typeMap } from "@/data/types";

describe("decodeAxes", () => {
  it("各タイプの復元した軸から、同じコードを再構成できる", () => {
    for (const code of ALL_TYPE_CODES) {
      const { a1, a2, a3, a4 } = decodeAxes(code);
      const char2 = a1 === "R" ? (a2 === "E" ? "C" : "P") : a2 === "E" ? "E" : "P";
      expect(`${a1}${char2}${a3}${a4}`).toBe(code);
    }
  });
});

describe("computeCompatibility", () => {
  it("全ペアで7項目すべてが0〜100に収まる", () => {
    for (const a of ALL_TYPE_CODES) {
      for (const b of ALL_TYPE_CODES) {
        const { scores } = computeCompatibility(a, b);
        for (const v of Object.values(scores)) {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("組み合わせ順が逆でも同じスコアになる（対称）", () => {
    const ab = computeCompatibility("CEMS", "RPGS");
    const ba = computeCompatibility("RPGS", "CEMS");
    expect(ab.scores).toEqual(ba.scores);
  });

  it("キュレーション済みペアを優先して返す", () => {
    const type = typeMap.RCGT;
    const result = computeCompatibility("RCGT", type.compatibility.bestTypeCode);
    // data/compatibility.ts の RCGT×CEMT は supportProject=95
    expect(result.scores.supportProject).toBe(95);
  });

  it("overallScore は7項目平均を返す", () => {
    const { scores } = computeCompatibility("CEMS", "CEGT");
    expect(overallScore(scores)).toBeGreaterThan(0);
    expect(overallScore(scores)).toBeLessThanOrEqual(100);
  });
});
