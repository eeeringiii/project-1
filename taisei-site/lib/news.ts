import fs from "node:fs";
import path from "node:path";
import type { NewsItem } from "@/lib/content";

// NEWS記事は content/news/*.json に1記事1ファイルで保存されている。
// 入稿ページ（/studio）が同じ形式のファイルをGitHub経由で追加する。
const newsDir = path.join(process.cwd(), "content", "news");

export function getNews(): NewsItem[] {
  const files = fs.readdirSync(newsDir).filter((f) => f.endsWith(".json"));
  const items = files.map(
    (f) => JSON.parse(fs.readFileSync(path.join(newsDir, f), "utf8")) as NewsItem,
  );
  return items.sort((a, b) => (a.date < b.date ? 1 : -1));
}
