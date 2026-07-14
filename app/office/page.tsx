import type { Metadata } from "next";
import {
  COMPANY,
  DEPARTMENTS,
  AI_COST,
  STATUS_LABEL,
  STATUS_DOT,
  kpis,
  type StaffStatus,
} from "./data";
import {
  latestNippou,
  listNippou,
  todayTasks,
  countIdeas,
  countNews,
} from "./lib";

export const metadata: Metadata = {
  title: `${COMPANY.name} — AI OFFICE`,
  description: COMPANY.tagline,
};

// 常に最新のファイル状態を反映
export const dynamic = "force-dynamic";

const accentRing: Record<string, string> = {
  emerald: "ring-emerald-500/40",
  fuchsia: "ring-fuchsia-500/40",
  sky: "ring-sky-500/40",
  orange: "ring-orange-500/40",
  violet: "ring-violet-500/40",
  rose: "ring-rose-500/40",
  pink: "ring-pink-500/40",
  teal: "ring-teal-500/40",
};
const accentText: Record<string, string> = {
  emerald: "text-emerald-300",
  fuchsia: "text-fuchsia-300",
  sky: "text-sky-300",
  orange: "text-orange-300",
  violet: "text-violet-300",
  rose: "text-rose-300",
  pink: "text-pink-300",
  teal: "text-teal-300",
};

function StatusBadge({ status }: { status: StaffStatus }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-zinc-300">
      <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function OfficePage() {
  const k = kpis();
  const nippou = latestNippou();
  const nippouCount = listNippou().length;
  const tasks = todayTasks(5);
  const ideas = countIdeas();
  const news = countNews();
  const totalOutputs = k.outputs;

  return (
    <main className="min-h-screen bg-[#0b0d12] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* ===== ヘッダー ===== */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-500 text-2xl">
              🏢
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">AI OFFICE</h1>
              <p className="text-xs text-zinc-400">
                {COMPANY.name}・担当アーティスト {COMPANY.artist}
              </p>
            </div>
          </div>
          <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
            更新 {COMPANY.updated}
          </span>
        </header>

        {/* ===== KPI 行 ===== */}
        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Kpi label="総AI社員数" value={k.total} unit="名" />
          <Kpi label="稼働中" value={k.active} unit="名" dot="bg-emerald-400" />
          <Kpi label="レビュー待ち" value={k.review} unit="名" dot="bg-amber-400" />
          <Kpi label="教育中" value={k.training} unit="名" dot="bg-sky-400" />
          <Kpi label="入社予定" value={k.planned} unit="名" dot="bg-zinc-500" />
          <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <span className="text-xs text-zinc-400">稼働率</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-300">{k.rate}%</span>
              <span className="text-[11px] text-zinc-500">成果物 累計 {totalOutputs}</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${k.rate}%` }} />
            </div>
          </div>
        </section>

        {/* ===== MY DESK ===== */}
        <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* 今日のタスク */}
          <Card title="✅ 今日のタスク" subtitle={COMPANY.updated}>
            {tasks.length === 0 ? (
              <p className="text-sm text-zinc-500">
                秘書用/todo に未完了タスク（- [ ]）を追加すると、ここに表示されます。
              </p>
            ) : (
              <ul className="space-y-2">
                {tasks.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-200">
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-zinc-600" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* 日報 */}
          <Card title="📓 日報" subtitle={nippou ? `最新 ${nippou.date}` : "未記録"}>
            {nippou ? (
              <>
                <p className="text-sm text-zinc-200">{nippou.summary || "（本文サマリーなし）"}</p>
                <p className="mt-3 text-[11px] text-zinc-500">
                  日報の実体: 秘書用/日報/{nippou.date}.md（累計 {nippouCount} 件）
                </p>
              </>
            ) : (
              <p className="text-sm text-zinc-500">
                秘書用/日報/YYYY-MM-DD.md を作成すると、最新分がここに出ます。
              </p>
            )}
          </Card>

          {/* アクション */}
          <Card title="⚡ アクション" subtitle="Claude Codeに指示">
            <div className="space-y-2">
              {[
                "📓 日報を整理して",
                "💡 今日のタスクを更新して",
                "🐦 X投稿案を3本作って",
                "🎫 ライブ情報を更新して",
              ].map((a) => (
                <div
                  key={a}
                  className="rounded-xl border border-zinc-800 bg-zinc-800/40 px-3 py-2 text-sm text-zinc-200"
                >
                  {a}
                </div>
              ))}
              <p className="pt-1 text-[11px] text-zinc-500">
                コピーしてClaude Codeに貼り付け／音声でもOK
              </p>
            </div>
          </Card>
        </section>

        {/* ===== 成果物ハイライト + AIコスト ===== */}
        <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card title="📦 成果物ハイライト" subtitle="実データ連動">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="成果物 累計" value={totalOutputs} />
                <Stat label="公開NEWS" value={news} />
                <Stat label="アイデア/下書き" value={ideas} />
                <Stat label="日報 累計" value={nippouCount} />
              </div>
            </Card>
          </div>
          {/* AIコスト */}
          <Card title="💰 AIコスト（今月）" subtitle="正本: app/office/data.ts">
            <p className="mb-3 text-2xl font-bold">
              ¥{AI_COST.total.toLocaleString()}
              <span className="ml-1 text-sm font-normal text-zinc-400">/月</span>
            </p>
            <ul className="space-y-1.5 text-sm">
              {AI_COST.items.map((c) => (
                <li key={c.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-zinc-300">
                    {c.name}
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                      {c.tag}
                    </span>
                  </span>
                  <span className="tabular-nums text-zinc-200">¥{c.amount.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* ===== 部門一覧 ===== */}
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-400">
            DEPARTMENTS — 部門一覧
          </h2>
          <div className="space-y-4">
            {DEPARTMENTS.map((d) => (
              <div
                key={d.id}
                className={`rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 ring-1 ${accentRing[d.accent]}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className={`flex items-center gap-2 font-semibold ${accentText[d.accent]}`}>
                    <span>{d.emoji}</span>
                    {d.name}
                  </h3>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">
                    {d.staff.length}名
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {d.staff.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-lg">
                        {s.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium text-zinc-100">{s.name}</p>
                          <StatusBadge status={s.status} />
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-zinc-500">{s.role}</p>
                        <p className="mt-1 line-clamp-2 text-[11px] text-zinc-400">{s.note}</p>
                        <div className="mt-1.5 flex items-center gap-3 text-[10px] text-zinc-500">
                          <span>成果物 {s.outputs}</span>
                          <span>ログ {s.logs}</span>
                          <span className="text-zinc-400">Lv.{s.level}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-zinc-800 pt-4 text-center text-[11px] text-zinc-600">
          {COMPANY.chief}（{COMPANY.chiefRole}）が運営 ／ 代表 {COMPANY.owner}
        </footer>
      </div>
    </main>
  );
}

function Kpi({
  label,
  value,
  unit,
  dot,
}: {
  label: string;
  value: number;
  unit?: string;
  dot?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
        {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
        {label}
      </div>
      <p className="mt-1 text-2xl font-bold tabular-nums">
        {value}
        {unit && <span className="ml-0.5 text-sm font-normal text-zinc-500">{unit}</span>}
      </p>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
        {subtitle && <span className="text-[11px] text-zinc-500">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 text-center">
      <p className="text-2xl font-bold tabular-nums text-emerald-300">{value}</p>
      <p className="mt-1 text-[11px] text-zinc-400">{label}</p>
    </div>
  );
}
