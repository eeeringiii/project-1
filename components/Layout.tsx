import Link from 'next/link';

export function Header() {
  return (
    <header className="shell nav">
      <Link href="/" className="logo">OSHICOA <i>16</i></Link>
      <nav className="navlinks">
        <Link href="/types">16タイプ</Link>
        <Link href="/about">診断について</Link>
        <Link href="/compatibility">相性診断</Link>
        <Link href="/fortune">今日の運勢</Link>
      </nav>
      <Link className="button small" href="/diagnosis">診断する</Link>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footerInner">
        <span>OSHICOA 16 — 推し方の本性を、生態解析する。</span>
        <span>
          <Link href="/types">16タイプ</Link>　<Link href="/about">診断について</Link>　<Link href="/terms">利用規約</Link>　<Link href="/privacy">プライバシー</Link>
        </span>
      </div>
    </footer>
  );
}
