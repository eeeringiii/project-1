"use client";

import { useMemo, useState } from "react";
import { types } from "@/data/types";
import TypeCard from "@/components/types/TypeCard";

/** コードに含まれる文字での絞り込みUI。複数選択はAND条件。 */
const FILTER_GROUPS: { label: string; letters: { key: string; name: string }[] }[] = [
  { label: "軸1", letters: [{ key: "R", name: "共鳴" }, { key: "C", name: "接続" }] },
  { label: "軸2", letters: [{ key: "E", name: "体験" }, { key: "P", name: "所有" }] },
  { label: "軸3", letters: [{ key: "G", name: "成長支援" }, { key: "M", name: "自己充足" }] },
  { label: "軸4", letters: [{ key: "T", name: "連帯" }, { key: "S", name: "単独" }] },
];

export default function TypesExplorer() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (letter: string) =>
    setSelected((prev) =>
      prev.includes(letter) ? prev.filter((l) => l !== letter) : [...prev, letter],
    );

  const filtered = useMemo(
    () => types.filter((t) => selected.every((l) => t.code.includes(l))),
    [selected],
  );

  return (
    <div>
      <div className="panel p-5">
        <div className="flex items-center justify-between">
          <p className="type-code text-xs text-violet">FILTER</p>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => setSelected([])}
              className="text-xs text-text-muted hover:text-text"
            >
              クリア
            </button>
          )}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FILTER_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-2 text-xs text-text-muted">{group.label}</p>
              <div className="flex gap-2">
                {group.letters.map((l) => {
                  const active = selected.includes(l.key);
                  return (
                    <button
                      key={l.key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggle(l.key)}
                      className={`flex-1 rounded-lg border px-2 py-2 text-center text-xs transition-colors ${
                        active
                          ? "border-violet bg-[rgba(139,92,246,0.16)] text-text"
                          : "border-line-strong text-text-sub hover:border-violet"
                      }`}
                    >
                      <span className="type-code block text-sm">{l.key}</span>
                      <span className="text-[10px] text-text-muted">{l.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-text-muted" aria-live="polite">
        {filtered.length}タイプを表示中
      </p>

      {filtered.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((type) => (
            <TypeCard key={type.code} type={type} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-center text-sm text-text-muted">
          条件に合うタイプがありません。フィルタを見直してください。
        </p>
      )}
    </div>
  );
}
