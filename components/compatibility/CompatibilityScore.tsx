'use client';

import { getRankText } from '@/lib/compatibility';
import { CompatibilityRank } from '@/lib/compatibility/types';

const SIZE = 200;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** 総合相性の円形ゲージ。色だけに頼らず、数値とテキストでも伝えます */
export function CompatibilityScore({
  score,
  rank,
  pairTitle,
}: {
  score: number;
  rank: CompatibilityRank;
  pairTitle: string;
}) {
  const rankText = getRankText(rank);
  const filled = (Math.max(0, Math.min(100, score)) / 100) * CIRCUMFERENCE;

  return (
    <section className="compatScoreCard" aria-labelledby="compat-score-heading">
      <p className="eyebrow">TOTAL MATCH</p>
      <h2 id="compat-score-heading" className="srOnly">
        総合相性
      </h2>
      <div className="compatGaugeWrap">
        <svg className="compatGauge" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-hidden focusable="false">
          <defs>
            <linearGradient id="compatGaugeGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff81ae" />
              <stop offset="55%" stopColor="#8b63e8" />
              <stop offset="100%" stopColor="#2fc3b6" />
            </linearGradient>
          </defs>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#f0e2ef" strokeWidth={STROKE} />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="url(#compatGaugeGradient)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </svg>
        <div className="compatGaugeCenter">
          <span className="compatScoreLabel">総合相性</span>
          <span className="compatScoreValue">
            {score}
            <i>%</i>
          </span>
        </div>
      </div>
      <p className="srOnly">総合相性は{score}パーセントです。</p>

      <p className="compatRankTitle">{rankText.title}</p>
      <p className="compatRankText">{rankText.shortText}</p>
      <p className="compatPairTitle">
        <span aria-hidden>✧</span> {pairTitle} <span aria-hidden>✧</span>
      </p>
    </section>
  );
}
