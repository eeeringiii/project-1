import { OshicoaType } from '@/types';
import { paidNote, offerUrl, offerCopy } from '@/data/offers';

/**
 * 有料コンテンツへの導線。
 * data/offers.ts の `url` が未設定のあいだは何も描画しないので、
 * 公開前にリンク切れのCTAが出てしまうことはありません。
 */
export function OfferCta({ type, placement }: { type: OshicoaType; placement: 'result' | 'type' }) {
  const href = offerUrl(placement, type.code);
  if (!href) return null;
  const copy = offerCopy(type);

  return (
    <aside className="offerCta">
      <p className="eyebrow">{paidNote.eyebrow}</p>
      <h2>{copy.heading}</h2>
      <p>{copy.body}</p>
      <a className="button" href={href} target="_blank" rel="noopener noreferrer">
        {paidNote.buttonLabel}
      </a>
      {paidNote.priceLabel && <p className="offerPrice">{paidNote.priceLabel}</p>}
    </aside>
  );
}
