import type { ChartMetricId } from "@/types";
import { chartMetrics } from "@/data/chartMetrics";

type Props = {
  values: Record<ChartMetricId, number>;
  size?: number;
  className?: string;
};

/**
 * 依存ライブラリなしのSVGレーダーチャート（8項目）。
 * - SSRで確定描画するためレイアウトシフトが起きない。
 * - スクリーンリーダー向けに role="img" のラベルと、視覚的に隠したデータ表を併記する。
 * - モバイルでラベルが重ならないよう、各頂点の位置に応じて text-anchor を調整する。
 */
export default function RadarChart({ values, size = 320, className = "" }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.32;
  const count = chartMetrics.length;
  const angleFor = (i: number) => (Math.PI * 2 * i) / count - Math.PI / 2;

  const pointAt = (i: number, r: number) => {
    const a = angleFor(i);
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const dataPoints = chartMetrics.map((m, i) => {
    const v = Math.max(0, Math.min(100, values[m.id] ?? 0));
    return pointAt(i, (v / 100) * radius);
  });
  const polygon = dataPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const altText =
    "能力値レーダーチャート。" +
    chartMetrics.map((m) => `${m.name}${values[m.id] ?? 0}`).join("、") +
    "（各100点満点）。";

  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        height="100%"
        role="img"
        aria-label={altText}
        className="max-w-full"
      >
        <defs>
          <radialGradient id="radarFill" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(217,70,239,0.42)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0.28)" />
          </radialGradient>
        </defs>

        {/* グリッドリング */}
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={chartMetrics
              .map((_, i) => {
                const p = pointAt(i, radius * ring);
                return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
              })
              .join(" ")}
            fill="none"
            stroke="rgba(160,140,220,0.16)"
            strokeWidth={1}
          />
        ))}

        {/* 軸線 */}
        {chartMetrics.map((_, i) => {
          const p = pointAt(i, radius);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="rgba(160,140,220,0.14)"
              strokeWidth={1}
            />
          );
        })}

        {/* データ多角形 */}
        <polygon points={polygon} fill="url(#radarFill)" stroke="#d946ef" strokeWidth={1.8} />
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.6} fill="#ff5da2" />
        ))}

        {/* ラベル */}
        {chartMetrics.map((m, i) => {
          const p = pointAt(i, radius + size * 0.075);
          const anchor =
            Math.abs(p.x - cx) < 6 ? "middle" : p.x > cx ? "start" : "end";
          return (
            <text
              key={m.id}
              x={p.x}
              y={p.y}
              dy="0.32em"
              textAnchor={anchor}
              fontSize={size * 0.037}
              fill="#b7bad0"
              className="font-sans"
            >
              {m.shortName}
            </text>
          );
        })}
      </svg>

      {/* SR向け / チャート非表示時の代替テキスト */}
      <figcaption className="sr-only">
        <table>
          <caption>{altText}</caption>
          <tbody>
            {chartMetrics.map((m) => (
              <tr key={m.id}>
                <th scope="row">{m.name}</th>
                <td>{values[m.id] ?? 0} / 100</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}
