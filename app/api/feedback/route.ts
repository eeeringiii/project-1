import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { meals } = await req.json();

    if (!meals || meals.length === 0) {
      return NextResponse.json({ error: "食事記録がありません" }, { status: 400 });
    }

    const mealSummary = meals
      .map((m: { name: string; calories: number; protein: number; carbs: number; fat: number; mealType: string }) =>
        `${m.mealType}：${m.name}（${m.calories}kcal、たんぱく質${m.protein}g、炭水化物${m.carbs}g、脂質${m.fat}g）`
      )
      .join("\n");

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `今日の食事記録です：\n${mealSummary}\n\n栄養バランスについて、友達のように親しみやすく日本語でアドバイスしてください。具体的に何が足りないか、何を食べると良いかを教えてください。200文字以内で簡潔に。`,
        },
      ],
    });

    const feedback = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: "フィードバックの取得に失敗しました" }, { status: 500 });
  }
}
