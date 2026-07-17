"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Sparkles, Save, ChevronDown } from "lucide-react";
import { Card, CardHeader, Button, Input, Textarea } from "@/components/ui/primitives";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { Spinner } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStore } from "@/repositories/store";
import { useToast } from "@/components/ui/Toast";
import { generateMockDrafts, type GeneratedDraft } from "@/services/ai-generation";
import {
  PLATFORM_LABELS,
  POST_TYPE_LABELS,
} from "@/constants";
import { formatDateTimeJa } from "@/lib/date";

export function GenerateView({ sourceId }: { sourceId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { state, createPostsFromDrafts } = useStore();
  const source = state.contentSources.find((c) => c.id === sourceId);
  const brandRules = state.brandRules;

  const [drafts, setDrafts] = useState<GeneratedDraft[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  async function generate() {
    setLoading(true);
    // モック生成（Phase 3 でサーバー経由の Anthropic 呼び出しに差し替え）
    await new Promise((r) => setTimeout(r, 650));
    setDrafts(generateMockDrafts(source!, brandRules));
    setLoading(false);
    toast.show("AIが投稿案を生成しました（モック）", "success");
  }

  function updateDraft(index: number, patch: Partial<GeneratedDraft>) {
    setDrafts((s) =>
      s ? s.map((d, i) => (i === index ? { ...d, ...patch } : d)) : s,
    );
  }

  function regenerateOne(index: number) {
    if (!drafts) return;
    const d = drafts[index];
    const fresh = generateMockDrafts(source!, brandRules).find(
      (x) => x.platform === d.platform && x.postType === d.postType,
    );
    if (fresh) {
      updateDraft(index, {
        body: fresh.body + "\n（再生成）",
        title: fresh.title,
      });
      toast.show("この投稿案を再生成しました", "info");
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

      {!drafts && !loading && (
        <Card>
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--accent-fg)]">
              <Sparkles size={22} />
            </span>
            <p className="text-sm font-medium">AI投稿案を生成しましょう</p>
            <p className="max-w-md text-xs text-[var(--muted)]">
              対象媒体（{source.targetPlatforms.length}媒体）ごとに、投稿タイプ別の草案をまとめて生成します。
              ※ Anthropic API 未設定でも動作するモック生成です。
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--muted)]">
              {drafts.length}件の投稿案を生成しました。編集して保存してください。
            </p>
            <Button variant="ghost" size="sm" onClick={generate}>
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
                  return (
                    <DraftEditor
                      key={`${d.platform}-${d.postType}`}
                      draft={d}
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
  onChange,
  onRegenerate,
}: {
  draft: GeneratedDraft;
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
        <Button variant="ghost" size="sm" onClick={onRegenerate}>
          <RefreshCw size={13} />
          再生成
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
