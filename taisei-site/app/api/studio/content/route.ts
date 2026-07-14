import { NextResponse } from "next/server";
import { getRepoFile, putRepoFile, toBase64 } from "@/lib/github";

// /studio の各タブ（リリース・LIVE・MOVIE・設定・プロフィール）からの
// 追加・削除・上書きを受け取り、GitHubのcontent/*.jsonを更新する。

const FILES = {
  releases: "releases.json",
  live: "live.json",
  movies: "movies.json",
  settings: "settings.json",
  profile: "profile.json",
} as const;

type FileKey = keyof typeof FILES;

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const isDate = (s: unknown) => typeof s === "string" && /^\d{4}\.\d{2}\.\d{2}$/.test(s);
const isIsoDate = (s: unknown) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isUrl = (s: unknown) =>
  typeof s === "string" && (s === "#" || /^https?:\/\/\S+$/.test(s));
const str = (s: unknown, max: number) =>
  typeof s === "string" && s.trim().length > 0 && s.trim().length <= max;
const optStr = (s: unknown, max: number) =>
  s === undefined || s === "" || (typeof s === "string" && s.length <= max);

// 追加時の入力チェックと保存形の組み立て
function buildItem(file: FileKey, raw: Record<string, unknown>): object | string {
  const id = Date.now().toString(36);
  if (file === "releases") {
    if (!str(raw.title, 120)) return "タイトルは1〜120文字で入力してください";
    if (!["SINGLE", "ALBUM", "DIGITAL", "OTHER"].includes(raw.type as string))
      return "種類を選択してください";
    if (!isDate(raw.date)) return "発売日の形式が不正です";
    if (!str(raw.description, 2000)) return "紹介文は1〜2000文字で入力してください";
    const links: { label: string; url: string }[] = [];
    if (raw.streamingUrl) {
      if (!isUrl(raw.streamingUrl)) return "配信リンクのURLが不正です";
      links.push({ label: "STREAMING / DOWNLOAD", url: raw.streamingUrl as string });
    }
    if (raw.mvUrl) {
      if (!isUrl(raw.mvUrl)) return "MVリンクのURLが不正です";
      links.push({ label: "MUSIC VIDEO", url: raw.mvUrl as string });
    }
    const jacket = (raw.jacket as string) || "";
    if (jacket && !jacket.startsWith("/uploads/")) return "ジャケット画像の指定が不正です";
    return {
      id,
      title: (raw.title as string).trim(),
      type: raw.type,
      date: raw.date,
      description: (raw.description as string).trim(),
      links,
      jacket,
    };
  }
  if (file === "live") {
    if (!isDate(raw.date)) return "公演日の形式が不正です";
    if (!str(raw.title, 120)) return "公演名は1〜120文字で入力してください";
    if (!str(raw.venue, 120)) return "会場は1〜120文字で入力してください";
    if (!optStr(raw.note, 200)) return "備考は200文字以内で入力してください";
    if (!["LIVE", "EVENT"].includes(raw.category as string))
      return "種別を選択してください";
    const hasStart = Boolean(raw.applyStart);
    const hasEnd = Boolean(raw.applyEnd);
    if (hasStart !== hasEnd) return "受付期間は開始・終了の両方を入力してください";
    if (hasStart && (!isIsoDate(raw.applyStart) || !isIsoDate(raw.applyEnd)))
      return "受付期間の日付形式が不正です";
    if (hasStart && (raw.applyStart as string) > (raw.applyEnd as string))
      return "受付終了日は開始日より後にしてください";
    if (raw.ticketUrl && !isUrl(raw.ticketUrl)) return "チケットURLが不正です";
    return {
      id,
      date: raw.date,
      title: (raw.title as string).trim(),
      venue: (raw.venue as string).trim(),
      note: ((raw.note as string) || "").trim(),
      category: raw.category,
      ...(hasStart
        ? { applyStart: raw.applyStart, applyEnd: raw.applyEnd }
        : {}),
      ...(raw.ticketUrl ? { ticketUrl: raw.ticketUrl } : {}),
    };
  }
  if (file === "movies") {
    if (!str(raw.title, 120)) return "タイトルは1〜120文字で入力してください";
    const idMatch =
      typeof raw.youtube === "string" &&
      raw.youtube.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{6,20})/);
    const direct =
      typeof raw.youtube === "string" && /^[\w-]{6,20}$/.test(raw.youtube.trim());
    const youtubeId = idMatch ? idMatch[1] : direct ? (raw.youtube as string).trim() : null;
    if (!youtubeId) return "YouTubeのURL（または動画ID）を確認してください";
    return { id, title: (raw.title as string).trim(), youtubeId };
  }
  return "対象が不正です";
}

