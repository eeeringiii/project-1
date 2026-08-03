import type { AxisKey, AxisScores, DiagnosisQuestion } from "@/types";
import { standardQuestions } from "@/data/questions";

const ALL_POLES: AxisKey[] = ["R", "C", "E", "P", "G", "M", "T", "S"];

function emptyTotals(): AxisScores {
  return Object.fromEntries(ALL_POLES.map((p) => [p, 0])) as AxisScores;
}

/**
 * 与えられた設問集合における、各極への割り当て重みの合計（正の重みのみ）。
 * 標準24問でも精密48問でも、実際に回答された設問集合から都度算出するため、
 * どちらのセットでも正規化が正しく機能する。
 */
export function computePoleTotals(questions: DiagnosisQuestion[]): AxisScores {
  const totals = emptyTotals();
  for (const q of questions) {
    for (const pole of ALL_POLES) {
      const w = q.weights[pole];
      if (w && w > 0) totals[pole] += w;
    }
  }
  return totals;
}

/** 標準24問の極合計（データ整合性テスト等の参照用）。 */
export const STANDARD_POLE_TOTALS: AxisScores = computePoleTotals(standardQuestions);

/**
 * 生の極スコアを -1〜1 の「その極への同意度」に正規化する。
 * 各極スコアを「最大回答強度(3) × その極の総重み」で割ることで、
 * 極ごとの質問数の偏りに依らず比較できるようにする。
 */
export function normalizeAxisScores(raw: AxisScores, totals: AxisScores): AxisScores {
  const normalized = {} as AxisScores;
  for (const pole of ALL_POLES) {
    const denom = 3 * (totals[pole] || 1);
    normalized[pole] = raw[pole] / denom;
  }
  return normalized;
}
