import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import LiveList from "@/components/LiveList";
import { liveEvents } from "@/lib/content";

export const metadata: Metadata = { title: "LIVE" };

export default function LivePage() {
  return (
    <PageShell titleEn="LIVE" titleJp="ライブ・イベント">
      <LiveList events={liveEvents} />
    </PageShell>
  );
}
