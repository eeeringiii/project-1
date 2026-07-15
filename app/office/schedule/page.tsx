import type { Metadata } from "next";
import { COMPANY, SCHEDULE } from "../data";

export const metadata: Metadata = {
  title: `スケジュール — ${COMPANY.name}`,
  description: "今週・今月・四半期のロードマップ",
};

export default function SchedulePage() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <header className="mb-5">
          <h1 className="text-lg font-bold">📅 スケジュール</h1>
          <p className="mt-1 text-xs text-zinc-500">
            今週・今月・四半期のロードマップ。正本は 秘書用/todo/（更新はClaude Codeへの指示で）
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {SCHEDULE.map((s) => (
            <section
              key={s.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{s.label}</h2>
                <span className="text-[11px] text-zinc-500">{s.sub}</span>
              </div>
              <ul className="space-y-3">
                {s.items.map((item) => (
                  <li
                    key={item.title}
                    className="flex items-baseline justify-between gap-3 text-sm"
                  >
                    <span className="min-w-0 text-zinc-200">{item.title}</span>
                    <span className="shrink-0 rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                      {item.owner}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
