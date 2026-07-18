import type { Metadata } from "next";
import SectionHeading from "@/components/common/SectionHeading";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "OSHICOA 16のプライバシーポリシー。推しの名前など入力情報の取り扱い、localStorage、アクセス解析について説明します。",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-2xl">
        <SectionHeading eyebrow="PRIVACY" title="プライバシーポリシー" />
        <div className="prose-legal mt-10 space-y-8 text-sm leading-loose text-text-sub">
          <section>
            <h2 className="font-display text-lg font-bold text-text">1. 基本方針</h2>
            <p className="mt-2">
              OSHICOA 16（以下「本サービス」）は、利用者のプライバシーを尊重し、個人情報の保護に努めます。本ポリシーは、本サービスにおける情報の取り扱いを定めるものです。
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-text">2. 入力情報の取り扱い</h2>
            <p className="mt-2">
              診断前に任意で入力いただく推しの名前・ジャンル・推し歴・現場頻度などの情報は、本サービスのサーバーへ送信・保存されません。これらは診断中の表示と、利用者の端末内（ブラウザのlocalStorage）での結果復元のためにのみ使用されます。
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-text">3. ローカルストレージ</h2>
            <p className="mt-2">
              本サービスは、診断結果の復元のためにブラウザのlocalStorageを利用します。保存されたデータは利用者の端末内にのみ存在し、いつでもブラウザの設定や結果画面の「すべてリセット」から削除できます。localStorageが利用できない環境でも、診断自体は動作します。
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-text">4. アクセス解析</h2>
            <p className="mt-2">
              本サービスは、サービス改善のためにGoogle Analytics等のアクセス解析ツールを利用する場合があります。これらのツールはCookie等を用いて利用状況を収集しますが、推しの名前などの個人を特定する入力情報は解析イベントへ送信しません。解析ツールの利用はCookieの無効化等で拒否できます。
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-text">5. 外部サービス</h2>
            <p className="mt-2">
              シェア機能を通じてX（旧Twitter）やLINE等の外部サービスへ遷移した場合、遷移先での情報の取り扱いは各サービスのプライバシーポリシーに従います。
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-bold text-text">6. 改定</h2>
            <p className="mt-2">
              本ポリシーは、必要に応じて改定されることがあります。重要な変更がある場合は、本ページ上で告知します。
            </p>
          </section>
          <p className="text-xs text-text-muted">最終更新日：2026年7月18日</p>
        </div>
      </div>
    </div>
  );
}
