import type { Metadata } from "next";
import StudioTabs from "./StudioTabs";
import { getLiveEvents, getMovies, getProfile, getReleases, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "入稿ページ",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <div className="mb-10 border-b border-line pb-6">
        <p className="mb-2 text-[0.68rem] tracking-[0.4em] text-gold">TAISEI FUKUMOTO — STUDIO</p>
        <h1 className="font-display text-2xl tracking-[0.2em]">入稿ページ</h1>
        <p className="mt-4 text-sm leading-loose text-sub">
          NEWS・リリース・LIVE・動画・写真・SNSリンクなど、サイトの内容をここから更新できます。
          公開ボタンを押してから約2分でサイトに反映されます。専用アプリやログインは不要です。
        </p>
      </div>
      <StudioTabs
        releases={getReleases()}
        live={getLiveEvents()}
        movies={getMovies()}
        settings={getSettings()}
        profile={getProfile()}
      />
    </main>
  );
}
