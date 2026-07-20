import { NextRequest, NextResponse } from "next/server";
import {
  buildNutritionFeedback,
  type Meal,
  type NutritionTargets,
} from "@/lib/nutrition-feedback";

// 栄養アドバイスは計算＋テンプレートで生成できるため、AI（外部API）を呼ばない。
// これにより Anthropic API の使用量を削減する。
export async function POST(req: NextRequest) {
  try {
    const { meals, targets } = (await req.json()) as {
      meals?: Meal[];
      targets?: NutritionTargets;
    };

    if (!meals || meals.length === 0) {
      return NextResponse.json({ error: "食事記録がありません" }, { status: 400 });
    }

    const feedback = buildNutritionFeedback(meals, targets);
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: "フィードバックの取得に失敗しました" }, { status: 500 });
  }
}
