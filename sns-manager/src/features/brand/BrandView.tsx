"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui/primitives";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { useStore } from "@/repositories/store";
import { useToast } from "@/components/ui/Toast";
import { can } from "@/services/permissions";
import { PLATFORMS, PLATFORM_LABELS } from "@/constants";
import { brandRuleSchema } from "@/schemas";
import type { BrandRule, Platform } from "@/types/domain";

/** AI生成時に参照するブランドルールのプリセット（rule_type → 表示名） */
const RULE_TYPE_PRESETS: { type: string; label: string }[] = [
  { type: "artist_name", label: "アーティスト名" },
  { type: "profile", label: "公式プロフィール" },
  { type: "brand_concept", label: "ブランドコンセプト" },
  { type: "target_fan", label: "ターゲットファン" },
  { type: "tone_official", label: "公式アカウントの口調" },
  { type: "tone_artist", label: "本人アカウントの口調" },
  { type: "emoji_allow", label: "使用してよい絵文字" },
  { type: "emoji_deny", label: "使用しない絵文字" },
  { type: "forbidden_expression", label: "使用禁止表現" },
  { type: "ng_word", label: "NGワード" },
  { type: "proper_noun", label: "固有名詞辞書" },
  { type: "artist_hashtag", label: "共通ハッシュタグ" },
  { type: "hashtag_rule", label: "ハッシュタグルール" },
  { type: "cta", label: "CTAルール" },
  { type: "length_rule", label: "媒体別文字数ルール" },
  { type: "required_notice", label: "必須表記" },
  { type: "sponsor_notice", label: "スポンサー表記" },
  { type: "copyright_notice", label: "著作権表記" },
  { type: "url_rule", label: "URLルール" },
  { type: "datetime_rule", label: "日時表記ルール" },
  { type: "weekday_rule", label: "曜日表記ルール" },
  { type: "price_rule", label: "金額表記ルール" },
  { type: "artist_approval_condition", label: "本人確認が必要な投稿条件" },
];

function ruleTypeLabel(type: string): string {
  return RULE_TYPE_PRESETS.find((r) => r.type === type)?.label ?? type;
}

