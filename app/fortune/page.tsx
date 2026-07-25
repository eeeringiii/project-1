import type { Metadata } from 'next';
import Link from 'next/link';
import { getFortune, prevDateKey } from '@/lib/fortune';
import { getType } from '@/data/types';
import { FortuneShare } from '@/components/FortuneShare';
import { FortunePersonalize } from '@/components/FortunePersonalize';

// 日付で内容が変わるため、静的化せず毎リクエスト評価する。
export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ type?: string }> }): Promise<Metadata> {
  const { type } = await searchParams;
  const t = type ? getType(type) : undefined;
  const ogUrl = `/fortune/og${t ? `?type=${t.code}` : ''}`;
  const title = t ? `今日の推し活運勢（${t.name}）` : '今日の推し活運勢';
  return {
    title,
    description: '推し運・現場運・チケット運・課金運を、あなたの16タイプ別に。毎日変わる、推し活のための運勢占い。',
    openGraph: { title, images: [ogUrl] },
    twitter: { card: 'summary_large_image', images: [ogUrl] },
  };
}

export default async function FortunePage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const f = getFortune({ typeCode: type });
  const yesterday = getFortune({ dateKey: prevDateKey(f.dateKey), typeCode: type });
  const delta = f.score - yesterday.score;
  const trend = delta > 0 ? `▲ 昨日より+${delta}` : delta < 0 ? `▼ 昨日より${delta}` : '→ 昨日と同じ';
  const top = [...f.categories].sort((a, b) => b.score - a.score)[0];

  return (
    <main>
      <section className="resultHero">
        <div className="shell">
          <p className="eyebrow">TODAY&apos;S OSHI FORTUNE / {f.dateKey}</p>
          <p>{f.displayDate}</p>
          {f.typeLine && <p className="catch">{f.typeLine}</p>}
          <div className="code" style={{ color: f.level.tone }}>{f.level.emoji} {f.level.name}</div>
          <h1>{f.headline}</h1>
          <p className="catch">総合スコア {f.score} / 100　<span style={{ color: delta > 0 ? '#86efac' : delta < 0 ? '#fca5a5' : '#d4d0dd' }}>{trend}</span></p>
          <FortuneShare
            level={f.level.name} headline={f.headline}
            topCategory={top.label} luckyAction={f.luckyAction} typeCode={f.typeCode}
          />
          <FortunePersonalize activeTypeCode={f.typeCode} />
        </div>
      </section>

      <div className="shell resultGrid">
        <article>
          <p className="eyebrow">FORTUNE BREAKDOWN</p>
          <h2>4つの運勢</h2>
          {f.categories.map((c) => (
            <section className="item" key={c.id}>
              <b>{c.icon} {c.label}　{c.score} / 100</b>
              <p>{c.comment}</p>
            </section>
          ))}
        </article>
        <aside>
          <p className="eyebrow">LUCKY TODAY</p>
          <section className="item">
            <b>🍀 今日のラッキー推し活</b>
            <p>{f.luckyAction}</p>
          </section>
          <section className="item">
            <b>🎁 ラッキーアイテム</b>
            <p>{f.luckyItem}</p>
          </section>
          <section className="item">
            <b>🎨 ラッキーカラー</b>
            <p>
              <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 4, background: f.luckyColor.hex, marginRight: 8, verticalAlign: 'middle' }} />
              {f.luckyColor.name}
            </p>
          </section>
          <section className="item">
            <b>🤝 今日のラッキー同担タイプ</b>
            <p><Link href={`/types/${f.luckyTypeCode}`}>{f.luckyTypeCode}｜{f.luckyTypeName}</Link><br />このタイプと絡むと、今日はいい供給がありそう。</p>
          </section>
          <p className="note">運勢はその日一日、何度見ても同じ結果です（日付とタイプだけで決まり、サーバーには何も送りません）。</p>
          <p><Link className="button" href="/diagnosis">まずは16タイプ診断へ</Link></p>
        </aside>
      </div>
    </main>
  );
}
