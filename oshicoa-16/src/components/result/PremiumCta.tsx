"use client";

import type { OshicoaType } from "@/types";
import { getPremium, formatPrice } from "@/data/premium";
import { siteMeta } from "@/lib/site";
import { trackEvent } from "@/lib/analytics";

/**
 * タイプ別の有料コンテンツ導線。設定は data/premium.ts に集約。
 * 公開済み（available）ならnote等へのリンク、未公開なら「準備中」表示（デッドリンクにしない）。
 */
export default function PremiumCta({ type, oshiName }: { type: OshicoaType; oshiName?: string }) {
  const premium = getPremium(type.code);
  const price = formatPrice(premium.price);
  const buttonLabel = oshiName
    ? `「${oshiName}」の完全取扱説明書を見る`
    : `「${type.name}」の完全取扱説明書を見る`;

  return (
    <section className="panel edge-glow relative overflow-hidden p-6 sm:p-8">
      <div className="grid-noise pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative">
        <div className="flex items-center justify-center gap-2">
          <span className="type-code text-xs text-magenta">DEEP DIVE</span>
          {premium.available && price && (
            <span className="ribbon rounded-full px-3 py-0.5 text-xs font-bold">{price}</span>
          )}
          {!premium.available && (
            <span className="rounded-full border border-line-strong px-3 py-0.5 text-[11px] text-text-muted">
              近日公開
            </span>
          )}
        </div>

        <h3 className="mt-3 text-center font-display text-xl font-bold leading-snug sm:text-2xl">
          {premium.title}
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-text-sub leading-relaxed">
          {premium.description}
        </p>

        {premium.available ? (
          <div className="mt-6 flex flex-col items-center gap-2">
            <a
              href={premium.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("premium_cta_clicked", { typeCode: type.code })}
              className="btn btn-primary"
            >
              {buttonLabel}
              {price && <span className="ml-1 text-xs opacity-90">（{price}）</span>}
            </a>
            <p className="text-xs text-text-muted">
              恋愛傾向ではなく、現場・同担・積み・認知・推し変まで徹底解剖します。
            </p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              type="button"
              disabled
              className="btn btn-ghost cursor-not-allowed opacity-60"
              aria-disabled="true"
            >
              完全取扱説明書は準備中です
            </button>
            <p className="text-xs text-text-muted">
              公開のお知らせは
              <span className="text-purple"> X {siteMeta.xAccount}（準備中）</span>
              でお届け予定です。
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
