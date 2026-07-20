"use client";

import Link from "next/link";
import { siteHref } from "@/lib/shop";
import { useCart } from "@/components/store/CartContext";

// ストア専用ヘッダー。右上にカート（点数バッジ付き）を常時表示して、
// どのページからでも購入手続きに進めるようにする。
export default function StoreHeader() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-9">
        <Link href="/goods" className="font-display text-sm tracking-[0.26em] md:text-base">
          OFFICIAL GOODS
        </Link>
        <div className="flex items-center gap-4 md:gap-6">
          <a
            href={siteHref("/")}
            className="hidden text-[0.62rem] tracking-[0.2em] text-sub transition-colors hover:text-gold sm:inline"
          >
            ← オフィシャルサイト
          </a>
          <Link
            href="/goods/cart"
            className="relative border border-ink px-4 py-2 text-[0.66rem] tracking-[0.22em] transition-colors hover:bg-ink hover:text-paper"
            aria-label={`カート ${count}点`}
          >
            CART
            {count > 0 && (
              <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[0.62rem] leading-5 text-paper">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
