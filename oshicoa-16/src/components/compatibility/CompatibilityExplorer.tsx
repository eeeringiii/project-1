"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { TypeCode } from "@/types";
import { types, typeMap } from "@/data/types";
import {
  computeCompatibility,
  overallScore,
  COMPATIBILITY_DIMENSIONS,
} from "@/lib/compatibility/computeCompatibility";

function TypeSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: TypeCode;
  onChange: (v: TypeCode) => void;
}) {
  return (
    <div className="flex-1">
      <label htmlFor={id} className="mb-2 block text-xs text-text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as TypeCode)}
        className="field"
      >
        {types.map((t) => (
          <option key={t.code} value={t.code}>
            {t.code}｜{t.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-sub">{label}</span>
        <span className="type-code text-text">{value}</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[rgba(150,120,210,0.18)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet to-magenta transition-[width] duration-500 ease-out"
          style={{ width: `${value}%` }}
          role="meter"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
    </div>
  );
}

export default function CompatibilityExplorer() {
  const [a, setA] = useState<TypeCode>("CEMS");
  const [b, setB] = useState<TypeCode>("CEGT");

  const result = useMemo(() => computeCompatibility(a, b), [a, b]);
  const overall = overallScore(result.scores);
  const typeA = typeMap[a];
  const typeB = typeMap[b];

  return (
    <div>
      <div className="panel p-6">
        <p className="type-code text-xs text-violet mb-4">SELECT 2 TYPES</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <TypeSelect id="typeA" label="あなた" value={a} onChange={setA} />
          <span className="hidden pb-3 text-center text-text-muted sm:block" aria-hidden="true">
            ×
          </span>
          <TypeSelect id="typeB" label="お相手" value={b} onChange={setB} />
        </div>
      </div>

      <div className="panel edge-glow mt-6 p-6 sm:p-8">
        <div className="flex items-center justify-center gap-3 text-center">
          <Link href={`/types/${typeA.code}`} className="min-w-0">
            <span className="type-code block text-xs text-magenta">{typeA.code}</span>
            <span className="font-display text-sm font-bold text-text">{typeA.name}</span>
          </Link>
          <span className="type-code text-text-muted" aria-hidden="true">
            ×
          </span>
          <Link href={`/types/${typeB.code}`} className="min-w-0">
            <span className="type-code block text-xs text-magenta">{typeB.code}</span>
            <span className="font-display text-sm font-bold text-text">{typeB.name}</span>
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="type-code text-xs text-violet">TOTAL</p>
          <p className="font-display text-5xl font-bold text-gradient" aria-live="polite">
            {overall}
            <span className="text-2xl text-text-muted"> / 100</span>
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {COMPATIBILITY_DIMENSIONS.map((d) => (
            <ScoreBar key={d.key} label={d.label} value={result.scores[d.key]} />
          ))}
        </div>

        <p className="mt-8 rounded-lg border border-line bg-[rgba(139,92,246,0.06)] p-4 text-sm leading-relaxed text-text-sub">
          {result.summary}
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-text-muted">
        ※ 代表的な組み合わせ以外のスコアは、各タイプの傾向から算出した簡易版です（仮ロジック）。
      </p>
    </div>
  );
}
