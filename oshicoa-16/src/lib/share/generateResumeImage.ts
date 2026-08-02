export type OtakuResumeData = {
  displayName?: string;
  oshiName?: string;
  genre?: string;
  duration?: string;
  frequency?: string;
  trigger?: string;
  favoritePoint?: string;
  motto?: string;
  pitch?: string;
};

const JP_FONT =
  '"Zen Maru Gothic", "Hiragino Maru Gothic ProN", "Yu Gothic", system-ui, sans-serif';

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

/** テキストを最大幅で折り返して描画し、次のy座標を返す。 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const chars = [...text];
  let line = "";
  let cy = y;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = ch;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, cy);
    cy += lineHeight;
  }
  return cy;
}

async function waitForFonts(): Promise<void> {
  try {
    if (typeof document !== "undefined" && "fonts" in document) {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready;
    }
  } catch {
    // no-op
  }
}

/** ヲタク履歴書カードをPNG Blobで生成する（縦長1080x1350）。 */
export async function generateResumeImage(data: OtakuResumeData): Promise<Blob> {
  await waitForFonts();
  const w = 1080;
  const h = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D コンテキストを取得できませんでした。");

  // 背景
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#f3ecfc");
  bg.addColorStop(1, "#fbeef6");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.22, 0, w * 0.5, h * 0.22, w * 0.7);
  glow.addColorStop(0, "rgba(255,182,220,0.4)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(157,127,224,0.4)";
  ctx.lineWidth = 3;
  roundRect(ctx, 36, 36, w - 72, h - 72, 40);
  ctx.stroke();

  const pad = 96;
  ctx.textAlign = "left";

  // ヘッダー
  ctx.fillStyle = "#8b6fd6";
  ctx.font = `700 34px ${JP_FONT}`;
  ctx.fillText("OSHICOA 16", pad, 120);
  ctx.textAlign = "center";
  ctx.fillStyle = "#4b3f77";
  ctx.font = `700 64px ${JP_FONT}`;
  ctx.fillText("ヲタク履歴書", w / 2, 210);
  ctx.textAlign = "left";

  // 名前
  const name = data.displayName?.trim() || "名無しのヲタク";
  ctx.fillStyle = "#6a5c95";
  ctx.font = `500 28px ${JP_FONT}`;
  ctx.fillText("ヲタクネーム", pad, 300);
  ctx.fillStyle = "#4b3f77";
  ctx.font = `700 56px ${JP_FONT}`;
  ctx.fillText(name, pad, 360);

  // 基本情報の行
  let y = 440;
  const rows: [string, string | undefined][] = [
    ["推し", data.oshiName],
    ["ジャンル", data.genre],
    ["推し歴", data.duration],
    ["現場頻度", data.frequency],
  ];
  for (const [label, value] of rows) {
    ctx.fillStyle = "#a98bec";
    ctx.font = `700 30px ${JP_FONT}`;
    ctx.fillText(label, pad, y);
    ctx.fillStyle = "#4b3f77";
    ctx.font = `500 34px ${JP_FONT}`;
    ctx.fillText(value?.trim() || "—", pad + 200, y);
    y += 66;
  }

  // 自由記述
  const blocks: [string, string | undefined][] = [
    ["沼落ちのきっかけ", data.trigger],
    ["好きなところ", data.favoritePoint],
    ["推し活ポリシー", data.motto],
    ["布教の一言", data.pitch],
  ];
  y += 20;
  for (const [label, value] of blocks) {
    ctx.fillStyle = "#e57fb8";
    ctx.font = `700 30px ${JP_FONT}`;
    ctx.fillText(`✦ ${label}`, pad, y);
    y += 46;
    ctx.fillStyle = "#5b4f83";
    ctx.font = `500 32px ${JP_FONT}`;
    y = wrapText(ctx, value?.trim() || "—", pad, y, w - pad * 2, 46);
    y += 30;
  }

  // フッター
  ctx.fillStyle = "#9a8dc0";
  ctx.font = `500 26px ${JP_FONT}`;
  ctx.fillText("#OSHICOA16  #ヲタク履歴書", pad, h - 96);
  ctx.fillStyle = "#a99fc4";
  ctx.font = `500 24px ${JP_FONT}`;
  ctx.fillText("oshicoa16 — 推し方の本性を診断する", pad, h - 60);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("画像の生成に失敗しました。"));
    }, "image/png");
  });
}
