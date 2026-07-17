"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu, RotateCcw, UserCircle2 } from "lucide-react";
import { useStore } from "@/repositories/store";
import { ROLE_LABELS } from "@/constants";
import { signOut } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";

export function Header({
  breadcrumb,
  onOpenMenu,
}: {
  breadcrumb: { label: string; href?: string }[];
  onOpenMenu: () => void;
}) {
  const { state, currentUser, setCurrentUserId, reset } = useStore();
  const router = useRouter();
  const toast = useToast();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 py-3 backdrop-blur sm:px-6">
      <button
        onClick={onOpenMenu}
        className="rounded-lg p-1.5 text-[var(--ink-2)] hover:bg-[var(--surface-2)] lg:hidden"
        aria-label="メニューを開く"
      >
        <Menu size={20} />
      </button>

      <nav aria-label="パンくず" className="min-w-0 flex-1">
        <ol className="flex items-center gap-1.5 truncate text-sm">
          {breadcrumb.map((b, i) => (
            <li key={i} className="flex items-center gap-1.5 truncate">
              {i > 0 && <span className="text-[var(--muted)]">/</span>}
              <span
                className={
                  i === breadcrumb.length - 1
                    ? "truncate font-medium text-[var(--ink)]"
                    : "truncate text-[var(--muted)]"
                }
              >
                {b.label}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      {/* デモ用: 操作ユーザー（権限）切替 */}
      <div className="hidden items-center gap-1.5 text-sm sm:flex">
        <UserCircle2 size={18} className="text-[var(--muted)]" />
        <select
          value={currentUser.id}
          onChange={(e) => setCurrentUserId(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs outline-none focus:border-[var(--accent)]"
          title="操作ユーザー（権限デモ）"
        >
          {state.users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}（{ROLE_LABELS[u.role]}）
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => {
          if (confirm("モックデータを初期状態に戻します。よろしいですか？")) {
            reset();
            toast.show("モックデータをリセットしました", "success");
          }
        }}
        className="rounded-lg p-1.5 text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
        title="モックデータをリセット"
        aria-label="モックデータをリセット"
      >
        <RotateCcw size={17} />
      </button>

      <button
        onClick={() => {
          signOut();
          toast.show("ログアウトしました", "info");
          router.push("/login");
        }}
        className="rounded-lg p-1.5 text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
        title="ログアウト"
        aria-label="ログアウト"
      >
        <LogOut size={17} />
      </button>
    </header>
  );
}
