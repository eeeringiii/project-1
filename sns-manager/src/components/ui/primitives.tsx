/**
 * 汎用UIプリミティブ（Card / Button / 入力要素など）
 * ビジネスロジックを含まない見た目専用コンポーネント。
 */
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
  icon,
}: {
  title: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3.5">
      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
        {icon}
        {title}
      </div>
      {action}
    </div>
  );
}

type Variant = "primary" | "secondary" | "ghost" | "danger" | "gold";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent)]/90 border-transparent",
  secondary:
    "bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-2)] border-[var(--border)]",
  ghost:
    "bg-transparent text-[var(--ink-2)] hover:bg-[var(--surface-2)] border-transparent",
  danger:
    "bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90 border-transparent",
  gold: "bg-[var(--gold)] text-white hover:bg-[var(--gold)]/90 border-transparent",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md";
}) {
  const sz = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm";
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${sz} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-[var(--ink-2)]">
        {label}
        {required && <span className="text-[var(--danger)]">*</span>}
      </span>
      {children}
      {hint && !error && (
        <span className="mt-1 block text-xs text-[var(--muted)]">{hint}</span>
      )}
      {error && (
        <span className="mt-1 block text-xs text-[var(--danger)]">{error}</span>
      )}
    </label>
  );
}

const inputBase =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${inputBase} min-h-24 resize-y leading-relaxed ${props.className ?? ""}`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${inputBase} ${props.className ?? ""}`}>
      {props.children}
    </select>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-sm text-[var(--muted)]">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
      {label ?? "読み込み中…"}
    </div>
  );
}
