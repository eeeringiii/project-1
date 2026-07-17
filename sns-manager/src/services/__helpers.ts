/** テスト用の SocialPost ビルダー */
import type { SocialPost } from "@/types/domain";

export function buildPost(overrides: Partial<SocialPost> = {}): SocialPost {
  const now = new Date().toISOString();
  return {
    id: "post_test",
    artistId: "artist_1",
    campaignId: null,
    contentSourceId: null,
    platform: "x",
    postType: "official_announcement",
    title: "テスト投稿",
    body: "本文",
    hashtags: [],
    imageTextSuggestions: [],
    importantFacts: [],
    scheduledAt: null,
    embargoAt: null,
    status: "draft",
    requiresArtistApproval: false,
    artistApprovedAt: null,
    approvedBy: null,
    approvedAt: null,
    publishedAt: null,
    publishedUrl: null,
    errorMessage: null,
    mediaAssetIds: [],
    createdBy: "user_manager",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
