"use client";

import { useMemo, useState } from "react";
import { FileVideo, Plus, Trash2, AlertTriangle } from "lucide-react";
import { Button, Card, Field, Input, Select } from "@/components/ui/primitives";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { Badge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { useStore } from "@/repositories/store";
import { useToast } from "@/components/ui/Toast";
import { can } from "@/services/permissions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { uploadMedia } from "@/repositories/supabase/storage";
import {
  MEDIA_CATEGORY_LABELS,
  PLATFORMS,
  PLATFORM_LABELS,
} from "@/constants";
import { formatDateJa, toJst } from "@/lib/date";
import type { MediaAsset, MediaCategory, Platform } from "@/types/domain";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function MediaView() {
  const { state, currentUser, addMediaAsset, deleteMediaAsset } = useStore();
  const toast = useToast();
  const [category, setCategory] = useState<MediaCategory | "">("");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const canManage = can(currentUser.role, "media.manage");
  const now = toJst(new Date());

  const filtered = useMemo(
    () =>
      state.mediaAssets.filter((a) => !category || a.category === category),
    [state.mediaAssets, category],
  );

  return (
    <div>
      <PageHeader
        title="素材管理"
        description={`アーティスト写真・告知画像・動画など ${state.mediaAssets.length} 件`}
        action={
          canManage && (
            <Button variant="primary" onClick={() => setAddOpen(true)}>
              <Plus size={15} />
              素材を追加
            </Button>
          )
        }
      />

      <Card className="mb-4 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategory("")}
            className={`rounded-lg px-3 py-1.5 text-xs ${
              category === ""
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface-2)] text-[var(--ink-2)]"
            }`}
          >
            すべて
          </button>
          {(Object.keys(MEDIA_CATEGORY_LABELS) as MediaCategory[]).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-lg px-3 py-1.5 text-xs ${
                category === c
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface-2)] text-[var(--ink-2)]"
              }`}
            >
              {MEDIA_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            title="素材がありません"
            description="「素材を追加」から登録してください。"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => {
            const expired = a.usageEndAt && toJst(a.usageEndAt) < now;
            return (
              <Card key={a.id} className="overflow-hidden">
                <div className="relative aspect-video bg-[var(--surface-2)]">
                  {a.fileType === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.fileUrl}
                      alt={a.fileName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--muted)]">
                      <FileVideo size={28} />
                    </div>
                  )}
                  {expired && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-[var(--danger)] px-1.5 py-0.5 text-[10px] text-white">
                      <AlertTriangle size={10} />
                      使用期限切れ
                    </span>
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{a.fileName}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {MEDIA_CATEGORY_LABELS[a.category]} ・ {a.fileType} ・{" "}
                        {formatSize(a.fileSize)}
                      </p>
                    </div>
                    {canManage && (
                      <button
                        onClick={() => setDeleteId(a.id)}
                        className="shrink-0 rounded p-1 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--danger)]"
                        aria-label="削除"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {a.allowedPlatforms.map((p) => (
                      <span key={p} title={PLATFORM_LABELS[p]}>
                        <PlatformIcon platform={p} size="sm" />
                      </span>
                    ))}
                  </div>

                  <div className="space-y-0.5 text-[11px] text-[var(--muted)]">
                    {(a.width || a.duration) && (
                      <p>
                        {a.width && a.height && `${a.width}×${a.height}`}
                        {a.duration && ` ・ ${a.duration}秒`}
                      </p>
                    )}
                    <p>
                      使用期間: {formatDateJa(a.usageStartAt)} 〜{" "}
                      {a.usageEndAt ? formatDateJa(a.usageEndAt) : "無期限"}
                    </p>
                    {a.creditText && <p>クレジット: {a.creditText}</p>}
                    {a.rightsNote && <p>権利: {a.rightsNote}</p>}
                  </div>

                  {a.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {a.tags.map((t) => (
                        <Badge key={t}>{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AddAssetModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={(asset) => {
          addMediaAsset({ ...asset, createdBy: currentUser.id });
          toast.show("素材を追加しました", "success");
          setAddOpen(false);
        }}
        artistId={state.artists[0]?.id ?? "artist_1"}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="素材を削除"
        message="この素材を削除します。よろしいですか？"
        confirmLabel="削除する"
        danger
        onConfirm={() => {
          if (deleteId) deleteMediaAsset(deleteId);
          toast.show("素材を削除しました", "info");
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function AddAssetModal({
  open,
  onClose,
  onAdd,
  artistId,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (
    asset: Omit<MediaAsset, "id" | "createdAt" | "updatedAt" | "createdBy">,
  ) => void;
  artistId: string;
}) {
  const [fileName, setFileName] = useState("");
  const [category, setCategory] = useState<MediaCategory>("announcement_image");
  const [fileType, setFileType] = useState<"image" | "video">("image");
  const [platforms, setPlatforms] = useState<Platform[]>(["x", "instagram"]);
  const [usageEnd, setUsageEnd] = useState("");
  const [credit, setCredit] = useState("");
  const [rights, setRights] = useState("");
  const [tags, setTags] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  function reset() {
    setFileName("");
    setPreviewUrl(null);
    setFileSize(0);
    setFile(null);
    setTags("");
    setCredit("");
    setRights("");
    setUsageEnd("");
  }

  function togglePlatform(p: Platform) {
    setPlatforms((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="素材を追加"
      size="lg"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            キャンセル
          </Button>
          <Button
            variant="primary"
            disabled={!fileName || uploading}
            onClick={async () => {
              let fileUrl =
                previewUrl ?? "https://placehold.co/800x600?text=Asset";
              const notes: string | null = isSupabaseConfigured
                ? null
                : "Supabase未設定のためローカルプレビュー";
              if (isSupabaseConfigured && file) {
                setUploading(true);
                try {
                  const res = await uploadMedia(file, artistId);
                  fileUrl = res.url;
                } catch (err) {
                  setUploading(false);
                  alert(
                    `アップロードに失敗しました: ${
                      err instanceof Error ? err.message : "不明なエラー"
                    }`,
                  );
                  return;
                }
                setUploading(false);
              }
              onAdd({
                artistId,
                campaignId: null,
                category,
                fileName,
                fileUrl,
                fileType,
                mimeType: fileType === "image" ? "image/*" : "video/*",
                fileSize,
                width: null,
                height: null,
                duration: null,
                usageStartAt: new Date().toISOString(),
                usageEndAt: usageEnd ? new Date(usageEnd).toISOString() : null,
                allowedPlatforms: platforms,
                rightsNote: rights || null,
                creditText: credit || null,
                tags: tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
                notes,
              });
              reset();
            }}
          >
            {uploading ? "アップロード中…" : "追加する"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--border)] px-4 py-6 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)]">
          <Plus size={20} />
          ファイルを選択（画像/動画）
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setFileName(f.name);
              setFileSize(f.size);
              setFileType(f.type.startsWith("video") ? "video" : "image");
              setPreviewUrl(URL.createObjectURL(f));
              setFile(f);
            }}
          />
        </label>

        {previewUrl && fileType === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="preview"
            className="mx-auto max-h-40 rounded-lg"
          />
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="ファイル名" required>
            <Input value={fileName} onChange={(e) => setFileName(e.target.value)} />
          </Field>
          <Field label="カテゴリ">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as MediaCategory)}
            >
              {(Object.keys(MEDIA_CATEGORY_LABELS) as MediaCategory[]).map((c) => (
                <option key={c} value={c}>
                  {MEDIA_CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="使用終了日">
            <Input
              type="date"
              value={usageEnd}
              onChange={(e) => setUsageEnd(e.target.value)}
            />
          </Field>
          <Field label="クレジット表記">
            <Input value={credit} onChange={(e) => setCredit(e.target.value)} />
          </Field>
          <Field label="権利情報">
            <Input value={rights} onChange={(e) => setRights(e.target.value)} />
          </Field>
          <Field label="タグ（カンマ区切り）">
            <Input value={tags} onChange={(e) => setTags(e.target.value)} />
          </Field>
        </div>

        <Field label="使用可能媒体">
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs ${
                  platforms.includes(p)
                    ? "border-[var(--accent)] bg-[var(--surface-2)]"
                    : "border-[var(--border)]"
                }`}
              >
                <PlatformIcon platform={p} size="sm" />
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
        </Field>
        <p className="text-xs text-[var(--muted)]">
          {isSupabaseConfigured
            ? "※ 追加時に Supabase Storage（bucket: media）へアップロードします。"
            : "※ Supabase未設定のためローカルプレビューのみ。.env.local 設定で Storage 保存に切り替わります。"}
        </p>
      </div>
    </Modal>
  );
}
