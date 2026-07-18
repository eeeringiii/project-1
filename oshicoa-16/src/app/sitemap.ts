import type { MetadataRoute } from "next";
import { ALL_TYPE_CODES } from "@/types";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = ["/", "/diagnosis", "/types", "/compatibility", "/about", "/privacy", "/terms"];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  const typeEntries: MetadataRoute.Sitemap = ALL_TYPE_CODES.map((code) => ({
    url: absoluteUrl(`/types/${code}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...typeEntries];
}
