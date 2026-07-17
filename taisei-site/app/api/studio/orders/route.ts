import { NextResponse } from "next/server";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/content";
import { deleteRepoFile, getRepoFile, putRepoFile, toBase64 } from "@/lib/github";
import { getAllOrders, orderStats, summarizeCustomers } from "@/lib/orders";

// /studio「注文・顧客」タブの注文一覧取得・ステータス更新・削除。
// 注文は個人情報を含むため、この一覧はパスワード認証を通ったときだけ返す
//（studioページ自体はサーバー認証がないため、サーバーHTMLには埋め込まない）。

const ORDERS_DIR = "taisei-site/content/orders";
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

  // 一覧取得（認証済みのみ）。ビルド時にディスクへ書かれた注文ファイルを読む。
  if (payload.action === "list") {
    const orders = getAllOrders();
    return NextResponse.json({
      ok: true,
      orders,
      customers: summarizeCustomers(orders),
      stats: orderStats(orders),
    });
  }

  const id = (payload.id ?? "").trim();
  if (!ID_RE.test(id)) return bad("注文の指定が不正です");

  if (!process.env.GITHUB_CONTENT_TOKEN)
    return bad("サーバー設定が未完了です（GITHUB_CONTENT_TOKEN）", 500);

  const repoPath = `${ORDERS_DIR}/${id}.json`;

  try {
    if (payload.action === "delete") {
      const { sha } = await getRepoFile(repoPath);
      await deleteRepoFile(repoPath, `注文削除: ${id}`, sha);
      return NextResponse.json({ ok: true });
    }

    if (payload.action === "status") {
      const status = payload.status as OrderStatus;
      if (!ORDER_STATUSES.includes(status)) return bad("ステータスが不正です");
      const { text, sha } = await getRepoFile(repoPath);
      const order = JSON.parse(text) as Order;
      order.status = status;
      await putRepoFile(
        repoPath,
        toBase64(JSON.stringify(order, null, 2) + "\n"),
        `注文更新: ${id} → ${status}`,
        sha,
      );
      return NextResponse.json({ ok: true });
    }

    return bad("操作が不正です");
  } catch (e) {
    console.error("studio orders error:", e);
    return bad("処理に失敗しました。注文が見つからないか、通信に失敗しました", 502);
  }
}
