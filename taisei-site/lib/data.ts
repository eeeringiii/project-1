import fs from "node:fs";
import path from "node:path";
import type {
  Goods,
  LiveEvent,
  Movie,
  Profile,
  Release,
  SiteSettings,
} from "@/lib/content";

// content/*.json をサーバー側で読み込む。
// 入稿ページからの更新はGitHubコミット→自動再ビルドで反映されるため、
// ビルド時読み込みで常に最新になる。

function readJson<T>(name: string): T {
  const p = path.join(process.cwd(), "content", name);
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

export function getSettings(): SiteSettings {
  return readJson<SiteSettings>("settings.json");
}

export function getProfile(): Profile {
  return readJson<Profile>("profile.json");
}

export function getReleases(): Release[] {
  return readJson<Release[]>("releases.json");
}

export function getMovies(): Movie[] {
  return readJson<Movie[]>("movies.json");
}

export function getLiveEvents(): LiveEvent[] {
  const events = readJson<LiveEvent[]>("live.json");
  return events.sort((a, b) => (a.date > b.date ? 1 : -1));
}

// グッズ一覧。入稿ページはこの配列を編集する。
export function getGoods(): Goods[] {
  return readJson<Goods[]>("goods.json");
}

// 公開ページ用：掲載中（active）のグッズのみ
export function getActiveGoods(): Goods[] {
  return getGoods().filter((g) => g.active);
}
