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
  ctx.strokeStyle = "rgba(150,120,210,0.3)";
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
  grad.addColorStop(0, "rgba(255,143,192,0.6)");
  grad.addColorStop(1, "rgba(157,127,224,0.45)");
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "#ff8fc0";
  ctx.lineWidth = 3;
  ctx.stroke();
}

/** 角丸矩形パスを引く（塗り/線は呼び出し側で行う）。 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
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

  // 背景（パステル）
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#f3ecfc");
  bg.addColorStop(1, "#fbeef6");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // 淡いグロー
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, w * 0.7);
  glow.addColorStop(0, "rgba(255,182,220,0.4)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // 丸い枠
  ctx.strokeStyle = "rgba(157,127,224,0.4)";
  ctx.lineWidth = 3;
  roundRect(ctx, 36, 36, w - 72, h - 72, 40);
  ctx.stroke();

  const pad = 90;
  ctx.textAlign = "left";

  // ロゴ
  ctx.fillStyle = "#8b6fd6";
  ctx.font = `700 40px ${JP_FONT}`;
  ctx.fillText("OSHICOA 16", pad, 132);
  ctx.fillStyle = "#9a8dc0";
  ctx.font = `500 26px ${JP_FONT}`;
  ctx.textAlign = "right";
  ctx.fillText("ヲタク生態診断", w - pad, 130);
  ctx.textAlign = "left";

  // 推し名（あれば）
  let y = 250;
  if (oshiName) {
    ctx.fillStyle = "#7466a0";
    ctx.font = `500 34px ${JP_FONT}`;
    const line = fitText(ctx, `${oshiName}を推しているときのあなた`, w - pad * 2);
    ctx.fillText(line, pad, y);
    y += 20;
  }

  // タイプコード
  ctx.fillStyle = "#ff8fc0";
  ctx.font = `700 64px ${JP_FONT}`;
  ctx.fillText(type.code.split("").join(" "), pad, y + 90);

  // タイプ名
  ctx.fillStyle = "#4b3f77";
  ctx.font = `700 84px ${JP_FONT}`;
  ctx.fillText(fitText(ctx, type.name, w - pad * 2), pad, y + 190);

  // キャッチコピー
  ctx.fillStyle = "#6a5c95";
  ctx.font = `500 34px ${JP_FONT}`;
  ctx.fillText(fitText(ctx, `「${type.catchphrase}」`, w - pad * 2), pad, y + 250);

  // 業タグ
  if (tags.length) {
    ctx.fillStyle = "#e57fb8";
    ctx.font = `700 32px ${JP_FONT}`;
    const tagLine = tags.map((t) => `#${t.name}`).join("  ");
    ctx.fillText(fitText(ctx, tagLine, w - pad * 2), pad, y + 320);
  }

  // ミニレーダー
  const radarCy = format === "portrait" ? h - 340 : h - 250;
  drawMiniRadar(ctx, w - pad - 150, radarCy, 130, chartScores);

  // フッター
  ctx.fillStyle = "#9a8dc0";
  ctx.font = `500 28px ${JP_FONT}`;
  ctx.fillText("#OSHICOA16  #ヲタク生態診断", pad, h - 110);
  ctx.fillStyle = "#a99fc4";
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
