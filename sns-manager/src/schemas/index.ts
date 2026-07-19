/**
 * Zodスキーマ
 *
 * ユーザー入力・AI出力の検証に使用する。要件「ユーザー入力はZodで検証」に対応。
 */
import { z } from "zod";
import { PLATFORMS, POST_STATUSES } from "@/constants";

const platformEnum = z.enum(
  PLATFORMS as [(typeof PLATFORMS)[number], ...(typeof PLATFORMS)[number][]],
);

const statusEnum = z.enum(
  POST_STATUSES as [
    (typeof POST_STATUSES)[number],
    ...(typeof POST_STATUSES)[number][],
  ],
);

// ---- コンテンツ新規作成フォーム ----

export const contentSourceSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  sourceText: z.string().min(1, "元となる告知情報は必須です"),
  purpose: z.string().default(""),
  campaignId: z.string().nullable().default(null),
  relatedUrl: z
    .string()
    .url("URLの形式が正しくありません")
    .or(z.literal(""))
    .nullable()
    .default(null),
  embargoAt: z.string().nullable().default(null),
  eventAt: z.string().nullable().default(null),
  venueName: z.string().nullable().default(null),
  productName: z.string().nullable().default(null),
  productPrice: z.number().int().nonnegative().nullable().default(null),
  notes: z.string().nullable().default(null),
  aiInstruction: z.string().nullable().default(null),
  requiresArtistApproval: z.boolean().default(false),
  targetPlatforms: z.array(platformEnum).min(1, "対象媒体を1つ以上選択してください"),
});

export type ContentSourceInput = z.infer<typeof contentSourceSchema>;

// ---- 投稿編集フォーム ----

export const postEditSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  body: z.string().min(1, "本文は必須です"),
  hashtags: z.array(z.string()),
  scheduledAt: z.string().nullable(),
  requiresArtistApproval: z.boolean(),
});

export type PostEditInput = z.infer<typeof postEditSchema>;

// ---- AI出力（媒体ごとの投稿案） ----

export const aiFactSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const aiPostSchema = z.object({
  platform: platformEnum,
  postType: z.string(),
  title: z.string(),
  body: z.string(),
  hashtags: z.array(z.string()).default([]),
  imageTextSuggestions: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  importantFacts: z.array(aiFactSchema).default([]),
});

export type AiPost = z.infer<typeof aiPostSchema>;

export const aiResponseSchema = z.object({
  posts: z.array(aiPostSchema),
});

export type AiResponse = z.infer<typeof aiResponseSchema>;

// ---- AI生成APIのリクエスト ----

/** プロンプト生成に必要な元情報（サーバーへ送る最小限） */
export const aiSourceSchema = z.object({
  id: z.string(),
  artistId: z.string(),
  campaignId: z.string().nullable().default(null),
  title: z.string().min(1),
  sourceText: z.string().min(1),
  purpose: z.string().default(""),
  relatedUrl: z.string().nullable().default(null),
  embargoAt: z.string().nullable().default(null),
  eventAt: z.string().nullable().default(null),
  venueName: z.string().nullable().default(null),
  productName: z.string().nullable().default(null),
  productPrice: z.number().nullable().default(null),
  notes: z.string().nullable().default(null),
  aiInstruction: z.string().nullable().default(null),
  requiresArtistApproval: z.boolean().default(false),
  targetPlatforms: z.array(platformEnum).min(1),
});

export const aiBrandRuleSchema = z.object({
  id: z.string(),
  artistId: z.string(),
  ruleType: z.string(),
  ruleName: z.string(),
  ruleValue: z.string(),
  platform: platformEnum.nullable().default(null),
  isActive: z.boolean().default(true),
});

export const generateRequestSchema = z.object({
  source: aiSourceSchema,
  rules: z.array(aiBrandRuleSchema).default([]),
  /** 生成対象の媒体（未指定なら source.targetPlatforms） */
  platforms: z.array(platformEnum).optional(),
  /** 一部再生成: 特定の媒体・投稿タイプのみ */
  only: z
    .object({ platform: platformEnum, postType: z.string() })
    .optional(),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

// ---- ステータス変更 ----

export const statusChangeSchema = z.object({
  socialPostId: z.string(),
  next: statusEnum,
  comment: z.string().optional(),
});

// ---- ブランドルール ----

export const brandRuleSchema = z.object({
  ruleType: z.string().min(1),
  ruleName: z.string().min(1),
  ruleValue: z.string(),
  platform: platformEnum.nullable().default(null),
  isActive: z.boolean().default(true),
});

export type BrandRuleInput = z.infer<typeof brandRuleSchema>;
