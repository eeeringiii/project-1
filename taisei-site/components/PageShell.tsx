import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { snsListFrom } from "@/lib/content";
import { getSettings } from "@/lib/data";

// 下層ページ共通の骨格。英字タイトル＋日本語ラベルのヘッダー付き
export default function PageShell({
  titleEn,
  titleJp,
  children,
}: {
  titleEn: string;
  titleJp: string;
  children: ReactNode;
}) {
  const snsLinks = snsListFrom(getSettings().sns);
  return (
    <>
      <Header snsLinks={snsLinks} />
      <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-14 md:px-9">
        <div className="mb-10 border-b border-line pb-6">
          <h1 className="rise font-display text-2xl tracking-[0.3em] md:text-3xl">
            {titleEn}
          </h1>
          <p className="rise rise-delay-1 mt-2 text-[0.68rem] tracking-[0.2em] text-gold">
            {titleJp}
          </p>
        </div>
        {children}
      </main>
      <Footer />
    </>
  );
}
