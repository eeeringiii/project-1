import { siteMeta, type LiveEvent } from "@/lib/content";
import { BASE_URL } from "@/lib/site";

// チケット受付の状態
export type ApplyStatus = "before" | "open" | "closed" | "none";

export function applyStatus(event: LiveEvent, nowMs: number): ApplyStatus {
  if (!event.applyStart || !event.applyEnd) return "none";
  const start = Date.parse(`${event.applyStart}T00:00:00+09:00`);
  const end = Date.parse(`${event.applyEnd}T23:59:59+09:00`);
  if (nowMs < start) return "before";
  if (nowMs > end) return "closed";
  return "open";
}

// "2026-08-20" → "8/20"
function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
}

export function applyPeriodLabel(event: LiveEvent): string {
  if (!event.applyStart || !event.applyEnd) return "";
  return `${shortDate(event.applyStart)} 〜 ${shortDate(event.applyEnd)}`;
}

// Googleカレンダーに終日予定として追加するリンク
export function calendarUrl(event: LiveEvent): string {
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
