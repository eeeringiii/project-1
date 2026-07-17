/**
 * 日付ユーティリティ（標準タイムゾーン: Asia/Tokyo）
 *
 * アプリ内の日付表示・曜日計算は必ずこのモジュールを経由し、
 * TZずれや曜日不一致を防ぐ。
 */
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { ja } from "date-fns/locale";
import { TIME_ZONE } from "@/constants";

const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];

/** ISO文字列を Asia/Tokyo の Date に変換 */
export function toJst(iso: string | Date): Date {
  return toZonedTime(iso, TIME_ZONE);
}

/** 日時を「2026年7月25日（土）19:00」形式で表示 */
export function formatDateTimeJa(iso: string | Date | null | undefined): string {
  if (!iso) return "未設定";
  const d = toJst(iso);
  return format(d, "yyyy年M月d日（E）HH:mm", { locale: ja });
}

/** 日付のみ「2026年7月25日（土）」 */
export function formatDateJa(iso: string | Date | null | undefined): string {
  if (!iso) return "未設定";
  const d = toJst(iso);
  return format(d, "yyyy年M月d日（E）", { locale: ja });
}

/** 時刻のみ「19:00」 */
export function formatTimeJa(iso: string | Date | null | undefined): string {
  if (!iso) return "--:--";
  return format(toJst(iso), "HH:mm");
}

/** YYYY-MM-DD（JST基準のカレンダーキー） */
export function dateKey(iso: string | Date): string {
  return format(toJst(iso), "yyyy-MM-dd");
}

/** JSTの曜日文字（日〜土）を返す */
export function weekdayJa(iso: string | Date): string {
  return WEEKDAYS_JA[toJst(iso).getDay()];
}

/** 相対表現「3日前」「2時間後」など（簡易） */
export function relativeJa(iso: string | null | undefined): string {
  if (!iso) return "";
  const diffMs = toJst(new Date()).getTime() - toJst(iso).getTime();
  const abs = Math.abs(diffMs);
  const min = Math.round(abs / 60000);
  const hour = Math.round(min / 60);
  const day = Math.round(hour / 24);
  const suffix = diffMs >= 0 ? "前" : "後";
  if (min < 1) return "たった今";
  if (min < 60) return `${min}分${suffix}`;
  if (hour < 24) return `${hour}時間${suffix}`;
  return `${day}日${suffix}`;
}
