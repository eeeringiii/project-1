"use client";

interface DayData {
  date: string;
  calories: number;
}

interface Props {
  data: DayData[];
  goal: number;
}

export default function CalorieChart({ data, goal }: Props) {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const max = Math.max(goal * 1.3, ...data.map((d) => d.calories), 100);
  const W = 300;
  const H = 140;
  const padL = 30;
  const padB = 24;
  const chartW = W - padL - 8;
  const chartH = H - padB - 8;
  const barW = chartW / 7 - 4;

  const goalY = H - padB - (goal / max) * chartH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* goal line */}
      <line x1={padL} y1={goalY} x2={W - 8} y2={goalY} stroke="#93c5fd" strokeDasharray="4 2" strokeWidth="1" />
      <text x={padL + 2} y={goalY - 3} fontSize="8" fill="#93c5fd">目標</text>

      {data.map((d, i) => {
        const barH = (d.calories / max) * chartH;
        const x = padL + i * (chartW / 7) + 2;
        const y = H - padB - barH;
        const date = new Date(d.date);
        const dayLabel = days[date.getDay()];
        const over = d.calories > goal;
        return (
          <g key={d.date}>
            {d.calories > 0 && (
              <rect x={x} y={y} width={barW} height={barH} rx="3" fill={over ? "#f87171" : "#4ade80"} />
            )}
            <text x={x + barW / 2} y={H - padB + 12} textAnchor="middle" fontSize="9" fill="#6b7280">
              {dayLabel}
            </text>
            {d.calories > 0 && (
              <text x={x + barW / 2} y={y - 2} textAnchor="middle" fontSize="8" fill="#374151">
                {d.calories}
              </text>
            )}
          </g>
        );
      })}

      {/* y-axis */}
      <line x1={padL} y1={8} x2={padL} y2={H - padB} stroke="#e5e7eb" strokeWidth="1" />
      <line x1={padL} y1={H - padB} x2={W - 8} y2={H - padB} stroke="#e5e7eb" strokeWidth="1" />
    </svg>
  );
}
