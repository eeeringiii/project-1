import { NextResponse } from "next/server";
import type { Goods, GoodsCategory } from "@/lib/content";
import { getRepoFile, putRepoFile, toBase64 } from "@/lib/github";

// /studio「グッズ」タブからの商品の追加・編集・削除。
// content/goods.json（配列）を GitHub 経由で書き換える。

const GOODS_PATH = "taisei-site/content/goods.json";
const CATEGORIES: GoodsCategory[] = [
  "APPAREL",
  "MUSIC",
  "ACCESSORY",
  "GOODS",
  "OTHER",
];

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const isUrl = (s: unknown) => typeof s === "string" && /^https?:\/\/\S+$/.test(s);

// 入力から保存用の商品オブジェクトを組み立てる（id は呼び出し側で付与）
function buildGoods(raw: Record<string, unknown>, id: string): Goods | string {
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!name || name.length > 120) return "商品名は1〜120文字で入力してください";
  if (!CATEGORIES.includes(raw.category as GoodsCategory))
    return "カテゴリを選択してください";
  const price = Number(raw.price);
  if (!Number.isInteger(price) || price < 0 || price > 1_000_000)
    return "価格は0〜1,000,000の整数で入力してください";
  const description = typeof raw.description === "string" ? raw.description.trim() : "";
  if (!description || description.length > 2000)
    return "商品説明は1〜2000文字で入力してください";
  const stock = Number(raw.stock);
  if (!Number.isInteger(stock) || stock < 0 || stock > 100000)
    return "在庫数は0以上の整数で入力してください";
  const image = typeof raw.image === "string" ? raw.image : "";
  if (image && !image.startsWith("/uploads/")) return "画像の指定が不正です";
  const externalUrl = typeof raw.externalUrl === "string" ? raw.externalUrl.trim() : "";
  if (externalUrl && !isUrl(externalUrl)) return "外部ショップのURLが不正です";
  const active = raw.active !== false;

  return {
    id,
    name,
    category: raw.category as GoodsCategory,
    price,
    description,
    ...(image ? { image } : {}),
    stock,
    ...(externalUrl ? { externalUrl } : {}),
    active,
  };
}

export async function POST(req: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return bad("送信データを読み取れませんでした");
  }

  const studioPassword = process.env.STUDIO_PASSWORD;
  if (!studioPassword) return bad("サーバー設定が未完了です（STUDIO_PASSWORD）", 500);
  if (payload.password !== studioPassword) return bad("パスワードが違います", 401);

  const action = payload.action as string;
  if (!["append", "update", "remove"].includes(action))
    return bad("操作が不正です");

  // 追加・編集は先に入力を検証する
  let built: Goods | null = null;
  if (action === "append") {
    const item = buildGoods(
      (payload.item as Record<string, unknown>) ?? {},
      `goods-${Date.now().toString(36)}`,
    );
    if (typeof item === "string") return bad(item);
    built = item;
  } else if (action === "update") {
    if (typeof payload.id !== "string" || !payload.id) return bad("対象が不正です");
    const item = buildGoods(
      (payload.item as Record<string, unknown>) ?? {},
      payload.id,
    );
    if (typeof item === "string") return bad(item);
    built = item;
  } else if (typeof payload.id !== "string" || !payload.id) {
    return bad("対象が不正です");
  }

  if (!process.env.GITHUB_CONTENT_TOKEN)
    return bad("サーバー設定が未完了です（GITHUB_CONTENT_TOKEN）", 500);

  try {
    const { text, sha } = await getRepoFile(GOODS_PATH);
    const arr = JSON.parse(text) as Goods[];
    let next: Goods[];
    let message = "";

    if (action === "append") {
      next = [...arr, built as Goods];
      message = `入稿(グッズ): 追加 ${(built as Goods).name}`;
    } else if (action === "update") {
      const id = payload.id as string;
      if (!arr.some((g) => g.id === id)) return bad("対象が見つかりませんでした", 404);
      next = arr.map((g) => (g.id === id ? (built as Goods) : g));
      message = `入稿(グッズ): 更新 ${(built as Goods).name}`;
    } else {
      const id = payload.id as string;
      next = arr.filter((g) => g.id !== id);
      if (next.length === arr.length) return bad("対象が見つかりませんでした", 404);
      message = `入稿(グッズ): 削除`;
    }

    await putRepoFile(GOODS_PATH, toBase64(JSON.stringify(next, null, 2) + "\n"), message, sha);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("studio goods error:", e);
    return bad("保存に失敗しました。時間をおいて再度お試しください", 502);
  }
}
