"use client";

import { useEffect, useState } from "react";
import { siteMeta } from "@/lib/content";

const SEEN_KEY = "tf-opening-seen";

// 初回訪問時だけ表示するオープニング演出。
// - 同じブラウザセッション中は2回出さない
// - クリック/タップでスキップできる
// - 動きを減らす設定（prefers-reduced-motion）の人には出さない
export default function Opening() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (sessionStorage.getItem(SEEN_KEY)) return;
    sessionStorage.setItem(SEEN_KEY, "1");
    setShow(true);
    const timer = setTimeout(() => setShow(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      className="opening"
      onClick={() => setShow(false)}
      role="presentation"
      aria-hidden="true"
    >
      <div className="text-center">
        <p className="opening-en mb-4 text-[0.7rem] tracking-[0.5em] text-gold">
          {siteMeta.artistNameEn}
        </p>
        <p className="text-4xl font-medium tracking-[0.3em] md:text-5xl">
          {[...siteMeta.artistName].map((ch, i) => (
            <span
              key={i}
              className="opening-char"
              style={{ animationDelay: `${0.3 + i * 0.22}s` }}
            >
              {ch}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
