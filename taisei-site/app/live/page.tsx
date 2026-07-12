import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import { liveEvents, siteMeta, type LiveEvent } from "@/lib/content";
import { BASE_URL } from "@/lib/site";

export const metadata: Metadata = { title: "LIVE" };

// Googleカレンダーに終日予定として追加するリンクを作る
function calendarUrl(event: LiveEvent): string {
  const start = event.date.replaceAll(".", "");
  const d = new Date(`${event.date.replaceAll(".", "-")}T00:00:00+09:00`);
  d.setDate(d.getDate() + 1);
  const p = (n: number) => String(n).padStart(2, "0");
  const end = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    location: event.venue,
    details: `${siteMeta.siteName} ${BASE_URL}/live`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function LivePage() {
  return (
    <PageShell titleEn="LIVE" titleJp="ライブ・イベント">
      <div className="space-y-6">
        {liveEvents.map((event, i) => (
          <Reveal key={i}>
            <div className="grid gap-3 border border-line p-7 md:grid-cols-[9rem_1fr_auto] md:items-center md:gap-6">
              <time className="text-sm tracking-[0.1em] text-gold">{event.date}</time>
              <div>
                <h2 className="mb-1 text-base tracking-[0.08em]">{event.title}</h2>
                <p className="text-xs leading-relaxed text-muted">{event.venue}</p>
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <span className="text-[0.68rem] tracking-[0.14em] text-muted">
                  {event.note}
                </span>
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
          </Reveal>
        ))}
      </div>
    </PageShell>
  );
}
