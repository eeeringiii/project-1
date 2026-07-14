import Link from "next/link";
import SnsLinks from "@/components/SnsLinks";
import { navItems, siteMeta, snsListFrom } from "@/lib/content";
import { getSettings } from "@/lib/data";

export default function Footer() {
  const snsLinks = snsListFrom(getSettings().sns);
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-9">
        <nav aria-label="フッターナビゲーション" className="mb-8 border-b border-line-soft pb-8">
          <ul className="flex flex-wrap justify-center gap-x-7 gap-y-3 md:justify-start">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-link text-[0.66rem] tracking-[0.2em] ${
                    item.href === "/business" ? "text-gold" : "text-sub"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <SnsLinks links={snsLinks} size={17} gap="gap-6" location="footer" />
          <small className="text-[0.62rem] tracking-[0.2em] text-muted">
            © {siteMeta.artistNameEn}
          </small>
        </div>
      </div>
    </footer>
  );
}
