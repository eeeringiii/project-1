"use client";

import { useState } from "react";
import type {
  LiveEvent,
  Movie,
  Profile,
  Release,
  SiteSettings,
} from "@/lib/content";

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

function NewsTab({ password }: { password: string }) {
  const [date, setDate] = useState(today());
  const [category, setCategory] = useState("INFO");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [timing, setTiming] = useState<"now" | "scheduled">("now");
  const [publishAt, setPublishAt] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

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
    // 写真を先にアップロードして、記事にパスを紐づける
    const images: string[] = [];
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
    const res = await post("/api/studio/news", {
      password,
      date: toDot(date),
      category,
      title,
      body,
      ...(images.length > 0 ? { images } : {}),
      ...(timing === "scheduled" ? { publishAt } : {}),
    });
    setSending(false);
    if (!res.ok) return setError(res.error ?? "エラーが発生しました");
    setDone(true);
    setTitle("");
    setBody("");
    setPhotoFiles([]);
  }

  return (
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
      </div>
      <Notice error={error} done={done} doneText="NEWSの公開を受け付けました" />
      <button type="button" className={primaryBtn} disabled={sending} onClick={submit}>
        {sending ? "送信中…" : "この内容で公開する"}
      </button>
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

// ---- 全体 ---------------------------------------------------------------

const TABS = [
  { key: "news", label: "NEWS" },
  { key: "releases", label: "リリース" },
  { key: "live", label: "LIVE" },
  { key: "movies", label: "MOVIE" },
  { key: "photos", label: "写真" },
  { key: "settings", label: "設定" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function StudioTabs({
  releases,
  live,
  movies,
  settings,
  profile,
}: {
  releases: Release[];
  live: LiveEvent[];
  movies: Movie[];
  settings: SiteSettings;
  profile: Profile;
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
        {tab === "news" && <NewsTab password={password} />}
        {tab === "releases" && <ReleaseTab password={password} initial={releases} />}
        {tab === "live" && <LiveTab password={password} initial={live} />}
        {tab === "movies" && <MovieTab password={password} initial={movies} />}
        {tab === "photos" && <PhotoTab password={password} settings={settings} />}
        {tab === "settings" && (
          <SettingsTab password={password} settings={settings} profile={profile} />
        )}
      </div>
    </div>
  );
}
