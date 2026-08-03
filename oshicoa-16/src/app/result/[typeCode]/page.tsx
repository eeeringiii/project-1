import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isTypeCode } from "@/types";
import { typeMap } from "@/data/types";
import { absoluteUrl } from "@/lib/site";
import ResultView from "@/components/result/ResultView";

type Params = { params: Promise<{ typeCode: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { typeCode } = await params;
  const code = typeCode.toUpperCase();
  if (!isTypeCode(code)) return { title: "診断結果が見つかりません" };
  const type = typeMap[code];
  const title = `${type.name}（${type.code}）｜あなたのヲタク生態`;
  const description = `「${type.catchphrase}」${type.shortDescription} OSHICOA 16のヲタク生態診断結果。`;
  const ogUrl = `/api/og?type=${type.code}`;
  return {
    title,
    description,
    alternates: { canonical: `/result/${type.code}` },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/result/${type.code}`),
      images: [{ url: ogUrl, width: 1200, height: 630, alt: type.name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogUrl] },
  };
}

export default async function ResultPage({ params }: Params) {
  const { typeCode } = await params;
  const code = typeCode.toUpperCase();
  if (!isTypeCode(code)) notFound();
  return <ResultView type={typeMap[code]} />;
}
