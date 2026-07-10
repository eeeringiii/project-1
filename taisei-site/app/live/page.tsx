import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import { liveEvents } from "@/lib/content";

export const metadata: Metadata = { title: "LIVE" };

export default function LivePage() {
  return (
    <PageShell titleEn="LIVE" titleJp="ライブ・イベント">
      <div className="space-y-6">
        {liveEvents.map((event, i) => (
          <Reveal key={i}>
            <div className="grid gap-2 border border-line p-7 md:grid-cols-[9rem_1fr_auto] md:items-center md:gap-6">
              <time className="text-sm tracking-[0.1em] text-gold">{event.date}</time>
              <div>
                <h2 className="mb-1 text-base tracking-[0.08em]">{event.title}</h2>
                <p className="text-xs leading-relaxed text-muted">{event.venue}</p>
              </div>
              <span className="text-[0.68rem] tracking-[0.14em] text-muted">
                {event.note}
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </PageShell>
  );
}
