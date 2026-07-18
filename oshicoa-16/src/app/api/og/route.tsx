import { readFileSync } from "node:fs";
import { ImageResponse } from "next/og";
import { isTypeCode } from "@/types";
import { typeMap } from "@/data/types";
import { siteMeta } from "@/lib/site";

export const runtime = "nodejs";

// コードから決定的な色相を得る（TypeVisual と同じ発想）。
function hueFor(code: string): number {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) & 0xffff;
  return h % 360;
}

/**
 * 日本語フォント。OGで使う文字（16タイプ名・キャッチコピー・固定文言）だけを含む
 * サブセット woff をプロジェクトに同梱し、実行時ネットワークに依存せず読み込む。
 * SNSクローラーからのアクセスでも確実に生成できる。
 */
let fontCache: ArrayBuffer | null = null;
function loadFont(): ArrayBuffer {
  if (fontCache) return fontCache;
  const buf = readFileSync(new URL("./NotoSansJP-subset.woff", import.meta.url));
  fontCache = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  return fontCache;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawType = (searchParams.get("type") || "").toUpperCase();
  const type = isTypeCode(rawType) ? typeMap[rawType] : null;

  const code = type?.code ?? "OSHICOA";
  const name = type?.name ?? siteMeta.mainCopy;
  const catchphrase = type?.catchphrase ?? siteMeta.subCopy;
  const hue = hueFor(code);

  const fontData = loadFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #0a0a12 0%, #14101e 100%)",
          position: "relative",
          fontFamily: "NotoSansJP",
        }}
      >
        {/* 装飾リング（右上） */}
        <div
          style={{
            position: "absolute",
            top: "-160px",
            right: "-120px",
            width: "520px",
            height: "520px",
            borderRadius: "9999px",
            background: `radial-gradient(circle, hsla(${hue},90%,60%,0.35), transparent 65%)`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "60px",
            width: "360px",
            height: "360px",
            borderRadius: "9999px",
            border: `2px solid hsla(${hue},85%,68%,0.35)`,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "#c9b8ff", fontSize: "34px", fontWeight: 700, letterSpacing: "0.12em" }}>
            OSHICOA 16
          </span>
          <span style={{ color: "#9296b4", fontSize: "24px" }}>｜ヲタク生態診断</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              color: `hsl(${hue},90%,72%)`,
              fontSize: "40px",
              fontWeight: 700,
              letterSpacing: "0.3em",
            }}
          >
            {code.split("").join(" ")}
          </span>
          <span
            style={{
              color: "#ffffff",
              fontSize: type ? "96px" : "60px",
              fontWeight: 700,
              marginTop: "8px",
              lineHeight: 1.15,
            }}
          >
            {name}
          </span>
          <span style={{ color: "#b7bad0", fontSize: "34px", marginTop: "18px" }}>
            {type ? `「${catchphrase}」` : catchphrase}
          </span>
        </div>

        <div style={{ display: "flex" }}>
          <span style={{ color: "#6f6f88", fontSize: "26px" }}>
            あなたの推し方の本性は？ #OSHICOA16
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "NotoSansJP", data: fontData, weight: 700, style: "normal" }],
    },
  );
}
