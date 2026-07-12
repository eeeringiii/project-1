import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // スタッフ用の入稿ページとAPIは検索結果に出さない
        disallow: ["/studio", "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
