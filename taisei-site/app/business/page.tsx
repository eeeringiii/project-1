import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "BUSINESS",
  description:
    "福本大晴への出演・タイアップ・メディア取材など、お仕事のご依頼はこちらから。",
};

const services = [
  { title: "出演", body: "テレビ・ラジオ・配信番組・イベントへの出演（サンプル）" },
  { title: "タイアップ", body: "楽曲タイアップ・プロモーション施策（サンプル）" },
  { title: "メディア取材", body: "雑誌・WEBメディアのインタビュー・撮影（サンプル）" },
];

export default function BusinessPage() {
  return (
    <PageShell titleEn="BUSINESS" titleJp="お仕事のご依頼">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <p className="mb-10 text-sm leading-loose text-sub">
            福本大晴への出演・タイアップ・取材など、お仕事のご依頼を受け付けております。
            下記の窓口よりお気軽にご相談ください。（文面はサンプルです）
          </p>
          <div className="mb-12 grid gap-4 md:grid-cols-3">
            {services.map((service) => (
              <div key={service.title} className="border border-line p-6">
                <h2 className="mb-3 text-sm tracking-[0.2em] text-gold">
                  {service.title}
                </h2>
                <p className="text-xs leading-loose text-sub">{service.body}</p>
              </div>
            ))}
          </div>
          <section className="border border-gold-soft bg-paper-soft p-8 text-center">
            <h2 className="mb-3 font-display text-lg tracking-[0.3em]">CONTACT</h2>
            <p className="mb-6 text-xs leading-loose text-sub">
              お問い合わせフォーム（実装予定）または下記メールアドレスまでご連絡ください。
            </p>
            <p className="text-sm tracking-[0.12em] text-gold">
              contact@example.com（サンプル）
            </p>
          </section>
        </Reveal>
      </div>
    </PageShell>
  );
}
