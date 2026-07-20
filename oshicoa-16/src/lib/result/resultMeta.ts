import type { ChartMetric, ChartMetricId, TypeCode } from "@/types";
import { chartMetrics } from "@/data/chartMetrics";

/** ISO日時を「2026.07.20」形式に整形する。 */
export function formatDiagnosisDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

/** 診断結果の識別ID（例: OSHICOA-CEMS-0610）。completedAt から決定的に生成。 */
export function buildResultId(typeCode: TypeCode, completedAt?: string): string {
  const seed = hash(`${typeCode}:${completedAt ?? ""}`);
  const suffix = String(seed % 10000).padStart(4, "0");
  return `OSHICOA-${typeCode}-${suffix}`;
}

export type Standout = {
  metric: ChartMetric;
  value: number;
  topPercent: number;
};

/**
 * 最も突出した能力値を「上位◯%（推定）」の演出用に算出する。
 * 値が高いほど上位%は小さくなる（あくまで遊びの指標として提示）。
 */
export function standoutMetric(chartScores: Record<ChartMetricId, number>): Standout {
  let best = chartMetrics[0];
  let bestValue = chartScores[best.id] ?? 0;
  for (const m of chartMetrics) {
    const v = chartScores[m.id] ?? 0;
    if (v > bestValue) {
      best = m;
      bestValue = v;
    }
  }
  const topPercent = Math.min(50, Math.max(1, Math.round((100 - bestValue) / 2.5)));
  return { metric: best, value: bestValue, topPercent };
}
