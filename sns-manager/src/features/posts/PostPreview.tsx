"use client";

/**
 * 投稿プレビュー（媒体別の簡易モック表示）
 */
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { PLATFORM_LABELS } from "@/constants";
import type { Platform } from "@/types/domain";

export function PostPreview({
  platform,
  title,
  body,
  hashtags,
  artistName,
}: {
  platform: Platform;
  title: string;
  body: string;
  hashtags: string[];
  artistName: string;
}) {
  const tagLine = hashtags.join(" ");

  return (
    <div className="mx-auto max-w-md">
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
        <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-2)] text-sm font-semibold text-[var(--ink-2)]">
            {artistName.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{artistName}</p>
            <p className="text-xs text-[var(--muted)]">
              @sample_artist ・ {PLATFORM_LABELS[platform]}
            </p>
          </div>
          <PlatformIcon platform={platform} size="sm" />
        </div>

        {platform === "website" && title && (
          <div className="border-b border-[var(--border)] px-4 py-3">
            <p className="text-base font-semibold leading-snug">{title}</p>
          </div>
        )}

        <div className="px-4 py-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]">
            {body || "（本文が未入力です）"}
          </p>
          {tagLine && (
            <p className="mt-2 text-sm text-[var(--info)]">{tagLine}</p>
          )}
        </div>

        <div className="aspect-video border-t border-[var(--border)] bg-[var(--surface-2)]">
          <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
            画像・動画プレビュー領域
          </div>
        </div>

        <div className="flex items-center gap-6 px-4 py-2.5 text-xs text-[var(--muted)]">
          <span>♡ いいね</span>
          <span>💬 コメント</span>
          <span>↗ 共有</span>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-[var(--muted)]">
        ※ 実際の表示は媒体により異なります（イメージ）
      </p>
    </div>
  );
}
