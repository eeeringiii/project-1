"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { bingoItems, BINGO_FREE_TEXT, bingoRankFor } from "@/data/bingoItems";
import { absoluteUrl } from "@/lib/site";
import { trackEvent } from "@/lib/analytics";

const CENTER = 12; // 5x5 の中央（フリー枠）

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 24項目を選んで5x5に配置（中央はフリー）。
 * 初期表示はSSRとクライアントで一致させるため決定的なシードを使い、
 * 引き直しのみ Math.random でランダム化する（ハイドレーション不一致を防ぐ）。
 */
function buildCard(rnd: () => number): string[] {
  const picks = shuffle(bingoItems, rnd).slice(0, 24);
  const cells: string[] = [];
  let p = 0;
  for (let i = 0; i < 25; i++) cells.push(i === CENTER ? BINGO_FREE_TEXT : picks[p++]);
  return cells;
}

const LINES: number[][] = (() => {
  const lines: number[][] = [];
  for (let r = 0; r < 5; r++) lines.push([0, 1, 2, 3, 4].map((c) => r * 5 + c));
  for (let c = 0; c < 5; c++) lines.push([0, 1, 2, 3, 4].map((r) => r * 5 + c));
  lines.push([0, 6, 12, 18, 24]);
  lines.push([4, 8, 12, 16, 20]);
  return lines;
})();

export default function KarmaBingo() {
  const [card, setCard] = useState<string[]>(() => buildCard(mulberry32(1)));
  const [filled, setFilled] = useState<Set<number>>(() => new Set([CENTER]));
  const [copied, setCopied] = useState(false);

  const toggle = useCallback((i: number) => {
    if (i === CENTER) return;
    setFilled((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  const reshuffle = useCallback(() => {
    setCard(buildCard(Math.random));
    setFilled(new Set([CENTER]));
  }, []);

  const bingoLines = useMemo(
    () => LINES.filter((line) => line.every((i) => filled.has(i))),
    [filled],
  );
  const bingoCount = bingoLines.length;
  const bingoCells = useMemo(() => new Set(bingoLines.flat()), [bingoLines]);
  const rank = bingoRankFor(filled.size);

  const shareText =
    `私のヲタク業ビンゴは【${bingoCount}ビンゴ】、ランクは「${rank.name}」でした。\n` +
    `あなたはいくつ当てはまる？\n#OSHICOA16 #ヲタク業ビンゴ`;
  const shareUrl = absoluteUrl("/bingo");

  const shareX = () => {
    trackEvent("bingo_shared", { channel: "x", bingo: bingoCount });
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      trackEvent("bingo_shared", { channel: "copy", bingo: bingoCount });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("コピーしてください", `${shareText}\n${shareUrl}`);
    }
  };

  return (
    <div>
      {/* スコア */}
      <div className="panel edge-glow p-5 text-center">
        <div className="flex items-center justify-center gap-6">
          <div>
            <p className="type-code text-xs text-purple">BINGO</p>
            <p className="font-display text-4xl font-bold text-gradient">{bingoCount}</p>
          </div>
          <div className="h-10 w-px bg-line" aria-hidden="true" />
          <div>
            <p className="type-code text-xs text-purple">RANK</p>
            <p className="font-display text-xl font-bold text-text">{rank.name}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-text-sub">{rank.comment}</p>
        <p className="mt-1 text-xs text-text-muted">
          {filled.size} / 25 マス達成
        </p>
      </div>

      {/* ビンゴカード */}
      <div className="mt-5 grid grid-cols-5 gap-1.5 sm:gap-2" role="group" aria-label="ヲタク業ビンゴ">
        {card.map((text, i) => {
          const isFilled = filled.has(i);
          const inBingo = bingoCells.has(i);
          const isFree = i === CENTER;
          return (
            <button
              key={i}
              type="button"
              aria-pressed={isFilled}
              disabled={isFree}
              onClick={() => toggle(i)}
              className={`flex aspect-square items-center justify-center rounded-xl border p-1 text-center text-[9px] leading-tight transition-all sm:text-[11px] ${
                isFree
                  ? "border-transparent bg-gradient-to-br from-violet to-pink font-bold text-white"
                  : isFilled
                    ? `border-transparent text-white ${inBingo ? "bg-pink" : "bg-violet"}`
                    : "border-line-strong bg-panel-soft text-text-sub hover:border-violet"
              }`}
              style={
                isFilled && !isFree
                  ? { background: inBingo ? "#ff8fc0" : "#a98bec" }
                  : undefined
              }
            >
              <span className="whitespace-pre-line">{text}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-xs text-text-muted">
        当てはまるマスをタップ。中央は「フリー」枠です。
      </p>

      {/* 操作 */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button type="button" onClick={shareX} className="btn btn-primary text-sm">
          Xでシェア
        </button>
        <button type="button" onClick={copy} className="btn btn-ghost text-sm">
          {copied ? "コピーしました" : "結果をコピー"}
        </button>
        <button type="button" onClick={reshuffle} className="btn btn-ghost text-sm">
          カードを引き直す
        </button>
        <Link href="/diagnosis" className="btn btn-ghost text-sm">
          タイプ診断もやる
        </Link>
      </div>
    </div>
  );
}
