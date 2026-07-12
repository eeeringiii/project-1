import { ImageResponse } from "next/og";
import { siteMeta } from "@/lib/content";

// SNSでURLをシェアしたときに表示されるカード画像。
// アー写が届いたら写真ベースのデザインに差し替える
export const alt = "福本大晴 OFFICIAL SITE";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 使う文字だけを含む日本語フォントをGoogle Fontsから取得する（ビルド時に1回だけ実行される）
async function loadFont(text: string): Promise<ArrayBuffer> {
  const css = await (
    await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@500&text=${encodeURIComponent(text)}`,
    )
  ).text();
  const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!match) throw new Error("OG画像用フォントの取得に失敗しました");
  return await (await fetch(match[1])).arrayBuffer();
}

export default async function OgImage() {
  const en = `${siteMeta.artistNameEn} OFFICIAL SITE`;
  const fontData = await loadFont(siteMeta.artistName + en);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fdfdfb",
          fontFamily: "NotoSerifJP",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 28,
            border: "1px solid #d9c9a4",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
          }}
        >
          <div style={{ fontSize: 26, letterSpacing: "0.5em", color: "#9a6b1f" }}>{en}</div>
          <div style={{ fontSize: 110, letterSpacing: "0.24em", color: "#1d1c19" }}>
            {siteMeta.artistName}
          </div>
          <div style={{ width: 120, height: 2, background: "#9a6b1f", display: "flex" }} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "NotoSerifJP", data: fontData, weight: 500, style: "normal" }],
    },
  );
}
