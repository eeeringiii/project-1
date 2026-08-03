import type { OshicoaType } from "@/types";

function NumberedList({
  title,
  badge,
  items,
  accent,
}: {
  title: string;
  badge: string;
  items: string[];
  accent: string;
}) {
  return (
    <div className="panel p-6">
      <h3 className="mb-4 text-center font-display text-base font-bold text-purple">
        <span className="sparkle mr-1" aria-hidden="true">✦</span>
        {title} <span className={accent}>{badge}</span>
      </h3>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 rounded-xl bg-panel-soft p-3 text-sm text-text-sub">
            <span
              className={`type-code flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs text-white ${accent === "text-pink" ? "bg-pink" : "bg-violet"}`}
              style={{ background: accent === "text-pink" ? "#ff8fc0" : "#a98bec" }}
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ResultSummary({ type }: { type: OshicoaType }) {
  return (
    <div className="space-y-6">
      <NumberedList title="あなたのヲタクあるある" badge="TOP5" items={type.traits} accent="text-violet" />
      <NumberedList title="あなたの強み" badge="BEST3" items={type.strengths} accent="text-pink" />

      {/* ヲタクの業（ピル） */}
      <div className="panel p-6">
        <h3 className="mb-4 text-center font-display text-base font-bold text-purple">
          <span className="sparkle mr-1" aria-hidden="true">✦</span>
          あなたのヲタクの業
        </h3>
        <ul className="space-y-2.5">
          {type.shadowTraits.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-2xl bg-[rgba(139,111,214,0.12)] px-4 py-3 text-sm text-text-sub"
            >
              <span className="mt-0.5 shrink-0 text-magenta" aria-hidden="true">♡</span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* タイプの深掘り説明 */}
      <div className="panel p-6 sm:p-8">
        <h3 className="mb-4 font-display text-base font-bold text-purple">
          <span className="sparkle mr-1" aria-hidden="true">✦</span>
          あなたという“生態”について
        </h3>
        <div className="space-y-4">
          {type.description.map((para, i) => (
            <p key={i} className="text-[15px] leading-loose text-text-sub">
              {para}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
