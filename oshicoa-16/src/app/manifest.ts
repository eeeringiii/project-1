import type { MetadataRoute } from "next";
import { siteMeta } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteMeta.siteName}｜ヲタク生態診断`,
    short_name: siteMeta.siteName,
    description: siteMeta.description,
    start_url: "/",
    display: "standalone",
    background_color: "#efe9fc",
    theme_color: "#c9b3f2",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
