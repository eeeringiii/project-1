import type { CompatibilityScore, TypeCode } from "@/types";
import { typeMap } from "@/data/types";
import { getCompatibility } from "@/data/compatibility";

type Axes = { a1: "R" | "C"; a2: "E" | "P"; a3: "G" | "M"; a4: "T" | "S" };

/** タイプコードを4軸の極へ復元する（determineType の表記規則の逆変換）。 */
export function decodeAxes(code: TypeCode): Axes {
  const a1 = code[0] === "C" ? "C" : "R";
  const a2 = code[1] === "P" ? "P" : "E"; // R系のC・C系のE はどちらも体験(E)、Pは所有(P)
  const a3 = code[2] === "M" ? "M" : "G";
  const a4 = code[3] === "S" ? "S" : "T";
  return { a1, a2, a3, a4 };
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export const COMPATIBILITY_DIMENSIONS: { key: keyof CompatibilityScore["scores"]; label: string }[] = [
  { key: "event", label: "連番相性" },
  { key: "travel", label: "遠征相性" },
  { key: "discussion", label: "感想会相性" },
  { key: "trading", label: "交換相性" },
  { key: "supportProject", label: "応援企画相性" },
  { key: "fandomPeace", label: "同担としての平和度" },
  { key: "spendingSense", label: "金銭感覚相性" },
];

const DIMENSION_PHRASE: Record<string, string> = {
  event: "同じ現場に足を運ぶ",
  travel: "遠征に出る",
  discussion: "現場後に語り合う",
  trading: "グッズを融通し合う",
  supportProject: "応援企画で力を合わせる",
  fandomPeace: "同担として穏やかに隣り合う",
  spendingSense: "お金の使い方の感覚を共有する",
};

/**
 * 任意の2タイプの相性を7項目で算出する。
 * キュレーション済みペア（data/compatibility.ts）があればそれを優先し、
 * 無ければ両タイプの軸構成とチャート基準値から簡易スコアを計算する。
 */
export function computeCompatibility(codeA: TypeCode, codeB: TypeCode): CompatibilityScore {
  const curated = getCompatibility(codeA, codeB);
  if (curated) return curated;

  const A = typeMap[codeA];
  const B = typeMap[codeB];
  const ax = decodeAxes(codeA);
  const bx = decodeAxes(codeB);
  const avg = (m: keyof typeof A.chartBaseValues) =>
    (A.chartBaseValues[m] + B.chartBaseValues[m]) / 2;

  const sameTribe = ax.a4 === bx.a4;
  const bothT = ax.a4 === "T" && bx.a4 === "T";
  const bothS = ax.a4 === "S" && bx.a4 === "S";
  const bothPossess = ax.a2 === "P" && bx.a2 === "P";
  const bothGrowth = ax.a3 === "G" && bx.a3 === "G";
  const bothConnection = ax.a1 === "C" && bx.a1 === "C";
  const anySolo = ax.a4 === "S" || bx.a4 === "S";

  const scores = {
    event: clamp(avg("genba") * 0.8 + (bothT ? 20 : sameTribe ? 10 : 0) + 8),
    travel: clamp(avg("genba") * 0.75 + (sameTribe ? 10 : 0) + 10),
    discussion: clamp(
      (avg("kaishaku") + avg("yoin")) * 0.4 + (bothT ? 20 : bothS ? -12 : 4) + 14,
    ),
    trading: clamp(avg("kiroku") * 0.5 + avg("tsumi") * 0.35 + (bothPossess ? 14 : 0) + 10),
    supportProject: clamp(avg("fukyo") * 0.85 + (bothGrowth ? 18 : 0) + 8),
    fandomPeace: clamp(
      100 - (bothConnection ? 22 : 0) - avg("ninchi") * 0.18 + (anySolo ? 14 : 0),
    ),
    spendingSense: clamp(
      100 - Math.abs(A.chartBaseValues.tsumi - B.chartBaseValues.tsumi) * 0.9,
    ),
  };

  return { typeA: codeA, typeB: codeB, scores, summary: buildSummary(A.name, B.name, scores) };
}

function buildSummary(
  nameA: string,
  nameB: string,
  scores: CompatibilityScore["scores"],
): string {
  const entries = Object.entries(scores) as [keyof typeof scores, number][];
  const best = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  const worst = entries.reduce((a, b) => (b[1] < a[1] ? b : a));
  return `${nameA}と${nameB}は、${DIMENSION_PHRASE[best[0]]}相性が高め。一方で「${DIMENSION_PHRASE[worst[0]]}」場面では、お互いのペースを尊重できると心地よく続きます。`;
}

export function overallScore(scores: CompatibilityScore["scores"]): number {
  const values = Object.values(scores);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}
