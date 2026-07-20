/**
 * アナリティクス送信ラッパー。
 * NEXT_PUBLIC_GA_ID / NEXT_PUBLIC_GTM_ID が未設定でも動作する（何もしない）。
 * 個人情報・推し名などはイベントへ送信しない設計。呼び出し側でもparamsに含めないこと。
 */
export type AnalyticsEvent =
  | "diagnosis_start"
  | "oshi_profile_completed"
  | "question_answered"
  | "diagnosis_abandoned"
  | "diagnosis_completed"
  | "result_viewed"
  | "result_shared_x"
  | "result_shared_line"
  | "result_url_copied"
  | "result_image_saved"
  | "diagnosis_restarted"
  | "premium_cta_clicked"
  | "type_detail_viewed"
  | "bingo_played"
  | "bingo_shared"
  | "resume_saved"
  | "resume_shared";

type EventParams = Record<string, string | number | boolean>;

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";
export const analyticsEnabled = Boolean(GA_ID || GTM_ID);

// 推し名など個人情報のキーは送信前に除去する二重防御。
const BLOCKED_KEYS = new Set(["oshiName", "oshi_name", "name", "email"]);

function sanitize(params?: EventParams): EventParams {
  if (!params) return {};
  const clean: EventParams = {};
  for (const [k, v] of Object.entries(params)) {
    if (BLOCKED_KEYS.has(k)) continue;
    clean[k] = v;
  }
  return clean;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: AnalyticsEvent, params?: EventParams): void {
  if (typeof window === "undefined") return;
  const payload = sanitize(params);
  try {
    if (GTM_ID && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, ...payload });
    }
    if (GA_ID && typeof window.gtag === "function") {
      window.gtag("event", event, payload);
    }
  } catch {
    // 計測失敗はユーザー体験に影響させない。
  }
}
