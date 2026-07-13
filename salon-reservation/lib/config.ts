// エルメ（L Message）サロン予約 連携の設定を環境変数から読み込む。
// 値は .env / Vercel の環境変数で設定する（.env.example を参照）。

export const lmeConfig = {
  // Webhook 受信時に照合する共有シークレット。
  // エルメ／Zapier 側の Webhook URL に ?token=... を付与するか、
  // x-webhook-secret ヘッダーで同じ値を送ることで正当性を検証する。
  webhookSecret: process.env.LME_WEBHOOK_SECRET ?? "",

  // 連携対象のサロン予約カレンダーID（管理画面URL /calendar-salon/<id> の値）。
  // 複数カレンダーを1つのエンドポイントで受ける場合の絞り込みに使う（任意）。
  calendarId: process.env.LME_CALENDAR_ID ?? "",

  // ── アウトバウンドAPI（エルメからデータを取得する場合）─────────────
  // エルメのAPI仕様は管理画面ログイン後に確認が必要。ベースURL・パスは
  // 実際の仕様に合わせて差し替える前提のプレースホルダー。
  apiBaseUrl: process.env.LME_API_BASE_URL ?? "https://step.lme.jp/api",
  apiToken: process.env.LME_API_TOKEN ?? "",
  // 予約一覧を取得するパス（{calendarId} は calendarId に置換される）。
  apiReservationsPath:
    process.env.LME_API_RESERVATIONS_PATH ?? "/calendar-salon/{calendarId}/reservations",

  // 受信イベントを永続バックエンド（KV/DB/別サービス）へ転送する場合の宛先URL（任意）。
  // Vercel等のサーバーレス環境ではプロセス内ストアが揮発するため、
  // 本番運用ではこの転送先で永続化することを推奨。
  forwardUrl: process.env.LME_FORWARD_URL ?? "",
} as const;

export function assertWebhookConfigured(): string | null {
  if (!lmeConfig.webhookSecret) {
    return "サーバー設定が未完了です（LME_WEBHOOK_SECRET 未設定）。管理者にご連絡ください";
  }
  return null;
}
