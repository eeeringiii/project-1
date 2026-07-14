"use client";

import { useEffect, useState } from "react";
import type { LiveCategory, LiveEvent } from "@/lib/content";
import { applyPeriodLabel, applyStatus, calendarUrl } from "@/lib/live";

const tabs: { value: "ALL" | LiveCategory; label: string }[] = [
  { value: "ALL", label: "すべて" },
  { value: "LIVE", label: "ライブ" },
  { value: "EVENT", label: "イベント" },
];

function StatusBadge({ event, nowMs }: { event: LiveEvent; nowMs: number | null }) {
  // 受付状態は現在時刻に依存するため、クライアントでマウント後にだけ描画する
  if (nowMs === null) return null;
  const status = applyStatus(event, nowMs);
  if (status === "none") return null;
  const map = {
    open: { text: "受付中", cls: "border-gold bg-gold text-paper" },
    before: { text: "近日受付", cls: "border-gold-soft text-gold" },
    closed: { text: "受付終了", cls: "border-line text-muted" },
  } as const;
  const s = map[status];
  return (
    <span className={`border px-2 py-0.5 text-[0.6rem] tracking-[0.16em] ${s.cls}`}>
      {s.text}
    </span>
  );
}

function EventCard({ event, nowMs }: { event: LiveEvent; nowMs: number | null }) {
  const period = applyPeriodLabel(event);
  const isOpen = nowMs !== null && applyStatus(event, nowMs) === "open";
  return (
    <div className="grid gap-3 border border-line p-7 md:grid-cols-[9rem_1fr_auto] md:items-center md:gap-6">
      <div className="flex items-center gap-3">
        <time className="text-sm tracking-[0.1em] text-gold">{event.date}</time>
        <span className="border border-line px-2 py-0.5 text-[0.58rem] tracking-[0.16em] text-muted">
          {event.category === "LIVE" ? "LIVE" : "EVENT"}
        </span>
      </div>
      <div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h2 className="text-base tracking-[0.08em]">{event.title}</h2>
          <StatusBadge event={event} nowMs={nowMs} />
        </div>
        <p className="text-xs leading-relaxed text-muted">{event.venue}</p>
        {period && (
          <p className="mt-1 text-[0.72rem] tracking-[0.06em] text-sub">
            チケット受付：{period}
          </p>
        )}
        {event.note && (
          <p className="mt-1 text-[0.72rem] tracking-[0.06em] text-muted">{event.note}</p>
        )}
      </div>
      <div className="flex flex-col items-start gap-2 md:items-end">
        {isOpen && event.ticketUrl && (
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gold bg-gold px-4 py-2 text-[0.66rem] tracking-[0.16em] text-paper transition-opacity hover:opacity-80"
          >
            チケットを申し込む
          </a>
        )}
        <a
          href={calendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-line px-4 py-2 text-[0.66rem] tracking-[0.16em] text-sub transition-colors hover:border-gold hover:text-gold"
        >
          ＋ カレンダーに追加
        </a>
      </div>
    </div>
  );
}

export default function LiveList({ events }: { events: LiveEvent[] }) {
  const [tab, setTab] = useState<"ALL" | LiveCategory>("ALL");
  const [nowMs, setNowMs] = useState<number | null>(null);

  // サーバー描画時に現在時刻で固定されるのを避け、マウント後に判定する
  useEffect(() => setNowMs(Date.now()), []);

  const openEvents =
    nowMs === null ? [] : events.filter((e) => applyStatus(e, nowMs) === "open");
  const filtered = tab === "ALL" ? events : events.filter((e) => e.category === tab);

  return (
    <div>
      {/* 受付中まとめ：いま申し込めるものを最上部に抜き出す */}
      {openEvents.length > 0 && (
        <section className="mb-10 border border-gold-soft bg-paper-soft p-6">
          <h2 className="mb-4 text-[0.72rem] tracking-[0.24em] text-gold">
            ただいまチケット受付中
          </h2>
          <ul className="space-y-3">
            {openEvents.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft pb-3 last:border-0 last:pb-0"
              >
                <span className="text-sm">
                  <span className="mr-3 tracking-[0.1em] text-gold">{event.date}</span>
                  {event.title}
                  <span className="ml-3 text-[0.72rem] text-sub">
                    〜 {applyPeriodLabel(event).split(" 〜 ")[1]} まで
                  </span>
                </span>
                {event.ticketUrl && (
                  <a
                    href={event.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-gold bg-gold px-4 py-2 text-[0.64rem] tracking-[0.16em] text-paper transition-opacity hover:opacity-80"
                  >
                    申し込む
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 種別タブ */}
      <div className="mb-6 flex gap-2" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={`border px-5 py-2 text-[0.7rem] tracking-[0.16em] transition-colors ${
              tab === t.value
                ? "border-ink bg-ink text-paper"
                : "border-line text-sub hover:border-gold hover:text-gold"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 一覧 */}
      {filtered.length > 0 ? (
        <div className="space-y-6">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} nowMs={nowMs} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-muted">
          該当する予定はありません。
        </p>
      )}
    </div>
  );
}
