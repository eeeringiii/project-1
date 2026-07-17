"use client";

/**
 * データストア（Phase 1: クライアント内メモリ + localStorage 永続化）
 *
 * 要件「モックデータでも一通り操作でき、リロード後もある程度保持」を満たすため、
 * React Context で全エンティティと更新操作を提供する。
 *
 * Phase 2 でこの Provider の内部実装を Supabase 呼び出しに差し替えても、
 * `useStore()` の公開インターフェースを維持できるよう、UI は本フックのみ参照する。
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  Approval,
  Artist,
  BrandRule,
  Campaign,
  ContentSource,
  MediaAsset,
  PostStatus,
  PostVersion,
  PublishingJob,
  SocialPost,
  StatusHistory,
  User,
  UserRole,
} from "@/types/domain";
import type { GeneratedDraft } from "@/services/ai-generation";
import { transition, makeVersion } from "@/services/status-flow";
import * as seed from "@/mock/seed";
import type { ContentSourceInput } from "@/schemas";

const STORAGE_KEY = "sns-manager-store-v1";

interface StoreState {
  artists: Artist[];
  users: User[];
  campaigns: Campaign[];
  contentSources: ContentSource[];
  posts: SocialPost[];
  mediaAssets: MediaAsset[];
  brandRules: BrandRule[];
  statusHistories: StatusHistory[];
  postVersions: PostVersion[];
  approvals: Approval[];
  publishingJobs: PublishingJob[];
  currentUserId: string;
}

function buildSeedState(): StoreState {
  return {
    artists: seed.seedArtists,
    users: seed.seedUsers,
    campaigns: seed.seedCampaigns,
    contentSources: seed.seedContentSources,
    posts: seed.seedPosts,
    mediaAssets: seed.seedMediaAssets,
    brandRules: seed.seedBrandRules,
    statusHistories: seed.seedStatusHistories,
    postVersions: seed.seedPostVersions,
    approvals: seed.seedApprovals,
    publishingJobs: seed.seedPublishingJobs,
    currentUserId: seed.CURRENT_USER_ID,
  };
}

function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

interface StoreApi {
  state: StoreState;
  currentUser: User;
  setCurrentUserId: (id: string) => void;
  reset: () => void;

  // content
  createContentSource: (input: ContentSourceInput) => ContentSource;
  createPostsFromDrafts: (
    sourceId: string,
    drafts: GeneratedDraft[],
  ) => SocialPost[];

  // posts
  updatePost: (
    id: string,
    patch: Partial<SocialPost>,
    opts?: { changeSummary?: string },
  ) => void;
  changeStatus: (id: string, next: PostStatus, comment?: string) => void;
  deletePost: (id: string) => void;
  createEmptyPost: (platform: SocialPost["platform"]) => SocialPost;

  // media
  addMediaAsset: (asset: Omit<MediaAsset, "id" | "createdAt" | "updatedAt">) => void;
  updateMediaAsset: (id: string, patch: Partial<MediaAsset>) => void;
  deleteMediaAsset: (id: string) => void;

  // brand rules
  upsertBrandRule: (rule: BrandRule) => void;
  deleteBrandRule: (id: string) => void;

  // campaigns
  createCampaign: (
    campaign: Omit<Campaign, "id" | "artistId" | "createdAt" | "updatedAt">,
  ) => void;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>(buildSeedState);
  const [hydrated, setHydrated] = useState(false);

  // localStorage から復元
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // localStorage（外部ストア）からの復元。Phase 2でSupabase取得に差替。
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setState(JSON.parse(raw) as StoreState);
    } catch {
      // 破損時はシードのまま
    }
    setHydrated(true);
  }, []);

  // 変更を保存
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 容量超過などは無視
    }
  }, [state, hydrated]);

  const currentUser = useMemo(
    () =>
      state.users.find((u) => u.id === state.currentUserId) ?? state.users[0],
    [state.users, state.currentUserId],
  );

  const setCurrentUserId = useCallback((id: string) => {
    setState((s) => ({ ...s, currentUserId: id }));
  }, []);

  const reset = useCallback(() => {
    const fresh = buildSeedState();
    setState(fresh);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // ignore
    }
  }, []);

  const createContentSource = useCallback(
    (input: ContentSourceInput): ContentSource => {
      const nowIso = new Date().toISOString();
      const source: ContentSource = {
        id: genId("src"),
        artistId: seed.ARTIST_ID,
        campaignId: input.campaignId,
        title: input.title,
        sourceText: input.sourceText,
        purpose: input.purpose,
        relatedUrl: input.relatedUrl || null,
        embargoAt: input.embargoAt,
        eventAt: input.eventAt,
        venueName: input.venueName,
        productName: input.productName,
        productPrice: input.productPrice,
        notes: input.notes,
        aiInstruction: input.aiInstruction,
        requiresArtistApproval: input.requiresArtistApproval,
        targetPlatforms: input.targetPlatforms,
        createdBy: state.currentUserId,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setState((s) => ({
        ...s,
        contentSources: [source, ...s.contentSources],
      }));
      return source;
    },
    [state.currentUserId],
  );

  const createPostsFromDrafts = useCallback(
    (sourceId: string, drafts: GeneratedDraft[]): SocialPost[] => {
      const nowIso = new Date().toISOString();
      const source = state.contentSources.find((c) => c.id === sourceId);
      const newPosts: SocialPost[] = drafts.map((d) => ({
        id: genId("post"),
        artistId: seed.ARTIST_ID,
        campaignId: source?.campaignId ?? null,
        contentSourceId: sourceId,
        platform: d.platform,
        postType: d.postType,
        title: d.title,
        body: d.body,
        hashtags: d.hashtags,
        imageTextSuggestions: d.imageTextSuggestions,
        importantFacts: d.importantFacts,
        scheduledAt: null,
        embargoAt: source?.embargoAt ?? null,
        status: "ai_generated" as PostStatus,
        requiresArtistApproval: source?.requiresArtistApproval ?? false,
        artistApprovedAt: null,
        approvedBy: null,
        approvedAt: null,
        publishedAt: null,
        publishedUrl: null,
        errorMessage: null,
        mediaAssetIds: [],
        createdBy: state.currentUserId,
        createdAt: nowIso,
        updatedAt: nowIso,
      }));
      setState((s) => ({ ...s, posts: [...newPosts, ...s.posts] }));
      return newPosts;
    },
    [state.contentSources, state.currentUserId],
  );

  const createEmptyPost = useCallback(
    (platform: SocialPost["platform"]): SocialPost => {
      const nowIso = new Date().toISOString();
      const post: SocialPost = {
        id: genId("post"),
        artistId: seed.ARTIST_ID,
        campaignId: null,
        contentSourceId: null,
        platform,
        postType: "official_announcement",
        title: "無題の投稿",
        body: "",
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
        createdBy: state.currentUserId,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setState((s) => ({ ...s, posts: [post, ...s.posts] }));
      return post;
    },
    [state.currentUserId],
  );

  const updatePost = useCallback(
    (
      id: string,
      patch: Partial<SocialPost>,
      opts?: { changeSummary?: string },
    ) => {
      setState((s) => {
        const post = s.posts.find((p) => p.id === id);
        if (!post) return s;
        const contentChanged =
          (patch.title !== undefined && patch.title !== post.title) ||
          (patch.body !== undefined && patch.body !== post.body) ||
          (patch.hashtags !== undefined &&
            JSON.stringify(patch.hashtags) !== JSON.stringify(post.hashtags));

        const updated: SocialPost = {
          ...post,
          ...patch,
          updatedAt: new Date().toISOString(),
        };

        let versions = s.postVersions;
        if (contentChanged && opts?.changeSummary) {
          const versionNumber =
            s.postVersions.filter((v) => v.socialPostId === id).length + 1;
          versions = [
            makeVersion({
              post: updated,
              versionNumber,
              userId: s.currentUserId,
              changeSummary: opts.changeSummary,
            }),
            ...s.postVersions,
          ];
        }

        return {
          ...s,
          posts: s.posts.map((p) => (p.id === id ? updated : p)),
          postVersions: versions,
        };
      });
    },
    [],
  );

  const changeStatus = useCallback(
    (id: string, next: PostStatus, comment?: string) => {
      setState((s) => {
        const post = s.posts.find((p) => p.id === id);
        if (!post) return s;
        const { post: updated, history } = transition({
          post,
          next,
          userId: s.currentUserId,
          comment,
        });
        return {
          ...s,
          posts: s.posts.map((p) => (p.id === id ? updated : p)),
          statusHistories: [history, ...s.statusHistories],
        };
      });
    },
    [],
  );

  const deletePost = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      posts: s.posts.filter((p) => p.id !== id),
    }));
  }, []);

  const addMediaAsset = useCallback(
    (asset: Omit<MediaAsset, "id" | "createdAt" | "updatedAt">) => {
      const nowIso = new Date().toISOString();
      const full: MediaAsset = {
        ...asset,
        id: genId("asset"),
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setState((s) => ({ ...s, mediaAssets: [full, ...s.mediaAssets] }));
    },
    [],
  );

  const updateMediaAsset = useCallback(
    (id: string, patch: Partial<MediaAsset>) => {
      setState((s) => ({
        ...s,
        mediaAssets: s.mediaAssets.map((a) =>
          a.id === id
            ? { ...a, ...patch, updatedAt: new Date().toISOString() }
            : a,
        ),
      }));
    },
    [],
  );

  const deleteMediaAsset = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      mediaAssets: s.mediaAssets.filter((a) => a.id !== id),
    }));
  }, []);

  const upsertBrandRule = useCallback((rule: BrandRule) => {
    setState((s) => {
      const exists = s.brandRules.some((r) => r.id === rule.id);
      return {
        ...s,
        brandRules: exists
          ? s.brandRules.map((r) => (r.id === rule.id ? rule : r))
          : [rule, ...s.brandRules],
      };
    });
  }, []);

  const deleteBrandRule = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      brandRules: s.brandRules.filter((r) => r.id !== id),
    }));
  }, []);

  const createCampaign = useCallback(
    (
      campaign: Omit<Campaign, "id" | "artistId" | "createdAt" | "updatedAt">,
    ) => {
      const nowIso = new Date().toISOString();
      const full: Campaign = {
        ...campaign,
        id: genId("camp"),
        artistId: seed.ARTIST_ID,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setState((s) => ({ ...s, campaigns: [full, ...s.campaigns] }));
    },
    [],
  );

  const api: StoreApi = {
    state,
    currentUser,
    setCurrentUserId,
    reset,
    createContentSource,
    createPostsFromDrafts,
    updatePost,
    changeStatus,
    deletePost,
    createEmptyPost,
    addMediaAsset,
    updateMediaAsset,
    deleteMediaAsset,
    upsertBrandRule,
    deleteBrandRule,
    createCampaign,
  };

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore は StoreProvider の内側で使用してください");
  return ctx;
}

// ---- 便利セレクタ ----

export function useCurrentRole(): UserRole {
  return useStore().currentUser.role;
}
