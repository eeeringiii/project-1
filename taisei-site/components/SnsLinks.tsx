"use client";

import { track } from "@vercel/analytics";
import { siteMeta } from "@/lib/content";

const icons: Record<string, React.ReactNode> = {
  X: (
    <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z" />
  ),
  Instagram: (
    <>
      <rect x="2.2" y="2.2" width="19.6" height="19.6" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.6" r="1.3" />
    </>
  ),
  TikTok: (
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.31-2.83v-3.5a6.37 6.37 0 1 0 5.76 6.33V8.69a8.24 8.24 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.12z" />
  ),
  YouTube: (
    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.55 15.57V8.43L15.82 12z" />
  ),
  FanClub: (
    <path
      d="M12 20.3S4.9 15.8 2.4 12.1C.6 9.5 1.8 6 4.9 5c2-.65 4.15.15 5.35 1.8L12 9l1.75-2.2C14.95 5.15 17.1 4.35 19.1 5c3.1 1 4.3 4.5 2.5 7.1-2.5 3.7-9.6 8.2-9.6 8.2z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  ),
};

export const snsList = [
  { label: "X", url: siteMeta.sns.x },
  { label: "Instagram", url: siteMeta.sns.instagram },
  { label: "TikTok", url: siteMeta.sns.tiktok },
  { label: "YouTube", url: siteMeta.sns.youtube },
  { label: "FanClub", url: siteMeta.sns.fanclub, jp: "ファンクラブ" },
];

// SNSアイコンの並び。size は Tailwind の h-/w- に渡すピクセル値
export default function SnsLinks({
  size = 16,
  gap = "gap-5",
  className = "",
  location = "unknown",
}: {
  size?: number;
  gap?: string;
  className?: string;
  location?: string; // どの場所のボタンが押されたかの計測用ラベル
}) {
  return (
    <ul className={`flex items-center ${gap} ${className}`}>
      {snsList.map((sns) => (
        <li key={sns.label}>
          <a
            href={sns.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("sns_click", { sns: sns.label, location })}
            aria-label={`${"jp" in sns && sns.jp ? sns.jp : sns.label}（外部サイト）`}
            className="block text-sub transition-colors hover:text-gold focus-visible:text-gold"
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              {icons[sns.label]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
