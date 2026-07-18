import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/common/SectionHeading";

export const metadata: Metadata = {
  title: "同担相性診断（準備中）",
  description:
    "OSHICOA 16の同担相性診断。連番・遠征・感想会・交換・応援企画など7項目で、ヲタクタイプ同士の相性を可視化します。現在準備中です。",
  alternates: { canonical: "/compatibility" },
};

const dimensions = [
  { key: "event", label: "連番相性" },
  { key: "travel", label: "遠征相性" },
  { key: "discussion", label: "感想会相性" },
  { key: "trading", label: "交換相性" },
  { key: "supportProject", label: "応援企画相性" },
  { key: "fandomPeace", label: "同担としての平和度" },
  { key: "spendingSense", label: "金銭感覚相性" },
];

export default function CompatibilityPage() {
  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-2xl">
        <SectionHeading
          eyebrow="COMPATIBILITY"
          title="同担相性診断"
          description="2人のヲタク生態から、一緒に推し活をするときの相性を診断する機能を準備しています。"
        />

        <div className="panel edge-glow mt-10 p-8 text-center">
          <p className="type-code text-sm text-magenta">COMING SOON</p>
          <h2 className="mt-3 font-display text-2xl font-bold">準備中です</h2>
          <p className="mt-4 text-sm text-text-sub leading-relaxed">
            次の7項目で、タイプ同士の相性を100点満点で表示できるよう開発を進めています。
          </p>
          <ul className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-2 text-sm">
            {dimensions.map((d) => (
              <li
                key={d.key}
                className="rounded-lg border border-line-strong px-3 py-2 text-text-sub"
              >
                {d.label}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-text-muted">
            まずは自分のヲタク生態を診断して、相性のよいタイプを確認してみてください。
          </p>
          <Link href="/diagnosis" className="btn btn-primary mt-6">
            自分を診断する
          </Link>
        </div>
      </div>
    </div>
  );
}
