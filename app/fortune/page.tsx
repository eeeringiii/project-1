import type { Metadata } from 'next';
import Link from 'next/link';
import { FortunePersonalize } from '@/components/FortunePersonalize';
import { FortuneShare } from '@/components/FortuneShare';
import { getType } from '@/data/types';
import { getFortune, prevDateKey } from '@/lib/fortune';

// 日付で内容が変わるため、静的化せず毎リクエスト評価する。
export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ type?: string }> }): Promise<Metadata> {
  const { type } = await searchParams;
  const t = type ? getType(type) : undefined;
  const ogUrl = `/api/og/fortune${t ? `?type=${t.code}` : ''}`;
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
  const fortune = getFortune({ typeCode: type });
  const yesterday = getFortune({ dateKey: prevDateKey(fortune.dateKey), typeCode: type });
  const delta = fortune.score - yesterday.score;
  const trend = delta > 0 ? `▲ 昨日より+${delta}` : delta < 0 ? `▼ 昨日より${delta}` : '→ 昨日と同じ';
  const top = [...fortune.categories].sort((a, b) => b.score - a.score)[0];

  return (
    <main className="shell">
      <section className="typeHero fortuneHero" style={{ ['--chip' as string]: fortune.level.tone }}>
        <p className="code">DAILY FORTUNE ・ {fortune.displayDate}</p>
        {fortune.typeLine && <p className="fortuneTypeLine">{fortune.typeLine}</p>}
        <h1><span className="fortuneEmoji" aria-hidden>{fortune.level.emoji}</span>{fortune.level.name}</h1>
        <p className="catch">{fortune.headline}</p>
        <p className="note"><span>総合スコア {fortune.score} / 100</span><span>{trend}</span></p>
        <div className="fortuneShare">
          <FortuneShare
            level={fortune.level.name}
            emoji={fortune.level.emoji}
            headline={fortune.headline}
            topCategory={top.label}
            luckyAction={fortune.luckyAction}
            typeCode={fortune.typeCode}
            typeName={fortune.typeName}
          />
        </div>
        <FortunePersonalize activeTypeCode={fortune.typeCode} />
      </section>

      <div className="resultGrid">
        <article className="profileCard">
          <p className="eyebrow">FORTUNE BREAKDOWN</p>
          <h2>4つの運勢</h2>
          {fortune.categories.map(category => (
            <div className="abilityRow fortuneRow" key={category.id}>
              <div><span>{category.icon} {category.label}</span><b>{category.score}</b></div>
              <progress max="100" value={category.score} aria-label={`${category.label} ${category.score}点`} />
              <p>{category.comment}</p>
            </div>
          ))}
        </article>

        <aside className="profileCard">
          <p className="eyebrow">LUCKY TODAY</p>
          <h2>今日のラッキー</h2>
          <dl>
            <div><dt>推し活</dt><dd>{fortune.luckyAction}</dd></div>
            <div><dt>アイテム</dt><dd>{fortune.luckyItem}</dd></div>
            <div>
              <dt>カラー</dt>
              <dd><span className="colorChip" style={{ background: fortune.luckyColor.hex }} aria-hidden />{fortune.luckyColor.name}</dd>
            </div>
            <div>
              <dt>同担タイプ</dt>
              <dd>
                <Link href={`/types/${fortune.luckyTypeCode}`}>{fortune.luckyTypeCode}｜{fortune.luckyTypeName}</Link>
                <br />このタイプと絡むと、今日はいい供給がありそう。
              </dd>
            </div>
          </dl>
          <p className="fortuneHint">運勢はその日一日、何度見ても同じ結果です。日付とタイプだけで決まり、サーバーには何も送りません。</p>
          <Link className="button" href="/diagnosis">まずは16タイプ診断へ</Link>
        </aside>
      </div>
    </main>
  );
}
