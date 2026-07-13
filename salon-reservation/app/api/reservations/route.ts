import { NextResponse } from "next/server";
import type { Reservation, ReservationStatus } from "@/lib/reservation";
import { getStore } from "@/lib/store";

// アプリ側が予約データを取得するための内部API。
// Webhook で受信・保管済みの正規化データを JSON で返す。
//
// クエリ:
//   ?status=confirmed        ステータスで絞り込み
//   ?from=2026-07-13         この日時（ISO）以降の予約のみ
//   ?to=2026-07-31           この日時（ISO）以前の予約のみ

export const dynamic = "force-dynamic";

const VALID_STATUS: ReservationStatus[] = [
  "confirmed",
  "changed",
  "cancelled",
  "completed",
  "pending",
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  let items: Reservation[] = await getStore().list();

  if (status && VALID_STATUS.includes(status as ReservationStatus)) {
    items = items.filter((r) => r.status === status);
  }
  if (from) {
    items = items.filter((r) => r.startAt >= from);
  }
  if (to) {
    items = items.filter((r) => r.startAt <= to);
  }

  return NextResponse.json({ count: items.length, reservations: items });
}
