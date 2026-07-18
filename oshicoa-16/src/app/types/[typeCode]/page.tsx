import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_TYPE_CODES, isTypeCode } from "@/types";
import { typeMap } from "@/data/types";
import { getBestMatch } from "@/data/compatibility";
import { absoluteUrl } from "@/lib/site";
import TypeVisual from "@/components/result/TypeVisual";
import RadarChart from "@/components/charts/RadarChart";
import ResultSummary from "@/components/result/ResultSummary";
import CompatibilityCard from "@/components/result/CompatibilityCard";
import PremiumCta from "@/components/result/PremiumCta";
import TrackView from "@/components/common/TrackView";

type Params = { params: Promise<{ typeCode: string }> };

export function generateStaticParams() {
  return ALL_TYPE_CODES.map((code) => ({ typeCode: code }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { typeCode } = await params;
  const code = typeCode.toUpperCase();
  if (!isTypeCode(code)) return { title: "タイプが見つかりません" };
  const type = typeMap[code];
  const title = `${type.name}（${type.code}）`;
  const description = `「${type.catchphrase}」${type.shortDescription}`;
  const ogUrl = `/api/og?type=${type.code}`;
  return {
    title,
    description,
    alternates: { canonical: `/types/${type.code}` },
    openGraph: {
      title: `${type.name}｜OSHICOA 16`,
      description,
      url: absoluteUrl(`/types/${type.code}`),
      images: [{ url: ogUrl, width: 1200, height: 630, alt: type.name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogUrl] },
  };
}

export default async function TypeDetailPage({ params }: Params) {
  const { typeCode } = await params;
  const code = typeCode.toUpperCase();
  if (!isTypeCode(code)) notFound();
  const type = typeMap[code];
  const best = getBestMatch(code);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "16タイプ一覧", item: absoluteUrl("/types") },
      { "@type": "ListItem", position: 3, name: type.name, item: absoluteUrl(`/types/${type.code}`) },
    ],
  };

  return (
    <div className="container-x py-12">
      <TrackView event="type_detail_viewed" params={{ typeCode: type.code }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <nav className="mb-8 text-xs text-text-muted" aria-label="パンくず">
        <Link href="/types" className="hover:text-text">
          16タイプ一覧
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span className="text-text-sub">{type.name}</span>
      </nav>

      <div className="mx-auto max-w-2xl space-y-6">
        <section className="panel edge-glow relative overflow-hidden p-8 text-center sm:p-10">
          <div className="grid-noise pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="relative">
            <div className="mx-auto max-w-[240px]">
              <TypeVisual code={type.code} size={240} />
            </div>
            <p className="type-code mt-6 text-base text-magenta">{type.code}</p>
            <h1 className="mt-1 font-display text-4xl font-bold text-gradient sm:text-5xl">
              {type.name}
            </h1>
            <p className="mt-1 text-xs text-text-muted">{type.reading}</p>
            <p className="mx-auto mt-4 max-w-lg text-text-sub">「{type.catchphrase}」</p>
            <p className="mt-5 text-xs text-text-muted">
              全体の約 <span className="type-code text-violet">{type.estimatedRatio}%</span>（推定）
            </p>
          </div>
        </section>

        <section className="panel p-6">
          <p className="type-code text-xs text-violet mb-4">ABILITY（タイプ基準値）</p>
          <div className="mx-auto max-w-sm">
            <RadarChart values={type.chartBaseValues} size={340} />
          </div>
          <p className="mt-3 text-center text-xs text-text-muted">
            ※ これはタイプの基準値です。診断するとあなた個人の値になります。
          </p>
        </section>

        <ResultSummary type={type} />

        <CompatibilityCard bestType={best.type} description={best.description} />

        <PremiumCta type={type} />

        <section className="panel edge-glow p-6 text-center">
          <p className="text-sm text-text-sub">
            あなたはこの生態でしょうか？ 24問の診断で確かめてみてください。
          </p>
          <Link href="/diagnosis" className="btn btn-primary mt-4">
            無料で診断する
          </Link>
        </section>

        <div className="text-center">
          <Link href="/types" className="text-sm text-violet hover:underline">
            ← 16タイプ一覧へ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
