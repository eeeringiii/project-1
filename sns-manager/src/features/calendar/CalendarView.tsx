"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, Button, Select } from "@/components/ui/primitives";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { useStore } from "@/repositories/store";
import { useToast } from "@/components/ui/Toast";
import { can } from "@/services/permissions";
import { detectCrowdedDay } from "@/services/warnings";
import {
  PLATFORMS,
  PLATFORM_LABELS,
  POST_STATUSES,
  STATUS_LABELS,
  STATUS_TONE,
} from "@/constants";
import { dateKey, toJst } from "@/lib/date";
import type { SocialPost } from "@/types/domain";

const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"];

const TONE_DOT: Record<string, string> = {
  neutral: "bg-[var(--neutral)]",
  info: "bg-[var(--info)]",
  warning: "bg-[var(--warning)]",
  success: "bg-[var(--success)]",
  danger: "bg-[var(--danger)]",
};

export function CalendarView() {
  const router = useRouter();
  const toast = useToast();
  const { state, currentUser, updatePost } = useStore();
  const [cursor, setCursor] = useState(() => toJst(new Date()));
  const [view, setView] = useState<"month" | "week">("month");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);

  const canEdit = can(currentUser.role, "calendar.edit");

  const days = useMemo(() => {
    if (view === "month") {
      const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    }
    const start = startOfWeek(cursor, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: addDays(start, 6) });
  }, [cursor, view]);

  const scheduledPosts = useMemo(() => {
    return state.posts.filter((p) => {
      if (!p.scheduledAt) return false;
      if (platform && p.platform !== platform) return false;
      if (status && p.status !== status) return false;
      return true;
    });
  }, [state.posts, platform, status]);

  const byDay = useMemo(() => {
    const map: Record<string, SocialPost[]> = {};
    scheduledPosts.forEach((p) => {
      const k = dateKey(p.scheduledAt!);
      (map[k] ??= []).push(p);
    });
    return map;
  }, [scheduledPosts]);

  function onDrop(dayIso: Date) {
    if (!dragId || !canEdit) return;
    const post = state.posts.find((p) => p.id === dragId);
    if (!post || !post.scheduledAt) {
      setDragId(null);
      return;
    }
    // 時刻は維持し、日付だけ変更
    const old = toJst(post.scheduledAt);
    const next = new Date(dayIso);
    next.setHours(old.getHours(), old.getMinutes(), 0, 0);
    updatePost(post.id, { scheduledAt: next.toISOString() });
    toast.show("公開予定日を変更しました", "success");
    setDragId(null);
  }

  const title =
    view === "month"
      ? `${cursor.getFullYear()}年${cursor.getMonth() + 1}月`
      : `${cursor.getFullYear()}年${cursor.getMonth() + 1}月 第${Math.ceil(
          cursor.getDate() / 7,
        )}週`;

  return (
    <div>
      <PageHeader
        title="投稿カレンダー"
        description="ドラッグ＆ドロップで公開予定日を変更できます。"
      />

      <Card className="mb-4 p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCursor((c) => (view === "month" ? addMonths(c, -1) : addDays(c, -7)))
              }
              aria-label="前へ"
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="min-w-32 text-center text-sm font-semibold">
              {title}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCursor((c) => (view === "month" ? addMonths(c, 1) : addDays(c, 7)))
              }
              aria-label="次へ"
            >
              <ChevronRight size={16} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCursor(toJst(new Date()))}
            >
              今日
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden rounded-lg border border-[var(--border)]">
              {(["month", "week"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs ${
                    view === v
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--surface)] text-[var(--ink-2)]"
                  }`}
                >
                  {v === "month" ? "月" : "週"}
                </button>
              ))}
            </div>
            <Select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-auto py-1.5 text-xs"
            >
              <option value="">媒体すべて</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABELS[p]}
                </option>
              ))}
            </Select>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-auto py-1.5 text-xs"
            >
              <option value="">ステータスすべて</option>
              {POST_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--surface-2)] text-center text-xs text-[var(--muted)]">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-2">
              {w}
            </div>
          ))}
        </div>
        <div className={`grid grid-cols-7 ${view === "week" ? "" : ""}`}>
          {days.map((day) => {
            const k = dateKey(day);
            const posts = byDay[k] ?? [];
            const crowded = detectCrowdedDay(posts.length);
            const inMonth = view === "week" || isSameMonth(day, cursor);
            const isToday = k === dateKey(new Date());
            return (
              <div
                key={k}
                onDragOver={(e) => {
                  if (dragId) e.preventDefault();
                }}
                onDrop={() => onDrop(day)}
                className={`min-h-28 border-b border-r border-[var(--border)] p-1.5 ${
                  inMonth ? "" : "bg-[var(--surface-2)]/50"
                } ${dragId ? "hover:bg-[var(--info-bg)]" : ""}`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      isToday
                        ? "bg-[var(--accent)] font-semibold text-white"
                        : inMonth
                          ? "text-[var(--ink)]"
                          : "text-[var(--muted)]"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  {crowded && (
                    <span
                      className="inline-flex items-center gap-0.5 rounded bg-[var(--warning-bg)] px-1 text-[10px] text-[var(--warning)]"
                      title="投稿が集中しています"
                    >
                      <AlertTriangle size={9} />
                      集中
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {posts.slice(0, view === "week" ? 12 : 4).map((p) => {
                    const beforeEmbargo =
                      p.embargoAt &&
                      toJst(p.scheduledAt!) < toJst(p.embargoAt);
                    return (
                      <div
                        key={p.id}
                        draggable={canEdit}
                        onDragStart={() => setDragId(p.id)}
                        onDragEnd={() => setDragId(null)}
                        onClick={() => router.push(`/posts/${p.id}`)}
                        className={`group cursor-pointer truncate rounded border px-1.5 py-1 text-[11px] ${
                          beforeEmbargo
                            ? "border-[var(--danger)]/40 bg-[var(--danger-bg)]"
                            : "border-[var(--border)] bg-[var(--surface)]"
                        } hover:border-[var(--accent)]`}
                        title={p.title}
                      >
                        <span className="flex items-center gap-1">
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              TONE_DOT[STATUS_TONE[p.status].tone]
                            }`}
                          />
                          <span className="scale-90">
                            {PLATFORM_LABELS[p.platform]}
                          </span>
                          {beforeEmbargo && (
                            <AlertTriangle
                              size={10}
                              className="text-[var(--danger)]"
                            />
                          )}
                        </span>
                        <span className="block truncate">{p.title}</span>
                      </div>
                    );
                  })}
                  {posts.length > (view === "week" ? 12 : 4) && (
                    <p className="px-1 text-[10px] text-[var(--muted)]">
                      他 {posts.length - (view === "week" ? 12 : 4)} 件
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
        <span className="flex items-center gap-1">
          <PlatformIcon platform="x" size="sm" /> 媒体アイコンで判別
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[var(--success)]" /> ステータス色
        </span>
        <span className="flex items-center gap-1">
          <AlertTriangle size={11} className="text-[var(--danger)]" />
          解禁前の公開予定
        </span>
      </div>
    </div>
  );
}
