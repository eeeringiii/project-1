import type { AxisKey, AxisScores } from "@/types";
import { questions } from "@/data/questions";

const ALL_POLES: AxisKey[] = ["R", "C", "E", "P", "G", "M", "T", "S"];

/**
 * 各極が「全質問中どれだけの重みを割り当てられているか」の合計（正の重みのみ）。
 * 質問データから静的に算出されるため、質問を編集すれば自動的に追従する。
 */
export const POLE_TOTAL_WEIGHT: AxisScores = (() => {
  const totals = Object.fromEntries(ALL_POLES.map((p) => [p, 0])) as AxisScores;
  for (const q of questions) {
    for (const pole of ALL_POLES) {
      const w = q.weights[pole];
      if (w && w > 0) totals[pole] += w;
    }
  }
  return totals;
})();

/**
 * 生の極スコアを -1〜1 の「その極への同意度」に正規化する。
 *
 * 極ごとに割り当て重みが異なっても（質問数の偏りがあっても）比較が公平になるよう、
 * 各極スコアを「最大回答強度(3) × その極の総重み」で割る。
 * これにより、少数の質問しか割り当てられていない極（例: T）でも、
 * 多数の質問を持つ極（例: S）と同じ土俵で比較できる。
 */
export function normalizeAxisScores(raw: AxisScores): AxisScores {
  const normalized = {} as AxisScores;
  for (const pole of ALL_POLES) {
    const denom = 3 * (POLE_TOTAL_WEIGHT[pole] || 1);
    normalized[pole] = raw[pole] / denom;
  }
  return normalized;
}
