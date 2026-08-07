import Link from 'next/link';
import { TypeCharacter } from '@/components/TypeCharacter';
import { oshicoaTypes } from '@/data/types';
import { axisChips, getTypeTheme } from '@/lib/theme';

const axes = [
  ['R / C', '共鳴 ↔ 接続', '作品の世界へ深く入るか、推し本人との接続を求めるか。'],
  ['E / P', '体験 ↔ 所有', 'その瞬間を共有するか、形として残すか。'],
  ['G / M', '成長支援 ↔ 自己充足', '推しの未来を動かすか、自分が受け取った感情を守るか。'],
  ['T / S', '連帯 ↔ 単独', 'ファンダムと熱狂するか、自分のペースで味わうか。'],
];

const contradictions = [
  '認知を求めていないと言いながら、少しは覚えてほしい。',
  '新規が増えると嬉しいのに、少しだけ寂しい。',
  '降りようと思った瞬間の供給を、運命だと思ってしまう。',
];

const faqs: [string, string][] = [
  ['診断結果は保存されますか', 'この端末内でのみ保存を試みます。サーバーへ個人入力は保存しません。'],
  ['複数の推しで診断できますか', 'できます。推しごとに再診断して、推し方の違いを楽しめます。'],
  ['課金額が多いほど良い結果になりますか', 'いいえ。愛の優劣ではなく、愛が向かう方向を見つける診断です。'],
  ['アイドル以外でも診断できますか', 'もちろんです。作品、配信者、スポーツ選手など幅広い推し方に対応しています。'],
  ['結果画像を投稿できますか', 'SNS投稿用の画像を端末へ保存できます。'],
];

const heroStickers = ['CEMT', 'RPMS', 'RCGT', 'CEMS', 'CPMT', 'RPGS'];

export default function Home() {
  return (
    <main>
      <section className="shell hero">
        <p className="heroBadge">✧ 全24問・約3分・登録なし</p>
        <h1>OSHICOA <em>16</em></h1>
        <h2>推しが変わっても、<br /><mark>あなたの“推し方”のクセ</mark>は変わらない。</h2>
        <p className="lead">現場、積み、布教、同担、供給、ファンサ、解釈。あなたを動かしている「ヲタクの核」を、16の生態に分類します。</p>
        <p className="heroCta">
          <Link className="button" href="/diagnosis">無料で診断する →</Link>
          <Link className="button ghost" href="/types">16タイプを見る</Link>
        </p>
        <p className="note"><span>💗 課金額で判定しません</span><span>🔒 入力は端末のなかだけ</span><span>📸 結果画像を保存できる</span></p>
        <div className="stickerRow">
          {heroStickers.map(code => {
            const type = oshicoaTypes.find(item => item.code === code);
            const theme = getTypeTheme(code);
            return type ? (
              <span className="sticker" key={code} style={{ ['--chip' as string]: theme.chip }}>
                <b>{theme.mark}</b>{type.name}
              </span>
            ) : null;
          })}
          <span className="sticker">…ぜんぶで16タイプ</span>
        </div>
      </section>

      <section className="shell miniStrips">
        <Link className="fortuneStrip" href="/fortune">
          <span className="fortuneStripMark" aria-hidden>🔮</span>
          <span className="fortuneStripBody">
            <b>今日の推し活運勢</b>
            <small>推し運・現場運・チケット運・課金運を毎日。</small>
          </span>
          <span className="fortuneStripGo" aria-hidden>→</span>
        </Link>
        <Link className="fortuneStrip bingoStrip" href="/bingo">
          <span className="fortuneStripMark" aria-hidden>🎯</span>
          <span className="fortuneStripBody">
            <b>ヲタク業ビンゴ</b>
            <small>あなたの業、いくつ当てはまる？ 診断なしで遊べます。</small>
          </span>
          <span className="fortuneStripGo" aria-hidden>→</span>
        </Link>
      </section>

      <section className="band">
        <div className="shell section">
          <p className="eyebrow">THE CONTRADICTIONS</p>
          <h2>推し活は、きれいな言葉だけでは<em>説明できない</em>。</h2>
          <div className="grid">
            {contradictions.map((text, i) => (
              <div className="item" key={text}>
                <span className="num">0{i + 1}</span>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell section">
        <p className="eyebrow">FOUR DIRECTIONS OF LOVE</p>
        <h2>愛の量ではなく、<br />愛が<em>どこへ向かうか</em>。</h2>
        <div className="grid4">
          {axes.map((axis, i) => (
            <div className="axis" key={axis[0]} style={{ ['--chip' as string]: axisChips[i] }}>
              <span className="pair">{axis[0]}</span>
              <h3>{axis[1]}</h3>
              <p>{axis[2]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="shell section">
        <p className="eyebrow">16 ECOLOGIES</p>
        <h2>16のヲタク生態、<br />あなたは<em>どれ</em>？</h2>
        <div className="grid">
          {oshicoaTypes.map(type => {
            const theme = getTypeTheme(type.code);
            return (
              <Link className="type" href={`/types/${type.code}`} key={type.code} style={{ ['--chip' as string]: theme.chip }}>
                <TypeCharacter type={type} className="typeThumb" loading="lazy" alt="" />
                <span className="code">{type.code}</span>
                <h3>{type.name}</h3>
                <p>{type.catchphrase}</p>
                <small>くわしく見る →</small>
              </Link>
            );
          })}
        </div>
        <p style={{ marginTop: 22 }}><Link className="button ghost" href="/types">16タイプをすべて見る</Link></p>
      </section>

      <section className="band">
        <div className="shell section">
          <p className="eyebrow">FAQ</p>
          <h2>よくある質問</h2>
          <div className="grid">
            {faqs.map(([question, answer]) => (
              <div className="item" key={question}>
                <b>Q. {question}</b>
                <p>{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell section" style={{ paddingTop: 0 }}>
        <div className="ctaBand">
          <p className="eyebrow">START</p>
          <h2>あなたのヲタク生態を、<br />3分で解析する。</h2>
          <p>結果は、そのままSNSに貼れる画像になります。</p>
          <Link className="button" href="/diagnosis">無料で診断する →</Link>
        </div>
      </section>
    </main>
  );
}
