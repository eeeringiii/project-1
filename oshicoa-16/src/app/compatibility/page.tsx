import type { Metadata } from "next";
import SectionHeading from "@/components/common/SectionHeading";
import CompatibilityExplorer from "@/components/compatibility/CompatibilityExplorer";

export const metadata: Metadata = {
  title: "同担相性診断",
  description:
    "OSHICOA 16の同担相性診断。2つのヲタク生態タイプを選ぶと、連番・遠征・感想会・交換・応援企画・平和度・金銭感覚の7項目で相性を表示します。",
  alternates: { canonical: "/compatibility" },
};

export default function CompatibilityPage() {
  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-2xl">
        <SectionHeading
          eyebrow="COMPATIBILITY"
          title="同担相性診断"
          description="2人のヲタク生態から、一緒に推し活をするときの相性を7項目で見てみましょう。自分のタイプは診断で分かります。"
        />
        <div className="mt-10">
          <CompatibilityExplorer />
        </div>
        <div className="mt-10 text-center">
          <a href="/diagnosis" className="btn btn-primary">
            自分のタイプを診断する
          </a>
        </div>
      </div>
    </div>
  );
}
