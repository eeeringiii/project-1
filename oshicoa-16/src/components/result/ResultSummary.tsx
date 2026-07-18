import type { OshicoaType } from "@/types";

function ListBlock({ title, items, accent }: { title: string; items: string[]; accent: string }) {
  return (
    <div className="panel p-6">
      <p className={`type-code text-xs mb-4 ${accent}`}>{title}</p>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-text-sub leading-relaxed">
            <span aria-hidden="true" className={`mt-1 shrink-0 ${accent}`}>
              ◆
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ResultSummary({ type }: { type: OshicoaType }) {
  return (
    <div className="space-y-6">
      <div className="panel p-6 sm:p-8">
        <p className="type-code text-xs text-violet mb-4">ABOUT YOU</p>
        <div className="space-y-4">
          {type.description.map((para, i) => (
            <p key={i} className="text-[15px] leading-loose text-text-sub">
              {para}
            </p>
          ))}
        </div>
      </div>

      <ListBlock title="ヲタクあるある" items={type.traits} accent="text-violet" />
      <ListBlock title="あなたの強み" items={type.strengths} accent="text-blue" />
      <ListBlock title="ヲタクの業" items={type.shadowTraits} accent="text-magenta" />
    </div>
  );
}
