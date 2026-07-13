import { getStore } from "@/lib/store";
import type { Reservation, ReservationStatus } from "@/lib/reservation";

// サーバーコンポーネントとして、保管済みの予約を直接読み出して表示する。
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<ReservationStatus, string> = {
  confirmed: "確定",
  changed: "変更",
  cancelled: "キャンセル",
  completed: "来店済み",
  pending: "仮予約",
};

const STATUS_COLOR: Record<ReservationStatus, string> = {
  confirmed: "#34d399",
  changed: "#60a5fa",
  cancelled: "#f87171",
  completed: "#a3a3a3",
  pending: "#fbbf24",
};

function formatDateTime(iso: string): string {
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return iso;
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tokyo",
  }).format(new Date(ts));
}

export default async function Home() {
  const reservations: Reservation[] = await getStore().list();

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "48px 20px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "0.02em" }}>
        サロン予約 連携ダッシュボード
      </h1>
      <p style={{ marginTop: 8, fontSize: 13, color: "#9aa0a6" }}>
        エルメ（L Message）から Webhook 受信した予約データ（プロセス内メモリ）
      </p>

      {reservations.length === 0 ? (
        <div
          style={{
            marginTop: 28,
            padding: "20px 18px",
            border: "1px solid #23262b",
            borderRadius: 10,
            fontSize: 13,
            lineHeight: 1.9,
            color: "#c3c7cc",
          }}
        >
          まだ予約データがありません。エルメ／Zapier の Webhook 送信先を
          <code style={{ margin: "0 4px", color: "#e8eaed" }}>
            /api/lme/webhook?token=…
          </code>
          に設定すると、ここに予約が表示されます。（README の「連携手順」を参照）
        </div>
      ) : (
        <ul style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
          {reservations.map((r) => (
            <li
              key={r.id}
              style={{
                padding: "14px 16px",
                border: "1px solid #23262b",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{r.customerName}</div>
                <div style={{ marginTop: 4, fontSize: 12, color: "#9aa0a6" }}>
                  {formatDateTime(r.startAt)}
                  {r.menu ? `・${r.menu}` : ""}
                  {r.staff ? `・担当 ${r.staff}` : ""}
                </div>
              </div>
              <span
                style={{
                  flexShrink: 0,
                  fontSize: 12,
                  fontWeight: 600,
                  color: STATUS_COLOR[r.status],
                }}
              >
                {STATUS_LABEL[r.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
