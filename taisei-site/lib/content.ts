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

// ---- グッズ（物販） ----
export type GoodsCategory = "APPAREL" | "MUSIC" | "ACCESSORY" | "GOODS" | "OTHER";

export const GOODS_CATEGORY_LABEL: Record<GoodsCategory, string> = {
  APPAREL: "アパレル",
  MUSIC: "音源・CD",
  ACCESSORY: "アクセサリー",
  GOODS: "グッズ",
  OTHER: "その他",
};

export type Goods = {
  id: string;
  name: string;
  category: GoodsCategory;
  price: number; // 税込・円
  description: string;
  image?: string; // /uploads/xxx.jpg
  stock: number; // 在庫数。0 で SOLD OUT 表示
  externalUrl?: string; // BASE / STORES など外部ショップで販売する場合のリンク
  active: boolean; // false の間はサイトに出さない
};

// ---- 注文・顧客 ----
export const ORDER_STATUSES = ["受付", "入金確認", "発送済み", "キャンセル"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export type OrderCustomer = {
  name: string;
  kana: string;
  email: string;
  phone: string;
  postal: string;
  address: string;
};

export type Order = {
  id: string; // 注文番号 例: 20260717-3F9K
  createdAt: string; // ISO 8601
  status: OrderStatus;
  customer: OrderCustomer;
  items: OrderItem[];
  total: number; // 税込合計（円）
  note?: string; // お客様からの備考
};

// 顧客ごとの集計（顧客管理タブ用）。メールアドレスを名寄せのキーにする。
export type CustomerSummary = {
  email: string;
  name: string;
  orderCount: number;
  totalSpent: number; // キャンセル分を除いた累計購入額
  lastOrderAt: string;
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
  // アーティスト名は仮名（プレースホルダー）。実名に差し替える際はここを変更する。
  artistName: "アーティスト",
  artistNameEn: "ARTIST",
  siteName: "ARTIST OFFICIAL SITE",
  description:
    "アーティストのオフィシャルサイト。最新のニュース、リリース、ライブ・イベント情報をお届けします。",
};

// サイト共通ナビゲーション（ヘッダー・フッターで共用）
export const navItems = [
  { href: "/news", label: "NEWS", jp: "ニュース" },
  { href: "/profile", label: "PROFILE", jp: "プロフィール" },
  { href: "/discography", label: "DISCOGRAPHY", jp: "ディスコグラフィ" },
  { href: "/movie", label: "MOVIE", jp: "ムービー" },
  { href: "/live", label: "LIVE", jp: "ライブ・イベント" },
  { href: "/goods", label: "GOODS", jp: "グッズ" },
  { href: "/contact", label: "CONTACT", jp: "ファンの皆さまへ" },
  { href: "/business", label: "BUSINESS", jp: "お仕事のご依頼" },
];
