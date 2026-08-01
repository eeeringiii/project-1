import Link from 'next/link';

const points: [string, string, string][] = [
  ['💗', '課金額で採点しない', '使った金額や現場の回数で、推し方に優劣をつけません。'],
  ['🧭', '愛の向かう先を見る', '4つの軸から、あなたの熱量がどこへ向かうかを16の生態に分類します。'],
  ['🔒', '入力は端末のなかだけ', '推しの名前や回答をサーバーへ送信・保存しません。'],
];

export default function About() {
  return (
    <main className="shell form">
      <p className="eyebrow">ABOUT OSHICOA 16</p>
      <h1>愛の量ではなく、<br />愛がどこへ向かうか。</h1>
      <p className="lead">OSHICOA 16は、課金額や現場数で推し活を採点しません。現場、積み、布教、同担、供給、ファンサ、解釈に現れる「自分らしい熱量の置き場所」を、16の生態として言葉にする体験です。</p>

      <div className="formCard" style={{ display: 'grid', gap: 18 }}>
        {points.map(([mark, title, text]) => (
          <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span className="typeMark" aria-hidden style={{ flex: 'none' }}>{mark}</span>
            <div>
              <b style={{ display: 'block', marginBottom: 4 }}>{title}</b>
              <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: 14, lineHeight: 1.8 }}>{text}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="heroCta">
        <Link className="button" href="/diagnosis">無料で診断する →</Link>
        <Link className="button ghost" href="/types">16タイプを見る</Link>
      </p>
    </main>
  );
}
