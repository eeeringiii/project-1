import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getType, oshicoaTypes } from '@/data/types';
import { Radar } from '@/components/Radar';
import { TypeCharacter } from '@/components/TypeCharacter';
import { getTypeTheme } from '@/lib/theme';

export function generateStaticParams() {
  return oshicoaTypes.map(type => ({ typeCode: type.code }));
}

export default async function TypePage({ params }: { params: Promise<{ typeCode: string }> }) {
  const { typeCode } = await params;
  const type = getType(typeCode);
  if (!type) notFound();
  const theme = getTypeTheme(type.code);
  const partner = getType(type.compatibility.bestTypeCode);

  return (
    <main className="shell">
      <section className="typeHero" style={{ ['--chip' as string]: theme.chip }}>
        <TypeCharacter type={type} className="typeHeroChar" alt="" />
        <p className="code" style={{ marginTop: 12 }}>ECOLOGY FILE / {type.code}</p>
        <h1>{type.name}</h1>
        <p className="catch">{type.catchphrase}</p>
        <Link className="button" href="/diagnosis">このタイプか診断する →</Link>
      </section>

      <div className="resultGrid">
        <article className="profileCard">
          {type.description.map(text => <p key={text} style={{ color: 'var(--ink-soft)', lineHeight: 1.9 }}>{text}</p>)}
          <h2 style={{ fontSize: 20, margin: '22px 0 8px' }}>こんな推し方</h2>
          <ul>{type.habits.map(text => <li key={text}>{text}</li>)}</ul>
          <dl>
            <div><dt>生息地</dt><dd>{type.habitat}</dd></div>
            <div><dt>主食</dt><dd>{type.mainFood}</dd></div>
            <div><dt>口癖</dt><dd>{type.habitPhrase}</dd></div>
            <div><dt>特殊能力</dt><dd>{type.specialAbility}</dd></div>
            <div><dt>弱点</dt><dd>{type.weakness}</dd></div>
          </dl>
          {partner && (
            <p style={{ margin: 0 }}>相性がよい生態：<Link href={`/types/${partner.code}`}>{partner.name}</Link> — {type.compatibility.description}</p>
          )}
        </article>

        <div style={{ display: 'grid', gap: 16 }}>
          <Radar scores={type.chartBaseValues} />
          <div className="ctaBand" style={{ margin: 0, padding: '26px 20px' }}>
            <h2 style={{ fontSize: 22 }}>あなたはこの生態？</h2>
            <p style={{ fontSize: 14 }}>24問・約3分で解析します。</p>
            <Link className="button" href="/diagnosis">無料で診断する →</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
