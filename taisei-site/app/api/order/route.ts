import { NextResponse } from "next/server";
import type { Goods, Order, OrderItem } from "@/lib/content";
import { getRepoFile, putRepoFile, toBase64 } from "@/lib/github";

// グッズ販売の注文受付（公開エンドポイント・パスワード不要）。
// 1) content/goods.json から正規の価格・在庫を読む（クライアントの金額は信用しない）
// 2) content/orders/<注文番号>.json に注文を保存（個人情報を含む・公開ページからは読まない）
// 3) goods.json の在庫を減らす
// いずれも GitHub へのコミット。mainへの反映でVercelが再ビルドする。

const GOODS_PATH = "taisei-site/content/goods.json";
const ORDERS_DIR = "taisei-site/content/orders";

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const str = (s: unknown, max: number) =>
  typeof s === "string" && s.trim().length > 0 && s.trim().length <= max;

type RawItem = { id?: unknown; qty?: unknown };

function makeOrderId(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const ymd = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${ymd}-${rand}`;
}

export async function POST(req: Request) {
  let payload: {
    customer?: Record<string, unknown>;
    items?: RawItem[];
    note?: unknown;
    company?: unknown; // ハニーポット
  };
  try {
    payload = await req.json();
  } catch {
    return bad("送信データを読み取れませんでした");
  }

  // ハニーポットに入力があれば bot とみなし、成功を装って捨てる
  if (typeof payload.company === "string" && payload.company.trim() !== "") {
    return NextResponse.json({ ok: true, orderId: makeOrderId() });
  }

  const c = payload.customer ?? {};
  if (!str(c.name, 60)) return bad("お名前を入力してください");
  if (!str(c.kana, 60)) return bad("フリガナを入力してください");
  if (typeof c.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))
    return bad("メールアドレスの形式をご確認ください");
  if (!str(c.phone, 20)) return bad("電話番号を入力してください");
  if (typeof c.postal !== "string" || !/^\d{3}-?\d{4}$/.test(c.postal.trim()))
    return bad("郵便番号は7桁（例: 100-0001）で入力してください");
  if (!str(c.address, 200)) return bad("ご住所を入力してください");

  const note = typeof payload.note === "string" ? payload.note.slice(0, 1000).trim() : "";

  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  if (rawItems.length === 0) return bad("カートに商品がありません");
  if (rawItems.length > 50) return bad("商品点数が多すぎます");

  // 入力を id→数量 に正規化
  const wanted = new Map<string, number>();
  for (const it of rawItems) {
    if (typeof it.id !== "string") return bad("商品の指定が不正です");
    const qty = Number(it.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 99)
      return bad("数量は1〜99で指定してください");
    wanted.set(it.id, (wanted.get(it.id) ?? 0) + qty);
  }

  if (!process.env.GITHUB_CONTENT_TOKEN)
    return bad("サーバー設定が未完了です。お手数ですが管理者にご連絡ください", 500);

  try {
    // 正規の商品データを取得
    const { text, sha } = await getRepoFile(GOODS_PATH);
    const goods = JSON.parse(text) as Goods[];
    const goodsById = new Map(goods.map((g) => [g.id, g]));

    const items: OrderItem[] = [];
    for (const [id, qty] of wanted) {
      const g = goodsById.get(id);
      if (!g || !g.active) return bad("販売が終了した商品が含まれています");
      if (g.externalUrl) return bad("この商品は外部ショップでのお取り扱いです");
      if (g.stock < qty)
        return bad(`「${g.name}」の在庫が不足しています（残り${g.stock}点）`);
      items.push({ id: g.id, name: g.name, price: g.price, qty });
    }

    const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);
    const orderId = makeOrderId();
    const order: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      status: "受付",
      customer: {
        name: (c.name as string).trim(),
        kana: (c.kana as string).trim(),
        email: (c.email as string).trim(),
        phone: (c.phone as string).trim(),
        postal: (c.postal as string).trim(),
        address: (c.address as string).trim(),
      },
      items,
      total,
      ...(note ? { note } : {}),
    };

    // 1) 先に注文を保存（お客様の注文を確実に記録する）
    await putRepoFile(
      `${ORDERS_DIR}/${orderId}.json`,
      toBase64(JSON.stringify(order, null, 2) + "\n"),
      `注文受付: ${orderId}`,
    );

    // 2) 在庫を減らす（失敗しても注文は成立済みなので成功として返す）
    try {
      for (const it of items) {
        const g = goodsById.get(it.id);
        if (g) g.stock = Math.max(0, g.stock - it.qty);
      }
      await putRepoFile(
        GOODS_PATH,
        toBase64(JSON.stringify(goods, null, 2) + "\n"),
        `在庫更新: 注文 ${orderId}`,
        sha,
      );
    } catch (e) {
      console.error("order stock update failed:", orderId, e);
    }

    return NextResponse.json({ ok: true, orderId });
  } catch (e) {
    console.error("order error:", e);
    return bad("注文の処理に失敗しました。時間をおいて再度お試しください", 502);
  }
}
