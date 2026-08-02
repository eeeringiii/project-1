import Link from "next/link";
import type { OshicoaType } from "@/types";

/** 16タイプ一覧・トップで使うタイプカード。コードより「タイプ名」を主役にする。 */
export default function TypeCard({ type }: { type: OshicoaType }) {
  return (
    <Link
      href={`/types/${type.code}`}
      className="panel edge-glow group block p-5 transition-transform hover:-translate-y-1"
    >
      <div className="flex items-center justify-between">
        <span className="type-code text-xs text-violet">{type.code}</span>
        <span className="text-[11px] text-text-muted">約{type.estimatedRatio}%</span>
      </div>
      <h3 className="mt-2 font-display text-lg font-bold text-text group-hover:text-gradient">
        {type.name}
      </h3>
      <p className="mt-1 text-sm text-text-sub leading-relaxed">「{type.catchphrase}」</p>
      <p className="mt-3 text-xs text-text-muted leading-relaxed line-clamp-2">
        {type.shortDescription}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs text-violet">
        詳細を見る
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
