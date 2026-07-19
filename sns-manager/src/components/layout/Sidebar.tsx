"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Disc3 } from "lucide-react";
import { NAV_ITEMS } from "./nav";
import { APP_NAME } from "@/constants";
import { useStore } from "@/repositories/store";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { state } = useStore();
  const artist = state.artists[0];

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-fg)]">
          <Disc3 size={18} />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">{APP_NAME}</p>
          <p className="text-xs text-[var(--muted)]">{artist?.name}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-[var(--accent)] font-medium text-[var(--accent-fg)]"
                  : "text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
              }`}
            >
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] px-5 py-3">
        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
          MVP / モックデータ版
          <br />
          外部SNS未連携
        </p>
      </div>
    </aside>
  );
}
