/**
 * ステータスバッジ
 * 色＋記号＋テキストで状態を表現（色覚に依存しない）。
 */
import { STATUS_LABELS, STATUS_TONE } from "@/constants";
import type { PostStatus } from "@/types/domain";

const TONE_CLASS: Record<string, string> = {
  neutral: "bg-[var(--neutral-bg)] text-[var(--neutral)] border-[var(--neutral)]/20",
  info: "bg-[var(--info-bg)] text-[var(--info)] border-[var(--info)]/20",
  warning:
    "bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]/20",
  success:
    "bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]/20",
  danger: "bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger)]/20",
};

export function StatusBadge({ status }: { status: PostStatus }) {
  const { tone, symbol } = STATUS_TONE[status];
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE_CLASS[tone]}`}
    >
      <span aria-hidden className="text-[0.85em] leading-none">
        {symbol}
      </span>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "info" | "warning" | "success" | "danger" | "gold";
}) {
  const cls =
    tone === "gold"
      ? "bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/30"
      : TONE_CLASS[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {children}
    </span>
  );
}
