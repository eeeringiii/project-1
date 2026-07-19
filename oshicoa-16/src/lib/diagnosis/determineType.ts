import type { AxisKey, AxisScores, DiagnosisAnswer, TypeCode } from "@/types";
import { AXIS_PAIRS } from "@/types";
import { questionMap } from "@/data/questionSets";
import { calculateAxes } from "@/lib/diagnosis/calculateAxes";
import { computePoleTotals, normalizeAxisScores } from "@/lib/diagnosis/normalizeScores";

/** 同点時の最終フォールバック（分布の偏りを抑えるための事前定義）。軸ごとに採用する極。 */
const TIE_PREFERENCE: Record<number, AxisKey> = {
  0: "R",
  1: "P",
  2: "M",
  3: "T",
};

const EPSILON = 1e-9;

/**
 * 1つの対立軸について、どちらの極を採用するか決定する。
 * 1. 正規化スコアの比較
 * 2. 同点時: 強い回答（±3）だけで再計算した差
 * 3. なお同点時: その軸に関係する直近回答の向き
 * 4. それでも同点: 事前定義ルール
 * Math.random は使わない（同じ回答は必ず同じ結果）。
 * 正規化の分母となる極合計 totals は、実際に回答された設問集合から算出したものを共通利用する。
 */
function decideAxis(
  pairIndex: number,
  positive: AxisKey,
  negative: AxisKey,
  normalized: AxisScores,
  totals: AxisScores,
  answers: DiagnosisAnswer[],
): AxisKey {
  const diff = normalized[positive] - normalized[negative];
  if (Math.abs(diff) > EPSILON) return diff > 0 ? positive : negative;

  // 1. 強い回答のみで再計算
  const strongAnswers = answers.filter((a) => Math.abs(a.value) === 3);
  const strongNorm = normalizeAxisScores(calculateAxes(strongAnswers), totals);
  const strongDiff = strongNorm[positive] - strongNorm[negative];
  if (Math.abs(strongDiff) > EPSILON) return strongDiff > 0 ? positive : negative;

  // 2. その軸に関係する直近回答の向き
  for (let i = answers.length - 1; i >= 0; i--) {
    const single = normalizeAxisScores(calculateAxes([answers[i]]), totals);
    const singleDiff = single[positive] - single[negative];
    if (Math.abs(singleDiff) > EPSILON) return singleDiff > 0 ? positive : negative;
  }

  // 3. 事前定義ルール
  return TIE_PREFERENCE[pairIndex];
}

/**
 * 正規化済みスコアと回答から16タイプの4文字コードを決定する。
 *
 * タイプコードは「1文字=1軸」の単純連結ではない（仕様の16コードに合わせる）。
 *  - 1文字目: 軸1 R↔C の採用極。
 *  - 2文字目: 軸2 E(体験)↔P(所有) を、軸1の結果に応じた表記に変換する。
 *      R系では 体験=「C」/ 所有=「P」（→ RC.. / RP..）
 *      C系では 体験=「E」/ 所有=「P」（→ CE.. / CP..）
 *  - 3文字目: 軸3 G↔M、4文字目: 軸4 T↔S。
 */
export function determineType(rawScores: AxisScores, answers: DiagnosisAnswer[]): TypeCode {
  const scopeQuestions = answers
    .map((a) => questionMap[a.questionId])
    .filter((q): q is NonNullable<typeof q> => Boolean(q));
  const totals = computePoleTotals(scopeQuestions);
  const normalized = normalizeAxisScores(rawScores, totals);

  const a1 = decideAxis(0, AXIS_PAIRS[0].positive, AXIS_PAIRS[0].negative, normalized, totals, answers); // R / C
  const a2 = decideAxis(1, AXIS_PAIRS[1].positive, AXIS_PAIRS[1].negative, normalized, totals, answers); // E / P
  const a3 = decideAxis(2, AXIS_PAIRS[2].positive, AXIS_PAIRS[2].negative, normalized, totals, answers); // G / M
  const a4 = decideAxis(3, AXIS_PAIRS[3].positive, AXIS_PAIRS[3].negative, normalized, totals, answers); // T / S

  const char1 = a1;
  const char2 = a1 === "R" ? (a2 === "E" ? "C" : "P") : a2 === "E" ? "E" : "P";
  const code = `${char1}${char2}${a3}${a4}`;
  return code as TypeCode;
}
