import type { ReactNode } from "react";
import { siteMeta } from "@/lib/content";
import { siteHref } from "@/lib/shop";
import { getActiveGoods } from "@/lib/data";
import { CartProvider } from "@/components/store/CartContext";
import StoreHeader from "@/components/store/StoreHeader";

// グッズストア共通レイアウト。本体サイトのナビは出さず、独立ストアとして表示。
// カートは全ページ共有（CartProvider）。商品カタログを渡して明細を解決する。
export default function StoreLayout({ children }: { children: ReactNode }) {
  const goods = getActiveGoods();
  return (
    <CartProvider goods={goods}>
      <StoreHeader />
      <main className="mx-auto min-h-[70vh] max-w-6xl px-5 py-10 md:px-9 md:py-14">
        {children}
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-10 md:flex-row md:justify-between md:px-9">
          <a
            href={siteHref("/")}
            className="text-[0.66rem] tracking-[0.2em] text-sub transition-colors hover:text-gold"
          >
            オフィシャルサイトへ戻る
          </a>
          <small className="text-[0.62rem] tracking-[0.2em] text-muted">
            © {siteMeta.artistNameEn}
          </small>
        </div>
      </footer>
    </CartProvider>
  );
}
