"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  UserCheck,
} from "lucide-react";
import { endOfWeek, isWithinInterval, startOfWeek } from "date-fns";
import { useStore } from "@/repositories/store";
import { Card, CardHeader } from "@/components/ui/primitives";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CAMPAIGN_STATUS_LABELS,
  PLATFORMS,
  PLATFORM_LABELS,
  POST_STATUSES,
} from "@/constants";
import { dateKey, formatDateJa, formatDateTimeJa, toJst } from "@/lib/date";
import type { PostStatus } from "@/types/domain";

export function DashboardView() {
  const { state } = useStore();
  const { posts, campaigns } = state;

  const nowJst = toJst(new Date());
  const todayKey = dateKey(new Date());
  const weekStart = startOfWeek(nowJst, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(nowJst, { weekStartsOn: 1 });

  const scheduledPosts = posts.filter(
    (p) => p.scheduledAt && ["scheduled", "approved"].includes(p.status),
  );

  const todayPosts = scheduledPosts.filter(
    (p) => p.scheduledAt && dateKey(p.scheduledAt) === todayKey,
  );
  const weekPosts = scheduledPosts.filter(
    (p) =>
      p.scheduledAt &&
      isWithinInterval(toJst(p.scheduledAt), { start: weekStart, end: weekEnd }),
  );

  const count = (s: PostStatus) => posts.filter((p) => p.status === s).length;

  const stats = [
    {
      label: "今日の投稿予定",
      value: todayPosts.length,
      icon: CalendarDays,
      tone: "info" as const,
    },
    {
      label: "今週の投稿予定",
      value: weekPosts.length,
      icon: Clock,
      tone: "info" as const,
    },
    {
      label: "確認待ち（担当者）",
      value: count("staff_review"),
      icon: FileText,
      tone: "warning" as const,
    },
    {
      label: "本人確認待ち",
      value: count("artist_review"),
      icon: UserCheck,
      tone: "warning" as const,
    },
    {
      label: "承認済み",
      value: count("approved"),
      icon: CheckCircle2,
      tone: "success" as const,
    },
    {
      label: "投稿エラー",
      value: count("failed"),
      icon: AlertTriangle,
      tone: "danger" as const,
    },
  ];

  const byPlatform = PLATFORMS.map((pl) => ({
    platform: pl,
    count: scheduledPosts.filter((p) => p.platform === pl).length,
  }));

  const recentPosts = [...posts]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 6);

  const upcomingCampaigns = [...campaigns]
    .filter((c) => c.status === "active" || c.status === "planning")
    .sort((a, b) => (a.startAt ?? "") < (b.startAt ?? "") ? -1 : 1)
    .slice(0, 4);

  const statusOverview = POST_STATUSES.map((s) => ({
    status: s,
    count: count(s),
  })).filter((s) => s.count > 0);

  const TONE_TEXT: Record<string, string> = {
    info: "text-[var(--info)]",
    warning: "text-[var(--warning)]",
    success: "text-[var(--success)]",
    danger: "text-[var(--danger)]",
  };

  return (
    <div>
      <PageHeader
        title="ダッシュボード"
        description={`本日 ${formatDateJa(new Date())} 時点の運用状況`}
      />

      {/* 統計カード */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted)]">{s.label}</span>
                <Icon size={16} className={TONE_TEXT[s.tone]} />
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {s.value}
              </p>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 今日の投稿予定 */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="今日の投稿予定"
            icon={<CalendarDays size={16} />}
            action={
              <Link
                href="/calendar"
                className="text-xs text-[var(--info)] hover:underline"
              >
                カレンダーへ
              </Link>
            }
          />
          {todayPosts.length === 0 ? (
            <EmptyState
              title="本日の投稿予定はありません"
              description="投稿を予約するとここに表示されます。"
            />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {todayPosts.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/posts/${p.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--surface-2)]"
                  >
                    <PlatformIcon platform={p.platform} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {p.title}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {formatDateTimeJa(p.scheduledAt).split("）")[1]}
                    </span>
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* 媒体別投稿予定数 */}
        <Card>
          <CardHeader title="媒体別 投稿予定" />
          <ul className="space-y-1 px-4 py-3">
            {byPlatform.map((b) => (
              <li
                key={b.platform}
                className="flex items-center justify-between rounded-lg px-1 py-1.5"
              >
                <span className="flex items-center gap-2 text-sm">
                  <PlatformIcon platform={b.platform} size="sm" />
                  {PLATFORM_LABELS[b.platform]}
                </span>
                <span className="text-sm font-semibold">{b.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 最近作成した投稿 */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="最近作成した投稿"
            action={
              <Link
                href="/posts"
                className="text-xs text-[var(--info)] hover:underline"
              >
                一覧へ
              </Link>
            }
          />
          {recentPosts.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {recentPosts.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/posts/${p.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--surface-2)]"
                  >
                    <PlatformIcon platform={p.platform} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {p.title}
                    </span>
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* 直近のキャンペーン */}
        <Card>
          <CardHeader title="直近のキャンペーン" />
          {upcomingCampaigns.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {upcomingCampaigns.map((c) => (
                <li key={c.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{c.name}</span>
                    <span className="shrink-0 text-[11px] text-[var(--muted)]">
                      {CAMPAIGN_STATUS_LABELS[c.status]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {formatDateJa(c.startAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* 投稿ステータス一覧 */}
      <Card className="mt-4">
        <CardHeader title="投稿ステータスの一覧" />
        <div className="flex flex-wrap gap-2 px-5 py-4">
          {statusOverview.length === 0 ? (
            <span className="text-sm text-[var(--muted)]">投稿がありません</span>
          ) : (
            statusOverview.map((s) => (
              <Link
                key={s.status}
                href={`/posts?status=${s.status}`}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-2)]"
              >
                <StatusBadge status={s.status} />
                <span className="font-semibold">{s.count}</span>
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
