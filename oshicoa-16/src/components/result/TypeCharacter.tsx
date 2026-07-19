"use client";

import { useState } from "react";
import type { TypeCode } from "@/types";
import TypeVisual from "@/components/result/TypeVisual";

type Props = {
  code: TypeCode;
  name: string;
  size?: number;
  className?: string;
};

/**
 * タイプごとのキャラクター画像。
 * `public/characters/{CODE}.webp`（無ければ .png）を表示し、
 * 画像が未用意の場合は抽象ビジュアル（TypeVisual）へ自動フォールバックする。
 * これにより、キャラクターイラストを後から差し込むだけでUIが完成する。
 */
export default function TypeCharacter({ code, name, size = 280, className = "" }: Props) {
  const [stage, setStage] = useState<"webp" | "png" | "fallback">("webp");

  if (stage === "fallback") {
    return <TypeVisual code={code} size={size} className={className} />;
  }

  const src = `/characters/${code}.${stage}`;
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
        src={src}
        alt={`${name}のイメージキャラクター`}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setStage((s) => (s === "webp" ? "png" : "fallback"))}
        className="mx-auto block h-auto w-full animate-float"
        style={{ maxWidth: size }}
      />
    </div>
  );
}
