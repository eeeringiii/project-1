"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { getSession } from "@/lib/auth";
import { APP_NAME } from "@/constants";

const CRUMB_LABELS: Record<string, string> = {
  dashboard: "ダッシュボード",
  content: "コンテンツ",
  new: "新規作成",
  generate: "AI生成",
  posts: "投稿一覧",
  calendar: "カレンダー",
  media: "素材管理",
  brand: "ブランドルール",
};

function buildBreadcrumb(pathname: string): { label: string }[] {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { label: string }[] = [{ label: APP_NAME }];
  for (const p of parts) {
    // IDセグメント（英数字_）はラベル化しない
    if (CRUMB_LABELS[p]) crumbs.push({ label: CRUMB_LABELS[p] });
  }
  return crumbs;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // モック認証ゲート（外部状態=localStorageの購読）。Phase 2でSupabase Authに差替。
    if (!getSession()) {
      router.replace("/login");
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthChecked(true);
    }
  }, [router]);

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
        読み込み中…
      </div>
    );
  }

  const breadcrumb = buildBreadcrumb(pathname);

  return (
    <div className="flex min-h-screen">
      {/* デスクトップ サイドバー */}
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </div>

      {/* モバイル ドロワー */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute left-0 top-0 h-full animate-fade-in">
            <div className="relative h-full">
              <Sidebar onNavigate={() => setDrawer(false)} />
              <button
                onClick={() => setDrawer(false)}
                className="absolute -right-10 top-3 rounded-lg bg-[var(--surface)] p-1.5 shadow"
                aria-label="閉じる"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header breadcrumb={breadcrumb} onOpenMenu={() => setDrawer(true)} />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
