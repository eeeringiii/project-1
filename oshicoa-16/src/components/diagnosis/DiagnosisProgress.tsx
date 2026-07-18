export default function DiagnosisProgress({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span className="type-code text-violet">
          Q<span className="text-text">{String(current).padStart(2, "0")}</span> / {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="診断の進捗"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet to-magenta transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
