"use client";

import { useState } from "react";
import { GENRE_OPTIONS, DURATION_OPTIONS, FREQUENCY_OPTIONS } from "@/constants/oshiOptions";
import { generateResumeImage, type OtakuResumeData } from "@/lib/share/generateResumeImage";
import { absoluteUrl } from "@/lib/site";
import { trackEvent } from "@/lib/analytics";

const empty: OtakuResumeData = {};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-text">{label}</span>
      {children}
    </label>
  );
}

/**
 * ヲタク履歴書。推し活プロフィールを入力すると、1枚のカードに整形して保存・シェアできる。
 * 入力情報はサーバーへ送信せず、端末内でのみ処理する（画像もブラウザ上で生成）。
 */
export default function OtakuResume() {
  const [data, setData] = useState<OtakuResumeData>(empty);
  const [imageState, setImageState] = useState<"idle" | "working" | "error">("idle");
  const [copied, setCopied] = useState(false);

  const set = (key: keyof OtakuResumeData) => (v: string) =>
    setData((d) => ({ ...d, [key]: v }));

  const shareUrl = absoluteUrl("/resume");
  const shareText =
    "推し活のプロフィールを「ヲタク履歴書」にまとめました。\nあなたも作ってみて！\n#OSHICOA16 #ヲタク履歴書";

  const saveImage = async () => {
    setImageState("working");
    try {
      const blob = await generateResumeImage(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "oshicoa16_resume.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      trackEvent("resume_saved");
      setImageState("idle");
    } catch {
      setImageState("error");
    }
  };

  const shareX = () => {
    trackEvent("resume_shared", { channel: "x" });
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      trackEvent("resume_shared", { channel: "copy" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("コピーしてください", `${shareText}\n${shareUrl}`);
    }
  };

  const previewRows = [
    ["推し", data.oshiName],
    ["ジャンル", data.genre],
    ["推し歴", data.duration],
    ["現場頻度", data.frequency],
  ] as const;
  const previewBlocks = [
    ["沼落ちのきっかけ", data.trigger],
    ["好きなところ", data.favoritePoint],
    ["推し活ポリシー", data.motto],
    ["布教の一言", data.pitch],
  ] as const;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* 入力フォーム */}
      <div className="panel p-6 sm:p-7">
        <div className="space-y-5">
          <Field label="ヲタクネーム（任意）">
            <input
              className="field"
              maxLength={24}
              value={data.displayName ?? ""}
              onChange={(e) => set("displayName")(e.target.value)}
              placeholder="表示名 / ハンドルネーム"
            />
          </Field>
          <Field label="推しの名前（任意）">
            <input
              className="field"
              maxLength={40}
              value={data.oshiName ?? ""}
              onChange={(e) => set("oshiName")(e.target.value)}
              placeholder="〇〇くん / 〇〇ちゃん"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ジャンル">
              <select className="field" value={data.genre ?? ""} onChange={(e) => set("genre")(e.target.value)}>
                <option value="">未選択</option>
                {GENRE_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="推し歴">
              <select className="field" value={data.duration ?? ""} onChange={(e) => set("duration")(e.target.value)}>
                <option value="">未選択</option>
                {DURATION_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="現場頻度">
            <select className="field" value={data.frequency ?? ""} onChange={(e) => set("frequency")(e.target.value)}>
              <option value="">未選択</option>
              {FREQUENCY_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="沼落ちのきっかけ（任意）">
            <textarea className="field" rows={2} maxLength={120} value={data.trigger ?? ""} onChange={(e) => set("trigger")(e.target.value)} placeholder="あの日のあの瞬間…" />
          </Field>
          <Field label="好きなところ（任意）">
            <textarea className="field" rows={2} maxLength={120} value={data.favoritePoint ?? ""} onChange={(e) => set("favoritePoint")(e.target.value)} placeholder="推しの、ここが尊い" />
          </Field>
          <Field label="推し活ポリシー（任意）">
            <textarea className="field" rows={2} maxLength={120} value={data.motto ?? ""} onChange={(e) => set("motto")(e.target.value)} placeholder="無理しない範囲で全力、など" />
          </Field>
          <Field label="布教の一言（任意）">
            <textarea className="field" rows={2} maxLength={120} value={data.pitch ?? ""} onChange={(e) => set("pitch")(e.target.value)} placeholder="とりあえずこれ見て、の一言" />
          </Field>

          <p className="rounded-lg border border-line bg-panel-soft p-3 text-xs text-text-sub leading-relaxed">
            入力内容はこの端末内でのみ使用され、サーバーへは送信されません。画像もブラウザ上で生成します。
          </p>
        </div>
      </div>

      {/* プレビュー & 操作 */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="panel edge-glow p-6 sm:p-7">
          <p className="type-code text-center text-xs text-purple">OTAKU RESUME</p>
          <h2 className="mt-1 text-center font-display text-2xl font-bold text-gradient">
            ヲタク履歴書
          </h2>
          <p className="mt-4 text-center">
            <span className="text-xs text-text-muted">ヲタクネーム</span>
            <br />
            <span className="font-display text-xl font-bold text-text">
              {data.displayName?.trim() || "名無しのヲタク"}
            </span>
          </p>

          <dl className="mt-5 space-y-2">
            {previewRows.map(([label, value]) => (
              <div key={label} className="flex gap-3 rounded-lg bg-panel-soft px-3 py-2 text-sm">
                <dt className="w-24 shrink-0 font-medium text-purple">{label}</dt>
                <dd className="text-text-sub">{value?.trim() || "—"}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 space-y-3">
            {previewBlocks.map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-bold text-pink">
                  <span className="sparkle mr-1" aria-hidden="true">✦</span>
                  {label}
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-text-sub">
                  {value?.trim() || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button type="button" onClick={saveImage} disabled={imageState === "working"} className="btn btn-primary text-sm disabled:opacity-60">
            画像を保存
          </button>
          <button type="button" onClick={shareX} className="btn btn-ghost text-sm">
            Xでシェア
          </button>
          <button type="button" onClick={copy} className="btn btn-ghost text-sm">
            {copied ? "コピーしました" : "リンクをコピー"}
          </button>
        </div>
        {imageState === "working" && (
          <p className="mt-3 text-center text-xs text-text-muted" role="status">画像を生成しています…</p>
        )}
        {imageState === "error" && (
          <p className="mt-3 text-center text-xs text-pink" role="alert">
            画像の生成に失敗しました。お使いのブラウザでは対応していない可能性があります。
          </p>
        )}
      </div>
    </div>
  );
}
