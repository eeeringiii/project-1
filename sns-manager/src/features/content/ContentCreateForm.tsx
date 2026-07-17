"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Sparkles, Video } from "lucide-react";
import { Card, CardHeader, Field, Input, Textarea, Select, Button } from "@/components/ui/primitives";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { useStore } from "@/repositories/store";
import { useToast } from "@/components/ui/Toast";
import { PLATFORMS, PLATFORM_LABELS } from "@/constants";
import { contentSourceSchema } from "@/schemas";
import type { Platform } from "@/types/domain";
import { can } from "@/services/permissions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { uploadMedia } from "@/repositories/supabase/storage";

interface UploadPreview {
  name: string;
  kind: "image" | "video";
  url: string;
  size: number;
  file: File;
}

export function ContentCreateForm() {
  const router = useRouter();
  const toast = useToast();
  const { state, currentUser, createContentSource, addMediaAsset } = useStore();

  const [title, setTitle] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [purpose, setPurpose] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [relatedUrl, setRelatedUrl] = useState("");
  const [embargoAt, setEmbargoAt] = useState("");
  const [publishWishAt, setPublishWishAt] = useState("");
  const [eventAt, setEventAt] = useState("");
  const [venueName, setVenueName] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [aiInstruction, setAiInstruction] = useState("");
  const [requiresArtistApproval, setRequiresArtistApproval] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>(["x", "instagram"]);
  const [uploads, setUploads] = useState<UploadPreview[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canCreate = can(currentUser.role, "post.create");

  function togglePlatform(p: Platform) {
    setPlatforms((s) =>
      s.includes(p) ? s.filter((x) => x !== p) : [...s, p],
    );
  }

  function toIso(local: string): string | null {
    if (!local) return null;
    return new Date(local).toISOString();
  }

  function onFiles(kind: "image" | "video", files: FileList | null) {
    if (!files) return;
    const next: UploadPreview[] = [];
    Array.from(files).forEach((f) => {
      next.push({
        name: f.name,
        kind,
        url: URL.createObjectURL(f),
        size: f.size,
        file: f,
      });
    });
    setUploads((s) => [...s, ...next]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = contentSourceSchema.safeParse({
      title,
      sourceText,
      purpose,
      campaignId: campaignId || null,
      relatedUrl: relatedUrl || null,
      embargoAt: toIso(embargoAt),
      eventAt: toIso(eventAt || publishWishAt),
      venueName: venueName || null,
      productName: productName || null,
      productPrice: productPrice ? Number(productPrice) : null,
      notes: notes || null,
      aiInstruction: aiInstruction || null,
      requiresArtistApproval,
      targetPlatforms: platforms,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        const key = String(i.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = i.message;
      });
      setErrors(fieldErrors);
      toast.show("入力内容を確認してください", "warning");
      return;
    }
    setErrors({});

    const source = createContentSource(parsed.data);

    // アップロード素材を素材ライブラリへ登録
    // Supabase設定時は Storage へアップロードして公開URLを保存、未設定時はローカルプレビュー。
    for (const u of uploads) {
      let fileUrl = u.url;
      let note: string | null =
        "MVP: ローカルプレビュー（Supabase未設定）";
      if (isSupabaseConfigured) {
        try {
          const res = await uploadMedia(u.file, source.artistId);
          fileUrl = res.url;
          note = null;
        } catch (err) {
          toast.show(
            `素材アップロードに失敗しました: ${
              err instanceof Error ? err.message : "不明なエラー"
            }`,
            "error",
          );
        }
      }
      addMediaAsset({
        artistId: source.artistId,
        campaignId: source.campaignId,
        category: u.kind === "image" ? "announcement_image" : "video",
        fileName: u.name,
        fileUrl,
        fileType: u.kind,
        mimeType: u.kind === "image" ? "image/*" : "video/*",
        fileSize: u.size,
        width: null,
        height: null,
        duration: null,
        usageStartAt: null,
        usageEndAt: null,
        allowedPlatforms: source.targetPlatforms,
        rightsNote: null,
        creditText: null,
        tags: ["入稿時アップロード"],
        notes: note,
        createdBy: currentUser.id,
      });
    }

    toast.show("コンテンツを登録しました。AI生成に進みます。", "success");
    router.push(`/content/${source.id}/generate`);
  }

  if (!canCreate) {
    return (
      <div>
        <PageHeader title="コンテンツ作成" />
        <Card className="p-6 text-sm text-[var(--muted)]">
          現在の権限（{currentUser.role}）ではコンテンツを作成できません。
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <PageHeader
        title="コンテンツ新規作成"
        description="1つの告知情報を登録すると、各媒体向けの投稿案をAIが生成します。"
        action={
          <Button type="submit" variant="primary">
            <Sparkles size={15} />
            登録してAI生成へ
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="基本情報" />
            <div className="space-y-4 p-5">
              <Field label="コンテンツタイトル" required error={errors.title}>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: ニューシングル「アオイロ」配信リリース"
                />
              </Field>
              <Field
                label="元となる告知情報"
                required
                hint="AIが投稿案を作る元ネタ。できるだけ具体的に。"
                error={errors.sourceText}
              >
                <Textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  rows={5}
                  placeholder="配信日、テーマ、聴きどころ、リンクなど"
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="投稿目的">
                  <Input
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="例: 初動再生数の最大化"
                  />
                </Field>
                <Field label="キャンペーン">
                  <Select
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                  >
                    <option value="">未選択</option>
                    {state.campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="関連URL" error={errors.relatedUrl}>
                <Input
                  value={relatedUrl}
                  onChange={(e) => setRelatedUrl(e.target.value)}
                  placeholder="https://example.com/..."
                />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="日時・イベント情報" />
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              <Field label="解禁日時" hint="この日時より前の公開は警告されます">
                <Input
                  type="datetime-local"
                  value={embargoAt}
                  onChange={(e) => setEmbargoAt(e.target.value)}
                />
              </Field>
              <Field label="公開希望日時">
                <Input
                  type="datetime-local"
                  value={publishWishAt}
                  onChange={(e) => setPublishWishAt(e.target.value)}
                />
              </Field>
              <Field label="イベント日時">
                <Input
                  type="datetime-local"
                  value={eventAt}
                  onChange={(e) => setEventAt(e.target.value)}
                />
              </Field>
              <Field label="会場名">
                <Input
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="例: 渋谷SAMPLE HALL"
                />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="商品情報" />
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              <Field label="商品名">
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="例: オフィシャルTシャツ"
                />
              </Field>
              <Field label="商品価格（円）">
                <Input
                  type="number"
                  min={0}
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="4000"
                />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="素材アップロード" />
            <div className="space-y-4 p-5">
              <div className="flex flex-wrap gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--ink-2)] hover:bg-[var(--surface-2)]">
                  <ImagePlus size={16} />
                  画像を追加
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => onFiles("image", e.target.files)}
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--ink-2)] hover:bg-[var(--surface-2)]">
                  <Video size={16} />
                  動画を追加
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => onFiles("video", e.target.files)}
                  />
                </label>
              </div>
              {uploads.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {uploads.map((u, i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-lg border border-[var(--border)]"
                    >
                      {u.kind === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.url}
                          alt={u.name}
                          className="h-20 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-20 items-center justify-center bg-[var(--surface-2)] text-[var(--muted)]">
                          <Video size={20} />
                        </div>
                      )}
                      <p className="truncate px-1.5 py-1 text-[10px] text-[var(--muted)]">
                        {u.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-[var(--muted)]">
                {isSupabaseConfigured
                  ? "※ 登録時に Supabase Storage へアップロードします。"
                  : "※ Supabase未設定のためローカルプレビューのみ。.env.local 設定で Storage 連携に切り替わります。"}
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader title="補足・AIへの指示" />
            <div className="space-y-4 p-5">
              <Field label="補足情報">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </Field>
              <Field
                label="AIへの追加指示"
                hint="トーンや強調したい点など"
              >
                <Textarea
                  value={aiInstruction}
                  onChange={(e) => setAiInstruction(e.target.value)}
                  rows={2}
                  placeholder="例: 爽やかで前向きなトーン。絵文字は控えめに。"
                />
              </Field>
            </div>
          </Card>
        </div>

        {/* 右カラム: 対象媒体・本人確認 */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="対象媒体（複数選択可）" />
            <div className="space-y-2 p-5">
              {PLATFORMS.map((p) => {
                const active = platforms.includes(p);
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "border-[var(--accent)] bg-[var(--surface-2)]"
                        : "border-[var(--border)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    <PlatformIcon platform={p} size="sm" />
                    <span className="flex-1 text-left">{PLATFORM_LABELS[p]}</span>
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                        active
                          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                          : "border-[var(--border)]"
                      }`}
                    >
                      {active ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
              {errors.targetPlatforms && (
                <p className="text-xs text-[var(--danger)]">
                  {errors.targetPlatforms}
                </p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="本人確認" />
            <div className="p-5">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={requiresArtistApproval}
                  onChange={(e) => setRequiresArtistApproval(e.target.checked)}
                  className="mt-0.5 h-4 w-4"
                />
                <span className="text-sm text-[var(--ink-2)]">
                  この投稿はアーティスト本人の確認・承認を必須にする
                </span>
              </label>
            </div>
          </Card>

          <div className="lg:hidden">
            <Button type="submit" variant="primary" className="w-full">
              <Sparkles size={15} />
              登録してAI生成へ
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
