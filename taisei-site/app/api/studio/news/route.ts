import { NextResponse } from "next/server";
import type { NewsCategory } from "@/lib/content";
import { deleteRepoFile, getRepoFile, putRepoFile, toBase64 } from "@/lib/github";

const CATEGORIES: NewsCategory[] = ["LIVE", "RELEASE", "EVENT", "MEDIA", "INFO"];
const NEWS_DIR = "taisei-site/content/news";

// /studio からのNEWS入稿を受け取り、GitHubの記事ファイルを操作する。
// - 新規公開（slugなし）／既存記事の上書き（slugあり）／削除（action: "delete"）
// mainへのコミットでVercelが自動再ビルドし、約2分でサイトに反映される。

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const SLUG_RE = /^[\w-]{1,64}$/;

export async function POST(req: Request) {
  let payload: {
    password?: string;
    action?: string; // 省略時は公開（新規/上書き）。"delete" で削除
    slug?: string; // 指定時は既存記事の上書き/削除対象
    date?: string;
    category?: string;
    title?: string;
    body?: string;
    images?: string[]; // 記事内写真のパス（/uploads/...）最大3枚
    publishAt?: string; // 予約公開日時 "YYYY-MM-DDTHH:mm"（JST）。省略時は即公開
  };
  try {
    payload = await req.json();
  } catch {
    return bad("送信データを読み取れませんでした");
  }

  const studioPassword = process.env.STUDIO_PASSWORD;
  if (!studioPassword)
    return bad("サーバー設定が未完了です（STUDIO_PASSWORD 未設定）。管理者にご連絡ください", 500);
  if (payload.password !== studioPassword) return bad("パスワードが違います", 401);

  const editSlug = (payload.slug ?? "").trim();
  if (editSlug && !SLUG_RE.test(editSlug)) return bad("記事の指定が不正です");

  if (!process.env.GITHUB_CONTENT_TOKEN)
    return bad("サーバー設定が未完了です（GITHUB_CONTENT_TOKEN 未設定）。管理者にご連絡ください", 500);

  // ---- 削除 ----
  if (payload.action === "delete") {
    if (!editSlug) return bad("記事の指定が不正です");
    try {
      const { sha } = await getRepoFile(`${NEWS_DIR}/${editSlug}.json`);
      await deleteRepoFile(`${NEWS_DIR}/${editSlug}.json`, `NEWS削除: ${editSlug}`, sha);
      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error("news delete error:", e);
      return bad("記事が見つからないか、削除に失敗しました", 502);
    }
  }

  // ---- 公開（新規/上書き） ----
  const date = (payload.date ?? "").trim();
  const category = (payload.category ?? "").trim() as NewsCategory;
  const title = (payload.title ?? "").trim();
  const bodyText = (payload.body ?? "").trim();

  if (!/^\d{4}\.\d{2}\.\d{2}$/.test(date)) return bad("日付の形式が不正です");
  if (!CATEGORIES.includes(category)) return bad("カテゴリを選択してください");
  if (!title || title.length > 120) return bad("タイトルは1〜120文字で入力してください");
  if (!bodyText || bodyText.length > 8000) return bad("本文は1〜8000文字で入力してください");

  const images = payload.images ?? [];
  if (!Array.isArray(images) || images.length > 3) return bad("写真は3枚までです");
  for (const img of images) {
    if (typeof img !== "string" || !img.startsWith("/uploads/"))
      return bad("写真の指定が不正です");
  }

  let publishAtIso: string | undefined;
  const publishAtRaw = (payload.publishAt ?? "").trim();
  if (publishAtRaw) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(publishAtRaw))
      return bad("予約日時の形式が不正です");
    publishAtIso = `${publishAtRaw}:00+09:00`; // 日本時間として扱う
    if (Number.isNaN(Date.parse(publishAtIso))) return bad("予約日時を読み取れませんでした");
  }

  const slug = editSlug || `${date.replaceAll(".", "")}-${Date.now().toString(36)}`;
  const item = {
    slug,
    date,
    category,
    title,
    // 空行区切りで段落に分割する
    body: bodyText.split(/\n\s*\n/).map((p) => p.replace(/\s+$/g, "").trim()).filter(Boolean),
    ...(images.length > 0 ? { images } : {}),
    ...(publishAtIso ? { publishAt: publishAtIso } : {}),
  };

  try {
    let sha: string | undefined;
    if (editSlug) {
      // 上書き対象の現在のshaを取得（存在しなければエラー）
      try {
        sha = (await getRepoFile(`${NEWS_DIR}/${slug}.json`)).sha;
      } catch {
        return bad("編集対象の記事が見つかりませんでした", 404);
      }
    }
    await putRepoFile(
      `${NEWS_DIR}/${slug}.json`,
      toBase64(JSON.stringify(item, null, 2) + "\n"),
      editSlug ? `NEWS更新: ${title}` : `NEWS入稿: ${title}`,
      sha,
    );
    return NextResponse.json({ ok: true, slug });
  } catch (e) {
    console.error("news publish error:", e);
    return bad("公開処理に失敗しました。時間をおいて再度お試しいただくか、管理者にご連絡ください", 502);
  }
}
