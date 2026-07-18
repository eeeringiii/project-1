import type { TypeCode } from "@/types";

type Props = {
  code: TypeCode;
  size?: number;
  className?: string;
  animate?: boolean;
};

// コード文字列から決定的な数値を得る（色相・配置のシード）。
function hashCode(code: string): number {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) & 0xffff;
  return h;
}

/**
 * タイプコードから生成する抽象キービジュアル。
 * キャラクター画像が未用意でも成立するよう、光・軌道・粒子・コードを組み合わせる。
 * 将来、同じ枠にキャラクター画像を差し込めるよう独立コンポーネント化している。
 */
export default function TypeVisual({ code, size = 320, className = "", animate = true }: Props) {
  const seed = hashCode(code);
  const hue = seed % 360;
  const cx = size / 2;
  const cy = size / 2;
  const chars = code.split("");

  // 4文字を円周上のノードとして配置。
  const nodes = chars.map((ch, i) => {
    const a = (Math.PI * 2 * i) / chars.length - Math.PI / 2 + (seed % 7) * 0.05;
    const r = size * 0.28;
    return { ch, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });

  const particles = Array.from({ length: 14 }, (_, i) => {
    const a = (seed * (i + 3)) % 360;
    const rad = (a * Math.PI) / 180;
    const dist = size * (0.16 + ((seed >> i) % 20) / 100);
    return { x: cx + Math.cos(rad) * dist, y: cy + Math.sin(rad) * dist, r: 1 + (i % 3) };
  });

  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" className="max-w-full">
        <defs>
          <radialGradient id={`glow-${code}`} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={`hsla(${hue}, 90%, 66%, 0.55)`} />
            <stop offset="55%" stopColor={`hsla(${hue + 40}, 85%, 55%, 0.18)`} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id={`ring-${code}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={`hsl(${hue}, 90%, 68%)`} />
            <stop offset="100%" stopColor={`hsl(${hue + 60}, 85%, 62%)`} />
          </linearGradient>
        </defs>

        <circle cx={cx} cy={cy} r={size * 0.42} fill={`url(#glow-${code})`} />

        {/* 軌道リング */}
        {[0.42, 0.34, 0.26].map((r, i) => (
          <g
            key={r}
            style={
              animate
                ? {
                    transformOrigin: "center",
                    animation: `spin-${i % 2 === 0 ? "cw" : "ccw"} ${16 + i * 6}s linear infinite`,
                  }
                : undefined
            }
          >
            <circle
              cx={cx}
              cy={cy}
              r={size * r}
              fill="none"
              stroke={`url(#ring-${code})`}
              strokeWidth={1}
              strokeDasharray={i === 1 ? "3 7" : undefined}
              opacity={0.5 - i * 0.08}
            />
          </g>
        ))}

        {/* 粒子 */}
        {particles.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={`hsla(${hue + i * 8}, 90%, 72%, 0.7)`} />
        ))}

        {/* 中央のコード（背景的に大きく） */}
        <text
          x={cx}
          y={cy}
          dy="0.34em"
          textAnchor="middle"
          className="type-code"
          fontSize={size * 0.2}
          fill={`hsla(${hue}, 60%, 88%, 0.12)`}
        >
          {code}
        </text>

        {/* ノード（4文字） */}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={size * 0.055} fill="rgba(10,10,16,0.85)" stroke={`hsl(${hue + i * 30}, 85%, 66%)`} strokeWidth={1.2} />
            <text x={n.x} y={n.y} dy="0.34em" textAnchor="middle" className="type-code" fontSize={size * 0.05} fill="#eef0f6">
              {n.ch}
            </text>
          </g>
        ))}
      </svg>
      <style>{`
        @keyframes spin-cw { to { transform: rotate(360deg); } }
        @keyframes spin-ccw { to { transform: rotate(-360deg); } }
        @media (prefers-reduced-motion: reduce) {
          svg g { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
