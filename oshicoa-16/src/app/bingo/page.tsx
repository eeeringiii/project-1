import type { Metadata } from "next";
import SectionHeading from "@/components/common/SectionHeading";
import KarmaBingo from "@/components/bingo/KarmaBingo";
import TrackView from "@/components/common/TrackView";

export const metadata: Metadata = {
  title: "ヲタク業ビンゴ",
  description:
    "あなたの“ヲタクの業”はいくつ当てはまる？ タップして遊べるヲタク業ビンゴ。ビンゴ数とヲタクランクを判定して、推し友とシェアしよう。",
  alternates: { canonical: "/bingo" },
  openGraph: {
    title: "ヲタク業ビンゴ｜OSHICOA 16",
    description: "あなたの“ヲタクの業”はいくつ当てはまる？ タップして遊べるヲタク業ビンゴ。",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
};

export default function BingoPage() {
  return (
    <div className="container-x py-16">
      <TrackView event="bingo_played" />
      <div className="mx-auto max-w-xl">
        <SectionHeading
          eyebrow="KARMA BINGO"
          title="ヲタク業ビンゴ"
          description="あなたの“ヲタクの業”は、いくつ当てはまる？ タップして埋めて、何ビンゴできるか試してみてください。"
          align="center"
        />
        <div className="mt-10">
          <KarmaBingo />
        </div>
      </div>
    </div>
  );
}
