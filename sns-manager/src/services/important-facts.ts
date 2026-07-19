/**
 * 重要情報の抽出サービス
 *
 * 投稿本文・入力情報から、日付/曜日/時間/会場/商品/金額/URL などの
 * 重要情報を抽出する。投稿前の確認画面で一覧表示するために使用する。
 *
 * 完全な自然言語解析ではなく、正規表現ベースの実用的な抽出。
 * AI生成時は importantFacts をAI側からも受け取る（併用）。
 */
import type { ContentSource, ImportantFact, SocialPost } from "@/types/domain";
import { formatDateTimeJa } from "@/lib/date";

const RE_URL = /https?:\/\/[^\s、。））]+/g;
const RE_DATE =
  /(?:\d{1,4}年\s?)?\d{1,2}月\s?\d{1,2}日|\d{1,2}\/\d{1,2}/g;
const RE_TIME = /\d{1,2}[:：]\d{2}|\d{1,2}時(?:\d{1,2}分)?/g;
const RE_PRICE = /[¥￥]\s?[\d,]+|\d[\d,]*\s?円/g;
const RE_WEEKDAY = /（?[日月火水木金土]曜?）?/g;

function pushUnique(facts: ImportantFact[], label: string, value: string) {
  const v = value.trim();
  if (!v) return;
  if (facts.some((f) => f.label === label && f.value === v)) return;
  facts.push({ label, value: v });
}

/** 本文テキストから重要情報を抽出 */
export function extractFromText(text: string): ImportantFact[] {
  const facts: ImportantFact[] = [];
  const urls = text.match(RE_URL) ?? [];
  urls.forEach((u) => pushUnique(facts, "URL", u));
  const dates = text.match(RE_DATE) ?? [];
  dates.forEach((d) => pushUnique(facts, "日付", d));
  const times = text.match(RE_TIME) ?? [];
  times.forEach((t) => pushUnique(facts, "時間", t));
  const prices = text.match(RE_PRICE) ?? [];
  prices.forEach((p) => pushUnique(facts, "金額", p));
  const weekdays = (text.match(RE_WEEKDAY) ?? []).filter(
    (w) => w.includes("曜") || /（[日月火水木金土]）/.test(w),
  );
  weekdays.forEach((w) => pushUnique(facts, "曜日", w));
  return facts;
}

/** 元情報（構造化フィールド）から重要情報を組み立てる */
export function extractFromSource(source: ContentSource): ImportantFact[] {
  const facts: ImportantFact[] = [];
  if (source.eventAt)
    pushUnique(facts, "イベント日時", formatDateTimeJa(source.eventAt));
  if (source.embargoAt)
    pushUnique(facts, "解禁日時", formatDateTimeJa(source.embargoAt));
  if (source.venueName) pushUnique(facts, "会場名", source.venueName);
  if (source.productName) pushUnique(facts, "商品名", source.productName);
  if (source.productPrice != null)
    pushUnique(facts, "金額", `${source.productPrice.toLocaleString()}円`);
  if (source.relatedUrl) pushUnique(facts, "URL", source.relatedUrl);
  return facts;
}

/** 投稿から重要情報を統合抽出（本文＋既存importantFacts） */
export function extractFromPost(
  post: SocialPost,
  source?: ContentSource | null,
): ImportantFact[] {
  const facts: ImportantFact[] = [...post.importantFacts];
  extractFromText(`${post.title}\n${post.body}`).forEach((f) =>
    pushUnique(facts, f.label, f.value),
  );
  if (source) {
    extractFromSource(source).forEach((f) => pushUnique(facts, f.label, f.value));
  }
  return facts;
}
