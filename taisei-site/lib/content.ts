// サイトの型定義と、めったに変わらない固定情報。
// 更新される中身（NEWS・リリース・LIVE・MOVIE・写真・SNS等）は content/*.json にあり、
// 入稿ページ（/studio）から編集できる。

export type NewsCategory = "LIVE" | "RELEASE" | "EVENT" | "MEDIA" | "INFO";

export type NewsItem = {
  slug: string;
  date: string; // YYYY.MM.DD
  category: NewsCategory;
  title: string;
  body: string[];
  images?: string[]; // 記事内に表示する写真（/uploads/xxx.jpg）
  publishAt?: string; // 予約公開日時（ISO 8601）。未設定なら即公開
};

export type Release = {
  id: string;
  title: string;
  type: string; // SINGLE / ALBUM / DIGITAL / OTHER
  date: string; // YYYY.MM.DD
  description: string;
  links: { label: string; url: string }[];
  jacket?: string; // /uploads/xxx.jpg
};

export type Movie = {
  id: string;
  title: string;
  youtubeId: string | null; // 未設定の間はプレースホルダー表示
};

export type LiveCategory = "LIVE" | "EVENT";

export type LiveEvent = {
  id: string;
  date: string; // YYYY.MM.DD（公演日）
  title: string;
  venue: string;
  note: string;
  category: LiveCategory;
  applyStart?: string; // チケット受付開始 YYYY-MM-DD
  applyEnd?: string; // チケット受付終了 YYYY-MM-DD
  ticketUrl?: string; // 受付ページのURL
};

export type SnsUrls = {
  x: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  fanclub: string;
};

export type SiteSettings = {
  catchCopy: string;
  description: string;
  tickerText: string;
  sns: SnsUrls;
  images: { hero: string; profile: string };
};

export type Profile = {
  lead: string;
  paragraphs: string[];
};

export type SnsLink = { label: string; url: string; jp?: string };

// SNS設定を表示順のリンク一覧に変換する（サーバー/クライアント両用・fs不使用）
export function snsListFrom(sns: SnsUrls): SnsLink[] {
  return [
    { label: "X", url: sns.x },
    { label: "Instagram", url: sns.instagram },
    { label: "TikTok", url: sns.tiktok },
    { label: "YouTube", url: sns.youtube },
    { label: "FanClub", url: sns.fanclub, jp: "ファンクラブ" },
  ];
}

export const siteMeta = {
  artistName: "アーティスト",
  artistNameEn: "ARTIST",
  siteName: "アーティスト OFFICIAL SITE",
  description:
    "アーティストオフィシャルサイト。最新のニュース、リリース、ライブ・イベント情報をお届けします。",
};

// サイト共通ナビゲーション（ヘッダー・フッターで共用）
export const navItems = [
  { href: "/news", label: "NEWS", jp: "ニュース" },
  { href: "/profile", label: "PROFILE", jp: "プロフィール" },
  { href: "/discography", label: "DISCOGRAPHY", jp: "ディスコグラフィ" },
  { href: "/movie", label: "MOVIE", jp: "ムービー" },
  { href: "/live", label: "LIVE", jp: "ライブ・イベント" },
  { href: "/contact", label: "CONTACT", jp: "ファンの皆さまへ" },
  { href: "/business", label: "BUSINESS", jp: "お仕事のご依頼" },
];
