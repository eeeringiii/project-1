import { CtaPlacement, buildPremiumNoteUrl, premiumNotePrice, premiumNoteUrl } from '@/lib/premium';
import { OshicoaType } from '@/types';

/**
 * 有料note への導線。
 * NEXT_PUBLIC_PREMIUM_NOTE_URL が未設定のあいだは何も描画しません。
 */
export function PremiumCta({ type, placement, compact = false }: { type: OshicoaType; placement: CtaPlacement; compact?: boolean }) {
  const href = buildPremiumNoteUrl(premiumNoteUrl, type.code, placement);
  if (!href) return null;

  return (
    <aside className={compact ? 'premiumCta compact' : 'premiumCta'}>
      <p className="eyebrow">OSHICOA 16 完全版</p>
      <h2>{type.premiumCtaTitle}</h2>
      <p className="premiumLead">{type.premiumCtaDescription}</p>
      {!compact && (
        <ul className="premiumPoints">
          <li>16タイプ全解説（強み・愛おしい業・ラクになるコツ）</li>
          <li>同担／複数推し／オタ友の相性の読み方</li>
          <li>推し変・降り・情緒振り回され期の処方箋</li>
        </ul>
      )}
      <a className="button" href={href} target="_blank" rel="noopener noreferrer">
        noteで続きを読む（¥{premiumNotePrice}）→
      </a>
      <p className="premiumFoot">無料パートだけでも読めます。感想は #OSHICOA16 へ。</p>
    </aside>
  );
}
