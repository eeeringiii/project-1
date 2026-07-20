/**
 * 栄養フィードバック（ルールベース）
 *
 * 食事記録から栄養バランスを計算し、友達のようなアドバイス文を生成する。
 * 以前は Anthropic API を毎回呼んでいたが、この処理は計算とテンプレートで
 * 代替できるため、API を呼ばずにここで完結させる（使用量の削減）。
 */

export interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
}

/** 1日の目標値（未指定なら一般的な成人の目安を使う） */
export interface NutritionTargets {
  calories?: number;
  protein?: number; // g
  fat?: number; // g（上限の目安）
  carbs?: number; // g
}

const round = (n: number) => Math.round(n);

function resolveTargets(t: NutritionTargets = {}): Required<NutritionTargets> {
  const calories = t.calories ?? 2000;
  return {
    calories,
    // たんぱく質の目安、脂質は総kcalの約27%、炭水化物は約55%を上限目安に
    protein: t.protein ?? 60,
    fat: t.fat ?? round((calories * 0.27) / 9),
    carbs: t.carbs ?? round((calories * 0.55) / 4),
  };
}

interface Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

function sumMeals(meals: Meal[]): Totals {
  return meals.reduce<Totals>(
    (acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

/**
 * 食事記録から栄養アドバイス文を生成する（日本語・約200文字以内）。
 */
export function buildNutritionFeedback(
  meals: Meal[],
  targets?: NutritionTargets,
): string {
  const goal = resolveTargets(targets);
  const total = sumMeals(meals);

  const tips: string[] = [];

  // --- カロリー ---
  const calRatio = goal.calories > 0 ? total.calories / goal.calories : 1;
  if (calRatio < 0.7) {
    tips.push(
      "今日は食べる量が少し少なめ。エネルギー不足に気をつけて、あと少し補給できるといいね。",
    );
  } else if (calRatio > 1.15) {
    tips.push(
      "カロリーは少しオーバー気味。次の食事は軽めにするとちょうどいいかも。",
    );
  } else {
    tips.push("カロリーはいいバランス！この調子で無理なくいこう。");
  }

  // --- たんぱく質 ---
  if (total.protein < goal.protein * 0.7) {
    tips.push(
      "たんぱく質が不足気味。卵・鶏むね肉・豆腐・魚などをプラスしてみて。",
    );
  } else if (total.protein >= goal.protein) {
    tips.push("たんぱく質はしっかり摂れてるね！");
  }

  // --- 脂質（総kcalに占める割合が高いか） ---
  const fatRatio = total.calories > 0 ? (total.fat * 9) / total.calories : 0;
  if (fatRatio > 0.35) {
    tips.push("脂質の割合が高め。揚げ物や脂の多い部位は控えめにしてみよう。");
  }

  // --- 炭水化物（偏りすぎ） ---
  const carbRatio = total.calories > 0 ? (total.carbs * 4) / total.calories : 0;
  if (carbRatio > 0.65) {
    tips.push("炭水化物に偏りぎみ。野菜やたんぱく質も一緒に摂ろう。");
  }

  // --- 記録数 ---
  if (meals.length === 1) {
    tips.push(
      "記録が1食分だけみたい。他の食事も記録すると、もっと的確にアドバイスできるよ。",
    );
  }

  // 先頭から詰めて約200文字に収める（最低1件は残す）
  const MAX = 200;
  const selected: string[] = [];
  let len = 0;
  for (const tip of tips) {
    if (selected.length > 0 && len + tip.length > MAX) break;
    selected.push(tip);
    len += tip.length;
  }

  return selected.join("");
}
