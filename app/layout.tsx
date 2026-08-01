import type { Metadata, Viewport } from 'next';
import { Zen_Maru_Gothic } from 'next/font/google';
import './globals.css';
import { Header, Footer } from '@/components/Layout';
import { SITE_URL, ogImageUrl } from '@/lib/site';

// まるっとしたゴシック体。ブランドの「かわいい」の土台なので、
// フォントを変えたいときはここを差し替えてください。
const maru = Zen_Maru_Gothic({
  weight: ['500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-maru',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'OSHICOA 16｜ヲタク生態診断', template: '%s｜OSHICOA 16' },
  description: '推しが変わっても、あなたの推し方の本性は変わらない。全24問で16のヲタク生態を解析します。',
  openGraph: { type: 'website', locale: 'ja_JP', siteName: 'OSHICOA 16', images: [{ url: ogImageUrl('CEMS'), width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', images: [ogImageUrl('CEMS')] },
};

export const viewport: Viewport = { themeColor: '#fff7f2' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={maru.variable}>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
