import type { ChartMetric, ChartMetricId } from "@/types";

/** レーダーチャートの8項目。順序は表示順。 */
export const chartMetrics: ChartMetric[] = [
  { id: "genba", name: "現場行動力", shortName: "現場" },
  { id: "tsumi", name: "積み耐性", shortName: "積み" },
  { id: "fukyo", name: "布教力", shortName: "布教" },
  { id: "kaishaku", name: "解釈力", shortName: "解釈" },
  { id: "rentai", name: "同担連帯力", shortName: "連帯" },
  { id: "ninchi", name: "認知欲", shortName: "認知" },
  { id: "yoin", name: "余韻持続力", shortName: "余韻" },
  { id: "kiroku", name: "記録保存力", shortName: "記録" },
];

export const chartMetricIds: ChartMetricId[] = chartMetrics.map((m) => m.id);

export const chartMetricMap: Record<ChartMetricId, ChartMetric> = Object.fromEntries(
  chartMetrics.map((m) => [m.id, m]),
) as Record<ChartMetricId, ChartMetric>;
