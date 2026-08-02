import type { Metadata } from 'next';
import { headers } from 'next/headers';
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

  // シェア用URLはサーバー側で確定させる（クライアントで location を読むとハイドレーションがズレるため）。
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? '';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  const shareUrl = `${proto}://${host}/fortune${f.typeCode ? `?type=${f.typeCode}` : ''}`;

  return (
    <main className="resultPage">
      {/* ヒーローの色は data/fortune.ts の LEVELS[].tone。OG画像と同じ値を使う。 */}
      <section className="typeHero shell" style={{ ['--chip' as string]: f.level.tone }}>
        <p className="code">今日の推し活運勢 ・ {f.displayDate}</p>
        {f.typeLine && <p style={{ color: 'var(--grape)', fontWeight: 800, fontSize: 14, margin: '6px 0 0' }}>{f.typeLine}</p>}
        <h1>{f.level.emoji} {f.level.name}</h1>
        <p className="catch">{f.headline}</p>
        <p className="note"><span>総合スコア {f.score} / 100</span><span>{trend}</span></p>
        <div style={{ marginTop: 16 }}>
          <FortuneShare
            level={f.level.name} headline={f.headline}
            topCategory={top.label} luckyAction={f.luckyAction} typeCode={f.typeCode} url={shareUrl}
          />
        </div>
        <FortunePersonalize activeTypeCode={f.typeCode} />
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
