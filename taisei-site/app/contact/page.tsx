import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = { title: "CONTACT" };

export default function ContactPage() {
  return (
    <PageShell titleEn="FAN CONTACT" titleJp="ファンの皆さまへ">
      <div className="mx-auto max-w-2xl space-y-10">
        <section>
          <h2 className="mb-4 text-sm tracking-[0.24em] text-gold">
            ファンレターの宛先
          </h2>
          <p className="border border-line bg-paper-soft p-7 text-sm leading-loose text-sub">
            〒000-0000
            <br />
            宛先住所が入ります（サンプル）
            <br />
            「アーティスト」宛
          </p>
        </section>
        <section>
          <h2 className="mb-4 text-sm tracking-[0.24em] text-gold">
            応援メッセージ
          </h2>
          <p className="text-sm leading-loose text-sub">
            応援メッセージの受付方法（フォーム・SNSなど）の案内文が入ります。（サンプル）
          </p>
        </section>
        <p className="border-t border-line pt-6 text-xs leading-loose text-muted">
          出演・タイアップなどお仕事に関するご連絡は
          <Link href="/business" className="mx-1 text-gold underline underline-offset-4">
            BUSINESS
          </Link>
          ページよりお願いいたします。
        </p>
      </div>
    </PageShell>
  );
}
