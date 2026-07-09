import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const anthropic = new Anthropic();

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET ?? "";
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";
const NOTION_API_KEY = process.env.NOTION_API_KEY ?? "";
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID ?? "";
const NOTION_TITLE_PROPERTY = process.env.NOTION_TITLE_PROPERTY || "Name";
const NOTION_DATE_PROPERTY = process.env.NOTION_DATE_PROPERTY || "";
const NOTION_NOTES_PROPERTY = process.env.NOTION_NOTES_PROPERTY || "";

type LineMentionee = { isSelf?: boolean };

type LineEvent = {
  type: string;
  replyToken?: string;
  source: { type: "user" | "group" | "room" };
  message?: {
    type: string;
    text: string;
    mention?: { mentionees: LineMentionee[] };
  };
};

type ExtractedTask = { title: string; dueDate: string | null; notes: string };

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !LINE_CHANNEL_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", LINE_CHANNEL_SECRET)
    .update(rawBody)
    .digest("base64");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

function isAddressedToBot(event: LineEvent): boolean {
  if (event.source.type === "user") return true;
  return event.message?.mention?.mentionees?.some((m) => m.isSelf) ?? false;
}

async function extractTask(text: string): Promise<ExtractedTask | null> {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `以下はLINEで送られてきたメッセージです。タスクとして登録すべき内容が含まれていれば、JSON形式で返してください。タスクでなければ {"isTask": false} とだけ返してください。

メッセージ: "${text}"

タスクの場合の形式:
{
  "isTask": true,
  "title": "タスク内容を簡潔にした一文",
  "dueDate": "YYYY-MM-DD形式の期限。読み取れなければnull",
  "notes": "補足があれば。なければ空文字"
}

JSONのみを返してください。`,
      },
    ],
  });

  const content = response.content[0];
  const raw = content.type === "text" ? content.text : "";
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;

  const parsed = JSON.parse(match[0]);
  if (!parsed.isTask) return null;
  return {
    title: parsed.title,
    dueDate: parsed.dueDate ?? null,
    notes: parsed.notes ?? "",
  };
}

async function createNotionTask(task: ExtractedTask): Promise<void> {
  const properties: Record<string, unknown> = {
    [NOTION_TITLE_PROPERTY]: { title: [{ text: { content: task.title } }] },
  };
  if (NOTION_DATE_PROPERTY && task.dueDate) {
    properties[NOTION_DATE_PROPERTY] = { date: { start: task.dueDate } };
  }
  if (NOTION_NOTES_PROPERTY && task.notes) {
    properties[NOTION_NOTES_PROPERTY] = {
      rich_text: [{ text: { content: task.notes } }],
    };
  }

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: NOTION_DATABASE_ID },
      properties,
    }),
  });

  if (!res.ok) {
    throw new Error(`Notion API error: ${res.status} ${await res.text()}`);
  }
}

async function replyToLine(replyToken: string, text: string): Promise<void> {
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }],
    }),
  });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { events } = JSON.parse(rawBody) as { events: LineEvent[] };

  await Promise.all(
    events.map(async (event) => {
      if (event.type !== "message" || event.message?.type !== "text") return;
      if (!isAddressedToBot(event)) return;

      try {
        const task = await extractTask(event.message.text);
        if (!task) return;

        await createNotionTask(task);

        if (event.replyToken) {
          const dueLine = task.dueDate ? `\n期限: ${task.dueDate}` : "";
          await replyToLine(
            event.replyToken,
            `タスクを登録しました\n「${task.title}」${dueLine}`
          );
        }
      } catch (error) {
        console.error("LINE webhook processing error:", error);
      }
    })
  );

  return NextResponse.json({ status: "ok" });
}

export async function GET() {
  return NextResponse.json({ status: "LINE webhook is running" });
}
