"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  History,
  Info,
  Send,
  ShieldCheck,
  Trash2,
  Undo2,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Textarea,
} from "@/components/ui/primitives";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { useStore } from "@/repositories/store";
import { useToast } from "@/components/ui/Toast";
import { can } from "@/services/permissions";
import { checkPost } from "@/services/warnings";
import { extractFromPost } from "@/services/important-facts";
import { nextAfterStaffReview } from "@/services/status-flow";
import {
  PLATFORM_LABELS,
  PLATFORM_MAX_LENGTH,
  POST_TYPE_LABELS,
  STATUS_LABELS,
} from "@/constants";
import { formatDateTimeJa, relativeJa } from "@/lib/date";
import { PostPreview } from "./PostPreview";

type Tab = "edit" | "preview" | "facts" | "history";

export function PostDetailView({ postId }: { postId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { state, currentUser, updatePost, changeStatus, deletePost } =
    useStore();

  const post = state.posts.find((p) => p.id === postId);

  const [tab, setTab] = useState<Tab>("edit");
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionComment, setRevisionComment] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  // 編集フォーム state（post から初期化）
  const [title, setTitle] = useState(post?.title ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [hashtags, setHashtags] = useState(post?.hashtags.join(", ") ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    post?.scheduledAt ? toLocalInput(post.scheduledAt) : "",
  );
  const [requiresArtistApproval, setRequiresArtistApproval] = useState(
    post?.requiresArtistApproval ?? false,
  );

  const source = post?.contentSourceId
    ? state.contentSources.find((c) => c.id === post.contentSourceId)
    : null;

  const warnings = useMemo(() => {
    if (!post) return [];
    return checkPost({
      post: {
        ...post,
        title,
        body,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        requiresArtistApproval,
      },
      source,
      assets: state.mediaAssets,
      siblings: state.posts,
    });
  }, [post, title, body, scheduledAt, requiresArtistApproval, source, state]);

  const facts = useMemo(
    () => (post ? extractFromPost({ ...post, title, body }, source) : []),
    [post, title, body, source],
  );

  const versions = state.postVersions
    .filter((v) => v.socialPostId === postId)
    .sort((a, b) => b.versionNumber - a.versionNumber);
  const histories = state.statusHistories
    .filter((h) => h.socialPostId === postId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  if (!post) {
    return (
      <div>
        <PageHeader title="投稿詳細" />
        <Card>
          <EmptyState
            title="投稿が見つかりません"
            action={
              <Button variant="secondary" onClick={() => router.push("/posts")}>
                投稿一覧へ
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const userName = (id: string | null) =>
    id ? state.users.find((u) => u.id === id)?.name ?? "—" : "—";

  function save(showToast = true) {
    updatePost(
      postId,
      {
        title,
        body,
        hashtags: hashtags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        requiresArtistApproval,
      },
      { changeSummary: "内容を編集" },
    );
    if (showToast) toast.show("下書きを保存しました", "success");
  }

  function doTransition(next: Parameters<typeof changeStatus>[1], comment?: string) {
    save(false);
    changeStatus(postId, next, comment);
    toast.show(`ステータスを「${STATUS_LABELS[next]}」に変更しました`, "success");
  }

  function requestReview() {
    doTransition("staff_review");
  }
  function approve() {
    const next = nextAfterStaffReview({ ...post!, requiresArtistApproval });
    doTransition(next);
  }
  function artistApprove() {
    doTransition("approved");
  }
  function schedule() {
    if (!scheduledAt) {
      toast.show("公開予定日時を設定してください", "warning");
      setTab("edit");
      return;
    }
    doTransition("scheduled");
  }
  function submitRevision() {
    doTransition("revision_requested", revisionComment || "修正をお願いします");
    setRevisionOpen(false);
    setRevisionComment("");
  }

  // 権限に応じた操作可否
  const canEdit = can(currentUser.role, "post.edit");
  const canRequest = can(currentUser.role, "post.request_review");
  const canApprove = can(currentUser.role, "post.approve");
  const canArtistApprove = can(currentUser.role, "post.artist_approve");
  const canSchedule = can(currentUser.role, "calendar.edit");

  const errorCount = warnings.filter((w) => w.level === "error").length;

  const TABS: { key: Tab; label: string; icon: typeof Info }[] = [
    { key: "edit", label: "編集", icon: Send },
    { key: "preview", label: "プレビュー", icon: Info },
    { key: "facts", label: "重要情報", icon: ShieldCheck },
    { key: "history", label: "履歴", icon: History },
  ];

  return (
    <div>
      {/* 投稿ヘッダ（媒体アイコン＋タイトル＋ステータス） */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <PlatformIcon platform={post.platform} />
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{post.title}</h1>
            <p className="text-xs text-[var(--muted)]">
              {PLATFORM_LABELS[post.platform]} ・{" "}
              {POST_TYPE_LABELS[post.postType] ?? post.postType}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={post.status} />
          {post.requiresArtistApproval && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--warning)]/30 bg-[var(--warning-bg)] px-2.5 py-0.5 text-xs text-[var(--warning)]">
              <ShieldCheck size={12} />
              本人確認 {post.artistApprovedAt ? "済" : "未"}
            </span>
          )}
        </div>
      </div>

      {/* 警告バナー */}
      {errorCount > 0 && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger)]">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>
            投稿前に解決すべきエラーが {errorCount} 件あります。「重要情報」タブで確認してください。
          </span>
        </div>
      )}

      {/* タブ */}
      <div className="mb-4 flex gap-1 border-b border-[var(--border)]">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          const badge =
            t.key === "facts" && warnings.length > 0 ? warnings.length : null;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors ${
                active
                  ? "border-[var(--accent)] font-medium text-[var(--ink)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--ink-2)]"
              }`}
            >
              <Icon size={15} />
              {t.label}
              {badge && (
                <span className="rounded-full bg-[var(--danger)] px-1.5 text-[10px] text-white">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {tab === "edit" && (
            <Card>
              <CardHeader title="投稿内容の編集" />
              <div className="space-y-4 p-5">
                <Field label="管理用タイトル" required>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={!canEdit}
                  />
                </Field>
                <Field
                  label="本文"
                  required
                  hint={`${body.length} / ${PLATFORM_MAX_LENGTH[post.platform]} 文字`}
                  error={
                    body.length > PLATFORM_MAX_LENGTH[post.platform]
                      ? "文字数制限を超えています"
                      : undefined
                  }
                >
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={8}
                    disabled={!canEdit}
                  />
                </Field>
                <Field label="ハッシュタグ（カンマ区切り）">
                  <Input
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    disabled={!canEdit}
                  />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="公開予定日時">
                    <Input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      disabled={!canEdit}
                    />
                  </Field>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 pb-2 text-sm">
                      <input
                        type="checkbox"
                        checked={requiresArtistApproval}
                        onChange={(e) =>
                          setRequiresArtistApproval(e.target.checked)
                        }
                        disabled={!canEdit}
                        className="h-4 w-4"
                      />
                      本人確認を必須にする
                    </label>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex justify-end">
                    <Button variant="secondary" onClick={() => save()}>
                      下書き保存
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {tab === "preview" && (
            <Card>
              <CardHeader title="投稿プレビュー" />
              <div className="p-5">
                <PostPreview
                  platform={post.platform}
                  title={title}
                  body={body}
                  hashtags={hashtags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)}
                  artistName={state.artists[0]?.name ?? "アーティスト"}
                />
              </div>
            </Card>
          )}

          {tab === "facts" && (
            <div className="space-y-4">
              <Card>
                <CardHeader
                  title="投稿前チェック"
                  icon={<AlertTriangle size={16} />}
                />
                <div className="p-5">
                  {warnings.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-[var(--success)]">
                      <CheckCircle2 size={16} />
                      問題は見つかりませんでした。
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {warnings.map((w, i) => (
                        <li
                          key={i}
                          className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                            w.level === "error"
                              ? "border-[var(--danger)]/30 bg-[var(--danger-bg)] text-[var(--danger)]"
                              : "border-[var(--warning)]/30 bg-[var(--warning-bg)] text-[var(--warning)]"
                          }`}
                        >
                          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                          <span>
                            <strong className="mr-1">
                              {w.level === "error" ? "エラー" : "警告"}:
                            </strong>
                            {w.message}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>

              <Card>
                <CardHeader title="抽出された重要情報" />
                <div className="p-5">
                  {facts.length === 0 ? (
                    <p className="text-sm text-[var(--muted)]">
                      重要情報は抽出されませんでした。
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {facts.map((f, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-[var(--border)] px-3 py-2"
                        >
                          <p className="text-xs text-[var(--muted)]">{f.label}</p>
                          <p className="text-sm font-medium">{f.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-4">
              <Card>
                <CardHeader
                  title="ステータス履歴"
                  icon={<Clock size={16} />}
                />
                {histories.length === 0 ? (
                  <EmptyState title="履歴はまだありません" />
                ) : (
                  <ul className="divide-y divide-[var(--border)]">
                    {histories.map((h) => (
                      <li key={h.id} className="px-5 py-3 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          {h.previousStatus && (
                            <>
                              <StatusBadge status={h.previousStatus} />
                              <span className="text-[var(--muted)]">→</span>
                            </>
                          )}
                          <StatusBadge status={h.newStatus} />
                          <span className="ml-auto text-xs text-[var(--muted)]">
                            {formatDateTimeJa(h.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          操作者: {userName(h.changedBy)}
                          {h.comment && ` ・ ${h.comment}`}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card>
                <CardHeader title="バージョン履歴" />
                {versions.length === 0 ? (
                  <EmptyState title="バージョン履歴はまだありません" />
                ) : (
                  <ul className="divide-y divide-[var(--border)]">
                    {versions.map((v) => (
                      <li key={v.id} className="px-5 py-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">v{v.versionNumber}</span>
                          <span className="text-xs text-[var(--muted)]">
                            {userName(v.changedBy)} ・ {relativeJa(v.createdAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          {v.changeSummary}
                        </p>
                        <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-[var(--ink-2)]">
                          {v.body}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* 右カラム: 承認アクション / メタ */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="承認フロー" />
            <div className="space-y-2 p-5">
              {(post.status === "draft" ||
                post.status === "ai_generated" ||
                post.status === "revision_requested") &&
                canRequest && (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={requestReview}
                  >
                    <Send size={14} />
                    確認依頼を出す
                  </Button>
                )}

              {post.status === "staff_review" && canApprove && (
                <Button variant="primary" className="w-full" onClick={approve}>
                  <CheckCircle2 size={14} />
                  {requiresArtistApproval ? "本人確認へ回す" : "承認する"}
                </Button>
              )}

              {post.status === "artist_review" && canArtistApprove && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={artistApprove}
                >
                  <ShieldCheck size={14} />
                  本人として承認する
                </Button>
              )}

              {post.status === "approved" && canSchedule && (
                <Button variant="gold" className="w-full" onClick={schedule}>
                  <Clock size={14} />
                  予約する
                </Button>
              )}

              {post.status === "failed" && canSchedule && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => doTransition("scheduled")}
                >
                  <Undo2 size={14} />
                  再実行（再予約）
                </Button>
              )}

              {["staff_review", "artist_review", "approved"].includes(
                post.status,
              ) &&
                (canApprove || canArtistApprove) && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setRevisionOpen(true)}
                  >
                    <Undo2 size={14} />
                    差し戻す（修正依頼）
                  </Button>
                )}

              {!["published", "cancelled"].includes(post.status) && canEdit && (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => doTransition("cancelled", "投稿を取り消し")}
                >
                  取り消す
                </Button>
              )}

              {post.status === "published" && (
                <p className="text-center text-xs text-[var(--success)]">
                  投稿完了済みです
                </p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="投稿情報" />
            <dl className="space-y-2.5 p-5 text-sm">
              <Meta label="作成者" value={userName(post.createdBy)} />
              <Meta label="承認者" value={userName(post.approvedBy)} />
              <Meta
                label="承認日時"
                value={post.approvedAt ? formatDateTimeJa(post.approvedAt) : "—"}
              />
              <Meta
                label="本人承認"
                value={
                  post.artistApprovedAt
                    ? formatDateTimeJa(post.artistApprovedAt)
                    : "未"
                }
              />
              <Meta
                label="解禁日時"
                value={formatDateTimeJa(post.embargoAt)}
              />
              <Meta
                label="公開URL"
                value={post.publishedUrl ?? "—"}
              />
              <Meta label="最終更新" value={relativeJa(post.updatedAt)} />
              {post.errorMessage && (
                <div className="rounded-lg bg-[var(--danger-bg)] px-3 py-2 text-xs text-[var(--danger)]">
                  {post.errorMessage}
                </div>
              )}
            </dl>
          </Card>

          {canEdit && (
            <Button
              variant="ghost"
              className="w-full text-[var(--danger)]"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 size={14} />
              この投稿を削除
            </Button>
          )}
        </div>
      </div>

      {/* 差し戻しモーダル */}
      <Modal
        open={revisionOpen}
        onClose={() => setRevisionOpen(false)}
        title="差し戻し（修正依頼）"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRevisionOpen(false)}>
              キャンセル
            </Button>
            <Button variant="primary" onClick={submitRevision}>
              修正依頼を送る
            </Button>
          </>
        }
      >
        <Field label="修正コメント" hint="どこをどう直してほしいかを記入してください">
          <Textarea
            value={revisionComment}
            onChange={(e) => setRevisionComment(e.target.value)}
            rows={4}
            placeholder="例: 「スワイプ」を「詳細はこちら」に変更してください。"
          />
        </Field>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title="投稿を削除"
        message="この投稿を削除します。取り消せません。よろしいですか？"
        confirmLabel="削除する"
        danger
        onConfirm={() => {
          deletePost(postId);
          toast.show("投稿を削除しました", "info");
          router.push("/posts");
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-xs text-[var(--muted)]">{label}</dt>
      <dd className="break-all text-right text-[var(--ink)]">{value}</dd>
    </div>
  );
}

/** ISO → datetime-local の value（ローカル時刻） */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}
