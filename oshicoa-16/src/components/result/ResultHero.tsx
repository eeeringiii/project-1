import type { OshicoaType, OtakuTag } from "@/types";
import TypeCharacter from "@/components/result/TypeCharacter";
import { formatDiagnosisDate, buildResultId } from "@/lib/result/resultMeta";

type Props = {
  type: OshicoaType;
  tags: OtakuTag[];
  oshiName?: string;
  undiagnosed?: boolean;
  completedAt?: string;
};

export default function ResultHero({ type, tags, oshiName, undiagnosed, completedAt }: Props) {
  const date = undiagnosed ? null : formatDiagnosisDate(completedAt);
  const id = undiagnosed ? null : buildResultId(type.code, completedAt);

  return (
    <section className="panel edge-glow relative overflow-hidden p-6 text-center sm:p-8">
      <div className="grid-noise pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative">
        {/* バナー */}
        <div className="flex items-start justify-between gap-2 text-left">
          <div className="leading-tight">
            <p className="type-code text-xs text-purple">OSHICOA 16</p>
            <p className="text-[10px] text-text-muted">ヲタク生態診断</p>
          </div>
          {date && (
            <div className="text-right leading-tight">
              <p className="text-[10px] text-text-muted">診断日 {date}</p>
              <p className="type-code text-[10px] text-text-muted">ID: {id}</p>
            </div>
          )}
        </div>

        {/* リボン */}
        <div className="mt-4 flex justify-center">
          <span className="ribbon inline-block px-5 py-1.5 text-xs font-medium">
            <span className="sparkle mr-1" aria-hidden="true">✦</span>
            {oshiName ? `${oshiName}を推しているときのあなたは…` : "あなたのヲタク生態は…"}
            <span className="sparkle ml-1" aria-hidden="true">✦</span>
          </span>
        </div>

        {/* キャラクター */}
        <div className="mx-auto mt-5 max-w-[240px]">
          <TypeCharacter code={type.code} name={type.name} size={240} />
        </div>

        {/* コード & 名前 */}
        <span className="type-code mt-4 inline-block rounded-full border border-line-strong bg-panel-soft px-4 py-1 text-sm text-purple">
          {type.code}
        </span>
        <h1 className="mt-3 font-display text-4xl font-bold text-gradient sm:text-5xl">
          {type.name}
        </h1>
        <p className="mt-1 text-xs text-text-muted">{type.reading}</p>
        <p className="mx-auto mt-4 max-w-lg text-text-sub">“{type.catchphrase}”</p>

        {/* 業タグ */}
        {!undiagnosed && tags.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-line-strong bg-[rgba(255,143,192,0.12)] px-3 py-1 text-xs text-text"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* 推定人口割合 */}
        <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-panel-soft px-5 py-3">
          <span className="text-xs text-text-muted">推定人口割合</span>
          <span className="font-display text-2xl font-bold text-gradient">
            {type.estimatedRatio}
            <span className="text-sm">%</span>
          </span>
          <span className="text-pink" aria-hidden="true">✦✧</span>
        </div>
      </div>
    </section>
  );
}
