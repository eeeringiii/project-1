"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Play, RotateCw } from "lucide-react";
import { Card, CardHeader, Button } from "@/components/ui/primitives";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/StatusBadge";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStore } from "@/repositories/store";
import { useToast } from "@/components/ui/Toast";
import { can } from "@/services/permissions";
import { canRetry, isDue, MAX_RETRY } from "@/services/publishing";
import {
  PLATFORM_LABELS,
  PUBLISHING_JOB_STATUS_LABELS,
  PUBLISHING_JOB_TONE,
} from "@/constants";
import { formatDateTimeJa, relativeJa } from "@/lib/date";

export function PublishingView() {
  const { state, currentUser, processDueJobs, retryJob } = useStore();
  const toast = useToast();
  const canEdit = can(currentUser.role, "calendar.edit");

  const jobs = useMemo(
    () =>
      [...state.publishingJobs].sort((a, b) =>
        a.scheduledAt < b.scheduledAt ? 1 : -1,
      ),
    [state.publishingJobs],
  );

  const now = new Date();
  const counts = {
    queued: jobs.filter((j) => j.status === "queued").length,
    due: jobs.filter((j) => isDue(j, now)).length,
    succeeded: jobs.filter((j) => j.status === "succeeded").length,
    failed: jobs.filter((j) => j.status === "failed").length,
  };

  const postTitle = (id: string) =>
    state.posts.find((p) => p.id === id)?.title ?? "（削除済み投稿）";
  const resultForJob = (jobId: string) =>
    state.publishingResults.find((r) => r.publishingJobId === jobId);

  function runNow() {
    const r = processDueJobs();
    if (r.processed === 0) {
      toast.show("実行対象（予定時刻を過ぎた待機中ジョブ）はありません", "info");
    } else {
      toast.show(
        `${r.processed}件を処理しました（成功${r.succeeded} / 失敗${r.failed}）`,
        r.failed > 0 ? "warning" : "success",
      );
    }
  }

  return (
    <div>
      <PageHeader
        title="配信ジョブ"
        description="承認済み→予約済みの投稿を配信キューで管理します。現段階では実際のSNS投稿は行わずモック実行します。"
        action={
          canEdit && (
            <Button variant="primary" onClick={runNow}>
              <Play size={15} />
              配信処理を実行
            </Button>
          )
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="待機中" value={counts.queued} icon={<Clock size={16} />} tone="info" />
        <Stat
          label="予定超過（実行対象）"
          value={counts.due}
          icon={<AlertTriangle size={16} />}
          tone="warning"
        />
        <Stat
          label="成功"
          value={counts.succeeded}
          icon={<CheckCircle2 size={16} />}
          tone="success"
        />
        <Stat
          label="失敗"
          value={counts.failed}
          icon={<AlertTriangle size={16} />}
          tone="danger"
        />
      </div>

      <div className="mb-4 rounded-xl border border-[var(--info)]/25 bg-[var(--info-bg)] px-4 py-3 text-xs text-[var(--info)]">
        本番運用では、予約時刻に応じて自動実行されます（Vercel Cron →{" "}
        <code>/api/cron/publish</code>、Supabase接続時）。この画面の「配信処理を実行」は、その処理を手動で試すためのものです（モック投稿）。
      </div>

      <Card className="overflow-hidden">
        <CardHeader title={`ジョブ一覧（${jobs.length}）`} />
        {jobs.length === 0 ? (
          <EmptyState
            title="配信ジョブがありません"
            description="投稿を「承認済み」→「予約する」と、ここにジョブが作成されます。"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-2)] text-left text-xs text-[var(--muted)]">
                  <th className="px-4 py-2.5">投稿</th>
                  <th className="px-4 py-2.5">媒体</th>
                  <th className="px-4 py-2.5">予定時刻</th>
                  <th className="px-4 py-2.5">状態</th>
                  <th className="px-4 py-2.5">再試行</th>
                  <th className="px-4 py-2.5">結果 / エラー</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => {
                  const result = resultForJob(j.id);
                  const due = isDue(j, now);
                  return (
                    <tr
                      key={j.id}
                      className="border-b border-[var(--border)] last:border-0 align-top"
                    >
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/posts/${j.socialPostId}`}
                          className="font-medium hover:text-[var(--info)] hover:underline"
                        >
                          {postTitle(j.socialPostId)}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-1.5">
                          <PlatformIcon platform={j.platform} size="sm" />
                          <span className="text-xs">
                            {PLATFORM_LABELS[j.platform]}
                          </span>
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-xs text-[var(--ink-2)]">
                        {formatDateTimeJa(j.scheduledAt)}
                        {due && (
                          <span className="ml-1 text-[var(--warning)]">（超過）</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge tone={PUBLISHING_JOB_TONE[j.status]}>
                          {PUBLISHING_JOB_STATUS_LABELS[j.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-[var(--ink-2)]">
                        {j.retryCount} / {MAX_RETRY}
                      </td>
                      <td className="max-w-xs px-4 py-2.5 text-xs">
                        {result?.publishedUrl ? (
                          <a
                            href={result.publishedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all text-[var(--info)] hover:underline"
                          >
                            {result.publishedUrl}
                          </a>
                        ) : j.lastError ? (
                          <span className="text-[var(--danger)]">{j.lastError}</span>
                        ) : (
                          <span className="text-[var(--muted)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {canEdit && canRetry(j) && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              const ok = retryJob(j.id);
                              toast.show(
                                ok ? "再試行に成功しました" : "再試行しましたが失敗しました",
                                ok ? "success" : "error",
                              );
                            }}
                          >
                            <RotateCw size={13} />
                            再試行
                          </Button>
                        )}
                        {j.status === "failed" && !canRetry(j) && (
                          <span className="text-xs text-[var(--muted)]">
                            上限到達
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {state.publishingResults.length > 0 && (
        <Card className="mt-4">
          <CardHeader title="配信結果（直近）" />
          <ul className="divide-y divide-[var(--border)]">
            {state.publishingResults.slice(0, 8).map((r) => (
              <li key={r.id} className="px-5 py-2.5 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="success">投稿完了</Badge>
                  <span className="text-xs text-[var(--muted)]">
                    外部ID: {r.externalPostId}
                  </span>
                  <span className="ml-auto text-xs text-[var(--muted)]">
                    {relativeJa(r.createdAt)}
                  </span>
                </div>
                {r.publishedUrl && (
                  <a
                    href={r.publishedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 block break-all text-xs text-[var(--info)] hover:underline"
                  >
                    {r.publishedUrl}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "info" | "warning" | "success" | "danger";
}) {
  const cls: Record<string, string> = {
    info: "text-[var(--info)]",
    warning: "text-[var(--warning)]",
    success: "text-[var(--success)]",
    danger: "text-[var(--danger)]",
  };
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--muted)]">{label}</span>
        <span className={cls[tone]}>{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </Card>
  );
}
