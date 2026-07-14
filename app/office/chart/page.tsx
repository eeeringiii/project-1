import type { Metadata } from "next";
import Link from "next/link";
import {
  COMPANY,
  DEPARTMENTS,
  STATUS_DOT,
  STATUS_LABEL,
  kpis,
} from "../data";

export const metadata: Metadata = {
  title: `組織図 — ${COMPANY.name}`,
  description: `${COMPANY.name}の組織図（AI社員の部門・担当一覧）`,
};

const headerBg: Record<string, string> = {
  emerald: "bg-emerald-950/60 text-emerald-200 border-emerald-500/30",
  fuchsia: "bg-fuchsia-950/60 text-fuchsia-200 border-fuchsia-500/30",
  rose: "bg-rose-950/60 text-rose-200 border-rose-500/30",
  pink: "bg-pink-950/60 text-pink-200 border-pink-500/30",
  sky: "bg-sky-950/60 text-sky-200 border-sky-500/30",
  orange: "bg-orange-950/60 text-orange-200 border-orange-500/30",
  violet: "bg-violet-950/60 text-violet-200 border-violet-500/30",
  teal: "bg-teal-950/60 text-teal-200 border-teal-500/30",
};

export default function ChartPage() {
  const k = kpis();

  return (
    <main className="min-h-screen bg-[#0b0d12] text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* ヘッダー */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-sky-500 text-xl">
              🏢
            </div>
            <div>
              <h1 className="text-base font-bold">{COMPANY.name} — 組織図</h1>
              <p className="text-[11px] text-zinc-500">
                担当アーティスト {COMPANY.artist}・更新 {COMPANY.updated}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <span>👥 総AI社員 <b className="text-zinc-100">{k.total}</b>名</span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />稼働中{" "}
              <b className="text-zinc-100">{k.active}</b>名
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400" />レビュー待ち{" "}
              <b className="text-zinc-100">{k.review}</b>名
            </span>
            <span>📦 成果物 <b className="text-zinc-100">{k.outputs}</b>件</span>
            <Link
              href="/office"
              className="rounded-full border border-zinc-700 px-3 py-1.5 text-zinc-300 transition hover:bg-zinc-800"
            >
              ← ダッシュボード
            </Link>
          </div>
        </header>

        {/* 経営レイヤー */}
        <div className="mb-2 flex flex-col items-center">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900/80 p-4 text-center shadow-lg">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-2xl">
              👑
            </div>
            <p className="font-bold">
              {COMPANY.owner}
              <span className="ml-2 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                代表
              </span>
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-500">{COMPANY.ownerRole}</p>
            <p className="mt-2 text-xs text-zinc-400">
              仕事は3つ: 方針を渡す ／「作って」と言う ／ 成果物に感想を言う
            </p>
          </div>
          <div className="h-5 w-px bg-zinc-700" />
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-center">
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 text-xl">
              🐺
            </div>
            <p className="font-bold">
              {COMPANY.chief}
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                稼働中
              </span>
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-500">{COMPANY.chiefRole}</p>
            <p className="mt-2 text-xs text-zinc-400">
              全部門を統括。指示を受けてAI社員に仕事を割り振る。
            </p>
          </div>
          <div className="h-5 w-px bg-zinc-700" />
        </div>

        {/* 部門ツリー */}
        <div className="grid grid-cols-2 gap-3 border-t border-zinc-800 pt-4 md:grid-cols-4 xl:grid-cols-8">
          {DEPARTMENTS.map((d) => (
            <div key={d.id} className="flex flex-col gap-2">
              <div
                className={`rounded-xl border px-3 py-3 text-center ${headerBg[d.accent]}`}
              >
                <p className="text-lg">{d.emoji}</p>
                <p className="mt-1 text-xs font-bold leading-tight">{d.name}</p>
                <p className="mt-1 text-[10px] opacity-70">
                  {d.staff.length}名・成果物{" "}
                  {d.staff.reduce((s, x) => s + x.outputs, 0)}件
                </p>
              </div>
              {d.staff.map((s) => (
                <div
                  key={s.id}
                  className={`rounded-lg border px-2.5 py-2 ${
                    s.status === "planned"
                      ? "border-dashed border-zinc-700 bg-transparent"
                      : "border-zinc-800 bg-zinc-900/60"
                  }`}
                  title={`${s.name}（${STATUS_LABEL[s.status]}） ${s.note}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{s.emoji}</span>
                    <span
                      className={`min-w-0 flex-1 truncate text-[11px] font-medium ${
                        s.status === "planned" ? "text-zinc-500" : "text-zinc-200"
                      }`}
                    >
                      {s.name}
                    </span>
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[s.status]}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <footer className="mt-8 border-t border-zinc-800 pt-4 text-center text-[11px] text-zinc-600">
          ● 稼働中 ／ ● レビュー待ち ／ ● 教育中 ／ 点線 = 入社予定
        </footer>
      </div>
    </main>
  );
}
