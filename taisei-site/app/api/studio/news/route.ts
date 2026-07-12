import { NextResponse } from "next/server";
import type { NewsCategory } from "@/lib/content";

const CATEGORIES: NewsCategory[] = ["LIVE", "RELEASE", "EVENT", "MEDIA", "INFO"];
const REPO = "eeeringiii/project-1";
const NEWS_PATH = "taisei-site/content/news";

// /studio からの入稿を受け取り、GitHubに記事ファイルを追加する。
// mainへのpushでVercelが自動再ビルドし、約2分でサイトに反映される。
export async function POST(req: Request) {
  let payload: {
    password?: string;
    date?: string;
    category?: string;
    title?: string;
    body?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "送信データを読み取れませんでした" }, { status: 400 });
  }

  const studioPassword = process.env.STUDIO_PASSWORD;
  if (!studioPassword) {
    return NextResponse.json(
      { error: "サーバー設定が未完了です（STUDIO_PASSWORD 未設定）。管理者にご連絡ください" },
      { status: 500 },
    );
  }
  if (payload.password !== studioPassword) {
    return NextResponse.json({ error: "パスワードが違います" }, { status: 401 });
  }

  const date = (payload.date ?? "").trim();
  const category = (payload.category ?? "").trim() as NewsCategory;
  const title = (payload.title ?? "").trim();
  const bodyText = (payload.body ?? "").trim();

  if (!/^\d{4}\.\d{2}\.\d{2}$/.test(date)) {
    return NextResponse.json({ error: "日付の形式が不正です" }, { status: 400 });
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "カテゴリを選択してください" }, { status: 400 });
  }
  if (!title || title.length > 120) {
    return NextResponse.json({ error: "タイトルは1〜120文字で入力してください" }, { status: 400 });
  }
  if (!bodyText || bodyText.length > 8000) {
    return NextResponse.json({ error: "本文は1〜8000文字で入力してください" }, { status: 400 });
  }

  const token = process.env.GITHUB_CONTENT_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "サーバー設定が未完了です（GITHUB_CONTENT_TOKEN 未設定）。管理者にご連絡ください" },
      { status: 500 },
    );
  }

  const slug = `${date.replaceAll(".", "")}-${Date.now().toString(36)}`;
  const item = {
    slug,
    date,
    category,
    title,
    // 空行区切りで段落に分割する
    body: bodyText.split(/\n\s*\n/).map((p) => p.replace(/\s+$/g, "").trim()).filter(Boolean),
  };

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${NEWS_PATH}/${slug}.json`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `NEWS入稿: ${title}`,
        content: Buffer.from(JSON.stringify(item, null, 2) + "\n").toString("base64"),
        branch: "main",
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text();
    console.error("GitHub API error:", res.status, detail.slice(0, 500));
    return NextResponse.json(
      { error: "公開処理に失敗しました。時間をおいて再度お試しいただくか、管理者にご連絡ください" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, slug });
}
