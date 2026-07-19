/**
 * AI投稿生成サービス（Phase 1: モック実装）
 *
 * 元情報(ContentSource)＋ブランドルールから、媒体ごとの投稿案を生成する。
 * Phase 1 では Anthropic API が未設定でも動作するようモック生成を提供する。
 * Phase 3 で `generateWithAnthropic`（サーバーサイド）に差し替える前提の
 * インターフェース `GeneratedDraft` を共通化しておく。
 *
 * 注意: 実APIキーはクライアントに露出させない。実呼び出しは route handler（サーバー）で行う。
 */
import {
  PLATFORM_LABELS,
  PLATFORM_POST_TYPES,
  POST_TYPE_LABELS,
} from "@/constants";
import type {
  BrandRule,
  ContentSource,
  ImportantFact,
  Platform,
} from "@/types/domain";
import { formatDateJa, formatDateTimeJa } from "@/lib/date";
import { extractFromSource } from "./important-facts";

export interface GeneratedDraft {
  platform: Platform;
  postType: string;
  title: string;
  body: string;
  hashtags: string[];
  imageTextSuggestions: string[];
  warnings: string[];
  importantFacts: ImportantFact[];
}

function ruleValue(rules: BrandRule[], ruleType: string): string | undefined {
  return rules.find((r) => r.isActive && r.ruleType === ruleType)?.ruleValue;
}

function baseHashtags(source: ContentSource, rules: BrandRule[]): string[] {
  const artistTag = ruleValue(rules, "artist_hashtag") ?? "#サンプルアーティスト";
  const tags = [artistTag];
  if (source.campaignId) tags.push("#新曲");
  if (source.eventAt) tags.push("#ライブ");
  return tags;
}

/**
 * 媒体・投稿タイプごとに本文テンプレートを組み立てるモック。
 * ブランドルール（口調・CTA・必須表記）を可能な範囲で反映する。
 */
function buildBody(
  source: ContentSource,
  platform: Platform,
  postType: string,
  rules: BrandRule[],
): string {
  const artist = ruleValue(rules, "artist_name") ?? "サンプルアーティスト";
  const cta = ruleValue(rules, "cta") ?? "詳細はプロフィールのリンクから！";
  const must = ruleValue(rules, "required_notice");
  const eventLine = source.eventAt
    ? `【日時】${formatDateTimeJa(source.eventAt)}`
    : "";
  const venueLine = source.venueName ? `【会場】${source.venueName}` : "";
  const priceLine =
    source.productName && source.productPrice != null
      ? `【${source.productName}】${source.productPrice.toLocaleString()}円`
      : "";
  const urlLine = source.relatedUrl ? `▶ ${source.relatedUrl}` : "";

  const info = [eventLine, venueLine, priceLine].filter(Boolean).join("\n");
  const tail = [urlLine, must].filter(Boolean).join("\n");

  const label = POST_TYPE_LABELS[postType] ?? postType;
  const head = `${source.title}`;

  switch (platform) {
    case "x":
      if (postType === "artist_voice") {
        return `${head}のお知らせです☺️\n${source.sourceText}\nみんなに会えるの楽しみ！\n${info}\n${tail}`.trim();
      }
      if (postType === "reminder") {
        return `【リマインド】${head}\nもうすぐです！\n${info}\n${cta}\n${tail}`.trim();
      }
      if (postType === "day_of") {
        return `本日開催🎉 ${head}\n${info}\n会場でお待ちしています！\n${tail}`.trim();
      }
      if (postType === "after_event") {
        return `${head} ありがとうございました！\n最高の時間でした。またお会いしましょう✨`.trim();
      }
      return `${head}\n${source.sourceText}\n${info}\n${cta}\n${tail}`.trim();
    case "instagram":
      return `${head}\n\n${source.sourceText}\n\n${info}\n\n${cta}\n${tail}\n\n（${label}）`.trim();
    case "tiktok":
      if (postType === "hook") {
        return `【冒頭フック案】\n「${head}、ついに解禁！？」\n最初の3秒で引き込む構成にしています。`;
      }
      if (postType === "structure") {
        return `動画構成案:\n1. フック（${head}）\n2. 本編（${source.sourceText}）\n3. CTA（${cta}）`;
      }
      return `${head}✨ ${source.sourceText}\n${info}\n${cta}`.trim();
    case "youtube":
      if (postType === "description") {
        return `${source.sourceText}\n\n${info}\n\n${urlLine}\n\n${artist} 公式チャンネル\n${must ?? ""}`.trim();
      }
      if (postType === "chapters") {
        return `0:00 オープニング\n0:30 ${head}\n2:00 本編\n5:00 エンディング`;
      }
      return `${head}｜${artist}`;
    case "website":
      if (postType === "ogp") {
        return `${head} - ${source.sourceText.slice(0, 60)}`;
      }
      return `${head}\n\n${source.sourceText}\n\n${info}\n\n${urlLine}\n${must ?? ""}`.trim();
    default:
      return source.sourceText;
  }
}

function buildTitle(
  source: ContentSource,
  platform: Platform,
  postType: string,
): string {
  const label = POST_TYPE_LABELS[postType] ?? postType;
  return `${source.title}（${PLATFORM_LABELS[platform]}・${label}）`;
}

function buildImageText(source: ContentSource): string[] {
  const out = [source.title];
  if (source.eventAt) out.push(formatDateJa(source.eventAt));
  if (source.venueName) out.push(source.venueName);
  return out;
}

/**
 * モック生成：対象媒体ごとに、代表的な投稿タイプの草案を生成する。
 * （画面ではさらに個別に再生成できる想定）
 */
export function generateMockDrafts(
  source: ContentSource,
  rules: BrandRule[] = [],
): GeneratedDraft[] {
  const drafts: GeneratedDraft[] = [];
  const facts = extractFromSource(source);
  const tags = baseHashtags(source, rules);

  for (const platform of source.targetPlatforms) {
    const types = PLATFORM_POST_TYPES[platform] ?? [];
    for (const t of types) {
      drafts.push({
        platform,
        postType: t.value,
        title: buildTitle(source, platform, t.value),
        body: buildBody(source, platform, t.value, rules),
        hashtags: tags,
        imageTextSuggestions: buildImageText(source),
        warnings: [],
        importantFacts: facts,
      });
    }
  }
  return drafts;
}
