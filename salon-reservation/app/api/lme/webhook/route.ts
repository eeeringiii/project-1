import { NextResponse } from "next/server";
import { assertWebhookConfigured, lmeConfig } from "@/lib/config";
import { normalizeLmeReservation } from "@/lib/reservation";
import { getStore } from "@/lib/store";

// エルメ（L Message）サロン予約の Webhook 受信エンドポイント。
//
// 連携手順（README 参照）:
//   エルメ管理画面 or Zapier の Webhook 送信先を次のURLに設定する。
//     https://<このアプリのドメイン>/api/lme/webhook?token=<LME_WEBHOOK_SECRET>
//   予約の発生・変更・キャンセル時にここへ POST され、正規化して保管する。
//
// 単一イベント {...} でも、複数イベント [{...}, {...}] でも受け取れる。

export const runtime = "nodejs";

function isAuthorized(req: Request): boolean {
  const url = new URL(req.url);
  const tokenFromQuery = url.searchParams.get("token");
  const tokenFromHeader = req.headers.get("x-webhook-secret");
  const provided = tokenFromQuery ?? tokenFromHeader ?? "";
  // タイミング差による情報漏れを避けるため長さ一致時のみ厳密比較。
  return provided.length > 0 && provided === lmeConfig.webhookSecret;
}

export async function POST(req: Request) {
  const configError = assertWebhookConfigured();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 500 });
  }

  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "送信データを読み取れませんでした" }, { status: 400 });
  }

  const events = Array.isArray(payload) ? payload : [payload];
  const store = getStore();

  let accepted = 0;
  const skipped: unknown[] = [];

  for (const event of events) {
    const reservation = normalizeLmeReservation(event, {
      calendarId: lmeConfig.calendarId || undefined,
    });
    if (!reservation) {
      // 予約ID・開始日時が取れないペイロードはスキップ（要フィールドマッピング調整）。
      skipped.push(event);
      continue;
    }
    await store.upsert(reservation);
    accepted += 1;
  }

  // 永続バックエンドが設定されていれば、正規化前の生イベントをそのまま転送する。
  if (lmeConfig.forwardUrl) {
    try {
      await fetch(lmeConfig.forwardUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "lme", events }),
      });
    } catch (error) {
      // 転送失敗は受信処理自体を失敗させない（ログのみ）。
      console.error("Forward to LME_FORWARD_URL failed:", error);
    }
  }

  if (accepted === 0) {
    console.warn("LME webhook: 正規化できたイベントがありません", JSON.stringify(skipped).slice(0, 500));
  }

  return NextResponse.json({ ok: true, accepted, skipped: skipped.length });
}

// 疎通確認用（ブラウザ / エルメ側の URL 検証で 200 を返す）。
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "lme-salon-webhook" });
}
