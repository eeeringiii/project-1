import type { Metadata } from "next";
import SectionHeading from "@/components/common/SectionHeading";
import TypesExplorer from "@/components/types/TypesExplorer";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "16タイプ一覧",
  description:
    "OSHICOA 16の16タイプのヲタク生態を一覧で紹介。4軸で絞り込みながら、それぞれのタイプ名・キャッチコピー・特徴を見られます。",
  alternates: { canonical: "/types" },
};

export default function TypesPage() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "16タイプ一覧", item: absoluteUrl("/types") },
    ],
  };

  return (
    <div className="container-x py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <SectionHeading
        eyebrow="16 TYPES"
        title="16のヲタク生態"
        description="どの推し方にも優劣はありません。あなたに近い生態、気になる生態を、じっくり見てみてください。"
      />
      <div className="mt-10">
        <TypesExplorer />
      </div>
    </div>
  );
}
