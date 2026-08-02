'use client';

import { useEffect, useState } from 'react';

const MESSAGES = ['2人の推し方を照合中…', '現場での距離感を解析中…', '推し活の化学反応を計算中…'];

/** 解析中の短い演出。prefers-reduced-motion のときはメッセージを切り替えません */
export function CompatibilityLoading({ reducedMotion }: { reducedMotion: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % MESSAGES.length), 280);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  return (
    <div className="compatLoading" role="status" aria-live="polite">
      <p className="loadingArt" aria-hidden>
        💞
      </p>
      <p className="eyebrow" style={{ display: 'block', width: 'fit-content', margin: '0 auto 10px' }}>
        MATCHING IN PROGRESS
      </p>
      <p className="compatLoadingText">{reducedMotion ? '2人の相性を解析中…' : MESSAGES[index]}</p>
    </div>
  );
}
