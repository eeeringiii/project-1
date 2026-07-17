"use client";

/**
 * Supabase データアクセス（クライアント側 / anon key + RLS）
 *
 * store.tsx から呼ばれ、ローカル状態への書き込みスルー先として永続化を担う。
 * すべて best-effort（失敗時は例外を投げ、呼び出し側がトーストで通知）。
 *
 * Supabase 未設定時は呼び出されない（store 側で isSupabaseConfigured を確認）。
 */
import { getBrowserClient } from "@/lib/supabase/client";
import type {
  AiGenerationLog,
  Artist,
  BrandRule,
  Campaign,
  ContentSource,
  MediaAsset,
  PostVersion,
  SocialPost,
  StatusHistory,
  User,
} from "@/types/domain";
import {
  aiLogFromRow,
  aiLogToRow,
  artistFromRow,
  brandRuleFromRow,
  brandRuleToRow,
  campaignFromRow,
  campaignToRow,
  contentSourceFromRow,
  contentSourceToRow,
  mediaAssetFromRow,
  mediaAssetToRow,
  postVersionFromRow,
  postVersionToRow,
  socialPostFromRow,
  socialPostToRow,
  statusHistoryFromRow,
  statusHistoryToRow,
  userFromRow,
} from "./mappers";

export interface RepoSnapshot {
  users: User[];
  artists: Artist[];
  campaigns: Campaign[];
  contentSources: ContentSource[];
  posts: SocialPost[];
  mediaAssets: MediaAsset[];
  brandRules: BrandRule[];
  postVersions: PostVersion[];
  statusHistories: StatusHistory[];
  aiLogs: AiGenerationLog[];
}

/** 画面表示に必要な全データをまとめて取得（RLSで許可された範囲のみ返る） */
export async function loadAll(): Promise<RepoSnapshot> {
  const sb = getBrowserClient();
  const [
    users,
    artists,
    campaigns,
    contentSources,
    mediaAssets,
    posts,
    postMedia,
    versions,
    histories,
    rules,
    aiLogs,
  ] = await Promise.all([
    sb.from("users").select("*"),
    sb.from("artists").select("*"),
    sb.from("campaigns").select("*"),
    sb.from("content_sources").select("*"),
    sb.from("media_assets").select("*"),
    sb.from("social_posts").select("*"),
    sb.from("post_media").select("*"),
    sb.from("post_versions").select("*"),
    sb.from("status_histories").select("*"),
    sb.from("brand_rules").select("*"),
    sb.from("ai_generation_logs").select("*"),
  ]);

  const err =
    users.error ||
    artists.error ||
    campaigns.error ||
    contentSources.error ||
    mediaAssets.error ||
    posts.error ||
    postMedia.error ||
    versions.error ||
    histories.error ||
    rules.error ||
    aiLogs.error;
  if (err) throw new Error(err.message);

  // post_media から mediaAssetIds を投稿へ結合
  const mediaByPost = new Map<string, { id: string; order: number }[]>();
  (postMedia.data ?? []).forEach(
    (pm: { social_post_id: string; media_asset_id: string; display_order: number }) => {
      const arr = mediaByPost.get(pm.social_post_id) ?? [];
      arr.push({ id: pm.media_asset_id, order: pm.display_order });
      mediaByPost.set(pm.social_post_id, arr);
    },
  );

  const mappedPosts = (posts.data ?? []).map(socialPostFromRow).map((p) => ({
    ...p,
    mediaAssetIds: (mediaByPost.get(p.id) ?? [])
      .sort((a, b) => a.order - b.order)
      .map((x) => x.id),
  }));

  return {
    users: (users.data ?? []).map(userFromRow),
    artists: (artists.data ?? []).map(artistFromRow),
    campaigns: (campaigns.data ?? []).map(campaignFromRow),
    contentSources: (contentSources.data ?? []).map(contentSourceFromRow),
    posts: mappedPosts,
    mediaAssets: (mediaAssets.data ?? []).map(mediaAssetFromRow),
    brandRules: (rules.data ?? []).map(brandRuleFromRow),
    postVersions: (versions.data ?? []).map(postVersionFromRow),
    statusHistories: (histories.data ?? []).map(statusHistoryFromRow),
    aiLogs: (aiLogs.data ?? []).map(aiLogFromRow),
  };
}

// ---- 書き込み（upsert / delete） ----

export async function upsertContentSource(c: ContentSource): Promise<void> {
  const { error } = await getBrowserClient()
    .from("content_sources")
    .upsert(contentSourceToRow(c));
  if (error) throw new Error(error.message);
}

export async function upsertPost(p: SocialPost): Promise<void> {
  const sb = getBrowserClient();
  const { error } = await sb.from("social_posts").upsert(socialPostToRow(p));
  if (error) throw new Error(error.message);
  // post_media を同期（全削除→再挿入）
  await sb.from("post_media").delete().eq("social_post_id", p.id);
  if (p.mediaAssetIds.length > 0) {
    const rows = p.mediaAssetIds.map((id, i) => ({
      social_post_id: p.id,
      media_asset_id: id,
      display_order: i,
    }));
    const { error: e2 } = await sb.from("post_media").insert(rows);
    if (e2) throw new Error(e2.message);
  }
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await getBrowserClient()
    .from("social_posts")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function insertPostVersion(v: PostVersion): Promise<void> {
  const { error } = await getBrowserClient()
    .from("post_versions")
    .insert(postVersionToRow(v));
  if (error) throw new Error(error.message);
}

export async function insertStatusHistory(h: StatusHistory): Promise<void> {
  const { error } = await getBrowserClient()
    .from("status_histories")
    .insert(statusHistoryToRow(h));
  if (error) throw new Error(error.message);
}

export async function upsertMediaAsset(a: MediaAsset): Promise<void> {
  const { error } = await getBrowserClient()
    .from("media_assets")
    .upsert(mediaAssetToRow(a));
  if (error) throw new Error(error.message);
}

export async function deleteMediaAsset(id: string): Promise<void> {
  const { error } = await getBrowserClient()
    .from("media_assets")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function upsertBrandRule(r: BrandRule): Promise<void> {
  const { error } = await getBrowserClient()
    .from("brand_rules")
    .upsert(brandRuleToRow(r));
  if (error) throw new Error(error.message);
}

export async function deleteBrandRule(id: string): Promise<void> {
  const { error } = await getBrowserClient()
    .from("brand_rules")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function upsertCampaign(c: Campaign): Promise<void> {
  const { error } = await getBrowserClient()
    .from("campaigns")
    .upsert(campaignToRow(c));
  if (error) throw new Error(error.message);
}

export async function insertAiLog(l: AiGenerationLog): Promise<void> {
  const { error } = await getBrowserClient()
    .from("ai_generation_logs")
    .insert(aiLogToRow(l));
  if (error) throw new Error(error.message);
}
