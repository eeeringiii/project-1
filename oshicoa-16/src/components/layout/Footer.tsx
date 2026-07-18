import Link from "next/link";
import { siteMeta } from "@/lib/site";

const footerLinks = [
  { href: "/about", label: "OSHICOA 16とは" },
  { href: "/types", label: "16タイプ一覧" },
  { href: "/terms", label: "利用規約" },
  { href: "/privacy", label: "プライバシーポリシー" },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-x py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="type-code text-base text-gradient font-display">OSHICOA</span>
              <span className="type-code text-base">16</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-text-muted">
              愛の量ではなく、愛がどこへ向かうか。あなたの“ヲタクの核”を16の生態に分類する推し活診断。
            </p>
          </div>
          <nav aria-label="フッターナビゲーション" className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
            {footerLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-text-sub hover:text-text transition-colors">
                {l.label}
              </Link>
            ))}
            <a
              href={`mailto:${siteMeta.contactEmail}`}
              className="text-text-sub hover:text-text transition-colors"
            >
              お問い合わせ
            </a>
            <span className="text-text-muted" aria-label="X公式アカウント（準備中）">
              X: {siteMeta.xAccount}（準備中）
            </span>
          </nav>
        </div>
        <p className="mt-10 text-xs text-text-muted">
          © {new Date().getFullYear()} OSHICOA 16. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
