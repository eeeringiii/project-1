'use client';

import { ChartMetricId } from '@/types';

const labels: Record<ChartMetricId, string> = {
  event: '現場行動力', spending: '積み耐性', evangelism: '布教力', interpretation: '解釈力',
  fandom: '同担連帯力', recognition: '認知欲', afterglow: '余韻持続力', archive: '記録保存力',
};

export function Radar({ scores }: { scores: Record<ChartMetricId, number> }) {
  const data = Object.keys(labels) as ChartMetricId[];
  const polar = (i: number, r: number) => {
    const angle = -Math.PI / 2 + i * Math.PI * 2 / data.length;
    return [150 + Math.cos(angle) * r, 150 + Math.sin(angle) * r];
  };
  // 一番外側のリング（半径120）が100点。スコアをそのまま半径に使うと満点でも
  // 外周に届かないので、0〜100点を0〜120の半径に変換します。
  const outerRing = 120;
  const radius = (score: number) => Math.max(0, Math.min(100, score)) / 100 * outerRing;
  const ring = (r: number) => data.map((_, i) => polar(i, r).join(',')).join(' ');
  const value = data.map((metric, i) => polar(i, radius(scores[metric])).join(',')).join(' ');

  return (
    <div className="radarCard">
      <svg className="radar" viewBox="-12 -8 324 320" role="img" aria-label={data.map(metric => `${labels[metric]} ${scores[metric]}点`).join('、')}>
        {[30, 60, 90, 120].map(r => <polygon key={r} points={ring(r)} fill={r === 120 ? '#fff8fc' : 'none'} stroke="#e7d9ef" strokeWidth="1.5" />)}
        {data.map((metric, i) => {
          const [x, y] = polar(i, 135);
          return (
            <g key={metric}>
              <line x1="150" y1="150" x2={x} y2={y} stroke="#efe2f2" strokeWidth="1.5" />
              <text x={x} y={y + 3} fill="#7c6b90" fontSize="10.5" fontWeight="700" textAnchor="middle">{labels[metric]}</text>
            </g>
          );
        })}
        <polygon points={value} fill="rgba(255,111,163,.3)" stroke="#8b63e8" strokeWidth="3" strokeLinejoin="round" />
        {data.map((metric, i) => {
          const [x, y] = polar(i, radius(scores[metric]));
          return <circle key={metric} cx={x} cy={y} r="4" fill="#fff" stroke="#8b63e8" strokeWidth="2.5" />;
        })}
      </svg>
      <p className="note">{data.map(metric => <span key={metric}>{labels[metric]} {scores[metric]}</span>)}</p>
    </div>
  );
}
