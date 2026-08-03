"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "愛の向かう先を計測",
  "現場行動パターンを照合",
  "同担との距離感を解析",
  "ヲタクの業を抽出",
];

/** 解析演出。実計算は瞬時なので、演出は1〜2秒に収める。onDone で結果へ遷移。 */
export default function AnalysisLoading({ onDone }: { onDone: () => void }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setActive((a) => Math.min(a + 1, STEPS.length));
    }, 380);
    const done = setTimeout(onDone, 1700);
    return () => {
      clearInterval(stepTimer);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div className="mx-auto max-w-md py-16 text-center" role="status" aria-live="polite">
      <div className="relative mx-auto h-24 w-24">
        <div className="absolute inset-0 rounded-full border border-line" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-violet border-r-magenta [animation-duration:1.1s]" />
        <div className="absolute inset-3 animate-pulse-soft rounded-full bg-[radial-gradient(circle,rgba(217,70,239,0.35),transparent_70%)]" />
      </div>
      <p className="mt-8 font-display text-lg font-bold text-gradient">
        あなたのヲタク生態を解析中
      </p>
      <ul className="mt-6 space-y-2 text-left">
        {STEPS.map((step, i) => (
          <li
            key={step}
            className={`flex items-center gap-2 text-sm transition-colors ${
              i < active ? "text-text" : "text-text-muted"
            }`}
          >
            <span aria-hidden="true" className={i < active ? "text-magenta" : "text-line-strong"}>
              {i < active ? "◆" : "◇"}
            </span>
            {step}
            {i < active && <span className="sr-only">完了</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
