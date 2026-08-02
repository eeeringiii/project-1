import Link from 'next/link';

export default function Compatibility() {
  return (
    <main className="shell form">
      <p className="eyebrow">COMING NEXT</p>
      <h1>同担相性診断は、<br />ただいま解析中。</h1>
      <div className="formCard">
        <p className="loadingArt" aria-hidden style={{ fontSize: 44, margin: '0 0 10px' }}>🔧</p>
        <p className="lead" style={{ margin: 'auto', textAlign: 'center' }}>連番、遠征、感想会、交換、応援企画。推し活の「一緒にいて心地よい」を、優劣なく見つける機能を準備中です。</p>
      </div>
      <p className="heroCta">
        <Link className="button" href="/diagnosis">先に自分を診断する →</Link>
        <Link className="button ghost" href="/types">16タイプを見る</Link>
      </p>
    </main>
  );
}
