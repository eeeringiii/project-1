import type { Metadata } from "next";
import { Noto_Sans_JP, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnalyticsScripts from "@/components/common/AnalyticsScripts";
import { siteMeta, BASE_URL } from "@/lib/site";

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: siteMeta.title,
    template: `%s｜${siteMeta.siteName}`,
  },
  description: siteMeta.description,
  keywords: [...siteMeta.keywords],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: siteMeta.siteName,
    title: siteMeta.title,
    description: siteMeta.description,
    url: BASE_URL,
    images: [{ url: "/api/og", width: 1200, height: 630, alt: siteMeta.siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteMeta.title,
    description: siteMeta.description,
    images: ["/api/og"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteMeta.siteName,
    alternateName: siteMeta.reading,
    url: BASE_URL,
    description: siteMeta.description,
    inLanguage: "ja",
  };

  return (
    <html lang="ja" className={`${notoSansJp.variable} ${spaceGrotesk.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a href="#main" className="skip-link">
          本文へスキップ
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <AnalyticsScripts />
      </body>
    </html>
  );
}
