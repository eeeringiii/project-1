import { NextResponse } from "next/server";
import { getRepoFile, putRepoFile, toBase64 } from "@/lib/github";

// 写真アップロード。クライアント側で縮小済みのJPEG(dataURL)を受け取り、
// public/uploads/ にコミットする。hero/profile はsettings.jsonの参照も更新する。

const ROLES = ["hero", "profile", "jacket"] as const;
type Role = (typeof ROLES)[number];

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  let payload: { password?: string; role?: string; dataUrl?: string };
  try {
    payload = await req.json();
  } catch {
    return bad("送信データを読み取れませんでした");
  }

  const studioPassword = process.env.STUDIO_PASSWORD;
  if (!studioPassword) return bad("サーバー設定が未完了です（STUDIO_PASSWORD）", 500);
  if (payload.password !== studioPassword) return bad("パスワードが違います", 401);

  const role = payload.role as Role;
  if (!ROLES.includes(role)) return bad("画像の用途が不正です");

  const match = (payload.dataUrl ?? "").match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return bad("画像データを読み取れませんでした");
  const base64 = match[1];
  if ((base64.length * 3) / 4 > 3.5 * 1024 * 1024)
    return bad("画像が大きすぎます（縮小後3.5MBまで）");

  if (!process.env.GITHUB_CONTENT_TOKEN)
    return bad("サーバー設定が未完了です（GITHUB_CONTENT_TOKEN）", 500);

  const filename = `${role}-${Date.now().toString(36)}.jpg`;
  const imagePath = `/uploads/${filename}`;

  try {
    await putRepoFile(
      `taisei-site/public/uploads/${filename}`,
      base64,
      `入稿(写真): ${role} をアップロード`,
    );

    // hero / profile はサイト設定の参照先も差し替える
    if (role === "hero" || role === "profile") {
      const repoPath = "taisei-site/content/settings.json";
      const { text, sha } = await getRepoFile(repoPath);
      const settings = JSON.parse(text);
      settings.images[role] = imagePath;
      await putRepoFile(
        repoPath,
        toBase64(JSON.stringify(settings, null, 2) + "\n"),
        `入稿(写真): ${role} を差し替え`,
        sha,
      );
    }

    return NextResponse.json({ ok: true, path: imagePath });
  } catch (e) {
    console.error("studio image error:", e);
    return bad("画像の保存に失敗しました。時間をおいて再度お試しください", 502);
  }
}