export function BrandView() {
  const { state, currentUser, upsertBrandRule, deleteBrandRule } = useStore();
  const toast = useToast();
  const artist = state.artists[0];
  const [editing, setEditing] = useState<BrandRule | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const canManage = can(currentUser.role, "brand.manage");
  const rules = state.brandRules;

  return (
    <div>
      <PageHeader
        title="ブランドルール設定"
        description="AI生成時に参照するルール。口調・NGワード・必須表記などを登録します。"
        action={
          canManage && (
            <Button variant="primary" onClick={() => setAddOpen(true)}>
              <Plus size={15} />
              ルールを追加
            </Button>
          )
        }
      />

      <Card className="mb-4">
        <CardHeader title="アーティスト基本情報" />
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 p-5 text-sm sm:grid-cols-2">
          <Info label="アーティスト名" value={artist?.name ?? "—"} />
          <Info label="表記（ステージ名）" value={artist?.stageName ?? "—"} />
          <div className="sm:col-span-2">
            <Info label="公式プロフィール" value={artist?.profile ?? "—"} />
          </div>
          <div className="sm:col-span-2">
            <Info label="ブランドコンセプト" value={artist?.brandConcept ?? "—"} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title={`登録済みルール（${rules.length}）`} />
        {rules.length === 0 ? (
          <EmptyState
            title="ルールがありません"
            description="「ルールを追加」から登録してください。"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-2)] text-left text-xs text-[var(--muted)]">
                  <th className="px-4 py-2.5">種別</th>
                  <th className="px-4 py-2.5">名称</th>
                  <th className="px-4 py-2.5">内容</th>
                  <th className="px-4 py-2.5">対象媒体</th>
                  <th className="px-4 py-2.5">状態</th>
                  {canManage && <th className="px-4 py-2.5" />}
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-[var(--ink-2)]">
                      {ruleTypeLabel(r.ruleType)}
                    </td>
                    <td className="px-4 py-2.5 font-medium">{r.ruleName}</td>
                    <td className="max-w-xs px-4 py-2.5 text-xs text-[var(--ink-2)]">
                      <span className="line-clamp-2">{r.ruleValue}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      {r.platform ? PLATFORM_LABELS[r.platform] : "共通"}
                    </td>
                    <td className="px-4 py-2.5">
                      {r.isActive ? (
                        <Badge tone="success">有効</Badge>
                      ) : (
                        <Badge tone="neutral">無効</Badge>
                      )}
                    </td>
                    {canManage && (
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditing(r)}
                            className="rounded p-1 text-[var(--muted)] hover:bg-[var(--surface-2)]"
                            aria-label="編集"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteId(r.id)}
                            className="rounded p-1 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--danger)]"
                            aria-label="削除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {(addOpen || editing) && (
        <RuleModal
          rule={editing}
          onClose={() => {
            setAddOpen(false);
            setEditing(null);
          }}
          onSave={(rule) => {
            upsertBrandRule(rule);
            toast.show("ルールを保存しました", "success");
            setAddOpen(false);
            setEditing(null);
          }}
          artistId={artist?.id ?? "artist_1"}
        />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="ルールを削除"
        message="このルールを削除します。よろしいですか？"
        confirmLabel="削除する"
        danger
        onConfirm={() => {
          if (deleteId) deleteBrandRule(deleteId);
          toast.show("ルールを削除しました", "info");
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="whitespace-pre-wrap text-[var(--ink)]">{value}</p>
    </div>
  );
}

function RuleModal({
  rule,
  onClose,
  onSave,
  artistId,
}: {
  rule: BrandRule | null;
  onClose: () => void;
  onSave: (rule: BrandRule) => void;
  artistId: string;
}) {
  const [ruleType, setRuleType] = useState(rule?.ruleType ?? "tone_official");
  const [ruleName, setRuleName] = useState(rule?.ruleName ?? "");
  const [ruleValue, setRuleValue] = useState(rule?.ruleValue ?? "");
  const [platform, setPlatform] = useState<Platform | "">(rule?.platform ?? "");
  const [isActive, setIsActive] = useState(rule?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);

  function save() {
    const parsed = brandRuleSchema.safeParse({
      ruleType,
      ruleName: ruleName || ruleTypeLabel(ruleType),
      ruleValue,
      platform: platform || null,
      isActive,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "入力エラー");
      return;
    }
    const nowIso = new Date().toISOString();
    onSave({
      id: rule?.id ?? `rule_${Date.now().toString(36)}`,
      artistId,
      ruleType: parsed.data.ruleType,
      ruleName: parsed.data.ruleName,
      ruleValue: parsed.data.ruleValue,
      platform: parsed.data.platform,
      isActive: parsed.data.isActive,
      createdAt: rule?.createdAt ?? nowIso,
      updatedAt: nowIso,
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={rule ? "ルールを編集" : "ルールを追加"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={save}>
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="種別">
          <Select value={ruleType} onChange={(e) => setRuleType(e.target.value)}>
            {RULE_TYPE_PRESETS.map((r) => (
              <option key={r.type} value={r.type}>
                {r.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="名称" hint="空欄の場合は種別名を使用します">
          <Input
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            placeholder={ruleTypeLabel(ruleType)}
          />
        </Field>
        <Field label="内容" required error={error ?? undefined}>
          <Textarea
            value={ruleValue}
            onChange={(e) => setRuleValue(e.target.value)}
            rows={3}
            placeholder="例: 丁寧・簡潔。過度な絵文字は避ける。"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="対象媒体">
            <Select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform | "")}
            >
              <option value="">共通（全媒体）</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABELS[p]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="状態">
            <label className="flex items-center gap-2 pt-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4"
              />
              有効にする
            </label>
          </Field>
        </div>
      </div>
    </Modal>
  );
}
