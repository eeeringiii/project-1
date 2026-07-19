import type { Order, OrderItem, OrderStatus } from "@/lib/content";

// 注文（個人情報）を Google スプレッドシートに保存・取得する。
// スプレッドシートに付属の「Google Apps Script」を Web App として公開し、
// そこへ HTTPS で読み書きする方式（サービスアカウント不要・設定が簡単）。
//
// 必要な環境変数（Vercel に設定）:
//   ORDERS_WEBHOOK_URL    … Apps Script を「デプロイ」して得られる /exec のURL
//   ORDERS_WEBHOOK_SECRET … Apps Script 側の SECRET と一致させる合言葉
//
// 公開リポジトリには個人情報を一切書かない。

const WEBHOOK_URL = process.env.ORDERS_WEBHOOK_URL ?? "";
const WEBHOOK_SECRET = process.env.ORDERS_WEBHOOK_SECRET ?? "";

export const sheetsEnabled = Boolean(WEBHOOK_URL && WEBHOOK_SECRET);

// スプレッドシートの列順（Apps Script 側と一致させること）
// 注文番号, 日時, ステータス, 氏名, フリガナ, メール, 電話, 郵便番号, 住所,
// 商品, 商品小計, 送料, 合計, 備考, items_json

async function call(
  action: string,
  extra: Record<string, unknown> = {},
): Promise<Record<string, unknown>> {
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: WEBHOOK_SECRET, action, ...extra }),
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`注文ストア呼び出しに失敗: ${res.status} ${(await res.text()).slice(0, 200)}`);
  }
  const json = (await res.json()) as Record<string, unknown>;
  if (!json.ok) throw new Error(`注文ストアがエラーを返しました: ${json.error ?? "unknown"}`);
  return json;
}

// items を人が読める文字列にする（例: ロゴTシャツ（L）×2 ／ CD×1）
function itemsText(items: OrderItem[]): string {
  return items
    .map((it) => `${it.name}${it.variant ? `（${it.variant}）` : ""}×${it.qty}`)
    .join(" ／ ");
}

export async function appendOrder(order: Order): Promise<void> {
  const row = [
    order.id,
    order.createdAt,
    order.status,
    order.customer.name,
    order.customer.kana,
    order.customer.email,
    order.customer.phone,
    order.customer.postal,
    order.customer.address,
    itemsText(order.items),
    order.subtotal ?? "",
    order.shipping ?? "",
    order.total,
    order.note ?? "",
    JSON.stringify(order.items),
  ];
  await call("append", { row });
}

function rowToOrder(r: string[]): Order {
  let items: OrderItem[] = [];
  try {
    items = JSON.parse(r[14] ?? "[]") as OrderItem[];
  } catch {
    items = [];
  }
  return {
    id: String(r[0] ?? ""),
    createdAt: String(r[1] ?? ""),
    status: (r[2] as OrderStatus) || "受付",
    customer: {
      name: String(r[3] ?? ""),
      kana: String(r[4] ?? ""),
      email: String(r[5] ?? ""),
      phone: String(r[6] ?? ""),
      postal: String(r[7] ?? ""),
      address: String(r[8] ?? ""),
    },
    items,
    subtotal: r[10] !== "" && r[10] != null ? Number(r[10]) : undefined,
    shipping: r[11] !== "" && r[11] != null ? Number(r[11]) : undefined,
    total: Number(r[12] ?? 0),
    ...(r[13] ? { note: String(r[13]) } : {}),
  };
}

export async function readOrders(): Promise<Order[]> {
  const json = await call("list");
  const rows = (json.rows as string[][]) ?? [];
  return rows
    .filter((r) => r[0])
    .map(rowToOrder)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<boolean> {
  try {
    await call("status", { id, status });
    return true;
  } catch (e) {
    if (String(e).includes("notfound")) return false;
    throw e;
  }
}

export async function deleteOrder(id: string): Promise<boolean> {
  try {
    await call("delete", { id });
    return true;
  } catch (e) {
    if (String(e).includes("notfound")) return false;
    throw e;
  }
}
