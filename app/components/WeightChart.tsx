"use client";

interface WeightEntry {
  date: string;
  weight: number;
}

export default function WeightChart({ data }: { data: WeightEntry[] }) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
        2件以上記録すると表示されます
      </div>
    );
  }

  const W = 300;
  const H = 120;
  const pad = { l: 36, r: 8, t: 12, b: 24 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;

  const weights = data.map((d) => d.weight);
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;

  const toX = (i: number) => pad.l + (i / (data.length - 1)) * chartW;
  const toY = (w: number) => pad.t + chartH - ((w - minW) / (maxW - minW)) * chartH;

  const points = data.map((d, i) => `${toX(i)},${toY(d.weight)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <polyline points={points} fill="none" stroke="#4ade80" strokeWidth="2" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={d.date}>
          <circle cx={toX(i)} cy={toY(d.weight)} r="3" fill="#16a34a" />
          {i === data.length - 1 && (
            <text x={toX(i) + 5} y={toY(d.weight) + 4} fontSize="9" fill="#16a34a">
              {d.weight}kg
            </text>
          )}
        </g>
      ))}
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H - pad.b} stroke="#e5e7eb" strokeWidth="1" />
      <line x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b} stroke="#e5e7eb" strokeWidth="1" />
      <text x={pad.l - 2} y={pad.t + 4} textAnchor="end" fontSize="8" fill="#9ca3af">{maxW.toFixed(1)}</text>
      <text x={pad.l - 2} y={H - pad.b} textAnchor="end" fontSize="8" fill="#9ca3af">{minW.toFixed(1)}</text>
    </svg>
  );
}
