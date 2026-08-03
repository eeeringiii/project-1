import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

/**
 * 出力スキーマ。structured outputs でモデル側に強制させることで、
 * 「JSONが壊れて解析できず1回分のAPI呼び出しが丸ごと無駄になる」ケースを防ぐ。
 */
const NUTRITION_SCHEMA = {
  type: "object",
  properties: {
    foods: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "食べ物の名前（日本語）" },
          calories: { type: "number", description: "kcal" },
          protein: { type: "number", description: "たんぱく質(g)" },
          carbs: { type: "number", description: "炭水化物(g)" },
          fat: { type: "number", description: "脂質(g)" },
        },
        required: ["name", "calories", "protein", "carbs", "fat"],
        additionalProperties: false,
      },
    },
    totalCalories: { type: "number", description: "合計カロリー(kcal)" },
    notes: { type: "string", description: "コメントや注意事項（日本語）" },
  },
  required: ["foods", "totalCalories", "notes"],
  additionalProperties: false,
} as const;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json();

    if (!imageBase64 || !mediaType) {
      return NextResponse.json({ error: "画像データが必要です" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      // 画像からの抽出タスクなので思考は不要。Sonnet 5 は thinking 未指定だと
      // adaptive thinking が既定で走り、出力トークンを余分に消費する。
      thinking: { type: "disabled" },
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: NUTRITION_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: "この食べ物の写真を分析してください。複数の食べ物が写っている場合はそれぞれ分けてリストアップします。栄養値は推定値で構いません。日本語で回答してください。",
            },
          ],
        },
      ],
    });

    // structured outputs によりスキーマ準拠のJSONが保証されるため、
    // 従来の正規表現による切り出しは不要。
    const text = response.content.find((b) => b.type === "text")?.text ?? "";
    if (!text) {
      return NextResponse.json({ error: "解析に失敗しました" }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("Error analyzing food:", error);
    return NextResponse.json({ error: "解析中にエラーが発生しました" }, { status: 500 });
  }
}
