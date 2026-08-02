import type { Metadata } from "next";
import SectionHeading from "@/components/common/SectionHeading";
import OtakuResume from "@/components/resume/OtakuResume";

export const metadata: Metadata = {
  title: "ヲタク履歴書",
  description:
    "推し活のプロフィールを1枚のカードに整形できる「ヲタク履歴書」。推し・推し歴・沼落ちのきっかけ・推し活ポリシーをまとめて、画像で保存・シェアできます。入力情報は端末内でのみ処理されます。",
  alternates: { canonical: "/resume" },
  openGraph: {
    title: "ヲタク履歴書｜OSHICOA 16",
    description: "推し活プロフィールを1枚のカードに。あなたのヲタク履歴書を作ろう。",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
};

export default function ResumePage() {
  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          eyebrow="OTAKU RESUME"
          title="ヲタク履歴書"
          description="あなたの推し活を、1枚のカードに。入力すると右側のプレビューに反映され、画像で保存・シェアできます。"
          align="center"
        />
        <div className="mt-10">
          <OtakuResume />
        </div>
      </div>
    </div>
  );
}
