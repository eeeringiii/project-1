/**
 * 空データ表示
 */
import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title = "データがありません",
  description,
  icon,
  action,
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="mb-1 text-[var(--muted)]">{icon ?? <Inbox size={28} />}</div>
      <p className="text-sm font-medium text-[var(--ink)]">{title}</p>
      {description && (
        <p className="max-w-sm text-xs text-[var(--muted)]">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
