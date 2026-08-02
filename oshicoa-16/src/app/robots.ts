import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 診断途中の画面はインデックス不要。
      disallow: ["/diagnosis/questions"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
