import type { ChartMetricId, OshicoaType, OtakuTag } from "@/types";
import { chartMetrics } from "@/data/chartMetrics";

export type ImageFormat = "square" | "portrait";

type Params = {
  type: OshicoaType;
  tags: OtakuTag[];
  chartScores: Record<ChartMetricId, number>;
  oshiName?: string;
  format: ImageFormat;
};

const SIZES: Record<ImageFormat, { w: number; h: number }> = {
  square: { w: 1080, h: 1080 },
  portrait: { w: 1080, h: 1350 },
};

const JP_FONT =
  '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", system-ui, sans-serif';

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
  return `${t}…`;
}

function drawMiniRadar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  values: Record<ChartMetricId, number>,
) {
  const count = chartMetrics.length;
  const angle = (i: number) => (Math.PI * 2 * i) / count - Math.PI / 2;

  // グリッド
  ctx.strokeStyle = "rgba(160,140,220,0.22)";
  ctx.lineWidth = 1.5;
  for (const ring of [0.5, 1]) {
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const a = angle(i);
      const x = cx + Math.cos(a) * radius * ring;
      const y = cy + Math.sin(a) * radius * ring;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // データ
  ctx.beginPath();
  chartMetrics.forEach((m, i) => {
    const v = Math.max(0, Math.min(100, values[m.id] ?? 0)) / 100;
    const a = angle(i);
    const x = cx + Math.cos(a) * radius * v;
    const y = cy + Math.sin(a) * radius * v;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  const grad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  grad.addColorStop(0, "rgba(217,70,239,0.55)");
  grad.addColorStop(1, "rgba(139,92,246,0.5)");
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "#ff5da2";
  ctx.lineWidth = 3;
  ctx.stroke();
}

/**
 * 結果カードをCanvasに描画してPNG Blobを返す。
 * ブラウザのシステムフォントで日本語を描画するため文字化けしない。
 * 呼び出し前にフォント読み込み完了を待つ（下部 waitForFonts 参照）。
 */
export async function generateResultImage(params: Params): Promise<Blob> {
  const { type, tags, chartScores, oshiName, format } = params;
  const { w, h } = SIZES[format];

  await waitForFonts();

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D コンテキストを取得できませんでした。");

  // 背景
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#0a0a12");
  bg.addColorStop(1, "#12101c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // 淡いグロー
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.32, 0, w * 0.5, h * 0.32, w * 0.7);
  glow.addColorStop(0, "rgba(139,92,246,0.22)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // 枠
  ctx.strokeStyle = "rgba(160,140,220,0.28)";
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, w - 80, h - 80);

  const pad = 90;
  ctx.textAlign = "left";

  // ロゴ
  ctx.fillStyle = "#c9b8ff";
  ctx.font = `700 40px ${JP_FONT}`;
  ctx.fillText("OSHICOA 16", pad, 130);
  ctx.fillStyle = "#9296b4";
  ctx.font = `500 26px ${JP_FONT}`;
  ctx.textAlign = "right";
  ctx.fillText("ヲタク生態診断", w - pad, 128);
  ctx.textAlign = "left";

  // 推し名（あれば）
  let y = 250;
  if (oshiName) {
    ctx.fillStyle = "#b7bad0";
    ctx.font = `500 34px ${JP_FONT}`;
    const line = fitText(ctx, `${oshiName}を推しているときのあなた`, w - pad * 2);
    ctx.fillText(line, pad, y);
    y += 20;
  }

  // タイプコード
  ctx.fillStyle = "#d946ef";
  ctx.font = `700 64px ${JP_FONT}`;
  ctx.fillText(type.code.split("").join(" "), pad, y + 90);

  // タイプ名
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 84px ${JP_FONT}`;
  ctx.fillText(fitText(ctx, type.name, w - pad * 2), pad, y + 190);

  // キャッチコピー
  ctx.fillStyle = "#b7bad0";
  ctx.font = `500 34px ${JP_FONT}`;
  ctx.fillText(fitText(ctx, `「${type.catchphrase}」`, w - pad * 2), pad, y + 250);

  // 業タグ
  if (tags.length) {
    ctx.fillStyle = "#ff5da2";
    ctx.font = `700 32px ${JP_FONT}`;
    const tagLine = tags.map((t) => `#${t.name}`).join("  ");
    ctx.fillText(fitText(ctx, tagLine, w - pad * 2), pad, y + 320);
  }

  // ミニレーダー
  const radarCy = format === "portrait" ? h - 340 : h - 250;
  drawMiniRadar(ctx, w - pad - 150, radarCy, 130, chartScores);

  // フッター
  ctx.fillStyle = "#9296b4";
  ctx.font = `500 28px ${JP_FONT}`;
  ctx.fillText("#OSHICOA16  #ヲタク生態診断", pad, h - 110);
  ctx.fillStyle = "#6f6f88";
  ctx.font = `500 24px ${JP_FONT}`;
  ctx.fillText("oshicoa16 — あなたの推し方の本性は？", pad, h - 70);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("画像の生成に失敗しました。"));
    }, "image/png");
  });
}

async function waitForFonts(): Promise<void> {
  try {
    if (typeof document !== "undefined" && "fonts" in document) {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready;
    }
  } catch {
    // フォント待機に失敗しても描画は続行する。
  }
}
