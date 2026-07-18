import type { Metadata } from "next";
import SectionHeading from "@/components/common/SectionHeading";
import OshiProfileForm from "@/components/diagnosis/OshiProfileForm";

export const metadata: Metadata = {
  title: "診断をはじめる",
  description:
    "推しの情報を任意で入力して、OSHICOA 16のヲタク生態診断をはじめましょう。入力情報は端末内でのみ使用され、サーバーへは送信されません。",
  alternates: { canonical: "/diagnosis" },
};

export default function DiagnosisStartPage() {
  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-xl">
        <SectionHeading
          eyebrow="STEP 0"
          title="はじめる前に（任意）"
          description="推しの情報を入力すると、結果の一部があなたの推しに合わせた表現になります。すべてスキップして診断だけ受けることもできます。"
        />
        <div className="mt-8">
          <OshiProfileForm />
        </div>
        <p className="mt-6 text-center text-xs text-text-muted">
          全24問・約3〜4分 / 登録不要 / 結果画像を保存可能
        </p>
      </div>
    </div>
  );
}
