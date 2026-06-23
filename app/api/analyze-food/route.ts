import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json();

    if (!imageBase64 || !mediaType) {
      return NextResponse.json({ error: "画像データが必要です" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
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
              text: `この食べ物の写真を分析して、以下の情報をJSON形式で返してください。日本語で回答してください。

{
  "foods": [
    {
      "name": "食べ物の名前",
      "calories": 数値（kcal）,
      "protein": 数値（g）,
      "carbs": 数値（g）,
      "fat": 数値（g）
    }
  ],
  "totalCalories": 合計カロリー数値,
  "notes": "コメントや注意事項"
}

写真に複数の食べ物がある場合はそれぞれ分けてリストアップしてください。推定値で構いません。JSONのみ返してください。`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "解析に失敗しました" }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error analyzing food:", error);
    return NextResponse.json({ error: "解析中にエラーが発生しました" }, { status: 500 });
  }
}
