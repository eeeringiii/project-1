"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/office", label: "📊 ダッシュボード" },
  { href: "/office/chart", label: "🗂 組織図" },
  { href: "/office/schedule", label: "📅 スケジュール" },
  { href: "/office/cost", label: "💰 コスト・収支" },
  { href: "/office/rules", label: "📚 運用ルール" },
];

export default function OfficeNav() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap gap-2" aria-label="オフィス内メニュー">
      {TABS.map((t) => {
        const on = path === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={on ? "page" : undefined}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              on
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-zinc-700 bg-zinc-900/60 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
