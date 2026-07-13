import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "サロン予約 連携ダッシュボード",
  description: "エルメ（L Message）サロン予約のデータ連携",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
