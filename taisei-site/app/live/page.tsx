import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import LiveList from "@/components/LiveList";
import { getLiveEvents } from "@/lib/data";

export const metadata: Metadata = { title: "LIVE" };

export default function LivePage() {
  return (
    <PageShell titleEn="LIVE" titleJp="ライブ・イベント">
      <LiveList events={getLiveEvents()} />
    </PageShell>
  );
}
