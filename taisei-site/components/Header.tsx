"use client";

import Link from "next/link";
import { useState } from "react";
import SnsLinks from "@/components/SnsLinks";
import { siteMeta } from "@/lib/content";

const navItems = [
  { href: "/news", label: "NEWS" },
  { href: "/profile", label: "PROFILE" },
  { href: "/discography", label: "DISCOGRAPHY" },
  { href: "/movie", label: "MOVIE" },
  { href: "/live", label: "LIVE" },
  { href: "/contact", label: "CONTACT" },
  { href: "/business", label: "BUSINESS" },
];

export default function Header() {
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
                    href={item.href}
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
            <SnsLinks size={15} gap="gap-4" />
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
                  href={item.href}
                  className={`block px-8 py-4 text-xs tracking-[0.28em] ${
                    item.href === "/business" ? "text-gold" : ""
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="px-8 py-5">
            <SnsLinks size={19} gap="gap-7" />
          </div>
        </nav>
      )}
    </header>
  );
}
