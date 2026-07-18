import type { Metadata } from "next";
import QuestionsFlow from "@/components/diagnosis/QuestionsFlow";

export const metadata: Metadata = {
  title: "診断中",
  description: "OSHICOA 16の24問診断。あなたのヲタク生態を解析します。",
  alternates: { canonical: "/diagnosis/questions" },
  robots: { index: false, follow: true },
};

export default function QuestionsPage() {
  return (
    <div className="container-x py-12">
      <div className="mx-auto max-w-xl">
        <QuestionsFlow />
      </div>
    </div>
  );
}
