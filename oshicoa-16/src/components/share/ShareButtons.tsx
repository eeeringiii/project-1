"use client";

import { useState } from "react";
import type { ChartMetricId, OshicoaType, OtakuTag } from "@/types";
import { buildXShareLink, buildLineShareLink, buildShareUrl, buildXShareText } from "@/lib/share/shareText";
import { generateResultImage, type ImageFormat } from "@/lib/share/generateResultImage";
import { trackEvent } from "@/lib/analytics";

type Props = {
  type: OshicoaType;
  tags: OtakuTag[];
  chartScores: Record<ChartMetricId, number>;
  oshiName?: string;
};

export default function ShareButtons({ type, tags, chartScores, oshiName }: Props) {
  const [copied, setCopied] = useState(false);
  const [imageState, setImageState] = useState<"idle" | "working" | "error">("idle");
  const shareUrl = buildShareUrl(type.code);

  const openWindow = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  const handleX = () => {
    trackEvent("result_shared_x", { typeCode: type.code });
    openWindow(buildXShareLink(type, tags, oshiName));
  };

  const handleLine = () => {
    trackEvent("result_shared_line", { typeCode: type.code });
    openWindow(buildLineShareLink(type.code));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackEvent("result_url_copied", { typeCode: type.code });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API不可環境: 手動コピー用にpromptで提示。
      window.prompt("以下のURLをコピーしてください", shareUrl);
    }
  };

  const handleWebShare = async () => {
    const text = buildXShareText(type, tags, oshiName);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "OSHICOA 16", text, url: shareUrl });
      } catch {
        // ユーザーキャンセル等は無視。
      }
    } else {
      handleCopy();
    }
  };

  const handleSaveImage = async (format: ImageFormat) => {
    setImageState("working");
    try {
      const blob = await generateResultImage({ type, tags, chartScores, oshiName, format });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `oshicoa16_${type.code}_${format}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      trackEvent("result_image_saved", { typeCode: type.code, format });
      setImageState("idle");
    } catch {
      setImageState("error");
    }
  };

  return (
    <div className="panel p-6">
      <p className="type-code text-xs text-violet mb-4">SHARE</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button type="button" onClick={handleX} className="btn btn-ghost text-sm">
          Xで投稿
        </button>
        <button type="button" onClick={handleLine} className="btn btn-ghost text-sm">
          LINEで送る
        </button>
        <button type="button" onClick={handleCopy} className="btn btn-ghost text-sm">
          {copied ? "コピーしました" : "URLをコピー"}
        </button>
        <button type="button" onClick={handleWebShare} className="btn btn-ghost text-sm">
          その他で共有
        </button>
      </div>

      <div className="mt-4 border-t border-line pt-4">
        <p className="mb-3 text-xs text-text-muted">結果画像を保存（SNS投稿用）</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleSaveImage("square")}
            disabled={imageState === "working"}
            className="btn btn-primary text-sm disabled:opacity-60"
          >
            正方形で保存
          </button>
          <button
            type="button"
            onClick={() => handleSaveImage("portrait")}
            disabled={imageState === "working"}
            className="btn btn-primary text-sm disabled:opacity-60"
          >
            縦長で保存
          </button>
        </div>
        {imageState === "working" && (
          <p className="mt-3 text-xs text-text-muted" role="status">
            画像を生成しています…
          </p>
        )}
        {imageState === "error" && (
          <p className="mt-3 text-xs text-pink" role="alert">
            画像の生成に失敗しました。お使いのブラウザでは対応していない可能性があります。上のボタンから通常のシェアをお試しください。
          </p>
        )}
      </div>
    </div>
  );
}
