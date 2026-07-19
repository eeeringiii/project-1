"use client";

/**
 * データストア（UIの単一情報源）
 *
 * - Supabase 未設定時: クライアント内メモリ + localStorage 永続（Phase 1 と同じモック動作）
 * - Supabase 設定時: 起動時に Supabase から全データをロードし、各更新を書き込みスルーで永続化
 *
 * UI（features）は本フック `useStore()` のみを参照するため、実装差し替えの影響を受けない。
 * 書き込みは楽観的更新（ローカル即時反映）＋非同期永続化（失敗時は console にエラー）。
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
  AiGenerationLog,
  Approval,
  Artist,
  BrandRule,
  Campaign,
  ContentSource,
  MediaAsset,
  PostStatus,
  PostVersion,
  PublishingJob,
  PublishingResult,
  SocialPost,
  StatusHistory,
  User,
  UserRole,
} from "@/types/domain";
import type { GeneratedDraft } from "@/services/ai-generation";
import { transition, makeVersion } from "@/services/status-flow";
import {
  canRetry,
  createJob,
  isDue,
  requeue,
  runJob,
} from "@/services/publishing";
import * as seed from "@/mock/seed";
import type { ContentSourceInput } from "@/schemas";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import * as repo from "@/repositories/supabase/repo";

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
  publishingResults: PublishingResult[];
  aiLogs: AiGenerationLog[];
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
    publishingResults: [],
    aiLogs: [],
    currentUserId: seed.CURRENT_USER_ID,
  };
}

/** ID採番: Supabase設定時はUUID（DBのuuid列に適合）、未設定時は可読ID */
function genId(prefix: string): string {
  if (isSupabaseConfigured && typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

/** 永続化を best-effort で実行（Supabase設定時のみ） */
function persist(op: () => Promise<void>): void {
  if (!isSupabaseConfigured) return;
  op().catch((e) => {
    console.error("[store] Supabase 永続化に失敗しました:", e);
  });
}

interface StoreApi {
  state: StoreState;
  currentUser: User;
  loading: boolean;
  loadError: string | null;
  setCurrentUserId: (id: string) => void;
  reset: () => void;

  createContentSource: (input: ContentSourceInput) => ContentSource;
  createPostsFromDrafts: (
    sourceId: string,
    drafts: GeneratedDraft[],
  ) => SocialPost[];

  updatePost: (
    id: string,
    patch: Partial<SocialPost>,
    opts?: { changeSummary?: string },
  ) => void;
  changeStatus: (id: string, next: PostStatus, comment?: string) => void;
  deletePost: (id: string) => void;
  createEmptyPost: (platform: SocialPost["platform"]) => SocialPost;

  addMediaAsset: (asset: Omit<MediaAsset, "id" | "createdAt" | "updatedAt">) => void;
  updateMediaAsset: (id: string, patch: Partial<MediaAsset>) => void;
  deleteMediaAsset: (id: string) => void;

  upsertBrandRule: (rule: BrandRule) => void;
  deleteBrandRule: (id: string) => void;

  createCampaign: (
    campaign: Omit<Campaign, "id" | "artistId" | "createdAt" | "updatedAt">,
  ) => void;

  addAiLog: (
    log: Omit<AiGenerationLog, "id" | "artistId" | "createdBy" | "createdAt">,
  ) => void;

  processDueJobs: () => { processed: number; succeeded: number; failed: number };
  retryJob: (jobId: string) => boolean;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>(buildSeedState);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 起動時のデータロード
  useEffect(() => {
    let active = true;
    if (isSupabaseConfigured) {
      repo
        .loadAll()
        .then((snap) => {
          if (!active) return;
          setState((s) => ({
            ...s,
            ...snap,
            // 現在ユーザーは Supabase の users から先頭を暫定選択（本来は auth.uid と紐付け）
            currentUserId: snap.users[0]?.id ?? s.currentUserId,
          }));
          setLoading(false);
        })
        .catch((e) => {
          if (!active) return;
          setLoadError(e instanceof Error ? e.message : "読み込みに失敗しました");
          setLoading(false);
        })
        .finally(() => {
          if (active) setHydrated(true);
        });
    } else {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (raw) setState(JSON.parse(raw) as StoreState);
      } catch {
        // 破損時はシードのまま
      }
      setHydrated(true);
    }
    return () => {
      active = false;
    };
  }, []);

  // localStorage への保存（モック時のみ）
  useEffect(() => {
    if (!hydrated || isSupabaseConfigured) return;
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

  const artistId = state.artists[0]?.id ?? seed.ARTIST_ID;

  const setCurrentUserId = useCallback((id: string) => {
    setState((s) => ({ ...s, currentUserId: id }));
  }, []);

  const reset = useCallback(() => {
    const fresh = buildSeedState();
    setState(fresh);
    if (!isSupabaseConfigured) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      } catch {
        // ignore
      }
    }
  }, []);

  const createContentSource = useCallback(
    (input: ContentSourceInput): ContentSource => {
      const nowIso = new Date().toISOString();
      const source: ContentSource = {
        id: genId("src"),
        artistId,
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
      setState((s) => ({ ...s, contentSources: [source, ...s.contentSources] }));
      persist(() => repo.upsertContentSource(source));
      return source;
    },
    [artistId, state.currentUserId],
  );

  const createPostsFromDrafts = useCallback(
    (sourceId: string, drafts: GeneratedDraft[]): SocialPost[] => {
      const nowIso = new Date().toISOString();
      const source = state.contentSources.find((c) => c.id === sourceId);
      const newPosts: SocialPost[] = drafts.map((d) => ({
        id: genId("post"),
        artistId,
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
      persist(async () => {
        for (const p of newPosts) await repo.upsertPost(p);
      });
      return newPosts;
    },
    [artistId, state.contentSources, state.currentUserId],
  );

  const createEmptyPost = useCallback(
    (platform: SocialPost["platform"]): SocialPost => {
      const nowIso = new Date().toISOString();
      const post: SocialPost = {
        id: genId("post"),
        artistId,
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
      persist(() => repo.upsertPost(post));
      return post;
    },
    [artistId, state.currentUserId],
  );

  const updatePost = useCallback(
    (
      id: string,
      patch: Partial<SocialPost>,
      opts?: { changeSummary?: string },
    ) => {
      const post = state.posts.find((p) => p.id === id);
      if (!post) return;
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

      let newVersion: PostVersion | null = null;
      if (contentChanged && opts?.changeSummary) {
        const versionNumber =
          state.postVersions.filter((v) => v.socialPostId === id).length + 1;
        newVersion = makeVersion({
          post: updated,
          versionNumber,
          userId: state.currentUserId,
          changeSummary: opts.changeSummary,
        });
      }

      const version = newVersion;
      setState((s) => ({
        ...s,
        posts: s.posts.map((p) => (p.id === id ? updated : p)),
        postVersions: version ? [version, ...s.postVersions] : s.postVersions,
      }));
      persist(async () => {
        await repo.upsertPost(updated);
        if (version) await repo.insertPostVersion(version);
      });
    },
    [state.posts, state.postVersions, state.currentUserId],
  );

  const changeStatus = useCallback(
    (id: string, next: PostStatus, comment?: string) => {
      const post = state.posts.find((p) => p.id === id);
      if (!post) return;
      const { post: updated, history } = transition({
        post,
        next,
        userId: state.currentUserId,
        comment,
      });

      // 予約時は配信ジョブを生成（既存の未完了ジョブが無い場合）。取り消し時は待機中ジョブを取消。
      const hasActiveJob = state.publishingJobs.some(
        (j) =>
          j.socialPostId === id &&
          (j.status === "queued" || j.status === "running"),
      );
      const newJob: PublishingJob | null =
        next === "scheduled" && !hasActiveJob ? createJob(updated) : null;

      setState((s) => ({
        ...s,
        posts: s.posts.map((p) => (p.id === id ? updated : p)),
        statusHistories: [history, ...s.statusHistories],
        publishingJobs:
          next === "cancelled"
            ? s.publishingJobs.map((j) =>
                j.socialPostId === id && j.status === "queued"
                  ? { ...j, status: "cancelled", updatedAt: new Date().toISOString() }
                  : j,
              )
            : newJob
              ? [newJob, ...s.publishingJobs]
              : s.publishingJobs,
      }));
      persist(async () => {
        await repo.upsertPost(updated);
        await repo.insertStatusHistory(history);
        if (newJob) await repo.upsertPublishingJob(newJob);
      });
    },
    [state.posts, state.currentUserId, state.publishingJobs],
  );

  /** 予定時刻を過ぎた queued ジョブをまとめて実行（モックcronのクライアント版） */
  const processDueJobs = useCallback((): {
    processed: number;
    succeeded: number;
    failed: number;
  } => {
    const now = new Date();
    const due = state.publishingJobs.filter((j) => isDue(j, now));
    let succeeded = 0;
    let failed = 0;
    const jobUpdates = new Map<string, PublishingJob>();
    const postUpdates = new Map<string, SocialPost>();
    const newResults: PublishingResult[] = [];

    for (const job of due) {
      const post = state.posts.find((p) => p.id === job.socialPostId);
      if (!post) continue;
      const outcome = runJob(job, post);
      jobUpdates.set(job.id, outcome.job);
      postUpdates.set(post.id, outcome.post);
      if (outcome.result) {
        newResults.push(outcome.result);
        succeeded += 1;
      } else {
        failed += 1;
      }
    }

    if (due.length > 0) {
      setState((s) => ({
        ...s,
        publishingJobs: s.publishingJobs.map((j) => jobUpdates.get(j.id) ?? j),
        posts: s.posts.map((p) => postUpdates.get(p.id) ?? p),
        publishingResults: [...newResults, ...s.publishingResults],
      }));
      persist(async () => {
        for (const j of jobUpdates.values()) await repo.upsertPublishingJob(j);
        for (const p of postUpdates.values()) await repo.upsertPost(p);
        for (const r of newResults) await repo.insertPublishingResult(r);
      });
    }
    return { processed: due.length, succeeded, failed };
  }, [state.publishingJobs, state.posts]);

  /** 失敗ジョブを再試行（再キュー→即時実行） */
  const retryJob = useCallback(
    (jobId: string): boolean => {
      const job = state.publishingJobs.find((j) => j.id === jobId);
      if (!job || !canRetry(job)) return false;
      const post = state.posts.find((p) => p.id === job.socialPostId);
      if (!post) return false;
      const outcome = runJob(requeue(job), post);
      setState((s) => ({
        ...s,
        publishingJobs: s.publishingJobs.map((j) =>
          j.id === jobId ? outcome.job : j,
        ),
        posts: s.posts.map((p) => (p.id === post.id ? outcome.post : p)),
        publishingResults: outcome.result
          ? [outcome.result, ...s.publishingResults]
          : s.publishingResults,
      }));
      persist(async () => {
        await repo.upsertPublishingJob(outcome.job);
        await repo.upsertPost(outcome.post);
        if (outcome.result) await repo.insertPublishingResult(outcome.result);
      });
      return outcome.result !== null;
    },
    [state.publishingJobs, state.posts],
  );

  const deletePost = useCallback((id: string) => {
    setState((s) => ({ ...s, posts: s.posts.filter((p) => p.id !== id) }));
    persist(() => repo.deletePost(id));
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
      persist(() => repo.upsertMediaAsset(full));
    },
    [],
  );

  const updateMediaAsset = useCallback(
    (id: string, patch: Partial<MediaAsset>) => {
      const asset = state.mediaAssets.find((a) => a.id === id);
      if (!asset) return;
      const updated: MediaAsset = {
        ...asset,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      setState((s) => ({
        ...s,
        mediaAssets: s.mediaAssets.map((a) => (a.id === id ? updated : a)),
      }));
      persist(() => repo.upsertMediaAsset(updated));
    },
    [state.mediaAssets],
  );

  const deleteMediaAsset = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      mediaAssets: s.mediaAssets.filter((a) => a.id !== id),
    }));
    persist(() => repo.deleteMediaAsset(id));
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
    persist(() => repo.upsertBrandRule(rule));
  }, []);

  const deleteBrandRule = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      brandRules: s.brandRules.filter((r) => r.id !== id),
    }));
    persist(() => repo.deleteBrandRule(id));
  }, []);

  const createCampaign = useCallback(
    (
      campaign: Omit<Campaign, "id" | "artistId" | "createdAt" | "updatedAt">,
    ) => {
      const nowIso = new Date().toISOString();
      const full: Campaign = {
        ...campaign,
        id: genId("camp"),
        artistId,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setState((s) => ({ ...s, campaigns: [full, ...s.campaigns] }));
      persist(() => repo.upsertCampaign(full));
    },
    [artistId],
  );

  const addAiLog = useCallback(
    (log: Omit<AiGenerationLog, "id" | "artistId" | "createdBy" | "createdAt">) => {
      const full: AiGenerationLog = {
        ...log,
        id: genId("ailog"),
        artistId,
        createdBy: state.currentUserId,
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({ ...s, aiLogs: [full, ...s.aiLogs] }));
      persist(() => repo.insertAiLog(full));
    },
    [artistId, state.currentUserId],
  );

  const api: StoreApi = {
    state,
    currentUser,
    loading,
    loadError,
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
    addAiLog,
    processDueJobs,
    retryJob,
  };

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore は StoreProvider の内側で使用してください");
  return ctx;
}

export function useCurrentRole(): UserRole {
  return useStore().currentUser.role;
}
