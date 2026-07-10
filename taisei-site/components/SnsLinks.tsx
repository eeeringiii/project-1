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
};

export const snsList = [
  { label: "X", url: siteMeta.sns.x },
  { label: "Instagram", url: siteMeta.sns.instagram },
  { label: "TikTok", url: siteMeta.sns.tiktok },
  { label: "YouTube", url: siteMeta.sns.youtube },
];

// SNSアイコンの並び。size は Tailwind の h-/w- に渡すピクセル値
export default function SnsLinks({
  size = 16,
  gap = "gap-5",
  className = "",
}: {
  size?: number;
  gap?: string;
  className?: string;
}) {
  return (
    <ul className={`flex items-center ${gap} ${className}`}>
      {snsList.map((sns) => (
        <li key={sns.label}>
          <a
            href={sns.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${sns.label}（外部サイト）`}
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
