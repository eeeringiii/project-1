import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getSummary } from "@/lib/funnelStore";

const client = new Anthropic();

function formatRate(rate: number | null): string {
  return rate === null ? "データ不足" : `${(rate * 100).toFixed(1)}%`;
}

export async function POST() {
  try {
    const summary = await getSummary();

    const prompt = `以下はLP→LINE登録→面談というマーケティングファネルの実績データです。

LP訪問数: ${summary.lpVisits}
LINE登録数: ${summary.lineRegistrations}
面談実施数: ${summary.meetingsDone}

LP→LINE登録 転換率: ${formatRate(summary.lpToLineRate)}
LINE登録→面談 転換率: ${formatRate(summary.lineToMeetingRate)}
LP→面談 全体転換率: ${formatRate(summary.lpToMeetingRate)}

このデータから読み取れるボトルネックや改善ポイントを、日本語で簡潔に（300文字以内）指摘してください。データが少なすぎる場合はその旨を伝えてください。`;

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const analysis = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ summary, analysis });
  } catch (error) {
    console.error("Funnel analysis error:", error);
    return NextResponse.json({ error: "分析中にエラーが発生しました" }, { status: 500 });
  }
}
