import type { OshicoaType, OtakuTag } from "@/types";
import TypeVisual from "@/components/result/TypeVisual";

type Props = {
  type: OshicoaType;
  tags: OtakuTag[];
  oshiName?: string;
  undiagnosed?: boolean;
};

export default function ResultHero({ type, tags, oshiName, undiagnosed }: Props) {
  return (
    <section className="panel edge-glow relative overflow-hidden p-8 text-center sm:p-10">
      <div className="grid-noise pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative">
        <div className="mx-auto max-w-[260px]">
          <TypeVisual code={type.code} size={260} />
        </div>

        {oshiName ? (
          <p className="mt-6 text-sm text-text-sub">
            {oshiName}を推しているときのあなたは
          </p>
        ) : (
          <p className="mt-6 text-sm text-text-sub">あなたのヲタク生態は</p>
        )}

        <p className="type-code mt-2 text-base text-magenta">{type.code}</p>
        <h1 className="mt-1 font-display text-4xl font-bold text-gradient sm:text-5xl">
          {type.name}
        </h1>
        <p className="mt-1 text-xs text-text-muted">{type.reading}</p>
        <p className="mx-auto mt-4 max-w-lg text-text-sub">「{type.catchphrase}」</p>

        {!undiagnosed && tags.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-line-strong bg-[rgba(217,70,239,0.08)] px-3 py-1 text-xs text-text"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        <p className="mt-5 text-xs text-text-muted">
          このタイプは全体の約 <span className="type-code text-violet">{type.estimatedRatio}%</span>（推定）
        </p>
      </div>
    </section>
  );
}