// 設定・プロフィールの上書き時チェック
function buildReplace(file: FileKey, raw: Record<string, unknown>): object | string {
  if (file === "settings") {
    if (!str(raw.catchCopy, 60)) return "キャッチコピーは1〜60文字で入力してください";
    if (!str(raw.description, 300)) return "紹介文は1〜300文字で入力してください";
    if (!str(raw.tickerText, 200)) return "ティッカー文は1〜200文字で入力してください";
    const sns = raw.sns as Record<string, unknown> | undefined;
    if (!sns) return "SNSリンクがありません";
    for (const key of ["x", "instagram", "tiktok", "youtube", "fanclub"]) {
      if (!isUrl(sns[key])) return `SNSリンク（${key}）のURLが不正です（未定の場合は # ）`;
    }
    const images = raw.images as Record<string, unknown> | undefined;
    const img = (v: unknown) =>
      v === "" || (typeof v === "string" && v.startsWith("/uploads/"));
    if (!images || !img(images.hero) || !img(images.profile))
      return "画像の指定が不正です";
    return {
      catchCopy: (raw.catchCopy as string).trim(),
      description: (raw.description as string).trim(),
      tickerText: (raw.tickerText as string).trim(),
      sns: {
        x: sns.x,
        instagram: sns.instagram,
        tiktok: sns.tiktok,
        youtube: sns.youtube,
        fanclub: sns.fanclub,
      },
      images: { hero: images.hero, profile: images.profile },
    };
  }
  if (file === "profile") {
    if (!str(raw.lead, 100)) return "リード文は1〜100文字で入力してください";
    if (!str(raw.body, 4000)) return "本文は1〜4000文字で入力してください";
    return {
      lead: (raw.lead as string).trim(),
      paragraphs: (raw.body as string)
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    };
  }
  return "対象が不正です";
}

export async function POST(req: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return bad("送信データを読み取れませんでした");
  }

  const studioPassword = process.env.STUDIO_PASSWORD;
  if (!studioPassword) return bad("サーバー設定が未完了です（STUDIO_PASSWORD）", 500);
  if (payload.password !== studioPassword) return bad("パスワードが違います", 401);

  const file = payload.file as FileKey;
  const action = payload.action as string;
  if (!(file in FILES)) return bad("対象が不正です");

  // 先に入力内容を検証してから、GitHub側の処理に進む
  let validItem: object | null = null;
  let validData: object | null = null;
  if (action === "append") {
    if (file === "settings" || file === "profile") return bad("操作が不正です");
    const item = buildItem(file, payload.item as Record<string, unknown>);
    if (typeof item === "string") return bad(item);
    validItem = item;
  } else if (action === "remove") {
    if (file === "settings" || file === "profile") return bad("操作が不正です");
    if (typeof payload.id !== "string" || !payload.id) return bad("対象が不正です");
  } else if (action === "replace") {
    if (file !== "settings" && file !== "profile") return bad("操作が不正です");
    const data = buildReplace(file, payload.data as Record<string, unknown>);
    if (typeof data === "string") return bad(data);
    validData = data;
  } else {
    return bad("操作が不正です");
  }

  if (!process.env.GITHUB_CONTENT_TOKEN)
    return bad("サーバー設定が未完了です（GITHUB_CONTENT_TOKEN）", 500);

  const repoPath = `taisei-site/content/${FILES[file]}`;

  try {
    const { text, sha } = await getRepoFile(repoPath);
    let next: unknown;
    let message = "";

    if (action === "append") {
      const arr = JSON.parse(text) as object[];
      if (file === "live") {
        arr.push(validItem as object);
      } else {
        arr.unshift(validItem as object); // リリース・MOVIEは新しいものを先頭に
      }
      next = arr;
      message = `入稿(${file}): 追加`;
    } else if (action === "remove") {
      const id = payload.id as string;
      const arr = JSON.parse(text) as { id: string }[];
      const filtered = arr.filter((x) => x.id !== id);
      if (filtered.length === arr.length) return bad("対象が見つかりませんでした", 404);
      next = filtered;
      message = `入稿(${file}): 削除`;
    } else {
      next = validData as object;
      message = `入稿(${file}): 更新`;
    }

    await putRepoFile(
      repoPath,
      toBase64(JSON.stringify(next, null, 2) + "\n"),
      message,
      sha,
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("studio content error:", e);
    return bad("保存に失敗しました。時間をおいて再度お試しください", 502);
  }
}
