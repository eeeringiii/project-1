import type { Metadata } from "next";
import { COMPANY } from "../data";

export const metadata: Metadata = {
  title: `運用ルール — ${COMPANY.name}`,
  description: "解禁告知フロー・FC運営・ファイル保存・HP運用の各ルール",
};

function Card({
  title,
  meta,
  children,
}: {
  title: string;
  meta: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-[11px] text-zinc-500">{meta}</span>
      </div>
      {children}
    </section>
  );
}

export default function RulesPage() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <header className="mb-5">
          <h1 className="text-lg font-bold">📚 運用ルール</h1>
          <p className="mt-1 text-xs text-zinc-500">
            チーム全員が守る運用の決めごと。各ルールの正本ファイルは各カード下部に記載
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card title="📢 解禁告知フロー" meta="広報担当・納品済み">
            <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-300">
              <li>
                <b className="text-zinc-100">解禁時刻より前に一切出さない</b>
                （下書きは事前作成、公開は時刻厳守）
              </li>
              <li>
                出す順序は <b className="text-zinc-100">HP NEWS → X → Instagram</b>
                （FCがあれば先行予告）
              </li>
              <li>
                日時・タイトル・表記は
                <b className="text-zinc-100">一次情報と突き合わせ</b>てから公開
              </li>
              <li>
                タイアップ案件は
                <b className="text-zinc-100">PR表記ルールの確認を先に</b>
              </li>
            </ol>
            <p className="mt-3 text-[11px] text-zinc-500">
              テンプレ実体: 秘書用/アイデア/2026-07-14_広報_解禁告知テンプレ.md
            </p>
          </Card>

          <Card title="💖 FC運営の4本柱" meta="FC運営担当・納品済み">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700 text-left text-[11px] text-zinc-500">
                    <th className="py-2 pr-3 font-semibold">柱</th>
                    <th className="py-2 pr-3 font-semibold">頻度</th>
                    <th className="py-2 font-semibold">連携先</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["会員限定ブログ", "週1目安", "FC限定コンテンツ担当"],
                    ["限定動画・ボイス", "月1〜", "MV・映像企画担当"],
                    ["先行案内", "都度", "チケッティング・グッズ担当"],
                    ["イベント", "年2〜", "ファンイベント担当"],
                  ].map(([a, b, c]) => (
                    <tr key={a} className="border-b border-zinc-800">
                      <td className="whitespace-nowrap py-2.5 pr-3 font-medium text-zinc-100">{a}</td>
                      <td className="whitespace-nowrap py-2.5 pr-3 text-zinc-300">{b}</td>
                      <td className="py-2.5 text-zinc-400">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] text-zinc-500">
              設計書実体: 秘書用/アイデア/2026-07-14_FC運営設計_初版.md
            </p>
          </Card>

          <Card title="🗂 ファイル保存ルール" meta="秘書運用">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700 text-left text-[11px] text-zinc-500">
                    <th className="py-2 pr-3 font-semibold">種類</th>
                    <th className="py-2 pr-3 font-semibold">保存先</th>
                    <th className="py-2 font-semibold">ファイル名</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["タスク", "秘書用/todo/", "YYYY-MM-DD_タスク名.md"],
                    ["アイデア・下書き", "秘書用/アイデア/", "YYYY-MM-DD_タイトル.md"],
                    ["日報", "秘書用/日報/", "YYYY-MM-DD.md（1日1ファイル）"],
                  ].map(([a, b, c]) => (
                    <tr key={a} className="border-b border-zinc-800">
                      <td className="whitespace-nowrap py-2.5 pr-3 font-medium text-zinc-100">{a}</td>
                      <td className="whitespace-nowrap py-2.5 pr-3 text-zinc-300">{b}</td>
                      <td className="py-2.5 text-zinc-400">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="🌐 HP運用の恒久原則" meta="2026-07-11 制定">
            <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-300">
              <li>
                常に<b className="text-zinc-100">「HPを見る人」目線</b>
                で最も見やすい状態を優先
              </li>
              <li>
                誰のサイトかが<b className="text-zinc-100">最初の画面で分かる</b>
              </li>
              <li>
                文字は<b className="text-zinc-100">可読コントラスト（WCAG AA・4.5:1）</b>
                を維持
              </li>
              <li>
                タップ目標は<b className="text-zinc-100">約44px</b>
                、英語ラベルには日本語を添える
              </li>
              <li>
                変更のたびにこの原則で
                <b className="text-zinc-100">自己点検してから反映</b>
              </li>
            </ol>
          </Card>
        </div>
      </div>
    </main>
  );
}
