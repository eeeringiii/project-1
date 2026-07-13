// エルメ（L Message）サロン予約の予約データを、アプリ内で扱いやすい
// 正規化モデルへ変換する。エルメ側 Webhook / API の正確なフィールド名は
// 管理画面ログイン後の仕様確認が必要なため、想定される複数のキー名
// （日本語キー・ローマ字snake_case等）を吸収できる防御的な実装にしている。
// 実ペイロードを Webhook ログで確認したら、pick() の候補キーを調整すること。

export type ReservationStatus =
  | "confirmed" // 予約確定
  | "changed" // 変更
  | "cancelled" // キャンセル
  | "completed" // 来店済み
  | "pending"; // 仮予約・未確定

export interface Reservation {
  id: string; // エルメの予約ID（一意キー）
  status: ReservationStatus;
  customerName: string; // 予約者名
  lineUserId?: string; // LINEユーザーID（友だち識別子）
  menu?: string; // メニュー／コース名
  staff?: string; // 担当スタッフ
  startAt: string; // 開始日時（ISO8601）
  endAt?: string; // 終了日時（ISO8601）
  note?: string; // 備考
  calendarId?: string; // 連携元カレンダーID
  source: "lme";
  receivedAt: string; // 受信時刻（ISO8601）
  raw?: unknown; // 元ペイロード（デバッグ用）
}

type Json = Record<string, unknown>;

function asRecord(value: unknown): Json {
  return value && typeof value === "object" ? (value as Json) : {};
}

// 候補キーのうち最初に見つかった非空の文字列を返す。
function pick(obj: Json, keys: string[]): string | undefined {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "string" && v.trim() !== "") return v.trim();
    if (typeof v === "number") return String(v);
  }
  return undefined;
}

const STATUS_MAP: Record<string, ReservationStatus> = {
  confirmed: "confirmed",
  confirm: "confirmed",
  reserved: "confirmed",
  確定: "confirmed",
  予約確定: "confirmed",
  changed: "changed",
  change: "changed",
  updated: "changed",
  変更: "changed",
  cancelled: "cancelled",
  canceled: "cancelled",
  cancel: "cancelled",
  キャンセル: "cancelled",
  取消: "cancelled",
  completed: "completed",
  done: "completed",
  来店済み: "completed",
  完了: "completed",
  pending: "pending",
  仮予約: "pending",
  未確定: "pending",
};

export function normalizeStatus(raw: string | undefined, eventType?: string): ReservationStatus {
  const key = (raw ?? "").toLowerCase();
  if (raw && STATUS_MAP[raw]) return STATUS_MAP[raw];
  if (STATUS_MAP[key]) return STATUS_MAP[key];
  // ステータス欄が無い場合はイベント種別から推定する。
  const ev = (eventType ?? "").toLowerCase();
  if (ev.includes("cancel")) return "cancelled";
  if (ev.includes("update") || ev.includes("change")) return "changed";
  if (ev.includes("complete")) return "completed";
  return "confirmed";
}

// 日時文字列を ISO8601 に寄せる。パースできない場合は元の文字列を返す。
function toIso(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const ts = Date.parse(value);
  return Number.isNaN(ts) ? value : new Date(ts).toISOString();
}

export interface NormalizeOptions {
  eventType?: string;
  calendarId?: string;
}

// エルメの Webhook / API ペイロード1件を Reservation へ正規化する。
export function normalizeLmeReservation(
  payload: unknown,
  options: NormalizeOptions = {},
): Reservation | null {
  const root = asRecord(payload);
  // ネスト構造（{ reservation: {...} } / { data: {...} }）にも対応。
  const body = asRecord(root.reservation ?? root.data ?? root);

  const id = pick(body, [
    "id",
    "reservation_id",
    "reservationId",
    "予約ID",
    "予約番号",
  ]);
  const startAt = toIso(
    pick(body, [
      "start_at",
      "startAt",
      "start",
      "datetime",
      "reserved_at",
      "予約日時",
      "開始日時",
      "日時",
    ]),
  );

  // ID または開始日時が取れないペイロードは正規化不能として除外する。
  if (!id || !startAt) return null;

  const customerName =
    pick(body, [
      "customer_name",
      "customerName",
      "name",
      "friend_name",
      "display_name",
      "予約者名",
      "お名前",
      "氏名",
    ]) ?? "名称未設定";

  return {
    id,
    status: normalizeStatus(
      pick(body, ["status", "state", "ステータス", "予約状態"]),
      options.eventType ?? pick(root, ["event", "event_type", "type"]),
    ),
    customerName,
    lineUserId: pick(body, ["line_user_id", "lineUserId", "user_id", "uid", "LINEユーザーID"]),
    menu: pick(body, ["menu", "course", "menu_name", "メニュー", "コース", "コース名"]),
    staff: pick(body, ["staff", "staff_name", "担当", "担当スタッフ", "スタッフ"]),
    startAt,
    endAt: toIso(pick(body, ["end_at", "endAt", "end", "終了日時"])),
    note: pick(body, ["note", "memo", "remark", "備考", "メモ"]),
    calendarId:
      options.calendarId ??
      pick(body, ["calendar_id", "calendarId", "カレンダーID"]) ??
      undefined,
    source: "lme",
    receivedAt: new Date().toISOString(),
    raw: payload,
  };
}
