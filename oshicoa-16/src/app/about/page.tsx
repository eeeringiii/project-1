import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/common/SectionHeading";
import AxisCard from "@/components/common/AxisCard";
import { axisInfos } from "@/constants/axes";
import { siteMeta } from "@/lib/site";

export const metadata: Metadata = {
  title: "OSHICOA 16とは",
  description:
    "OSHICOA 16は、愛の量ではなく“愛がどこへ向かうか”を診断する推し活診断。どんな推し方も否定しない思想と、4軸16タイプの診断ロジックについて説明します。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-2xl">
        <SectionHeading
          eyebrow="ABOUT"
          title="OSHICOA 16について"
          description={siteMeta.mainCopy}
        />

        <div className="mt-10 space-y-6 text-[15px] leading-loose text-text-sub">
          <p>
            OSHICOA 16（オシコア・シックスティーン）は、推し活の優劣や愛の大きさを判定する診断ではありません。診断するのは、愛の量ではなく「愛がどこへ向かうか」です。
          </p>
          <p>
            課金額が少ない人も、在宅中心の人も、新規も古参も、同担拒否も箱推しも複数推しも。どのような推し方も否定しません。きれいな性格説明だけでなく、ヲタクが抱える矛盾・葛藤・執着・黒歴史、そして愛おしい“業”まで言語化することを大切にしています。
          </p>
          <p>
            推しが変わっても、あなたの“推し方の本性”は変わりません。現場、積み、布教、同担、供給、ファンサ、解釈——あなたを動かしている「ヲタクの核」を、16の生態に分類します。
          </p>
        </div>

        <div className="mt-14">
          <SectionHeading eyebrow="4 AXES" title="診断の4つの軸" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {axisInfos.map((axis) => (
              <AxisCard key={axis.index} axis={axis} />
            ))}
          </div>
        </div>

        <div className="mt-14">
          <SectionHeading eyebrow="HOW IT WORKS" title="診断のしくみ" />
          <div className="panel mt-8 p-6 text-sm leading-relaxed text-text-sub">
            <p>
              24問の設問への回答（4段階）から、4つの対立軸それぞれのスコアを集計し、16タイプのいずれかを判定します。あわせて、回答傾向から「ヲタクの業タグ」と「8項目の能力値（レーダーチャート）」を、推し歴と回答から「現在の関係フェーズ」を算出します。
            </p>
            <p className="mt-4">
              判定にランダム要素はありません。同じ回答からは必ず同じ結果になります。推しの名前などの入力情報はサーバーへ送信されず、端末内でのみ使用されます。
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/diagnosis" className="btn btn-primary">
            無料で診断する
          </Link>
        </div>
      </div>
    </div>
  );
}
