// サイトの掲載内容をここに集約する。
// 将来 microCMS に移行する際は、この型のままAPI取得に差し替えられる構造にしてある。
// 現在の内容はすべてサンプル（仮）データ。

export type NewsCategory = "LIVE" | "RELEASE" | "EVENT" | "MEDIA" | "INFO";

export type NewsItem = {
  slug: string;
  date: string; // YYYY.MM.DD
  category: NewsCategory;
  title: string;
  body: string[];
};

export type Release = {
  slug: string;
  title: string;
  type: string;
  date: string;
  description: string;
  links: { label: string; url: string }[];
};

export type Movie = {
  title: string;
  youtubeId: string | null; // 未設定の間はプレースホルダー表示
};

export type LiveEvent = {
  date: string;
  title: string;
  venue: string;
  note: string;
};

export const siteMeta = {
  artistName: "福本大晴",
  artistNameEn: "TAISEI FUKUMOTO",
  siteName: "福本大晴 OFFICIAL SITE",
  description:
    "福本大晴オフィシャルサイト。最新のニュース、リリース、ライブ・イベント情報をお届けします。",
  sns: {
    x: "#",
    instagram: "#",
    tiktok: "#",
    youtube: "#",
    fanclub: "#",
  },
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

export const newsItems: NewsItem[] = [
  {
    slug: "live-2026",
    date: "2026.07.01",
    category: "LIVE",
    title: "「TAISEI FUKUMOTO LIVE 2026」開催決定（サンプル）",
    body: [
      "ライブ開催決定のお知らせ本文が入ります。日程・会場・チケット受付スケジュールなどをここに記載します。",
      "この記事はデザイン確認用のサンプルです。",
    ],
  },
  {
    slug: "new-single",
    date: "2026.06.20",
    category: "RELEASE",
    title: "ニューシングル 配信リリース決定（サンプル）",
    body: [
      "リリース情報の本文が入ります。収録曲・配信リンク・特典情報などをここに記載します。",
      "この記事はデザイン確認用のサンプルです。",
    ],
  },
  {
    slug: "fan-event",
    date: "2026.06.05",
    category: "EVENT",
    title: "ファンイベント開催のお知らせ（サンプル）",
    body: [
      "イベント概要の本文が入ります。",
      "この記事はデザイン確認用のサンプルです。",
    ],
  },
  {
    slug: "media-appearance",
    date: "2026.05.28",
    category: "MEDIA",
    title: "テレビ出演情報（サンプル）",
    body: ["出演情報の本文が入ります。", "この記事はデザイン確認用のサンプルです。"],
  },
  {
    slug: "site-open",
    date: "2026.05.01",
    category: "INFO",
    title: "オフィシャルサイトをリニューアルしました（サンプル）",
    body: ["リニューアルのご挨拶が入ります。", "この記事はデザイン確認用のサンプルです。"],
  },
];

export const releases: Release[] = [
  {
    slug: "new-single-2026",
    title: "New Single「タイトル未定」",
    type: "SINGLE",
    date: "2026.08.05",
    description:
      "最新シングルの紹介文が入ります。各配信サービスへのリンクボタンをここに並べ、ワンタップで聴きに行ける導線にします。（サンプル）",
    links: [
      { label: "STREAMING / DOWNLOAD", url: "#" },
      { label: "MUSIC VIDEO", url: "#" },
    ],
  },
];

export const movies: Movie[] = [
  { title: "Music Video（サンプル）", youtubeId: null },
  { title: "Music Video（サンプル）", youtubeId: null },
  { title: "Behind The Scenes（サンプル）", youtubeId: null },
];

export const liveEvents: LiveEvent[] = [
  {
    date: "2026.09.23",
    title: "TAISEI FUKUMOTO LIVE 2026（サンプル）",
    venue: "会場名が入ります（東京）",
    note: "チケット情報準備中",
  },
  {
    date: "2026.10.12",
    title: "TAISEI FUKUMOTO LIVE 2026（サンプル）",
    venue: "会場名が入ります（大阪）",
    note: "チケット情報準備中",
  },
];

export const profile = {
  lead: "まっすぐに、音と言葉を届ける。",
  paragraphs: [
    "プロフィール本文が入ります。経歴・活動内容・人柄が伝わる紹介文をここに記載します。（サンプル）",
    "受賞歴・出演歴などの実績もこのページに整理して掲載します。（サンプル）",
  ],
};
