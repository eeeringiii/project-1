"use client";

import type { OshicoaType } from "@/types";
import { trackEvent } from "@/lib/analytics";

/**
 * タイプ別の有料コンテンツ導線。note等のURLは types.ts の premiumUrl（仮）を参照。
 */
export default function PremiumCta({ type, oshiName }: { type: OshicoaType; oshiName?: string }) {
  const buttonLabel = oshiName
    ? `「${oshiName}」の完全取扱説明書を見る`
    : `「${type.name}」の完全取扱説明書を見る`;

  return (
    <section className="panel edge-glow relative overflow-hidden p-6 sm:p-8">
      <div className="grid-noise pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative">
        <p className="type-code text-xs text-magenta mb-3">DEEP DIVE</p>
        <h3 className="font-display text-xl font-bold leading-snug sm:text-2xl">
          {type.premiumCtaTitle}
        </h3>
        <p className="mt-3 max-w-xl text-sm text-text-sub leading-relaxed">
          {type.premiumCtaDescription}
        </p>
        <a
          href={type.premiumUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("premium_cta_clicked", { typeCode: type.code })}
          className="btn btn-primary mt-6"
        >
          {buttonLabel}
        </a>
        <p className="mt-3 text-xs text-text-muted">
          恋愛傾向ではなく、現場・同担・積み・認知・推し変まで、あなたの推し活を徹底解剖します。
        </p>
      </div>
    </section>
  );
}
