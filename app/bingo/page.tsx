import type { Metadata } from 'next';
import { BingoCard } from '@/components/BingoCard';
import { buildBingoCard } from '@/data/bingo';
import { toJstDateKey } from '@/lib/fortune';

// カードは日付で変わるため、静的化せず毎リクエスト評価する（/fortune と同じ扱い）。
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ヲタク業ビンゴ',
  description: 'あなたのヲタクの業は、いくつ当てはまる？ タップして埋めるだけのヲタク業ビンゴ。ビンゴ数とヲタクランクを判定して、推し友とシェアしよう。',
  openGraph: {
    title: 'ヲタク業ビンゴ｜OSHICOA 16',
    description: 'あなたのヲタクの業は、いくつ当てはまる？ タップして埋めるだけのヲタク業ビンゴ。',
    images: ['/api/og/bingo'],
  },
  twitter: { card: 'summary_large_image', images: ['/api/og/bingo'] },
};

/** 日付を数値の種に変換する（同じ日なら同じカードになる）。 */
function seedFromDateKey(dateKey: string): number {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash ^= dateKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export default function BingoPage() {
  const dateKey = toJstDateKey();

  return (
    <main className="shell section bingoPage">
      <div className="bingoHead">
        <p className="eyebrow">KARMA BINGO</p>
        <h1>ヲタク業ビンゴ</h1>
        <p className="lead">
          当てはまるマスをタップするだけ。あなたのヲタクの業、いくつ埋まりますか。
          <br />
          カードは毎日変わります。
        </p>
      </div>

      <BingoCard initialCard={buildBingoCard(seedFromDateKey(dateKey))} />
    </main>
  );
}
