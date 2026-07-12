import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-6 py-20 text-center">
        <div>
          <p className="mb-3 font-display text-3xl tracking-[0.3em] text-gold">404</p>
          <h1 className="mb-4 text-lg tracking-[0.14em]">
            お探しのページが見つかりませんでした
          </h1>
          <p className="mb-10 text-sm leading-loose text-sub">
            ページが移動または削除された可能性があります。
            <br />
            最新の情報はトップページからご覧ください。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="border border-ink px-8 py-3 text-[0.72rem] tracking-[0.24em] transition-colors hover:border-gold hover:text-gold"
            >
              トップページへ
            </Link>
            <Link
              href="/news"
              className="border border-line px-8 py-3 text-[0.72rem] tracking-[0.24em] text-sub transition-colors hover:border-gold hover:text-gold"
            >
              最新ニュースへ
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
