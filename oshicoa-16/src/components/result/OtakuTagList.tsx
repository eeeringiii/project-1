import type { OtakuTag } from "@/types";

export default function OtakuTagList({ tags, showDescription = false }: { tags: OtakuTag[]; showDescription?: boolean }) {
  if (!tags.length) return null;
  return (
    <ul className="flex flex-col gap-3">
      {tags.map((tag) => (
        <li key={tag.id} className="panel-hair p-4">
          <div className="flex items-center gap-2">
            <span className="type-code text-[10px] text-magenta">業</span>
            <span className="font-display text-base font-bold text-text">#{tag.name}</span>
          </div>
          {showDescription && (
            <p className="mt-2 text-sm text-text-sub leading-relaxed">{tag.description}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
