import type { ChartMetricId } from "@/types";
import RadarChart from "@/components/charts/RadarChart";
import { standoutMetric } from "@/lib/result/resultMeta";

export default function ResultStatus({
  chartScores,
  undiagnosed = false,
}: {
  chartScores: Record<ChartMetricId, number>;
  undiagnosed?: boolean;
}) {
  const standout = standoutMetric(chartScores);

  return (
    <section className="panel p-6">
      <h2 className="text-center font-display text-base font-bold text-purple">
        <span className="sparkle mr-1" aria-hidden="true">✦</span>
        あなたのヲタクステータス
        <span className="sparkle ml-1" aria-hidden="true">✦</span>
      </h2>

      <div className="mx-auto mt-4 max-w-sm">
        <RadarChart values={chartScores} size={340} />
      </div>

      {/* 上位◯% バッジ */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <span className="ribbon flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold">
          <span aria-hidden="true">♛</span>
          上位{standout.topPercent}%
        </span>
        <p className="text-sm text-text-sub">
          <span className="font-bold text-text">{standout.metric.name}</span>
          が高いタイプ！
        </p>
      </div>

      {/* レーダーの見方 */}
      <div className="mt-5 rounded-xl bg-panel-soft p-3 text-center text-[11px] text-text-muted">
        <span className="type-code text-purple">レーダーの見方</span>
        <span className="mx-2" aria-hidden="true">/</span>
        外側にいくほど、その力が強め
      </div>

      {undiagnosed && (
        <p className="mt-3 text-center text-xs text-text-muted">
          ※ 診断前はタイプの基準値です。回答するとあなた個人の値になります。
        </p>
      )}
    </section>
  );
}
