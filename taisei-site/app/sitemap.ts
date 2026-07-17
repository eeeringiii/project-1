import type { MetadataRoute } from "next";
import { getNews } from "@/lib/news";
import { BASE_URL } from "@/lib/site";
import { shopEnabled } from "@/lib/shop";

export default function sitemap(): MetadataRoute.Sitemap {
  // サブドメイン運用時、/goods は shop.ドメイン側なので本体サイトマップからは外す
  const pages = ["", "/news", "/profile", "/discography", "/movie", "/live", "/contact", "/business"];
  if (!shopEnabled) pages.splice(6, 0, "/goods");
  return [
    ...pages.map((p) => ({ url: `${BASE_URL}${p}`, lastModified: new Date() })),
    ...getNews().map((n) => ({ url: `${BASE_URL}/news/${n.slug}` })),
  ];
}
