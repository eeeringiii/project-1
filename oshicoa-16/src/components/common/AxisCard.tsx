import type { AxisInfo } from "@/constants/axes";

export default function AxisCard({ axis }: { axis: AxisInfo }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2">
        <span className="type-code text-xs text-violet">AXIS {axis.index}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <h3 className="mt-3 font-display text-lg font-bold">{axis.title}</h3>
      <p className="mt-1 text-sm text-text-muted">{axis.question}</p>
      <div className="mt-4 space-y-3">
        {[axis.positive, axis.negative].map((pole) => (
          <div key={pole.key} className="flex gap-3">
            <span className="type-code mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line-strong text-sm text-text">
              {pole.key}
            </span>
            <div>
              <p className="text-sm font-medium text-text">{pole.name}</p>
              <p className="text-xs text-text-sub leading-relaxed">{pole.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
