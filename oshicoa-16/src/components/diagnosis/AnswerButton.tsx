"use client";

import type { AnswerValue } from "@/types";

type Props = {
  value: AnswerValue;
  label: string;
  shortcut: string;
  selected: boolean;
  onSelect: (value: AnswerValue) => void;
};

/** 回答ボタン。強度に応じてアクセントの濃さを変える。片手操作しやすい大きさ。 */
export default function AnswerButton({ value, label, shortcut, selected, onSelect }: Props) {
  const intensity =
    value === 3 ? "strong-pos" : value === 1 ? "pos" : value === -1 ? "neg" : "strong-neg";

  const accent: Record<string, string> = {
    "strong-pos": "border-magenta/60",
    pos: "border-violet/50",
    neg: "border-blue/40",
    "strong-neg": "border-line-strong",
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-xl border bg-[rgba(255,255,255,0.02)] px-4 py-4 text-left transition-all duration-150 hover:bg-[rgba(139,92,246,0.08)] active:scale-[0.99] ${
        selected ? "border-violet bg-[rgba(139,92,246,0.14)] shadow-[0_0_0_3px_rgba(139,92,246,0.18)]" : accent[intensity]
      }`}
    >
      <span
        aria-hidden="true"
        className="type-code flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line-strong text-sm text-text-sub"
      >
        {shortcut}
      </span>
      <span className="text-[15px] font-medium text-text">{label}</span>
      {selected && (
        <span className="ml-auto text-violet" aria-hidden="true">
          ✓
        </span>
      )}
    </button>
  );
}
