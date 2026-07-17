"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Sparkles,
  Save,
  ChevronDown,
  AlertTriangle,
  History,
} from "lucide-react";
import { Card, CardHeader, Button, Input, Textarea } from "@/components/ui/primitives";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { Spinner } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStore } from "@/repositories/store";
import { useToast } from "@/components/ui/Toast";
import type { GeneratedDraft } from "@/services/ai-generation";
import { generateDrafts } from "@/services/ai-client";
import {
  PLATFORM_LABELS,
  POST_TYPE_LABELS,
} from "@/constants";
import { formatDateTimeJa, relativeJa } from "@/lib/date";

export function GenerateView({ sourceId }: { sourceId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { state, createPostsFromDrafts, addAiLog } = useStore();
  const source = state.contentSources.find((c) => c.id === sourceId);
  const brandRules = state.brandRules;
  const logs = state.aiLogs.filter((l) => l.contentSourceId === sourceId);

  const [drafts, setDrafts] = useState<GeneratedDraft[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedMock, setUsedMock] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  const grouped = useMemo(() => {
    if (!drafts) return {};
    return drafts.reduce<Record<string, GeneratedDraft[]>>((acc, d) => {
      (acc[d.platform] ??= []).push(d);
      return acc;
    }, {});
  }, [drafts]);

  if (!source) {
    return (
      <div>
        <PageHeader title="AI投稿生成" />
        <Card>
          <EmptyState
            title="元コンテンツが見つかりません"
            description="削除されたか、URLが正しくない可能性があります。"
            action={
              <Button variant="secondary" onClick={() => router.push("/content/new")}>
                新規作成へ
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  function platformSummary(list: GeneratedDraft[]): string {
    const platforms = Array.from(new Set(list.map((d) => d.platform)));
    return platforms.map((p) => PLATFORM_LABELS[p]).join(" / ");
  }

  async function generate() {
    if (!source) return;
    setLoading(true);
    setError(null);
    try {
      const { posts, meta } = await generateDrafts(source, brandRules);
      setDrafts(posts);
      setUsedMock(meta.usedMock);
      addAiLog({
        contentSourceId: sourceId,
        platformSummary: platformSummary(posts) || "—",
        model: meta.model,
        usedMock: meta.usedMock,
        postCount: posts.length,
        ok: true,
        errorMessage: null,
      });
      toast.show(
        meta.usedMock
          ? "AIが投稿案を生成しました（モック / APIキー未設定）"
          : `AIが投稿案を生成しました（${meta.model}）`,
        "success",
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "生成に失敗しました";
      setError(msg);
      addAiLog({
        contentSourceId: sourceId,
        platformSummary: source.targetPlatforms
          .map((p) => PLATFORM_LABELS[p])
          .join(" / "),
        model: null,
        usedMock: false,
        postCount: 0,
        ok: false,
        errorMessage: msg,
      });
      toast.show("AI生成に失敗しました。再実行してください。", "error");
    } finally {
      setLoading(false);
    }
  }

  function updateDraft(index: number, patch: Partial<GeneratedDraft>) {
    setDrafts((s) =>
      s ? s.map((d, i) => (i === index ? { ...d, ...patch } : d)) : s,
    );
  }

  async function regenerateOne(index: number) {
    if (!drafts || !source) return;
    const d = drafts[index];
    const key = `${d.platform}-${d.postType}`;
    setRegenerating(key);
    try {
      const { posts } = await generateDrafts(source, brandRules, {
        only: { platform: d.platform, postType: d.postType },
      });
      const fresh = posts[0];
      if (fresh) {
        updateDraft(index, {
          title: fresh.title,
          body: fresh.body,
          hashtags: fresh.hashtags,
          imageTextSuggestions: fresh.imageTextSuggestions,
        });
        toast.show("この投稿案を再生成しました", "info");
      }
    } catch (e) {
      toast.show(
        e instanceof Error ? e.message : "再生成に失敗しました",
        "error",
      );
    } finally {
      setRegenerating(null);
    }
  }

  function saveAll() {
    if (!drafts) return;
    setSaving(true);
    createPostsFromDrafts(sourceId, drafts);
    toast.show(`${drafts.length}件の投稿案を保存しました`, "success");
    setSaving(false);
    router.push("/posts");
  }

  return (
    <div>
      <PageHeader
        title="AI投稿生成"
        description="元情報をもとに媒体ごとの投稿案を生成します。生成後はすべて編集できます。"
        action={
          drafts && (
            <Button variant="primary" onClick={saveAll} disabled={saving}>
              <Save size={15} />
              投稿案として保存（{drafts.length}件）
            </Button>
          )
        }
      />

      {/* 元情報サマリ */}
      <Card className="mb-4">
        <CardHeader title="元コンテンツ" />
        <div className="grid grid-cols-1 gap-x-6 gap-y-2 p-5 text-sm sm:grid-cols-2">
          <Info label="タイトル" value={source.title} />
          <Info label="目的" value={source.purpose || "—"} />
          <Info label="解禁日時" value={formatDateTimeJa(source.embargoAt)} />
          <Info label="イベント日時" value={formatDateTimeJa(source.eventAt)} />
          <Info label="会場" value={source.venueName || "—"} />
          <Info
            label="対象媒体"
            value={source.targetPlatforms
              .map((p) => PLATFORM_LABELS[p])
              .join(" / ")}
          />
          <div className="sm:col-span-2">
            <Info label="告知情報" value={source.sourceText} />
          </div>
        </div>
      </Card>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)]">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p>{error}</p>
            <button
              onClick={generate}
              className="mt-1 font-medium underline"
            >
              再実行する
            </button>
          </div>
        </div>
      )}

      {!drafts && !loading && (
        <Card>
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--accent-fg)]">
              <Sparkles size={22} />
            </span>
            <p className="text-sm font-medium">AI投稿案を生成しましょう</p>
            <p className="max-w-md text-xs text-[var(--muted)]">
              対象媒体（{source.targetPlatforms.length}媒体）ごとに、投稿タイプ別の草案をまとめて生成します。
              ブランドルール（口調・NGワード・必須表記）を反映します。
              ※ Anthropic API 未設定でも動作するモック生成にフォールバックします。
            </p>
            <Button variant="primary" onClick={generate}>
              <Sparkles size={15} />
              AIで生成する
            </Button>
          </div>
        </Card>
      )}

      {loading && (
        <Card>
          <Spinner label="AIが投稿案を生成しています…" />
        </Card>
      )}

      {drafts && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm text-[var(--muted)]">
              {drafts.length}件の投稿案を生成しました。編集して保存してください。
              {usedMock ? (
                <Badge tone="warning">モック生成</Badge>
              ) : (
                <Badge tone="success">AI生成</Badge>
              )}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={generate}
              disabled={loading}
            >
              <RefreshCw size={14} />
              すべて再生成
            </Button>
          </div>

          {Object.entries(grouped).map(([platform, list]) => (
            <Card key={platform}>
              <CardHeader
                title={
                  <span className="flex items-center gap-2">
                    <PlatformIcon
                      platform={platform as GeneratedDraft["platform"]}
                      size="sm"
                    />
                    {PLATFORM_LABELS[platform as GeneratedDraft["platform"]]}
                    <span className="text-xs font-normal text-[var(--muted)]">
                      {list.length}案
                    </span>
                  </span>
                }
              />
              <div className="divide-y divide-[var(--border)]">
                {list.map((d) => {
                  const index = drafts.indexOf(d);
                  const key = `${d.platform}-${d.postType}`;
                  return (
                    <DraftEditor
                      key={key}
                      draft={d}
                      busy={regenerating === key}
                      onChange={(patch) => updateDraft(index, patch)}
                      onRegenerate={() => regenerateOne(index)}
                    />
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* AI生成履歴 */}
      {logs.length > 0 && (
        <Card className="mt-4">
          <CardHeader title="AI生成履歴" icon={<History size={16} />} />
          <ul className="divide-y divide-[var(--border)]">
            {logs.slice(0, 8).map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center gap-2 px-5 py-2.5 text-sm"
              >
                {l.ok ? (
                  <Badge tone={l.usedMock ? "warning" : "success"}>
                    {l.usedMock ? "モック" : l.model ?? "AI"}
                  </Badge>
                ) : (
                  <Badge tone="danger">失敗</Badge>
                )}
                <span className="text-[var(--ink-2)]">{l.platformSummary}</span>
                {l.ok && (
                  <span className="text-xs text-[var(--muted)]">
                    {l.postCount}件生成
                  </span>
                )}
                {l.errorMessage && (
                  <span className="text-xs text-[var(--danger)]">
                    {l.errorMessage}
                  </span>
                )}
                <span className="ml-auto text-xs text-[var(--muted)]">
                  {relativeJa(l.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="whitespace-pre-wrap text-[var(--ink)]">{value}</p>
    </div>
  );
}

function DraftEditor({
  draft,
  busy,
  onChange,
  onRegenerate,
}: {
  draft: GeneratedDraft;
  busy: boolean;
  onChange: (patch: Partial<GeneratedDraft>) => void;
  onRegenerate: () => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="px-5 py-4">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          className="flex items-center gap-1.5 text-sm font-medium"
        >
          <ChevronDown
            size={15}
            className={`transition-transform ${open ? "" : "-rotate-90"}`}
          />
          {POST_TYPE_LABELS[draft.postType] ?? draft.postType}
        </button>
        <Button variant="ghost" size="sm" onClick={onRegenerate} disabled={busy}>
          <RefreshCw size={13} className={busy ? "animate-spin" : ""} />
          {busy ? "生成中…" : "再生成"}
        </Button>
      </div>
      {open && (
        <div className="space-y-3 pl-5">
          <div>
            <p className="mb-1 text-xs text-[var(--muted)]">管理用タイトル</p>
            <Input
              value={draft.title}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-[var(--muted)]">本文</p>
            <Textarea
              value={draft.body}
              onChange={(e) => onChange({ body: e.target.value })}
              rows={5}
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-[var(--muted)]">
              ハッシュタグ（カンマ区切り）
            </p>
            <Input
              value={draft.hashtags.join(", ")}
              onChange={(e) =>
                onChange({
                  hashtags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
          {draft.imageTextSuggestions.length > 0 && (
            <div>
              <p className="mb-1 text-xs text-[var(--muted)]">画像内テキスト案</p>
              <div className="flex flex-wrap gap-1.5">
                {draft.imageTextSuggestions.map((t, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-[var(--surface-2)] px-2 py-1 text-xs text-[var(--ink-2)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
