import type { Metadata } from "next";
import { Noto_Serif_JP, Gloock } from "next/font/google";
import "./globals.css";
import FloatingSns from "@/components/FloatingSns";
import { siteMeta } from "@/lib/content";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSerifJp.variable} ${gloock.variable}`}>
      <body>
        {children}
        <FloatingSns />
      </body>
    </html>
  );
}
