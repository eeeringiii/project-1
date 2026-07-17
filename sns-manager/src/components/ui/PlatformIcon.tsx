/**
 * 媒体アイコン
 * 色だけでなくアイコン＋ラベルでも媒体を判別できるようにする。
 */
import { Globe, Instagram, Music2, Twitter, Youtube } from "lucide-react";
import type { Platform } from "@/types/domain";
import { PLATFORM_LABELS } from "@/constants";

const ICONS: Record<Platform, typeof Globe> = {
  x: Twitter,
  instagram: Instagram,
  tiktok: Music2,
  youtube: Youtube,
  website: Globe,
};

const COLORS: Record<Platform, string> = {
  x: "bg-neutral-900 text-white",
  instagram: "bg-gradient-to-br from-fuchsia-500 to-amber-400 text-white",
  tiktok: "bg-neutral-800 text-white",
  youtube: "bg-red-600 text-white",
  website: "bg-slate-600 text-white",
};

export function PlatformIcon({
  platform,
  size = "md",
}: {
  platform: Platform;
  size?: "sm" | "md";
}) {
  const Icon = ICONS[platform];
  const box = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const icon = size === "sm" ? 13 : 16;
  return (
    <span
      className={`inline-flex ${box} shrink-0 items-center justify-center rounded-lg ${COLORS[platform]}`}
      title={PLATFORM_LABELS[platform]}
      aria-label={PLATFORM_LABELS[platform]}
    >
      <Icon size={icon} strokeWidth={2} />
    </span>
  );
}

export function PlatformTag({ platform }: { platform: Platform }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <PlatformIcon platform={platform} size="sm" />
      <span>{PLATFORM_LABELS[platform]}</span>
    </span>
  );
}
