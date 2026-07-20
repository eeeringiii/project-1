/**
 * AIプロンプト生成（サーバーサイドで使用）
 *
 * 元情報(ContentSource) ＋ ブランドルール から、媒体ごとの system / user プロンプトを組み立てる。
 * ブランドルール（口調・NGワード・必須表記・CTA・固有名詞 等）をAIへ反映する。
 * 未解禁情報の露出防止のため、解禁日時をプロンプトに明示する。
 */
import {
  PLATFORM_LABELS,
  PLATFORM_MAX_LENGTH,
  PLATFORM_POST_TYPES,
  POST_TYPE_LABELS,
} from "@/constants";
import type { BrandRule, ContentSource, Platform } from "@/types/domain";
import { formatDateTimeJa } from "@/lib/date";

/** rule_type ごとの表示名（プロンプト内の見出し用） */
const RULE_LABELS: Record<string, string> = {
  artist_name: "アーティスト名",
  profile: "公式プロフィール",
  brand_concept: "ブランドコンセプト",
  target_fan: "ターゲットファン",
  tone_official: "公式アカウントの口調",
  tone_artist: "本人アカウントの口調",
  emoji_allow: "使用してよい絵文字",
  emoji_deny: "使用しない絵文字",
  forbidden_expression: "使用禁止表現",
  ng_word: "NGワード",
  proper_noun: "固有名詞辞書",
  artist_hashtag: "共通ハッシュタグ",
  hashtag_rule: "ハッシュタグルール",
  cta: "CTAルール",
  required_notice: "必須表記",
  sponsor_notice: "スポンサー表記",
  copyright_notice: "著作権表記",
  url_rule: "URLルール",
  datetime_rule: "日時表記ルール",
  price_rule: "金額表記ルール",
};

export function buildSystemPrompt(): string {
  return [
    "あなたはアーティスト事務所のSNS運用を担うプロの編集者です。",
    "与えられた告知情報とブランドルールをもとに、各SNS媒体に最適化した投稿案を作成します。",
    "",
    "厳守事項:",
    "- 必ず日本語で作成する。",
    "- ブランドルール（口調・NGワード・使用禁止表現・必須表記・CTA・固有名詞・絵文字ルール）を厳密に守る。",
    "- NGワードや使用禁止表現は本文・ハッシュタグに一切含めない。",
    "- 事実（日時・会場・金額・URL）を勝手に創作しない。与えられた情報の範囲で書く。",
    "- 解禁日時が指定されている場合、それより前に公開される前提の表現（例:『本日解禁』）は避ける。",
    "- 誇張・不当表示を避け、景品表示法に配慮する。",
    "- 出力は指定されたJSONスキーマに厳密に従い、JSON以外のテキスト（前置き・コードフェンス）を一切含めない。",
  ].join("\n");
}

function formatRules(rules: BrandRule[]): string {
  if (rules.length === 0) return "（登録なし）";
  return rules
    .map((r) => `- ${RULE_LABELS[r.ruleType] ?? r.ruleType}: ${r.ruleValue}`)
    .join("\n");
}

/** 全媒体共通（platform 未指定）の有効ルール */
function globalRuleLines(rules: BrandRule[]): string {
  return formatRules(rules.filter((r) => r.isActive && r.platform === null));
}

/** 指定媒体だけに適用される有効ルール */
function platformRuleLines(rules: BrandRule[], platform: Platform): string {
  return formatRules(
    rules.filter((r) => r.isActive && r.platform === platform),
  );
}

function sourceFacts(source: ContentSource): string {
  const lines: string[] = [];
  lines.push(`- タイトル: ${source.title}`);
  lines.push(`- 告知情報: ${source.sourceText}`);
  if (source.purpose) lines.push(`- 投稿目的: ${source.purpose}`);
  if (source.embargoAt)
    lines.push(`- 解禁日時（これより前に公開しない前提）: ${formatDateTimeJa(source.embargoAt)}`);
  if (source.eventAt) lines.push(`- イベント日時: ${formatDateTimeJa(source.eventAt)}`);
  if (source.venueName) lines.push(`- 会場: ${source.venueName}`);
  if (source.productName) lines.push(`- 商品名: ${source.productName}`);
  if (source.productPrice != null)
    lines.push(`- 商品価格: ${source.productPrice.toLocaleString()}円`);
  if (source.relatedUrl) lines.push(`- 関連URL: ${source.relatedUrl}`);
  if (source.aiInstruction) lines.push(`- 追加指示: ${source.aiInstruction}`);
  return lines.join("\n");
}

/**
 * 媒体をまたいで共通の文脈（告知情報＋全媒体共通ルール）を生成する。
 * これは1回の生成リクエスト内では媒体によって変化しないため、
 * プロンプトキャッシュの対象プレフィックスとして system 側に置く。
 */
export function buildSharedContextPrompt(
  source: ContentSource,
  rules: BrandRule[],
): string {
  return [
    "# 告知情報",
    sourceFacts(source),
    "",
    "# 共通ブランドルール（全媒体で厳守）",
    globalRuleLines(rules),
  ].join("\n");
}

/**
 * 指定媒体だけに固有の user プロンプトを生成（媒体固有ルール＋生成指示）。
 * 告知情報と共通ルールは buildSharedContextPrompt 側（system）にあるため含めない。
 * postTypes を絞ると一部再生成に使える（未指定なら媒体の全タイプ）。
 */
export function buildPlatformPrompt(
  rules: BrandRule[],
  platform: Platform,
  postTypes?: string[],
): string {
  const types = (PLATFORM_POST_TYPES[platform] ?? []).filter(
    (t) => !postTypes || postTypes.includes(t.value),
  );
  const typeList = types
    .map((t) => `  - postType="${t.value}"（${t.label}）`)
    .join("\n");

  const maxLen = PLATFORM_MAX_LENGTH[platform];

  return [
    `# 対象媒体: ${PLATFORM_LABELS[platform]}`,
    `本文の文字数上限の目安: ${maxLen}文字（超えないこと）`,
    "",
    "# この媒体固有のブランドルール（厳守）",
    platformRuleLines(rules, platform),
    "",
    "# 生成する投稿タイプ",
    typeList,
    "",
    "# 出力形式（JSONのみ・前後に文章やコードフェンスを付けない）",
    "{",
    '  "posts": [',
    "    {",
    `      "platform": "${platform}",`,
    '      "postType": "上記のpostType値",',
    '      "title": "管理用タイトル",',
    '      "body": "投稿本文",',
    '      "hashtags": ["#タグ1", "#タグ2"],',
    '      "imageTextSuggestions": ["画像内テキスト案"],',
    '      "warnings": ["気になる点があれば"],',
    '      "importantFacts": [{ "label": "開催日時", "value": "..." }]',
    "    }",
    "  ]",
    "}",
    "",
    `posts 配列には、上記の生成する投稿タイプ ${types.length} 件すべてを含めること。`,
  ].join("\n");
}

/** ログ用: プロンプトの要約（機密は含めない） */
export function summarizePrompt(platform: Platform, postTypes: string[]): string {
  const labels = postTypes.map((t) => POST_TYPE_LABELS[t] ?? t).join(", ");
  return `${PLATFORM_LABELS[platform]}: ${labels}`;
}
