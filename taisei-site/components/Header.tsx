"use client";

import Link from "next/link";
import { useState } from "react";
import SnsLinks from "@/components/SnsLinks";
import { navItems, siteMeta, type SnsLink } from "@/lib/content";
import { shopEnabled, shopHref } from "@/lib/shop";

// GOODS はサブドメイン運用時のみ shop.ドメインへ（外部リンク扱い）。
const isExternalGoods = (href: string) => href === "/goods" && shopEnabled;
const hrefFor = (href: string) => (isExternalGoods(href) ? shopHref() : href);

export default function Header({ snsLinks }: { snsLinks: SnsLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-9">
        <Link
          href="/"
          className="font-display text-sm tracking-[0.32em] md:text-base"
          onClick={() => setOpen(false)}
        >
          {siteMeta.artistNameEn}
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <nav aria-label="メインナビゲーション">
            <ul className="flex items-center gap-7">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={hrefFor(item.href)}
                    className={`nav-link text-[0.7rem] tracking-[0.22em] ${
                      item.href === "/business" ? "text-gold" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-l border-line pl-6">
            <SnsLinks links={snsLinks} size={15} gap="gap-4" location="header" />
          </div>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-expanded={open}
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          onClick={() => setOpen(!open)}
        >
          <span
            className={`block h-px w-6 bg-ink transition-transform ${
              open ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-6 bg-ink transition-transform ${
              open ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {open && (
        <nav className="border-t border-line bg-paper md:hidden" aria-label="メインナビゲーション">
          <ul>
            {navItems.map((item) => (
              <li key={item.href} className="border-b border-line-soft">
                <Link
                  href={hrefFor(item.href)}
                  className="flex items-baseline gap-4 px-8 py-4"
                  onClick={() => setOpen(false)}
                >
                  <span
                    className={`text-xs tracking-[0.28em] ${
                      item.href === "/business" ? "text-gold" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="text-[0.65rem] tracking-[0.1em] text-muted">
                    {item.jp}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="px-8 py-5">
            <SnsLinks links={snsLinks} size={19} gap="gap-7" location="mobile-menu" />
          </div>
        </nav>
      )}
    </header>
  );
}
