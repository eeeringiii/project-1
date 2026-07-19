"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ArrowUpDown, ShieldCheck } from "lucide-react";
import { Card, Button, Input, Select } from "@/components/ui/primitives";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStore } from "@/repositories/store";
import { useToast } from "@/components/ui/Toast";
import {
  PLATFORMS,
  PLATFORM_LABELS,
  POST_STATUSES,
  POST_TYPE_LABELS,
  STATUS_LABELS,
} from "@/constants";
import { dateKey, formatDateTimeJa, relativeJa } from "@/lib/date";
import type { PostStatus } from "@/types/domain";

type SortKey = "updated" | "scheduled" | "created";

export function PostListView() {
  const { state, changeStatus } = useStore();
  const toast = useToast();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") ?? "";

  const [keyword, setKeyword] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [campaign, setCampaign] = useState("");
  const [date, setDate] = useState("");
  const [sort, setSort] = useState<SortKey>("updated");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<PostStatus | "">("");

  const userName = (id: string) =>
    state.users.find((u) => u.id === id)?.name ?? "—";
  const campaignName = (id: string | null) =>
    id ? state.campaigns.find((c) => c.id === id)?.name ?? "—" : "—";

  const filtered = useMemo(() => {
    let list = [...state.posts];
    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(k) ||
          p.body.toLowerCase().includes(k),
      );
    }
    if (platform) list = list.filter((p) => p.platform === platform);
    if (status) list = list.filter((p) => p.status === status);
    if (campaign) list = list.filter((p) => p.campaignId === campaign);
    if (date)
      list = list.filter(
        (p) => p.scheduledAt && dateKey(p.scheduledAt) === date,
      );

    list.sort((a, b) => {
      if (sort === "scheduled") {
        return (a.scheduledAt ?? "9999") < (b.scheduledAt ?? "9999") ? -1 : 1;
      }
      if (sort === "created") {
        return a.createdAt < b.createdAt ? 1 : -1;
      }
      return a.updatedAt < b.updatedAt ? 1 : -1;
    });
    return list;
  }, [state.posts, keyword, platform, status, campaign, date, sort]);

  function toggleSelect(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((s) =>
      s.size === filtered.length
        ? new Set()
        : new Set(filtered.map((p) => p.id)),
    );
  }

  function applyBulk() {
    if (!bulkStatus || selected.size === 0) return;
    selected.forEach((id) => changeStatus(id, bulkStatus, "一括ステータス変更"));
    toast.show(
      `${selected.size}件を「${STATUS_LABELS[bulkStatus]}」に変更しました`,
      "success",
    );
    setSelected(new Set());
    setBulkStatus("");
  }

  const filtersActive =
    keyword || platform || status || campaign || date;

  return (
    <div>
      <PageHeader
        title="投稿一覧"
        description={`全 ${state.posts.length} 件`}
        action={
          <Link href="/content/new">
            <Button variant="primary">コンテンツ作成</Button>
          </Link>
        }
      />

      {/* フィルター */}
      <Card className="mb-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative lg:col-span-2">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="キーワード検索"
              className="pl-9"
            />
          </div>
          <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="">媒体（すべて）</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LABELS[p]}
              </option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">ステータス（すべて）</option>
            {POST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Select value={campaign} onChange={(e) => setCampaign(e.target.value)}>
            <option value="">キャンペーン（すべて）</option>
            {state.campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <ArrowUpDown size={14} />
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="w-auto py-1 text-xs"
            >
              <option value="updated">最終更新が新しい順</option>
              <option value="scheduled">公開予定が早い順</option>
              <option value="created">作成が新しい順</option>
            </Select>
          </div>
          {filtersActive && (
            <button
              onClick={() => {
                setKeyword("");
                setPlatform("");
                setStatus("");
                setCampaign("");
                setDate("");
              }}
              className="text-xs text-[var(--info)] hover:underline"
            >
              フィルターをクリア
            </button>
          )}
        </div>
      </Card>

      {/* 一括操作バー */}
      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--accent)]/30 bg-[var(--surface-2)] px-4 py-2.5 text-sm">
          <span className="font-medium">{selected.size}件を選択中</span>
          <Select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value as PostStatus)}
            className="w-auto py-1 text-xs"
          >
            <option value="">ステータスを選択</option>
            {POST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Button size="sm" variant="primary" onClick={applyBulk} disabled={!bulkStatus}>
            一括変更
          </Button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-[var(--muted)] hover:underline"
          >
            選択解除
          </button>
        </div>
      )}

      {/* テーブル（PC） */}
      <Card className="hidden overflow-hidden lg:block">
        {filtered.length === 0 ? (
          <EmptyState
            title="該当する投稿がありません"
            description="フィルター条件を変更してください。"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-2)] text-left text-xs text-[var(--muted)]">
                  <th className="w-10 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={
                        selected.size === filtered.length && filtered.length > 0
                      }
                      onChange={toggleAll}
                      aria-label="すべて選択"
                    />
                  </th>
                  <th className="px-3 py-2.5">タイトル</th>
                  <th className="px-3 py-2.5">媒体</th>
                  <th className="px-3 py-2.5">タイプ</th>
                  <th className="px-3 py-2.5">キャンペーン</th>
                  <th className="px-3 py-2.5">公開予定</th>
                  <th className="px-3 py-2.5">ステータス</th>
                  <th className="px-3 py-2.5">本人確認</th>
                  <th className="px-3 py-2.5">担当</th>
                  <th className="px-3 py-2.5">最終更新</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]"
                  >
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        aria-label="選択"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <Link
                        href={`/posts/${p.id}`}
                        className="font-medium text-[var(--ink)] hover:text-[var(--info)] hover:underline"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5">
                      <PlatformIcon platform={p.platform} size="sm" />
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[var(--ink-2)]">
                      {POST_TYPE_LABELS[p.postType] ?? p.postType}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[var(--ink-2)]">
                      {campaignName(p.campaignId)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-[var(--ink-2)]">
                      {p.scheduledAt ? formatDateTimeJa(p.scheduledAt) : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-3 py-2.5">
                      {p.requiresArtistApproval ? (
                        <span className="inline-flex items-center gap-1 text-xs text-[var(--warning)]">
                          <ShieldCheck size={13} />
                          必要
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--muted)]">不要</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[var(--ink-2)]">
                      {userName(p.createdBy)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-[var(--muted)]">
                      {relativeJa(p.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* カード（モバイル） */}
      <div className="space-y-2 lg:hidden">
        {filtered.length === 0 ? (
          <Card>
            <EmptyState title="該当する投稿がありません" />
          </Card>
        ) : (
          filtered.map((p) => (
            <Link key={p.id} href={`/posts/${p.id}`}>
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <PlatformIcon platform={p.platform} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      {POST_TYPE_LABELS[p.postType] ?? p.postType} ・{" "}
                      {campaignName(p.campaignId)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status={p.status} />
                      {p.requiresArtistApproval && (
                        <span className="inline-flex items-center gap-1 text-xs text-[var(--warning)]">
                          <ShieldCheck size={12} />
                          本人確認
                        </span>
                      )}
                      {p.scheduledAt && (
                        <span className="text-xs text-[var(--muted)]">
                          {formatDateTimeJa(p.scheduledAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
