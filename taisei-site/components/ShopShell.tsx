import type { ReactNode } from "react";
import { siteMeta } from "@/lib/content";
import { siteHref } from "@/lib/shop";

// shop. サブドメインで表示するときのストア専用の骨格。
// 本体サイトのグローバルナビは出さず、独立したストアとして見せる。
export default function ShopShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-9">
          <a
            href={siteHref("/")}
            className="text-[0.62rem] tracking-[0.2em] text-sub transition-colors hover:text-gold"
          >
            ← オフィシャルサイト
          </a>
          <span className="font-display text-sm tracking-[0.28em] md:text-base">
            OFFICIAL GOODS
          </span>
        </div>
      </header>
      <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-14 md:px-9">
        <div className="mb-10 border-b border-line pb-6">
          <h1 className="rise font-display text-2xl tracking-[0.3em] md:text-3xl">
            GOODS STORE
          </h1>
          <p className="rise rise-delay-1 mt-2 text-[0.68rem] tracking-[0.2em] text-gold">
            {siteMeta.artistName} オフィシャルグッズ
          </p>
        </div>
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
    </>
  );
}
