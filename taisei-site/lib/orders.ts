import fs from "node:fs";
import path from "node:path";
import type { CustomerSummary, Order } from "@/lib/content";

// 注文は content/orders/<注文番号>.json に1件1ファイルで保存される。
// 個人情報を含むため、この関数はパスワード保護された /studio の管理タブでのみ使う。
// （公開ページからは import しないこと）
const ordersDir = path.join(process.cwd(), "content", "orders");

export function getAllOrders(): Order[] {
  if (!fs.existsSync(ordersDir)) return [];
  const files = fs.readdirSync(ordersDir).filter((f) => f.endsWith(".json"));
  return files
    .map((f) => JSON.parse(fs.readFileSync(path.join(ordersDir, f), "utf8")) as Order)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)); // 新しい注文が先頭
}

// 注文を名寄せして顧客一覧をつくる（メールアドレスが同じなら同一顧客とみなす）。
export function summarizeCustomers(orders: Order[]): CustomerSummary[] {
  const map = new Map<string, CustomerSummary>();
  for (const o of orders) {
    const key = o.customer.email.toLowerCase();
    const spent = o.status === "キャンセル" ? 0 : o.total;
    const existing = map.get(key);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += spent;
      if (o.createdAt > existing.lastOrderAt) {
        existing.lastOrderAt = o.createdAt;
        existing.name = o.customer.name;
      }
    } else {
      map.set(key, {
        email: o.customer.email,
        name: o.customer.name,
        orderCount: 1,
        totalSpent: spent,
        lastOrderAt: o.createdAt,
      });
    }
  }
  return [...map.values()].sort((a, b) => (a.lastOrderAt < b.lastOrderAt ? 1 : -1));
}

// 注文全体の売上サマリー（キャンセルを除く）。
export function orderStats(orders: Order[]): {
  totalSales: number;
  paidOrShipped: number;
  pending: number;
  count: number;
} {
  let totalSales = 0;
  let paidOrShipped = 0;
  let pending = 0;
  for (const o of orders) {
    if (o.status === "キャンセル") continue;
    totalSales += o.total;
    if (o.status === "受付") pending += 1;
    else paidOrShipped += 1;
  }
  return { totalSales, paidOrShipped, pending, count: orders.length };
}
