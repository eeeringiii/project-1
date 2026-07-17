"use client";

import { useEffect, useState } from "react";
import {
  GOODS_CATEGORY_LABEL,
  ORDER_STATUSES,
  type CustomerSummary,
  type Goods,
  type GoodsCategory,
  type LiveEvent,
  type Movie,
  type NewsItem,
  type Order,
  type OrderStatus,
  type Profile,
  type Release,
  type SiteSettings,
} from "@/lib/content";

const yen = (n: number) => `¥${new Intl.NumberFormat("ja-JP").format(n)}`;

// ---- 共通スタイル・部品 -------------------------------------------------

const field =
  "w-full border border-line bg-paper px-4 py-3 text-[0.95rem] focus:border-gold focus:outline-none";
const labelCls = "mb-2 block text-[0.8rem] tracking-[0.1em] text-ink";
const hintCls = "mt-1 block text-[0.72rem] leading-relaxed text-muted";
const primaryBtn =
  "w-full border border-ink bg-ink px-6 py-4 text-[0.85rem] tracking-[0.3em] text-paper transition-opacity hover:opacity-80 disabled:opacity-50";
const dangerBtn =
  "border border-line px-3 py-1.5 text-[0.66rem] tracking-[0.1em] text-muted transition-colors hover:border-red-400 hover:text-red-600";

async function post(url: string, body: object): Promise<{ ok: boolean; error?: string; path?: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json.error ?? "エラーが発生しました" };
    return { ok: true, ...json };
  } catch {
    return { ok: false, error: "通信に失敗しました。電波状況をご確認ください" };
  }
}

function Notice({ error, done, doneText }: { error: string; done: boolean; doneText: string }) {
  if (error)
    return (
      <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
        {error}
      </p>
    );
  if (done)
    return (
      <p className="border border-gold-soft bg-paper-soft px-4 py-3 text-sm text-gold" role="status">
        {doneText}（サイトへの反映まで約2分かかります）
      </p>
    );
  return null;
}

function today(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const toDot = (iso: string) => iso.replaceAll("-", ".");

// 画像をブラウザ内で縮小してJPEGのdataURLにする（アップロードを軽くするため）
async function resizeImage(file: File, maxSize = 1600): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas error");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.82);
}

// ---- NEWS ---------------------------------------------------------------

// "2026-07-20T18:00:00+09:00" → "2026/7/20 18:00"
function fmtPublishAt(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return iso;
  return `${m[1]}/${Number(m[2])}/${Number(m[3])} ${m[4]}:${m[5]}`;
}

