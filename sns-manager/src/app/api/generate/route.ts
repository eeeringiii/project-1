import "server-only";

/**
 * AI投稿生成 API（サーバーサイド）
 *
 * - ANTHROPIC_API_KEY が設定されていれば Anthropic API を媒体ごとに呼び出す。
 * - 未設定なら generateMockDrafts でモック生成（開発・デモ用フォールバック）。
 * - 出力は必ず Zod（aiResponseSchema）で検証してから返す。
 * - APIキー等の機密はレスポンスにもログにも含めない。
 *
 * 外部API連携はこのサーバー側ハンドラでのみ行い、キーをクライアントへ露出させない。
 */
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  aiResponseSchema,
  generateRequestSchema,
  type AiPost,
} from "@/schemas";
import { buildSystemPrompt, buildUserPrompt, summarizePrompt } from "@/services/ai-prompt";
import { generateMockDrafts } from "@/services/ai-generation";
import { PLATFORM_POST_TYPES } from "@/constants";
import type { ContentSource, Platform } from "@/types/domain";
import type { GenerateRequest } from "@/schemas";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

/** リクエストの source を ContentSource 型へ補完（プロンプト生成用） */
function toContentSource(s: GenerateRequest["source"]): ContentSource {
  const nowIso = new Date().toISOString();
  return {
    ...s,
    createdBy: "",
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

/** どの (platform, postTypes) を生成するか算出 */
function resolveTargets(req: GenerateRequest): { platform: Platform; postTypes: string[] }[] {
  if (req.only) {
    return [{ platform: req.only.platform, postTypes: [req.only.postType] }];
  }
  const platforms = req.platforms ?? req.source.targetPlatforms;
  return platforms.map((platform) => ({
    platform,
    postTypes: (PLATFORM_POST_TYPES[platform] ?? []).map((t) => t.value),
  }));
}

/** コードフェンス等を除去してJSONを取り出す */
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text.trim();
}

export async function POST(request: Request) {
  const started = Date.now();
  let req: GenerateRequest;
  try {
    const json = await request.json();
    req = generateRequestSchema.parse(json);
  } catch (e) {
    return NextResponse.json(
      { error: "リクエストが不正です: " + (e instanceof Error ? e.message : "") },
      { status: 400 },
    );
  }

  const source = toContentSource(req.source);
  const rules = req.rules.map((r) => ({ ...r, createdAt: "", updatedAt: "" }));
  const targets = resolveTargets(req);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // ---- フォールバック: モック生成 ----
  if (!apiKey) {
    const all = generateMockDrafts(source, rules);
    const posts = all.filter((d) =>
      targets.some(
        (t) => t.platform === d.platform && t.postTypes.includes(d.postType),
      ),
    );
    console.info(
      `[ai.generate] mock mode / targets=${targets
        .map((t) => summarizePrompt(t.platform, t.postTypes))
        .join(" | ")} / posts=${posts.length}`,
    );
    return NextResponse.json({
      posts,
      meta: {
        model: null,
        usedMock: true,
        durationMs: Date.now() - started,
      },
    });
  }

  // ---- Anthropic 呼び出し（媒体ごと） ----
  const client = new Anthropic({ apiKey });
  const system = buildSystemPrompt();
  const posts: AiPost[] = [];

  try {
    for (const t of targets) {
      const userPrompt = buildUserPrompt(source, rules, t.platform, t.postTypes);
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: 2500,
        system,
        messages: [{ role: "user", content: userPrompt }],
      });
      const text = message.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
      const parsed = aiResponseSchema.parse(JSON.parse(extractJson(text)));
      posts.push(...parsed.posts);
      // ログ（機密なし）: 入力要約と出力件数のみ
      console.info(
        `[ai.generate] model=${MODEL} / ${summarizePrompt(
          t.platform,
          t.postTypes,
        )} / posts=${parsed.posts.length}`,
      );
    }
  } catch (e) {
    console.error("[ai.generate] error:", e instanceof Error ? e.message : e);
    return NextResponse.json(
      {
        error:
          "AI生成に失敗しました。時間をおいて再実行してください。（" +
          (e instanceof Error ? e.message : "unknown") +
          "）",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    posts,
    meta: { model: MODEL, usedMock: false, durationMs: Date.now() - started },
  });
}
