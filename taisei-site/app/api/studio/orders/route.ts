import { NextResponse } from "next/server";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/content";
import { orderStats, summarizeCustomers } from "@/lib/orders";
import {
  deleteOrder,
  readOrders,
  sheetsEnabled,
  updateOrderStatus,
} from "@/lib/sheets";

// /studio「注文・顧客」タブの注文一覧取得・ステータス更新・削除。
// 注文（個人情報）は Google スプレッドシートに保存されており、
// この一覧はパスワード認証を通ったときだけ返す。

const ID_RE = /^[0-9]{8}-[A-Z0-9]{4}$/;

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  let payload: {
    password?: string;
    action?: string;
    id?: string;
    status?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return bad("送信データを読み取れませんでした");
  }

  const studioPassword = process.env.STUDIO_PASSWORD;
  if (!studioPassword) return bad("サーバー設定が未完了です（STUDIO_PASSWORD）", 500);
  if (payload.password !== studioPassword) return bad("パスワードが違います", 401);

  if (!sheetsEnabled)
    return bad(
      "注文の保存先（スプレッドシート）が未設定です。管理者にご連絡ください",
      503,
    );

  try {
    // 一覧取得（認証済みのみ）
    if (payload.action === "list") {
      const orders = await readOrders();
      return NextResponse.json({
        ok: true,
        orders,
        customers: summarizeCustomers(orders),
        stats: orderStats(orders),
      });
    }

    const id = (payload.id ?? "").trim();
    if (!ID_RE.test(id)) return bad("注文の指定が不正です");

    if (payload.action === "delete") {
      const done = await deleteOrder(id);
      if (!done) return bad("対象の注文が見つかりませんでした", 404);
      return NextResponse.json({ ok: true });
    }

    if (payload.action === "status") {
      const status = payload.status as OrderStatus;
      if (!ORDER_STATUSES.includes(status)) return bad("ステータスが不正です");
      const done = await updateOrderStatus(id, status);
      if (!done) return bad("対象の注文が見つかりませんでした", 404);
      return NextResponse.json({ ok: true });
    }

    return bad("操作が不正です");
  } catch (e) {
    console.error("studio orders error:", e);
    return bad("処理に失敗しました。時間をおいて再度お試しください", 502);
  }
}
