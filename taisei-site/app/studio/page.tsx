import type { Metadata } from "next";
import StudioForm from "./StudioForm";

export const metadata: Metadata = {
  title: "NEWS入稿",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <div className="mb-10 border-b border-line pb-6">
        <p className="mb-2 text-[0.68rem] tracking-[0.4em] text-gold">TAISEI FUKUMOTO — STUDIO</p>
        <h1 className="font-display text-2xl tracking-[0.2em]">NEWS入稿ページ</h1>
        <p className="mt-4 text-sm leading-loose text-sub">
          ①〜⑥を上から順に入力して「公開する」を押すだけで、オフィシャルサイトのNEWSへ反映されます。
          予約公開（日時指定）もできます。
          専用アプリやログインは不要です。
        </p>
      </div>
      <StudioForm />
    </main>
  );
}
