import type { ChartMetricId, DiagnosisAnswer, TypeCode } from "@/types";
import { questionMap } from "@/data/questionSets";
import { chartMetricIds } from "@/data/chartMetrics";
import { typeMap } from "@/data/types";

const CHART_SCALE = 4; // 回答補正の反映倍率

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * レーダーチャート8項目のスコアを算出する。
 * タイプごとの基準値(chartBaseValues)に、回答のchartWeights×回答強度による補正を加え、
 * 0〜100にクランプする。同じタイプでも回答によって個人差が出る。
 */
export function calculateChart(
  typeCode: TypeCode,
  answers: DiagnosisAnswer[],
): Record<ChartMetricId, number> {
  const base = typeMap[typeCode].chartBaseValues;

  const deltas = Object.fromEntries(
    chartMetricIds.map((id) => [id, 0]),
  ) as Record<ChartMetricId, number>;

  for (const answer of answers) {
    const question = questionMap[answer.questionId];
    if (!question?.chartWeights) continue;
    for (const [metricId, weight] of Object.entries(question.chartWeights)) {
      if (!weight) continue;
      deltas[metricId as ChartMetricId] += weight * answer.value;
    }
  }

  const result = {} as Record<ChartMetricId, number>;
  for (const id of chartMetricIds) {
    result[id] = clamp(base[id] + deltas[id] * CHART_SCALE);
  }
  return result;
}
