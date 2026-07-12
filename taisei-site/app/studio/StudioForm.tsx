"use client";

import { useState } from "react";

const categories = [
  { value: "LIVE", label: "LIVE（ライブ・公演）" },
  { value: "RELEASE", label: "RELEASE（CD・配信リリース）" },
  { value: "EVENT", label: "EVENT（イベント）" },
  { value: "MEDIA", label: "MEDIA（TV・雑誌・WEB出演）" },
  { value: "INFO", label: "INFO（その他のお知らせ）" },
];

function today() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function StudioForm() {
  const [password, setPassword] = useState("");
  const [date, setDate] = useState(today());
  const [category, setCategory] = useState("INFO");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    if (!password) return setError("パスワードを入力してください");
    if (!title.trim()) return setError("タイトルを入力してください");
    if (!body.trim()) return setError("本文を入力してください");
    setSending(true);
    try {
      const res = await fetch("/api/studio/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          date: date.replaceAll("-", "."),
          category,
          title,
          body,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "エラーが発生しました");
      } else {
        setDone(true);
      }
    } catch {
      setError("通信に失敗しました。電波状況をご確認のうえ再度お試しください");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="border border-gold-soft bg-paper-soft p-8 text-center">
        <p className="mb-3 text-lg tracking-[0.1em] text-gold">公開を受け付けました</p>
        <p className="mb-6 text-sm leading-loose text-sub">
          約2分後にサイトのNEWSへ自動反映されます。
          <br />
          反映後、
          <a href="/news" className="mx-1 text-gold underline underline-offset-4">
            NEWS一覧
          </a>
          でご確認ください。
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(false);
            setTitle("");
            setBody("");
          }}
          className="border border-ink px-6 py-3 text-[0.75rem] tracking-[0.2em] transition-colors hover:border-gold hover:text-gold"
        >
          続けてもう1件入稿する
        </button>
      </div>
    );
  }

  const field = "w-full border border-line bg-paper px-4 py-3 text-[0.95rem] focus:border-gold focus:outline-none";
  const label = "mb-2 block text-[0.8rem] tracking-[0.1em] text-ink";
  const hint = "mt-1 block text-[0.72rem] leading-relaxed text-muted";

  return (
    <div className="space-y-7">
      <div>
        <label className={label} htmlFor="studio-date">
          ① 日付
        </label>
        <input
          id="studio-date"
          type="date"
          className={field}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <span className={hint}>記事に表示される日付です。ふつうは今日のままでOK</span>
      </div>

      <div>
        <label className={label} htmlFor="studio-category">
          ② カテゴリ
        </label>
        <select
          id="studio-category"
          className={field}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <span className={hint}>迷ったら「INFO」で大丈夫です</span>
      </div>

      <div>
        <label className={label} htmlFor="studio-title">
          ③ タイトル
        </label>
        <input
          id="studio-title"
          type="text"
          className={field}
          placeholder="例：「TAISEI FUKUMOTO LIVE 2026」開催決定"
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <span className={hint}>NEWS一覧にそのまま表示されます</span>
      </div>

      <div>
        <label className={label} htmlFor="studio-body">
          ④ 本文
        </label>
        <textarea
          id="studio-body"
          className={`${field} min-h-56`}
          placeholder={"本文を入力します。\n\n1行空けると段落が変わります。"}
          maxLength={8000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <span className={hint}>1行空けると段落の区切りになります</span>
      </div>

      <div>
        <label className={label} htmlFor="studio-password">
          ⑤ 公開パスワード
        </label>
        <input
          id="studio-password"
          type="password"
          className={field}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span className={hint}>管理者から共有されたパスワードを入力してください</span>
      </div>

      {error && (
        <p className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={sending}
        className="w-full border border-ink bg-ink px-6 py-4 text-[0.85rem] tracking-[0.3em] text-paper transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {sending ? "公開処理中…" : "この内容で公開する"}
      </button>
      <p className="text-center text-[0.72rem] leading-relaxed text-muted">
        押した約2分後にサイトへ自動反映されます。取り消したいときは管理者へご連絡ください
      </p>
    </div>
  );
}
