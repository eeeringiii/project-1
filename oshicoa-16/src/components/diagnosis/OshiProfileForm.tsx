"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDiagnosisStore } from "@/stores/diagnosisStore";
import { GENRE_OPTIONS, DURATION_OPTIONS, FREQUENCY_OPTIONS } from "@/constants/oshiOptions";
import { trackEvent } from "@/lib/analytics";

/**
 * 診断前の任意入力フォーム。全項目スキップ可能。
 * 入力値はサーバーへ送信せず、Zustand + localStorage（端末内）でのみ保持する。
 */
export default function OshiProfileForm() {
  const router = useRouter();
  const setOshiProfile = useDiagnosisStore((s) => s.setOshiProfile);
  const restartSameOshi = useDiagnosisStore((s) => s.restartSameOshi);

  const [oshiName, setOshiName] = useState("");
  const [genre, setGenre] = useState("");
  const [duration, setDuration] = useState("");
  const [frequency, setFrequency] = useState("");

  const start = () => {
    // 途中まで回答が残っている可能性があるためリセットしてから開始。
    restartSameOshi();
    const profile = {
      oshiName: oshiName.trim() || undefined,
      genre: genre || undefined,
      duration: duration || undefined,
      frequency: frequency || undefined,
    };
    setOshiProfile(profile);
    const filled = Object.values(profile).some(Boolean);
    if (filled) trackEvent("oshi_profile_completed");
    trackEvent("diagnosis_start");
    router.push("/diagnosis/questions");
  };

  return (
    <div className="panel edge-glow p-6 sm:p-8">
      <div className="space-y-6">
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
