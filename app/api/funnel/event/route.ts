import { NextRequest, NextResponse } from "next/server";
import { recordEvent, getSummary, type FunnelStage } from "@/lib/funnelStore";

const MANUAL_STAGES: FunnelStage[] = ["lp_visit", "meeting_done"];

export async function POST(req: NextRequest) {
  const { stage } = await req.json();

  if (!MANUAL_STAGES.includes(stage)) {
    return NextResponse.json({ error: "不正なstageです" }, { status: 400 });
  }

  await recordEvent(stage);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const summary = await getSummary();
  return NextResponse.json(summary);
}
