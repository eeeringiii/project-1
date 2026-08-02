import type { Metadata } from 'next';
import { Suspense } from 'react';
import CompatibilityPage from '@/components/compatibility/CompatibilityPage';
import { getType } from '@/data/types';
import { calculateCompatibility, normalizeCodeParam } from '@/lib/compatibility';

type SearchParams = { [key: string]: string | string[] | undefined };

const BASE_TITLE = '推し活相性診断｜OSHICOA 16';
const BASE_DESCRIPTION =
  '2人の推し方から、連番・遠征・感想会・グッズ交換・応援企画の相性を無料で診断します。';
const OG_DESCRIPTION = '2人の推し方から、連番・遠征・感想会・交換・応援企画の相性を解析します。';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const me = normalizeCodeParam(params.me);
  const partner = normalizeCodeParam(params.partner);

  // 2人が確定しているときだけ、その組み合わせ用のOG画像を出す
  const pairMeta =
    me && partner
      ? (() => {
          const result = calculateCompatibility(me, partner);
          const meName = getType(me)?.name ?? me;
          const partnerName = getType(partner)?.name ?? partner;
          return {
            title: `${meName} × ${partnerName}の推し活相性は${result.overallScore}%｜OSHICOA 16`,
            description: `${meName}（${me}）と${partnerName}（${partner}）の相性は${result.overallScore}%、「${result.pairTitle}」。${OG_DESCRIPTION}`,
            image: `/api/og/compatibility?me=${me}&partner=${partner}`,
          };
        })()
      : undefined;

  return {
    // ルートレイアウトのテンプレート（%s｜OSHICOA 16）で「推し活相性診断｜OSHICOA 16」になります
    title: '推し活相性診断',
    description: BASE_DESCRIPTION,
    alternates: { canonical: '/compatibility' },
    openGraph: {
      title: pairMeta?.title ?? BASE_TITLE,
      description: pairMeta?.description ?? OG_DESCRIPTION,
      url: '/compatibility',
      images: [{ url: pairMeta?.image ?? '/api/og/compatibility', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: pairMeta?.title ?? BASE_TITLE,
      description: pairMeta?.description ?? OG_DESCRIPTION,
      images: [pairMeta?.image ?? '/api/og/compatibility'],
    },
  };
}

export default function Compatibility() {
  return (
    <Suspense fallback={<div className="shell compatPage compatBoot" aria-hidden />}>
      <CompatibilityPage />
    </Suspense>
  );
}
