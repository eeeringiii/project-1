import { lmeConfig } from "@/lib/config";
import { normalizeLmeReservation, type Reservation } from "@/lib/reservation";

// エルメ（L Message）からサロン予約データを能動的に取得するためのAPIクライアント。
//
// ⚠️ エルメの公開APIエンドポイント／認証方式は管理画面ログイン後の仕様確認が必要。
//    本クライアントは「ベアラトークン認証のREST」という一般的な前提で実装しており、
//    ベースURL・パス・認証ヘッダーは config（環境変数）で差し替えられるようにしている。
//    実仕様が判明したら request() のヘッダーやパスを合わせて調整すること。
//    Webhook 受信（app/api/lme/webhook）だけで完結する場合、本クライアントは不要。

export class LmeApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: string,
  ) {
    super(message);
    this.name = "LmeApiError";
  }
}

export class LmeClient {
  constructor(
    private readonly baseUrl: string = lmeConfig.apiBaseUrl,
    private readonly token: string = lmeConfig.apiToken,
  ) {}

  private async request<T>(pathTemplate: string, calendarId: string): Promise<T> {
    if (!this.token) {
      throw new LmeApiError("LME_API_TOKEN が未設定です", 500);
    }
    const path = pathTemplate.replace("{calendarId}", encodeURIComponent(calendarId));
    const url = `${this.baseUrl.replace(/\/$/, "")}${path}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/json",
      },
      // 予約データは頻繁に変わるためキャッシュしない。
      cache: "no-store",
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new LmeApiError(
        `エルメAPIの呼び出しに失敗しました（${res.status}）`,
        res.status,
        detail.slice(0, 500),
      );
    }
    return (await res.json()) as T;
  }

  // 指定カレンダーの予約一覧を取得して正規化する。
  async listReservations(
    calendarId: string = lmeConfig.calendarId,
  ): Promise<Reservation[]> {
    if (!calendarId) {
      throw new LmeApiError("calendarId が未指定です（LME_CALENDAR_ID を設定）", 400);
    }
    const raw = await this.request<unknown>(lmeConfig.apiReservationsPath, calendarId);
    // レスポンス形状（配列 / { reservations: [] } / { data: [] }）を吸収する。
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as { reservations?: unknown[] })?.reservations)
        ? (raw as { reservations: unknown[] }).reservations
        : Array.isArray((raw as { data?: unknown[] })?.data)
          ? (raw as { data: unknown[] }).data
          : [];

    return list
      .map((item) => normalizeLmeReservation(item, { calendarId }))
      .filter((r): r is Reservation => r !== null);
  }
}

export const lmeClient = new LmeClient();
