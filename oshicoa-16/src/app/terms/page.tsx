import type { Metadata } from "next";
import SectionHeading from "@/components/common/SectionHeading";

export const metadata: Metadata = {
  title: "利用規約",
  description: "OSHICOA 16の利用規約。診断結果の位置づけ、禁止事項、免責事項などを定めます。",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-2xl">
        <SectionHeading eyebrow="TERMS" title="利用規約" />
        <div className="mt-10 space-y-8 text-sm leading-loose text-text-sub">
          <section>
            <h2 className="font-display text-lg font-bold text-text">第1条（適用）</h2>
            <p className="mt-2">
              本規約は、OSHICOA 16（以下「本サービス」）の利用に関する条件を、利用者と運営者との間で定めるものです。利用者は、本サービスを利用することで本規約に同意したものとみなされます。
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-text">第2条（診断結果の位置づけ）</h2>
            <p className="mt-2">
              本サービスの診断結果はエンターテインメントを目的としたものであり、医学的・心理学的な診断や、個人の人格・能力の優劣を評価するものではありません。診断結果の解釈・利用は利用者自身の判断で行ってください。
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-text">第3条（禁止事項）</h2>
            <p className="mt-2">利用者は、次の行為をしてはなりません。</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>本サービスのコンテンツを無断で複製・転載・商用利用する行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>他の利用者や第三者を誹謗中傷する目的で診断結果を利用する行為</li>
              <li>法令または公序良俗に反する行為</li>
            </ul>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-text">第4条（知的財産権）</h2>
            <p className="mt-2">
              本サービスに関する著作権その他の知的財産権は、運営者または正当な権利者に帰属します。診断結果を個人がSNS等で共有することは、この限りではありません。
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-text">第5条（免責事項）</h2>
            <p className="mt-2">
              運営者は、本サービスの内容の正確性・完全性・有用性を保証しません。本サービスの利用により生じた損害について、運営者は一切の責任を負いません。
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-text">第6条（規約の変更）</h2>
            <p className="mt-2">
              運営者は、必要と判断した場合、利用者への事前の通知なく本規約を変更できます。変更後の規約は、本ページに掲載された時点から効力を生じます。
            </p>
          </section>
          <p className="text-xs text-text-muted">最終更新日：2026年7月18日</p>
        </div>
      </div>
    </div>
  );
}
