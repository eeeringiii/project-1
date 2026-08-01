import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getType } from '@/data/types';
import { ogImageUrl } from '@/lib/site';
import ResultClient from '@/components/ResultClient';

export async function generateMetadata({ params }: { params: Promise<{ typeCode: string }> }): Promise<Metadata> {
  const { typeCode } = await params;
  const type = getType(typeCode);
  if (!type) return {};
  const title = `診断結果：${type.code}｜${type.name}`;
  const description = `${type.catchphrase} あなたのヲタク生態も24問・約3分で解析できます。`;
  const image = ogImageUrl(type.code);
  return {
    title,
    description,
    openGraph: { title: `${title}｜OSHICOA 16`, description, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: `${title}｜OSHICOA 16`, description, images: [image] },
  };
}

export default async function ResultPage({ params }: { params: Promise<{ typeCode: string }> }) {
  const { typeCode } = await params;
  const type = getType(typeCode);
  if (!type) notFound();
  return <ResultClient type={type} />;
}
