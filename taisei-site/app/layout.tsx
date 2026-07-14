import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Noto_Serif_JP, Gloock } from "next/font/google";
import "./globals.css";
import FloatingSns from "@/components/FloatingSns";
import { siteMeta, snsListFrom } from "@/lib/content";
import { getSettings } from "@/lib/data";
import { BASE_URL } from "@/lib/site";

const notoSerifJp = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const gloock = Gloock({
  variable: "--font-gloock",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: siteMeta.siteName,
    template: `%s | ${siteMeta.siteName}`,
  },
  description: siteMeta.description,
  openGraph: {
    title: siteMeta.siteName,
    description: siteMeta.description,
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = getSettings();
  // 検索エンジンに「福本大晴の公式サイト」であることを正しく伝える構造化データ
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteMeta.artistName,
    alternateName: siteMeta.artistNameEn,
    url: BASE_URL,
    sameAs: Object.values(settings.sns).filter((u) => u !== "#"),
  };
  return (
    <html lang="ja" className={`${notoSerifJp.variable} ${gloock.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <FloatingSns snsLinks={snsListFrom(settings.sns)} />
        <Analytics />
      </body>
    </html>
  );
}