function NewsTab({ password, initial }: { password: string; initial: NewsItem[] }) {
  const [date, setDate] = useState(today());
  const [category, setCategory] = useState("INFO");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [timing, setTiming] = useState<"now" | "scheduled">("now");
  const [publishAt, setPublishAt] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [doneText, setDoneText] = useState("");
  const [error, setError] = useState("");

  // 一覧・編集の状態
  const [nowMs, setNowMs] = useState<number | null>(null);
  useEffect(() => setNowMs(Date.now()), []);
  const [removed, setRemoved] = useState<string[]>([]);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [keepImages, setKeepImages] = useState<string[]>([]);
  const [listError, setListError] = useState("");

  function resetForm() {
    setEditingSlug(null);
    setKeepImages([]);
    setDate(today());
    setCategory("INFO");
    setTitle("");
    setBody("");
    setPhotoFiles([]);
    setTiming("now");
    setPublishAt("");
    setError("");
  }

  function startEdit(item: NewsItem) {
    setDone(false);
    setError("");
    setEditingSlug(item.slug);
    setDate(item.date.replaceAll(".", "-"));
    setCategory(item.category);
    setTitle(item.title);
    setBody(item.body.join("\n\n"));
    setKeepImages(item.images ?? []);
    setPhotoFiles([]);
    if (item.publishAt && Date.parse(item.publishAt) > Date.now()) {
      setTiming("scheduled");
      setPublishAt(item.publishAt.slice(0, 16));
    } else {
      setTiming("now");
      setPublishAt("");
    }
    document.getElementById("news-form")?.scrollIntoView({ behavior: "smooth" });
  }

  async function removeItem(item: NewsItem) {
    setListError("");
    if (!window.confirm(`「${item.title}」を削除します。よろしいですか？`)) return;
    const res = await post("/api/studio/news", {
      password,
      action: "delete",
      slug: item.slug,
    });
    if (!res.ok) return setListError(res.error ?? "削除に失敗しました");
    setRemoved((r) => [...r, item.slug]);
    if (editingSlug === item.slug) resetForm();
  }

  async function submit() {
    setError("");
    setDone(false);
    if (!title.trim()) return setError("タイトルを入力してください");
    if (!body.trim()) return setError("本文を入力してください");
    if (photoFiles.length > 3) return setError("写真は3枚までです");
    if (timing === "scheduled") {
      if (!publishAt) return setError("予約日時を選択してください");
      if (new Date(publishAt) <= new Date()) return setError("予約日時は未来の日時にしてください");
    }
    setSending(true);
    // 新しい写真を選んだ場合はアップロードして差し替え。選ばなければ元の写真を維持
    let images: string[] = editingSlug ? keepImages : [];
    if (photoFiles.length > 0) {
      images = [];
      for (const file of photoFiles) {
        try {
          const dataUrl = await resizeImage(file, 1600);
          const up = await post("/api/studio/image", { password, role: "news", dataUrl });
          if (!up.ok) {
            setSending(false);
            return setError(up.error ?? "写真のアップロードに失敗しました");
          }
          images.push(up.path ?? "");
        } catch {
          setSending(false);
          return setError("写真の読み込みに失敗しました。別の写真でお試しください");
        }
      }
    }
    const res = await post("/api/studio/news", {
      password,
      ...(editingSlug ? { slug: editingSlug } : {}),
      date: toDot(date),
      category,
      title,
      body,
      ...(images.length > 0 ? { images } : {}),
      ...(timing === "scheduled" ? { publishAt } : {}),
    });
    setSending(false);
    if (!res.ok) return setError(res.error ?? "エラーが発生しました");
    setDoneText(
      editingSlug
        ? "記事の更新を受け付けました"
        : timing === "scheduled"
          ? "予約を受け付けました"
          : "NEWSの公開を受け付けました",
    );
    setDone(true);
    resetForm();
  }

  const visible = initial.filter((n) => !removed.includes(n.slug));
  const scheduled =
    nowMs === null
      ? []
      : visible.filter((n) => n.publishAt && Date.parse(n.publishAt) > nowMs);
  const published =
    nowMs === null
      ? visible
      : visible.filter((n) => !n.publishAt || Date.parse(n.publishAt) <= nowMs);

  const listRow = (item: NewsItem, badge: React.ReactNode) => (
    <li key={item.slug} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
      <span className="text-sm leading-relaxed">
        <span className="mr-3 text-xs text-muted">{item.date}</span>
        {item.title}
        <span className="ml-2">{badge}</span>
      </span>
      <span className="flex gap-2">
        <button
          type="button"
          className="border border-line px-3 py-1.5 text-[0.66rem] tracking-[0.1em] text-sub transition-colors hover:border-gold hover:text-gold"
          onClick={() => startEdit(item)}
        >
          編集
        </button>
        <button type="button" className={dangerBtn} onClick={() => removeItem(item)}>
          削除
        </button>
      </span>
    </li>
  );

  return (
    <div className="space-y-8">
      {/* 記事一覧 */}
      <div>
        <span className={labelCls}>予約中の記事</span>
        {scheduled.length === 0 ? (
          <p className="border border-line bg-paper-soft px-4 py-3 text-sm text-muted">
            予約中の記事はありません
          </p>
        ) : (
          <ul className="divide-y divide-line-soft border border-gold-soft bg-paper-soft">
            {scheduled.map((item) =>
              listRow(
                item,
                <span className="border border-gold px-2 py-0.5 text-[0.6rem] tracking-[0.1em] text-gold">
                  予約中 {item.publishAt ? fmtPublishAt(item.publishAt) : ""} 公開
                </span>,
              ),
            )}
          </ul>
        )}
      </div>
      <div>
        <span className={labelCls}>公開済みの記事</span>
        {published.length === 0 ? (
          <p className="border border-line bg-paper-soft px-4 py-3 text-sm text-muted">
            公開済みの記事はありません
          </p>
        ) : (
          <ul className="divide-y divide-line-soft border border-line">
            {published.map((item) => listRow(item, null))}
          </ul>
        )}
        {listError && <p className="mt-2 text-sm text-red-700">{listError}</p>}
        <span className={hintCls}>
          「編集」を押すと下のフォームに内容が入ります。一覧への反映は最新の公開から約2分ずれることがあります
        </span>
      </div>

      {/* 入稿フォーム */}
      <div id="news-form" className="border-t border-line pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[0.8rem] tracking-[0.2em] text-gold">
            {editingSlug ? "記事を編集中" : "新しい記事を書く"}
          </h3>
          {editingSlug && (
            <button
              type="button"
              className="border border-line px-3 py-1.5 text-[0.66rem] tracking-[0.1em] text-sub hover:border-gold hover:text-gold"
              onClick={resetForm}
            >
              編集をやめて新規作成に戻る
            </button>
          )}
        </div>
        <div className="space-y-6">
          <div>
            <label className={labelCls}>日付</label>
            <input type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>カテゴリ</label>
            <select className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="LIVE">LIVE（ライブ・公演）</option>
              <option value="RELEASE">RELEASE（CD・配信リリース）</option>
              <option value="EVENT">EVENT（イベント）</option>
              <option value="MEDIA">MEDIA（TV・雑誌・WEB出演）</option>
              <option value="INFO">INFO（その他のお知らせ）</option>
            </select>
            <span className={hintCls}>迷ったら「INFO」で大丈夫です</span>
          </div>
          <div>
            <label className={labelCls}>タイトル</label>
            <input type="text" className={field} maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>本文</label>
            <textarea className={`${field} min-h-48`} maxLength={8000} value={body} onChange={(e) => setBody(e.target.value)} placeholder={"1行空けると段落が変わります。"} />
          </div>
          <div>
            <label className={labelCls}>写真（あれば・3枚まで）</label>
            <input
              type="file"
              accept="image/*"
              multiple
              className={field}
              onChange={(e) => setPhotoFiles(Array.from(e.target.files ?? []).slice(0, 3))}
            />
            <span className={hintCls}>
              自動で軽量化されるので、スマホの写真そのままで大丈夫です。
              ふつうは本文の下にまとめて表示されます。本文中の好きな位置に置きたいときは、
              本文の行に「[写真1]」「[写真2]」とだけ書くと、その位置に表示されます
              {editingSlug && keepImages.length > 0 && photoFiles.length === 0 &&
                `。現在この記事には写真が${keepImages.length}枚ついています（そのまま維持。新しく選ぶと差し替え）`}
              {photoFiles.length > 0 && `（現在${photoFiles.length}枚選択中）`}
            </span>
          </div>
          <div>
            <span className={labelCls}>公開タイミング</span>
            <div className="flex flex-col gap-2 border border-line p-4">
              <label className="flex items-center gap-3 text-sm">
                <input type="radio" checked={timing === "now"} onChange={() => setTiming("now")} />
                すぐ公開する
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="radio" checked={timing === "scheduled"} onChange={() => setTiming("scheduled")} />
                日時を指定して予約公開する
              </label>
              {timing === "scheduled" && (
                <input type="datetime-local" className={field} value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
              )}
            </div>
            {editingSlug && (
              <span className={hintCls}>
                予約中の記事を「すぐ公開する」に変えて保存すると、即公開に切り替わります
              </span>
            )}
          </div>
          <Notice error={error} done={done} doneText={doneText} />
          <button type="button" className={primaryBtn} disabled={sending} onClick={submit}>
            {sending ? "送信中…" : editingSlug ? "この内容で更新する" : "この内容で公開する"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- リリース -----------------------------------------------------------

function ReleaseTab({ password, initial }: { password: string; initial: Release[] }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("SINGLE");
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState("");
  const [streamingUrl, setStreamingUrl] = useState("");
  const [mvUrl, setMvUrl] = useState("");
  const [jacketFile, setJacketFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    setDone(false);
    if (!title.trim()) return setError("タイトルを入力してください");
    if (!description.trim()) return setError("紹介文を入力してください");
    setSending(true);
    let jacket = "";
    if (jacketFile) {
      try {
        const dataUrl = await resizeImage(jacketFile, 1200);
        const up = await post("/api/studio/image", { password, role: "jacket", dataUrl });
        if (!up.ok) {
          setSending(false);
          return setError(up.error ?? "画像のアップロードに失敗しました");
        }
        jacket = up.path ?? "";
      } catch {
        setSending(false);
        return setError("画像の読み込みに失敗しました。別の画像でお試しください");
      }
    }
    const res = await post("/api/studio/content", {
      password,
      file: "releases",
      action: "append",
      item: { title, type, date: toDot(date), description, streamingUrl, mvUrl, jacket },
    });
    setSending(false);
    if (!res.ok) return setError(res.error ?? "エラーが発生しました");
    setDone(true);
    setTitle("");
    setDescription("");
    setStreamingUrl("");
    setMvUrl("");
    setJacketFile(null);
  }

  return (
    <div className="space-y-6">
      <CurrentList
        password={password}
        file="releases"
        items={initial.map((r) => ({ id: r.id, label: `${r.date}　${r.title}` }))}
      />
      <h3 className="border-t border-line pt-6 text-[0.8rem] tracking-[0.2em] text-gold">新しいリリースを追加</h3>
      <div>
        <label className={labelCls}>タイトル</label>
        <input type="text" className={field} maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例：New Single「タイトル」" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className={labelCls}>種類</label>
          <select className={field} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="SINGLE">SINGLE</option>
            <option value="ALBUM">ALBUM</option>
            <option value="DIGITAL">DIGITAL（配信）</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>発売日</label>
          <input type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelCls}>紹介文</label>
        <textarea className={`${field} min-h-32`} maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>配信リンク（あれば）</label>
        <input type="url" className={field} value={streamingUrl} onChange={(e) => setStreamingUrl(e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <label className={labelCls}>MVリンク（あれば）</label>
        <input type="url" className={field} value={mvUrl} onChange={(e) => setMvUrl(e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <label className={labelCls}>ジャケット写真（あれば）</label>
        <input type="file" accept="image/*" className={field} onChange={(e) => setJacketFile(e.target.files?.[0] ?? null)} />
        <span className={hintCls}>自動で軽量化されるので、スマホの写真そのままで大丈夫です</span>
      </div>
      <Notice error={error} done={done} doneText="リリースの追加を受け付けました" />
      <button type="button" className={primaryBtn} disabled={sending} onClick={submit}>
        {sending ? "送信中…" : "この内容で追加する"}
      </button>
    </div>
  );
}

// ---- LIVE ---------------------------------------------------------------

function LiveTab({ password, initial }: { password: string; initial: LiveEvent[] }) {
  const [date, setDate] = useState(today());
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("LIVE");
  const [applyStart, setApplyStart] = useState("");
  const [applyEnd, setApplyEnd] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    setDone(false);
    if (!title.trim()) return setError("公演名を入力してください");
    if (!venue.trim()) return setError("会場を入力してください");
    setSending(true);
    const res = await post("/api/studio/content", {
      password,
      file: "live",
      action: "append",
      item: { date: toDot(date), title, venue, note, category, applyStart, applyEnd, ticketUrl },
    });
    setSending(false);
    if (!res.ok) return setError(res.error ?? "エラーが発生しました");
    setDone(true);
    setTitle("");
    setVenue("");
    setNote("");
    setApplyStart("");
    setApplyEnd("");
    setTicketUrl("");
  }

  return (
    <div className="space-y-6">
      <CurrentList
        password={password}
        file="live"
        items={initial.map((e) => ({ id: e.id, label: `${e.date}　${e.title}` }))}
      />
      <h3 className="border-t border-line pt-6 text-[0.8rem] tracking-[0.2em] text-gold">新しい公演・イベントを追加</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className={labelCls}>公演日</label>
          <input type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>種別</label>
          <select className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="LIVE">ライブ</option>
            <option value="EVENT">イベント</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>公演名</label>
        <input type="text" className={field} maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>会場</label>
        <input type="text" className={field} maxLength={120} value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="例：Zepp DiverCity（東京）" />
      </div>
      <div>
        <label className={labelCls}>備考（あれば）</label>
        <input type="text" className={field} maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} placeholder="例：入場無料・事前申込不要" />
      </div>
      <div>
        <span className={labelCls}>チケット受付期間（決まっていれば）</span>
        <div className="grid gap-4 border border-line p-4 md:grid-cols-2">
          <div>
            <label className={hintCls}>受付開始</label>
            <input type="date" className={field} value={applyStart} onChange={(e) => setApplyStart(e.target.value)} />
          </div>
          <div>
            <label className={hintCls}>受付終了</label>
            <input type="date" className={field} value={applyEnd} onChange={(e) => setApplyEnd(e.target.value)} />
          </div>
        </div>
        <span className={hintCls}>入れておくと、期間中は自動で「受付中」表示＆申込ボタンが出ます</span>
      </div>
      <div>
        <label className={labelCls}>チケット申込URL（あれば）</label>
        <input type="url" className={field} value={ticketUrl} onChange={(e) => setTicketUrl(e.target.value)} placeholder="https://..." />
      </div>
      <Notice error={error} done={done} doneText="公演の追加を受け付けました" />
      <button type="button" className={primaryBtn} disabled={sending} onClick={submit}>
        {sending ? "送信中…" : "この内容で追加する"}
      </button>
    </div>
  );
}

// ---- MOVIE --------------------------------------------------------------

function MovieTab({ password, initial }: { password: string; initial: Movie[] }) {
  const [title, setTitle] = useState("");
  const [youtube, setYoutube] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    setDone(false);
    if (!title.trim()) return setError("タイトルを入力してください");
    if (!youtube.trim()) return setError("YouTubeのURLを入力してください");
    setSending(true);
    const res = await post("/api/studio/content", {
      password,
      file: "movies",
      action: "append",
      item: { title, youtube },
    });
    setSending(false);
    if (!res.ok) return setError(res.error ?? "エラーが発生しました");
    setDone(true);
    setTitle("");
    setYoutube("");
  }

  return (
    <div className="space-y-6">
      <CurrentList
        password={password}
        file="movies"
        items={initial.map((m) => ({ id: m.id, label: m.title }))}
      />
      <h3 className="border-t border-line pt-6 text-[0.8rem] tracking-[0.2em] text-gold">新しい動画を追加</h3>
      <div>
        <label className={labelCls}>タイトル</label>
        <input type="text" className={field} maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例：「曲名」Music Video" />
      </div>
      <div>
        <label className={labelCls}>YouTubeのURL</label>
        <input type="url" className={field} value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
        <span className={hintCls}>動画ページのURLをそのまま貼り付けてください</span>
      </div>
      <Notice error={error} done={done} doneText="動画の追加を受け付けました" />
      <button type="button" className={primaryBtn} disabled={sending} onClick={submit}>
        {sending ? "送信中…" : "この内容で追加する"}
      </button>
    </div>
  );
}

// ---- 写真 ---------------------------------------------------------------

function PhotoTab({ password, settings }: { password: string; settings: SiteSettings }) {
  const [role, setRole] = useState<"hero" | "profile">("hero");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const current = role === "hero" ? settings.images.hero : settings.images.profile;

  async function submit() {
    setError("");
    setDone(false);
    if (!file) return setError("写真を選択してください");
    setSending(true);
    try {
      const dataUrl = await resizeImage(file, 1600);
      const res = await post("/api/studio/image", { password, role, dataUrl });
      setSending(false);
      if (!res.ok) return setError(res.error ?? "エラーが発生しました");
      setDone(true);
      setFile(null);
    } catch {
      setSending(false);
      setError("画像の読み込みに失敗しました。別の画像でお試しください");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <span className={labelCls}>どこの写真を差し替えますか？</span>
        <div className="flex flex-col gap-2 border border-line p-4">
          <label className="flex items-center gap-3 text-sm">
            <input type="radio" checked={role === "hero"} onChange={() => setRole("hero")} />
            トップページの大きな写真（アー写）
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="radio" checked={role === "profile"} onChange={() => setRole("profile")} />
            プロフィールページの写真
          </label>
        </div>
      </div>
      <div>
        <span className={labelCls}>現在の写真</span>
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt="現在の写真" className="max-h-60 border border-line object-contain" />
        ) : (
          <p className="border border-line bg-paper-soft px-4 py-3 text-sm text-muted">
            まだ設定されていません（グレーの仮画像が表示されています）
          </p>
        )}
      </div>
      <div>
        <label className={labelCls}>新しい写真を選択</label>
        <input type="file" accept="image/*" className={field} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <span className={hintCls}>自動で軽量化されるので、スマホの写真そのままで大丈夫です</span>
      </div>
      <Notice error={error} done={done} doneText="写真の差し替えを受け付けました" />
      <button type="button" className={primaryBtn} disabled={sending} onClick={submit}>
        {sending ? "アップロード中…" : "この写真に差し替える"}
      </button>
    </div>
  );
}

// ---- 設定（SNS・文言・プロフィール） -------------------------------------

function SettingsTab({
  password,
  settings,
  profile,
}: {
  password: string;
  settings: SiteSettings;
  profile: Profile;
}) {
  const [catchCopy, setCatchCopy] = useState(settings.catchCopy);
  const [description, setDescription] = useState(settings.description);
  const [tickerText, setTickerText] = useState(settings.tickerText);
  const [sns, setSns] = useState({ ...settings.sns });
  const [lead, setLead] = useState(profile.lead);
  const [body, setBody] = useState(profile.paragraphs.join("\n\n"));
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const snsFields: { key: keyof typeof sns; label: string }[] = [
    { key: "x", label: "X（旧Twitter）" },
    { key: "instagram", label: "Instagram" },
    { key: "tiktok", label: "TikTok" },
    { key: "youtube", label: "YouTube" },
    { key: "fanclub", label: "ファンクラブ" },
  ];

  async function submit() {
    setError("");
    setDone(false);
    setSending(true);
    const res1 = await post("/api/studio/content", {
      password,
      file: "settings",
      action: "replace",
      data: { catchCopy, description, tickerText, sns, images: settings.images },
    });
    if (!res1.ok) {
      setSending(false);
      return setError(res1.error ?? "エラーが発生しました");
    }
    const res2 = await post("/api/studio/content", {
      password,
      file: "profile",
      action: "replace",
      data: { lead, body },
    });
    setSending(false);
    if (!res2.ok) return setError(res2.error ?? "エラーが発生しました");
    setDone(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <label className={labelCls}>キャッチコピー（トップの名前の下）</label>
        <input type="text" className={field} maxLength={60} value={catchCopy} onChange={(e) => setCatchCopy(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>サイト紹介文（トップ）</label>
        <textarea className={`${field} min-h-24`} maxLength={300} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>流れる新着テロップ（ティッカー）</label>
        <input type="text" className={field} maxLength={200} value={tickerText} onChange={(e) => setTickerText(e.target.value)} />
        <span className={hintCls}>「 — 」（スペース＋ダッシュ＋スペース）で区切ると複数のお知らせを流せます</span>
      </div>
      <div>
        <span className={labelCls}>SNS・ファンクラブのリンク</span>
        <div className="space-y-4 border border-line p-4">
          {snsFields.map((f) => (
            <div key={f.key}>
              <label className={hintCls}>{f.label}</label>
              <input
                type="text"
                className={field}
                value={sns[f.key]}
                onChange={(e) => setSns({ ...sns, [f.key]: e.target.value })}
                placeholder="https://...（未定なら # のまま）"
              />
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className={labelCls}>プロフィール：リード文</label>
        <input type="text" className={field} maxLength={100} value={lead} onChange={(e) => setLead(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>プロフィール：本文</label>
        <textarea className={`${field} min-h-40`} maxLength={4000} value={body} onChange={(e) => setBody(e.target.value)} placeholder={"1行空けると段落が変わります。"} />
      </div>
      <Notice error={error} done={done} doneText="設定の更新を受け付けました" />
      <button type="button" className={primaryBtn} disabled={sending} onClick={submit}>
        {sending ? "送信中…" : "この内容で更新する"}
      </button>
    </div>
  );
}

// ---- 既存項目の一覧＋削除 -------------------------------------------------

function CurrentList({
  password,
  file,
  items,
}: {
  password: string;
  file: "releases" | "live" | "movies";
  items: { id: string; label: string }[];
}) {
  const [removed, setRemoved] = useState<string[]>([]);
  const [error, setError] = useState("");
  const visible = items.filter((i) => !removed.includes(i.id));

  async function remove(id: string, label: string) {
    setError("");
    if (!window.confirm(`「${label}」を削除します。よろしいですか？`)) return;
    const res = await post("/api/studio/content", { password, file, action: "remove", id });
    if (!res.ok) return setError(res.error ?? "削除に失敗しました");
    setRemoved((r) => [...r, id]);
  }

  return (
    <div>
      <span className={labelCls}>現在の掲載内容</span>
      {visible.length === 0 ? (
        <p className="border border-line bg-paper-soft px-4 py-3 text-sm text-muted">掲載中の項目はありません</p>
      ) : (
        <ul className="divide-y divide-line-soft border border-line">
          {visible.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-sm leading-relaxed">{item.label}</span>
              <button type="button" className={dangerBtn} onClick={() => remove(item.id, item.label)}>
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <span className={hintCls}>
        内容の修正は「削除→追加し直し」で行えます（表示は最新反映まで約2分ずれることがあります）
      </span>
    </div>
  );
}

// ---- グッズ -------------------------------------------------------------

const GOODS_CATEGORIES: GoodsCategory[] = [
  "APPAREL",
  "MUSIC",
  "ACCESSORY",
  "GOODS",
  "OTHER",
];

function GoodsTab({ password, initial }: { password: string; initial: Goods[] }) {
  const [items, setItems] = useState<Goods[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<GoodsCategory>("GOODS");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [active, setActive] = useState(true);
  const [keepImage, setKeepImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [doneText, setDoneText] = useState("");
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");

  function resetForm() {
    setEditingId(null);
    setName("");
    setCategory("GOODS");
    setPrice("");
    setStock("");
    setDescription("");
    setExternalUrl("");
    setActive(true);
    setKeepImage("");
    setImageFile(null);
    setError("");
  }

  function startEdit(g: Goods) {
    setDone(false);
    setError("");
    setEditingId(g.id);
    setName(g.name);
    setCategory(g.category);
    setPrice(String(g.price));
    setStock(String(g.stock));
    setDescription(g.description);
    setExternalUrl(g.externalUrl ?? "");
    setActive(g.active);
    setKeepImage(g.image ?? "");
    setImageFile(null);
    document.getElementById("goods-form")?.scrollIntoView({ behavior: "smooth" });
  }

  async function removeItem(g: Goods) {
    setListError("");
    if (!window.confirm(`「${g.name}」を削除します。よろしいですか？`)) return;
    const res = await post("/api/studio/goods", { password, action: "remove", id: g.id });
    if (!res.ok) return setListError(res.error ?? "削除に失敗しました");
    setItems((prev) => prev.filter((x) => x.id !== g.id));
    if (editingId === g.id) resetForm();
  }

  async function submit() {
    setError("");
    setDone(false);
    if (!name.trim()) return setError("商品名を入力してください");
    if (!description.trim()) return setError("商品説明を入力してください");
    const priceNum = Number(price);
    if (!Number.isInteger(priceNum) || priceNum < 0)
      return setError("価格は0以上の整数で入力してください");
    const stockNum = Number(stock);
    if (!Number.isInteger(stockNum) || stockNum < 0)
      return setError("在庫数は0以上の整数で入力してください");
    setSending(true);
    let image = editingId ? keepImage : "";
    if (imageFile) {
      try {
        const dataUrl = await resizeImage(imageFile, 1400);
        const up = await post("/api/studio/image", { password, role: "goods", dataUrl });
        if (!up.ok) {
          setSending(false);
          return setError(up.error ?? "画像のアップロードに失敗しました");
        }
        image = up.path ?? "";
      } catch {
        setSending(false);
        return setError("画像の読み込みに失敗しました。別の画像でお試しください");
      }
    }
    const item = {
      name,
      category,
      price: priceNum,
      stock: stockNum,
      description,
      externalUrl,
      image,
      active,
    };
    const res = await post("/api/studio/goods", {
      password,
      action: editingId ? "update" : "append",
      ...(editingId ? { id: editingId } : {}),
      item,
    });
    setSending(false);
    if (!res.ok) return setError(res.error ?? "エラーが発生しました");
    // 一覧を即時反映（サイト公開反映は約2分）
    const saved: Goods = {
      id: editingId ?? `goods-tmp-${Date.now().toString(36)}`,
      name,
      category,
      price: priceNum,
      description,
      stock: stockNum,
      active,
      ...(image ? { image } : {}),
      ...(externalUrl ? { externalUrl } : {}),
    };
    setItems((prev) =>
      editingId ? prev.map((x) => (x.id === editingId ? saved : x)) : [...prev, saved],
    );
    setDoneText(editingId ? "商品を更新しました" : "商品を追加しました");
    setDone(true);
    resetForm();
  }

  return (
    <div className="space-y-6">
      <div>
        <span className={labelCls}>現在の商品</span>
        {items.length === 0 ? (
          <p className="border border-line bg-paper-soft px-4 py-3 text-sm text-muted">
            登録中の商品はありません
          </p>
        ) : (
          <ul className="divide-y divide-line-soft border border-line">
            {items.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm">
                    {!g.active && <span className="text-muted">［非公開］</span>}
                    {g.name}
                  </p>
                  <p className="text-[0.72rem] text-muted">
                    {GOODS_CATEGORY_LABEL[g.category]}・{yen(g.price)}・在庫{g.stock}
                    {g.externalUrl ? "・外部販売" : ""}
                    {g.stock <= 0 ? "・SOLD OUT" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    className="border border-line px-3 py-1.5 text-[0.66rem] tracking-[0.1em] text-sub transition-colors hover:border-gold hover:text-gold"
                    onClick={() => startEdit(g)}
                  >
                    編集
                  </button>
                  <button type="button" className={dangerBtn} onClick={() => removeItem(g)}>
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {listError && <p className="mt-2 text-sm text-red-700">{listError}</p>}
      </div>

      <div id="goods-form" className="space-y-6 border-t border-line pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[0.8rem] tracking-[0.2em] text-gold">
            {editingId ? "商品を編集" : "新しい商品を追加"}
          </h3>
          {editingId && (
            <button
              type="button"
              className="text-[0.72rem] text-muted underline"
              onClick={resetForm}
            >
              新規追加に戻る
            </button>
          )}
        </div>
        <div>
          <label className={labelCls}>商品名</label>
          <input
            type="text"
            className={field}
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：ロゴTシャツ（ブラック）"
          />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label className={labelCls}>カテゴリ</label>
            <select
              className={field}
              value={category}
              onChange={(e) => setCategory(e.target.value as GoodsCategory)}
            >
              {GOODS_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {GOODS_CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>価格（税込・円）</label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              className={field}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="4200"
            />
          </div>
          <div>
            <label className={labelCls}>在庫数</label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              className={field}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="30"
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>商品説明</label>
          <textarea
            className={`${field} min-h-28`}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>商品写真（あれば）</label>
          <input
            type="file"
            accept="image/*"
            className={field}
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
          {editingId && keepImage && !imageFile && (
            <span className={hintCls}>
              現在の写真を使用中。変更する場合のみ選び直してください
            </span>
          )}
          <span className={hintCls}>自動で軽量化されます。スマホの写真そのままで大丈夫です</span>
        </div>
        <div>
          <label className={labelCls}>外部ショップのURL（BASE / STORES 等・任意）</label>
          <input
            type="url"
            className={field}
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://...（入力するとサイト内注文ではなく外部リンクになります）"
          />
        </div>
        <label className="flex items-center gap-3 text-sm text-sub">
          <input
            type="checkbox"
            className="accent-gold"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          サイトに掲載する（外すと下書きとして非公開）
        </label>
        <Notice error={error} done={done} doneText={doneText} />
        <button type="button" className={primaryBtn} disabled={sending} onClick={submit}>
          {sending ? "送信中…" : editingId ? "この内容で更新する" : "この内容で追加する"}
        </button>
      </div>
    </div>
  );
}

// ---- 注文・顧客 ---------------------------------------------------------

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

const STATUS_STYLE: Record<OrderStatus, string> = {
  受付: "border-gold-soft text-gold",
  入金確認: "border-sky-300 text-sky-700",
  発送済み: "border-emerald-300 text-emerald-700",
  キャンセル: "border-line text-muted",
};

function OrdersTab({ password }: { password: string }) {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [stats, setStats] = useState<{
    totalSales: number;
    paidOrShipped: number;
    pending: number;
    count: number;
  } | null>(null);
  const [view, setView] = useState<"orders" | "customers">("orders");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    if (!password) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/studio/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action: "list" }),
    });
    setLoading(false);
    let json: {
      ok?: boolean;
      error?: string;
      orders?: Order[];
      customers?: CustomerSummary[];
      stats?: typeof stats;
    };
    try {
      json = await res.json();
    } catch {
      return setError("読み込みに失敗しました");
    }
    if (!res.ok || !json.ok) return setError(json.error ?? "読み込みに失敗しました");
    setOrders(json.orders ?? []);
    setCustomers(json.customers ?? []);
    setStats(json.stats ?? null);
    setLoaded(true);
  }

  async function changeStatus(id: string, status: OrderStatus) {
    setBusyId(id);
    const res = await post("/api/studio/orders", { password, action: "status", id, status });
    setBusyId(null);
    if (!res.ok) return setError(res.error ?? "更新に失敗しました");
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  async function removeOrder(id: string) {
    if (!window.confirm(`注文 ${id} を削除します。よろしいですか？`)) return;
    setBusyId(id);
    const res = await post("/api/studio/orders", { password, action: "delete", id });
    setBusyId(null);
    if (!res.ok) return setError(res.error ?? "削除に失敗しました");
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  if (!loaded) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-sub">
          注文情報には個人情報が含まれるため、ボタンを押したときだけ読み込みます。
        </p>
        <button type="button" className={primaryBtn} disabled={loading} onClick={load}>
          {loading ? "読み込み中…" : "注文・顧客データを読み込む"}
        </button>
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="border border-line px-3 py-4 text-center">
            <p className="font-display text-lg tracking-wide">{yen(stats.totalSales)}</p>
            <p className="mt-1 text-[0.66rem] tracking-[0.1em] text-muted">売上（キャンセル除く）</p>
          </div>
          <div className="border border-line px-3 py-4 text-center">
            <p className="font-display text-lg tracking-wide">{stats.count}</p>
            <p className="mt-1 text-[0.66rem] tracking-[0.1em] text-muted">注文件数</p>
          </div>
          <div className="border border-line px-3 py-4 text-center">
            <p className="font-display text-lg tracking-wide text-gold">{stats.pending}</p>
            <p className="mt-1 text-[0.66rem] tracking-[0.1em] text-muted">未対応（受付）</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["orders", "customers"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`border px-3 py-1.5 text-[0.7rem] tracking-[0.12em] transition-colors ${
                view === v ? "border-ink bg-ink text-paper" : "border-line text-sub"
              }`}
            >
              {v === "orders" ? "注文一覧" : "顧客一覧"}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="text-[0.72rem] text-muted underline"
          disabled={loading}
          onClick={load}
        >
          {loading ? "更新中…" : "再読み込み"}
        </button>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {view === "orders" ? (
        orders.length === 0 ? (
          <p className="border border-line bg-paper-soft px-4 py-3 text-sm text-muted">
            まだ注文はありません
          </p>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li key={o.id} className="border border-line p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-display tracking-widest">{o.id}</span>
                    <span className="ml-3 text-[0.72rem] text-muted">
                      {fmtDateTime(o.createdAt)}
                    </span>
                  </div>
                  <span
                    className={`border px-2 py-0.5 text-[0.66rem] tracking-[0.1em] ${STATUS_STYLE[o.status]}`}
                  >
                    {o.status}
                  </span>
                </div>
                <div className="mb-3 grid gap-1 text-[0.82rem] leading-relaxed text-sub">
                  <p>
                    <span className="text-ink">{o.customer.name}</span>（{o.customer.kana}）
                  </p>
                  <p>{o.customer.email}／{o.customer.phone}</p>
                  <p>
                    〒{o.customer.postal}　{o.customer.address}
                  </p>
                </div>
                <ul className="mb-3 border-y border-line-soft py-2 text-[0.82rem]">
                  {o.items.map((it) => (
                    <li key={it.id} className="flex justify-between py-0.5">
                      <span>
                        {it.name} × {it.qty}
                      </span>
                      <span className="tabular-nums text-sub">{yen(it.price * it.qty)}</span>
                    </li>
                  ))}
                  <li className="mt-1 flex justify-between border-t border-line-soft pt-1.5 font-medium">
                    <span>合計</span>
                    <span className="tabular-nums">{yen(o.total)}</span>
                  </li>
                </ul>
                {o.note && (
                  <p className="mb-3 whitespace-pre-line border border-line-soft bg-paper-soft px-3 py-2 text-[0.8rem] text-sub">
                    備考：{o.note}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="border border-line bg-paper px-3 py-1.5 text-[0.75rem] focus:border-gold focus:outline-none"
                    value={o.status}
                    disabled={busyId === o.id}
                    onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <a
                    href={`mailto:${o.customer.email}?subject=${encodeURIComponent(
                      `【ARTIST OFFICIAL】ご注文 ${o.id} について`,
                    )}`}
                    className="border border-line px-3 py-1.5 text-[0.7rem] tracking-[0.1em] text-sub transition-colors hover:border-gold hover:text-gold"
                  >
                    メール作成
                  </a>
                  <button
                    type="button"
                    className={dangerBtn}
                    disabled={busyId === o.id}
                    onClick={() => removeOrder(o.id)}
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : customers.length === 0 ? (
        <p className="border border-line bg-paper-soft px-4 py-3 text-sm text-muted">
          まだ顧客はいません
        </p>
      ) : (
        <ul className="divide-y divide-line-soft border border-line">
          {customers.map((c) => (
            <li key={c.email} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-ink">{c.name}</span>
                <span className="text-[0.8rem] tabular-nums text-sub">{yen(c.totalSpent)}</span>
              </div>
              <p className="mt-0.5 text-[0.72rem] text-muted">
                {c.email}・{c.orderCount}回・最終 {fmtDateTime(c.lastOrderAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---- 全体 ---------------------------------------------------------------

const TABS = [
  { key: "news", label: "NEWS" },
  { key: "releases", label: "リリース" },
  { key: "live", label: "LIVE" },
  { key: "movies", label: "MOVIE" },
  { key: "goods", label: "グッズ" },
  { key: "orders", label: "注文・顧客" },
  { key: "photos", label: "写真" },
  { key: "settings", label: "設定" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function StudioTabs({
  news,
  releases,
  live,
  movies,
  settings,
  profile,
  goods,
}: {
  news: NewsItem[];
  releases: Release[];
  live: LiveEvent[];
  movies: Movie[];
  settings: SiteSettings;
  profile: Profile;
  goods: Goods[];
}) {
  const [tab, setTab] = useState<TabKey>("news");
  const [password, setPassword] = useState("");

  return (
    <div className="space-y-8">
      <div>
        <label className={labelCls} htmlFor="studio-password">
          公開パスワード（全タブ共通・最初に入力してください）
        </label>
        <input
          id="studio-password"
          type="password"
          className={field}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="管理者から共有されたパスワード"
        />
      </div>

      <div className="flex flex-wrap gap-2" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`border px-4 py-2 text-[0.72rem] tracking-[0.14em] transition-colors ${
              tab === t.key
                ? "border-ink bg-ink text-paper"
                : "border-line text-sub hover:border-gold hover:text-gold"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!password && (
        <p className="border border-gold-soft bg-paper-soft px-4 py-3 text-sm text-sub">
          まず上の欄に公開パスワードを入力してください。入力すると各タブから公開・更新ができます。
        </p>
      )}

      <div className={password ? "" : "pointer-events-none opacity-40"}>
        {tab === "news" && <NewsTab password={password} initial={news} />}
        {tab === "releases" && <ReleaseTab password={password} initial={releases} />}
        {tab === "live" && <LiveTab password={password} initial={live} />}
        {tab === "movies" && <MovieTab password={password} initial={movies} />}
        {tab === "goods" && <GoodsTab password={password} initial={goods} />}
        {tab === "orders" && <OrdersTab password={password} />}
        {tab === "photos" && <PhotoTab password={password} settings={settings} />}
        {tab === "settings" && (
          <SettingsTab password={password} settings={settings} profile={profile} />
        )}
      </div>
    </div>
  );
}
