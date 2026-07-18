import Link from "next/link";
import type { OshicoaType } from "@/types";

export default function CompatibilityCard({
  bestType,
  description,
}: {
  bestType: OshicoaType;
  description: string;
}) {
  return (
    <div className="panel p-6">
      <p className="type-code text-xs text-violet mb-3">BEST MATCH</p>
      <Link href={`/types/${bestType.code}`} className="group flex items-baseline gap-2">
        <span className="type-code text-sm text-magenta">{bestType.code}</span>
        <span className="font-display text-lg font-bold text-text group-hover:text-gradient">
          {bestType.name}
        </span>
      </Link>
      <p className="mt-1 text-sm text-text-sub">「{bestType.catchphrase}」</p>
      <p className="mt-3 text-sm text-text-sub leading-relaxed">{description}</p>
    </div>
  );
}
