// サーバー専用: 秘書用/ ディレクトリの実ファイルを読み、オフィスのMY DESKに反映する。
// Server Component からのみ呼び出す（fs を使用）。
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const HISHO = path.join(ROOT, "秘書用");

function safeList(dir: string): string[] {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

function safeRead(file: string): string {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

/** 日報ファイル（YYYY-MM-DD.md）を新しい順に返す */
export function listNippou(): { date: string; file: string }[] {
  const dir = path.join(HISHO, "日報");
  return safeList(dir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .sort()
    .reverse()
    .map((f) => ({ date: f.replace(/\.md$/, ""), file: path.join(dir, f) }));
}

/** 最新日報の日付と冒頭サマリーを返す */
export function latestNippou(): { date: string; summary: string } | null {
  const list = listNippou();
  if (list.length === 0) return null;
  const body = safeRead(list[0].file);
  // 最初の見出し/箇条書きでない本文行をサマリーとして拾う
  const line =
    body
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith("#")) ?? "";
  return { date: list[0].date, summary: line.replace(/^[-*]\s*/, "") };
}

/** todo フォルダの計画ファイル（README除く）を新しい順に返す */
export function listTodos(): { title: string; date: string }[] {
  const dir = path.join(HISHO, "todo");
  return safeList(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .sort()
    .reverse()
    .map((f) => {
      const m = f.match(/^(\d{4}-\d{2}-\d{2})_(.+)\.md$/);
      return { date: m?.[1] ?? "", title: (m?.[2] ?? f.replace(/\.md$/, "")) };
    });
}

/** アイデア/SNS下書きの件数（README除く） */
export function countIdeas(): number {
  const dir = path.join(HISHO, "アイデア");
  return safeList(dir).filter((f) => f !== "README.md" && !f.startsWith(".")).length;
}

/** 公開済みNEWS記事の件数（taisei-site/content/news/*.json） */
export function countNews(): number {
  const dir = path.join(ROOT, "taisei-site", "content", "news");
  return safeList(dir).filter((f) => f.endsWith(".json")).length;
}

/**
 * 「今日のタスク」。最新todo計画ファイルの未完了チェックボックス（- [ ]）を拾う。
 * 無ければ既定のプレースホルダを返す。
 */
export function todayTasks(limit = 5): string[] {
  const todos = listTodos();
  if (todos.length === 0) return [];
  const dir = path.join(HISHO, "todo");
  const files = safeList(dir).filter((f) => f.endsWith(".md") && f !== "README.md");
  const tasks: string[] = [];
  for (const f of files.sort().reverse()) {
    const body = safeRead(path.join(dir, f));
    for (const raw of body.split("\n")) {
      const m = raw.trim().match(/^- \[ \]\s+(.+)$/);
      if (m) tasks.push(m[1].trim());
      if (tasks.length >= limit) return tasks;
    }
  }
  return tasks;
}
