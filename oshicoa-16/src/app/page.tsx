import Link from "next/link";
import type { Metadata } from "next";
import SectionHeading from "@/components/common/SectionHeading";
import AxisCard from "@/components/common/AxisCard";
import TypeCard from "@/components/types/TypeCard";
import FaqAccordion from "@/components/common/FaqAccordion";
import TypeVisual from "@/components/result/TypeVisual";
import { axisInfos } from "@/constants/axes";
import { types, typeMap } from "@/data/types";
import { faqItems } from "@/data/faq";
import { siteMeta } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const contradictions = [
  "認知を求めていないと言いながら、少しは覚えてほしい。",
  "新規が増えると嬉しいのに、少しだけ寂しい。",
  "推しのためと言いながら、自分も救われている。",
  "降りようと思った瞬間の供給を、運命だと思ってしまう。",
  "使った金額を直視せず、愛と呼んでいる。",
];

const knowList = [
  { title: "ヲタク生態タイプ", desc: "16タイプのうち、あなたの推し方の本性はどれか。" },
  { title: "愛の向かう方向", desc: "あなたの愛が、どこへ向かって流れているか。" },
  { title: "ヲタクの業タグ", desc: "無意識にやってしまう、愛おしい“業”。" },
  { title: "現在の関係フェーズ", desc: "いまの推しと、どんな関係の時期にいるか。" },
  { title: "8項目の能力値", desc: "現場力・積み耐性・解釈力などをレーダーで可視化。" },
  { title: "相性のよいヲタクタイプ", desc: "隣にいると心地よい、同担のかたち。" },
];

const preview = typeMap.CEMS;

export default function HomePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ===== ファーストビュー ===== */}
      <section className="relative overflow-hidden">
        <div className="grid-noise pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="container-x relative py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center animate-fade-up">
            <p className="type-code text-xs tracking-[0.35em] text-violet">
              OTAKU ECOLOGY DIAGNOSIS
            </p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] sm:text-6xl">
              <span className="text-gradient">OSHICOA 16</span>
            </h1>
            <p className="mt-6 text-lg font-medium text-text sm:text-xl">{siteMeta.mainCopy}</p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-text-sub">
              {siteMeta.subCopy}
            </p>

            <div className="mt-9 flex flex-col items-center gap-4">
              <Link href="/diagnosis" className="btn btn-primary px-8 py-4 text-base">
                無料で診断する
              </Link>
              <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-text-muted">
                <span>全24問・約3〜4分</span>
                <span aria-hidden="true">•</span>
                <span>登録不要</span>
                <span aria-hidden="true">•</span>
                <span>結果画像を保存可能</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 問題提起 ===== */}
      <section className="container-x py-16">
        <SectionHeading
          eyebrow="CONTRADICTION"
          title="あなたの推し活は、きれいな言葉だけでは説明できない。"
          description="OSHICOA 16が言語化するのは、性格のきれいな部分だけではありません。ヲタクが抱える矛盾、執着、そして愛おしい“業”まで。"
        />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {contradictions.map((c) => (
            <li key={c} className="panel-hair flex items-start gap-3 p-4 text-sm text-text-sub">
              <span className="type-code mt-0.5 text-magenta" aria-hidden="true">
                ―
              </span>
              {c}
            </li>
          ))}
        </ul>
      </section>

      {/* ===== 診断で分かること ===== */}
      <section className="container-x py-16">
        <SectionHeading eyebrow="WHAT YOU LEARN" title="診断で分かること" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {knowList.map((item, i) => (
            <div key={item.title} className="panel p-5">
              <span className="type-code text-xs text-violet">0{i + 1}</span>
              <h3 className="mt-2 font-display text-base font-bold">{item.title}</h3>
              <p className="mt-1 text-sm text-text-sub leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 4軸紹介 ===== */}
      <section className="container-x py-16">
        <SectionHeading
          eyebrow="4 AXES"
          title="4つの軸で、愛の“向き”を測る。"
          description="診断するのは、愛の量ではありません。あなたの愛が、どこへ向かっているか。4つの対立軸の組み合わせが、16の生態を描き出します。"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {axisInfos.map((axis) => (
            <AxisCard key={axis.index} axis={axis} />
          ))}
        </div>
      </section>

      {/* ===== 16タイプ一覧 ===== */}
      <section className="container-x py-16">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading eyebrow="16 TYPES" title="16のヲタク生態" />
          <Link href="/types" className="shrink-0 text-sm text-violet hover:underline">
            一覧を見る →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {types.map((type) => (
            <TypeCard key={type.code} type={type} />
          ))}
        </div>
      </section>

      {/* ===== 診断結果プレビュー ===== */}
      <section className="container-x py-16">
        <SectionHeading eyebrow="RESULT PREVIEW" title="こんな結果が出ます" align="center" />
        <div className="mx-auto mt-10 max-w-2xl">
          <div className="panel edge-glow overflow-hidden p-8 text-center">
            <div className="mx-auto max-w-[240px]">
              <TypeVisual code={preview.code} size={240} />
            </div>
            <p className="type-code mt-6 text-sm text-magenta">{preview.code}</p>
            <h3 className="mt-2 font-display text-3xl font-bold text-gradient">{preview.name}</h3>
            <p className="mt-3 text-text-sub">「{preview.catchphrase}」</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <span className="rounded-full border border-line-strong px-3 py-1 text-xs text-text-sub">
                #深夜長文感想型
              </span>
              <span className="rounded-full border border-line-strong px-3 py-1 text-xs text-text-sub">
                #供給永久反芻型
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="container-x py-16">
        <SectionHeading eyebrow="FAQ" title="よくある質問" />
        <div className="mt-8">
          <FaqAccordion items={faqItems} />
        </div>
      </section>

      {/* ===== 最終CTA ===== */}
      <section className="container-x py-20">
        <div className="panel edge-glow relative overflow-hidden p-10 text-center">
          <div className="grid-noise pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="relative">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              あなたを動かしている「ヲタクの核」を、見に行く。
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-text-sub">
              全24問・約3〜4分。登録不要で、いますぐ診断できます。
            </p>
            <Link href="/diagnosis" className="btn btn-primary mt-8 px-8 py-4 text-base">
              無料で診断する
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export const dynamic = "force-static";
