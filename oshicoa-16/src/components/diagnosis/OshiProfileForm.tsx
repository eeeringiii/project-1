"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDiagnosisStore } from "@/stores/diagnosisStore";
import { GENRE_OPTIONS, DURATION_OPTIONS, FREQUENCY_OPTIONS } from "@/constants/oshiOptions";
import { QUESTION_SET_META, type QuestionSetId } from "@/data/questionSets";
import { trackEvent } from "@/lib/analytics";

/**
 * 診断前の任意入力フォーム。全項目スキップ可能。
 * 入力値はサーバーへ送信せず、Zustand + localStorage（端末内）でのみ保持する。
 */
export default function OshiProfileForm() {
  const router = useRouter();
  const setOshiProfile = useDiagnosisStore((s) => s.setOshiProfile);
  const setMode = useDiagnosisStore((s) => s.setMode);

  const [mode, setLocalMode] = useState<QuestionSetId>("standard");
  const [oshiName, setOshiName] = useState("");
  const [genre, setGenre] = useState("");
  const [duration, setDuration] = useState("");
  const [frequency, setFrequency] = useState("");

  const start = () => {
    // セットを確定（内部で回答をリセットして開始位置を戻す）。
    setMode(mode);
    const profile = {
      oshiName: oshiName.trim() || undefined,
      genre: genre || undefined,
      duration: duration || undefined,
      frequency: frequency || undefined,
    };
    setOshiProfile(profile);
    const filled = Object.values(profile).some(Boolean);
    if (filled) trackEvent("oshi_profile_completed");
    trackEvent("diagnosis_start", { mode });
    router.push("/diagnosis/questions");
  };

  return (
    <div className="panel edge-glow p-6 sm:p-8">
      <div className="space-y-6">
        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-text">診断のボリューム</legend>
          <div className="grid grid-cols-2 gap-3">
            {(Object.values(QUESTION_SET_META)).map((meta) => {
              const active = mode === meta.id;
              return (
                <button
                  key={meta.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setLocalMode(meta.id)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    active
                      ? "border-violet bg-[rgba(139,92,246,0.14)]"
                      : "border-line-strong hover:border-violet"
                  }`}
                >
                  <span className="flex items-baseline gap-2">
                    <span className="font-display text-base font-bold text-text">{meta.label}</span>
                    <span className="type-code text-xs text-violet">{meta.count}問</span>
                  </span>
                  <span className="mt-1 block text-xs text-text-muted">{meta.minutes}</span>
                  <span className="mt-1 block text-xs text-text-sub leading-relaxed">
                    {meta.description}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="oshiName" className="mb-2 block text-sm font-medium text-text">
            推しの名前 <span className="text-text-muted">（任意）</span>
          </label>
          <input
            id="oshiName"
            type="text"
            value={oshiName}
            onChange={(e) => setOshiName(e.target.value)}
            placeholder="〇〇くん / 〇〇ちゃん / 〇〇さん"
            className="field"
            autoComplete="off"
            maxLength={40}
          />
        </div>

        <Select id="genre" label="ジャンル" value={genre} onChange={setGenre} options={GENRE_OPTIONS} />
        <Select id="duration" label="推している期間" value={duration} onChange={setDuration} options={DURATION_OPTIONS} />
        <Select id="frequency" label="現場頻度" value={frequency} onChange={setFrequency} options={FREQUENCY_OPTIONS} />

        <p className="rounded-lg border border-line bg-[rgba(79,140,255,0.06)] p-3 text-xs text-text-sub leading-relaxed">
          入力した推しの情報は、この端末内でのみ使用されます。サーバーへは送信されません。
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={start} className="btn btn-primary flex-1">
            この内容で診断をはじめる
          </button>
        </div>
      </div>
    </div>
  );
}

function Select({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-text">
        {label} <span className="text-text-muted">（任意）</span>
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="field">
        <option value="">選択しない</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
