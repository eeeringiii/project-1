import type { Metadata } from "next";
import { AI_COST, COMPANY, REVENUE_PILLARS } from "../data";

export const metadata: Metadata = {
  title: `コスト・収支 — ${COMPANY.name}`,
  description: "AIコスト明細と収益の柱の設計状況",
};

export default function CostPage() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <header className="mb-5">
          <h1 className="text-lg font-bold">💰 コスト・収支</h1>
          <p className="mt-1 text-xs text-zinc-500">
            AIコストの明細と、収益5本柱の設計状況。正本は app/office/data.ts
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* AIコスト */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="mb-3 text-sm font-semibold">AIコスト（今月）</h2>
            <p className="mb-3 text-3xl font-bold">
              ¥{AI_COST.total.toLocaleString()}
              <span className="ml-1 text-sm font-normal text-zinc-400">/月</span>
            </p>
            <ul className="space-y-2 text-sm">
              {AI_COST.items.map((c) => (
                <li key={c.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-zinc-300">
                    {c.name}
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                      {c.tag}
                    </span>
                  </span>
                  <span className="tabular-nums text-zinc-200">
                    ¥{c.amount.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[11px] text-zinc-500">
              実額に更新したいときは「AIコストを更新して」とClaude Codeに一言。
            </p>
          </section>

          {/* 収益の柱 */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 lg:col-span-2">
            <h2 className="mb-3 text-sm font-semibold">収益の柱（設計状況）</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700 text-left text-[11px] text-zinc-500">
                    <th className="py-2 pr-3 font-semibold">柱</th>
                    <th className="py-2 pr-3 font-semibold">状態</th>
                    <th className="py-2 pr-3 font-semibold">次の一手</th>
                    <th className="py-2 font-semibold">担当</th>
                  </tr>
                </thead>
                <tbody>
                  {REVENUE_PILLARS.map((p) => (
                    <tr key={p.name} className="border-b border-zinc-800">
                      <td className="whitespace-nowrap py-2.5 pr-3 font-medium text-zinc-100">
                        {p.name}
                      </td>
                      <td className="whitespace-nowrap py-2.5 pr-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] ${
                            p.status === "稼働中"
                              ? "bg-emerald-400/10 text-emerald-300"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-zinc-300">{p.next}</td>
                      <td className="whitespace-nowrap py-2.5 text-zinc-400">{p.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[11px] text-zinc-500">
              月次の収支まとめは経理・コスト管理担当（入社予定）が担当予定。
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
