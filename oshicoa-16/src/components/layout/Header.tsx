import Link from "next/link";
import { siteMeta } from "@/lib/site";

const navLinks = [
  { href: "/types", label: "16タイプ" },
  { href: "/about", label: "OSHICOA 16とは" },
  { href: "/compatibility", label: "相性診断" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line backdrop-blur-md bg-[rgba(7,7,11,0.66)]">
      <div className="container-x flex items-center justify-between h-16">
        <Link href="/" className="flex items-baseline gap-2" aria-label={`${siteMeta.siteName} トップへ`}>
          <span className="type-code text-lg text-gradient font-display">OSHICOA</span>
          <span className="type-code text-lg text-text">16</span>
        </Link>
        <nav aria-label="メインナビゲーション" className="flex items-center gap-1 sm:gap-2">
          <div className="hidden items-center gap-1 sm:flex sm:gap-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="whitespace-nowrap px-3 py-2 text-sm text-text-sub hover:text-text transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <Link href="/diagnosis" className="btn btn-primary ml-1 sm:ml-2 !py-2 !px-4 text-sm">
            診断する
          </Link>
        </nav>
      </div>
    </header>
  );
}
