"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { hasSession } from "@/lib/auth";
import { useStore } from "@/repositories/store";
import { APP_NAME } from "@/constants";

const CRUMB_LABELS: Record<string, string> = {
  dashboard: "ダッシュボード",
  content: "コンテンツ",
  new: "新規作成",
  generate: "AI生成",
  posts: "投稿一覧",
  calendar: "カレンダー",
  publishing: "配信ジョブ",
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
    // 認証ゲート。Supabase設定時はセッション確認、未設定時はモック（localStorage）。
    let active = true;
    hasSession().then((ok) => {
      if (!active) return;
      if (!ok) router.replace("/login");
      else setAuthChecked(true);
    });
    return () => {
      active = false;
    };
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
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
          <DataGate>{children}</DataGate>
        </main>
      </div>
    </div>
  );
}

/** Supabase設定時、初回データロード中はスピナー、失敗時はエラーバナーを表示 */
function DataGate({ children }: { children: React.ReactNode }) {
  const { loading, loadError } = useStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--muted)]">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
        データを読み込んでいます…
      </div>
    );
  }
  return (
    <>
      {loadError && (
        <div className="mb-4 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)]">
          データの読み込みに失敗しました：{loadError}
          <br />
          Supabase の設定（URL / anon key / マイグレーション適用 / RLS）をご確認ください。
        </div>
      )}
      {children}
    </>
  );
}
