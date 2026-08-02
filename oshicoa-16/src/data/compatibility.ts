import type { CompatibilityScore, TypeCode } from "@/types";
import { typeMap } from "@/data/types";

/**
 * 相性データ。
 * MVPでは各タイプの「相性のよいタイプ（bestTypeCode）」を types.ts に持たせ、
 * ここでは代表的なペアの7項目スコアを定義する（将来の /compatibility 本実装用の構造）。
 * タイプの組み合わせ順序が逆でも同じデータを参照できるよう、getCompatibility でキーを正規化する。
 */
export const compatibilityScores: CompatibilityScore[] = [
  {
    typeA: "RCGT",
    typeB: "CEMT",
    scores: { event: 88, travel: 74, discussion: 82, trading: 60, supportProject: 95, fandomPeace: 78, spendingSense: 70 },
    summary: "数字で押し上げる司令塔と、現場で熱を体現するパリピ。応援企画の設計と実行がきれいに噛み合う黄金コンビ。",
  },
  {
    typeA: "RCGS",
    typeB: "CEGT",
    scores: { event: 80, travel: 82, discussion: 70, trading: 58, supportProject: 92, fandomPeace: 74, spendingSense: 80 },
    summary: "静かな戦略家と現場の統率者。計画と行動が補い合い、目立たないところで確実に成果を出す。",
  },
  {
    typeA: "RCMT",
    typeB: "CEMT",
    scores: { event: 90, travel: 72, discussion: 94, trading: 55, supportProject: 66, fandomPeace: 80, spendingSense: 62 },
    summary: "ファンサの一瞬を宝物にする収集家と、感情豊かなパリピ。現場後の感想会がとにかく楽しい。",
  },
  {
    typeA: "RCMS",
    typeB: "CEMS",
    scores: { event: 66, travel: 60, discussion: 72, trading: 40, supportProject: 50, fandomPeace: 90, spendingSense: 72 },
    summary: "胸の奥に物語を持つ二人。多くを語らずとも、静けさと深さで通じ合える平和な関係。",
  },
  {
    typeA: "RPGT",
    typeB: "RPGS",
    scores: { event: 62, travel: 58, discussion: 90, trading: 66, supportProject: 84, fandomPeace: 82, spendingSense: 74 },
    summary: "入口を広げる宣教師と、奥行きを守るアーカイバー。布教の説得力が跳ね上がる名タッグ。",
  },
  {
    typeA: "RPMT",
    typeB: "RPMS",
    scores: { event: 68, travel: 70, discussion: 76, trading: 78, supportProject: 58, fandomPeace: 84, spendingSense: 66 },
    summary: "思い出を編む編集長と、証拠を保存するコレクター。残すことの尊さを分かち合える。",
  },
  {
    typeA: "CEGS",
    typeB: "CEMS",
    scores: { event: 78, travel: 84, discussion: 58, trading: 42, supportProject: 54, fandomPeace: 88, spendingSense: 74 },
    summary: "単独で動く遠征兵と、余韻に沈む亡霊。干渉しない距離感が心地よく続く、静かな相性。",
  },
  {
    typeA: "CPGT",
    typeB: "CPGS",
    scores: { event: 70, travel: 66, discussion: 72, trading: 70, supportProject: 96, fandomPeace: 80, spendingSense: 60 },
    summary: "旗を振る団長と、黙って支える大口。号令と静かな行動が噛み合う、支援の両輪。",
  },
  {
    typeA: "CPMT",
    typeB: "CPMS",
    scores: { event: 60, travel: 58, discussion: 70, trading: 92, supportProject: 62, fandomPeace: 86, spendingSense: 68 },
    summary: "人をつなぐ外交官と、静かに愛でる守護神。揃える人と迎え入れる人の、丁寧な相性。",
  },
];

function key(a: TypeCode, b: TypeCode): string {
  return [a, b].sort().join("-");
}

const compatibilityMap: Record<string, CompatibilityScore> = Object.fromEntries(
  compatibilityScores.map((c) => [key(c.typeA, c.typeB), c]),
);

/** 順序に依存せず相性データを取得する。未定義のペアは undefined。 */
export function getCompatibility(a: TypeCode, b: TypeCode): CompatibilityScore | undefined {
  return compatibilityMap[key(a, b)];
}

/** タイプの「相性のよいタイプ」の表示情報を取得する。 */
export function getBestMatch(code: TypeCode) {
  const type = typeMap[code];
  const best = typeMap[type.compatibility.bestTypeCode];
  return { type: best, description: type.compatibility.description };
}
