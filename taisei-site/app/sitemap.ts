import type { MetadataRoute } from "next";
import { getNews } from "@/lib/news";
import { BASE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/news", "/profile", "/discography", "/movie", "/live", "/goods", "/contact", "/business"];
  return [
    ...pages.map((p) => ({ url: `${BASE_URL}${p}`, lastModified: new Date() })),
    ...getNews().map((n) => ({ url: `${BASE_URL}/news/${n.slug}` })),
  ];
}
