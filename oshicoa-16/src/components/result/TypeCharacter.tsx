"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { TypeCode } from "@/types";
import TypeVisual from "@/components/result/TypeVisual";

type Props = {
  code: TypeCode;
  name: string;
  size?: number;
  className?: string;
};

/**
 * 読み込みに成功したキャラクター画像を覚えておく小さなストア。
 * 同じ画像を何度も取りに行かず、一度確認できたタイプは再表示時に
 * 抽象ビジュアルへ戻ってちらつくこともない。
 */
const resolvedByCode = new Map<TypeCode, string>();
const requested = new Set<TypeCode>();
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** `.webp` → `.png` の順に実在を確認し、見つかったURLをストアへ記録する。 */
function prefetchCharacter(code: TypeCode) {
  if (typeof window === "undefined" || requested.has(code)) return;
  requested.add(code);

  const candidates = [`/characters/${code}.webp`, `/characters/${code}.png`];
  const tryLoad = (i: number) => {
    if (i >= candidates.length) return;
    const probe = new Image();
    probe.onload = () => {
      if (probe.naturalWidth <= 0) {
        tryLoad(i + 1);
        return;
      }
      resolvedByCode.set(code, candidates[i]);
      listeners.forEach((listener) => listener());
    };
    probe.onerror = () => tryLoad(i + 1);
    probe.src = candidates[i];
  };
  tryLoad(0);
}

/** 実在が確認できたキャラクター画像のURL。未確認の間は null（抽象ビジュアルを表示）。 */
function useCharacterImage(code: TypeCode) {
  useEffect(() => {
    prefetchCharacter(code);
  }, [code]);

  return useSyncExternalStore(
    subscribe,
    () => resolvedByCode.get(code) ?? null,
    () => null,
  );
}

/**
 * タイプごとのキャラクター画像。
 * `public/characters/{CODE}.webp`（無ければ .png）を表示し、
 * 画像が未用意の場合は抽象ビジュアル（TypeVisual）へ自動フォールバックする。
 * これにより、キャラクターイラストを後から差し込むだけでUIが完成する。
 *
 * 実装上の注意：
 * 画像を <img> として直接SSRすると、Reactがハイドレートして onError を張る前に
 * 404が確定し、error イベントが取りこぼされてフォールバックが働かず「割れ画像」が
 * 残る（ハイドレーション競合）。それを避けるため、SSR/初期表示は常に抽象ビジュアルとし、
 * クライアント側で `new Image()` により実画像の存在を確認できたときだけ差し替える。
 * 共有画像生成（generateResultImage.ts）と同じ、実績のある読み込み確認方式。
 */
export default function TypeCharacter({ code, name, size = 280, className = "" }: Props) {
  const resolvedSrc = useCharacterImage(code);

  if (!resolvedSrc) {
    return <TypeVisual code={code} size={size} className={className} />;
  }

  return (
    <div className={`relative ${className}`} style={{ maxWidth: size }}>
      {/* 画像の後ろに淡い光を敷いて、透過PNG/WebPでも馴染むようにする */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(255,182,220,0.4), rgba(157,127,224,0.18) 55%, transparent 72%)",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolvedSrc}
        alt={`${name}のイメージキャラクター`}
        width={size}
        height={size}
        className="mx-auto block h-auto w-full animate-float"
        style={{ maxWidth: size }}
      />
    </div>
  );
}
