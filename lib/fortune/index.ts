// 「今日の推し活運勢」の決定論ロジック。
// 日付（JST）×タイプコードをシードにするため、同じ日・同じタイプなら誰が引いても同じ結果になる。
// ランダム性はなく、サーバーへ何も送らない（診断ロジックと同じ思想）。
import { getType, oshicoaTypes } from '@/data/types';
import {
  LEVELS, fortuneCategories, luckyActions, luckyItems, luckyColors, typeLineTemplates,
  type FortuneColor, type FortuneLevel,
} from '@/data/fortune';

export interface CategoryFortune { id: string; label: string; icon: string; score: number; comment: string }
export interface Fortune {
  dateKey: string;       // YYYY-MM-DD（JST）
  displayDate: string;   // 2026年7月24日（金）
  score: number;         // 総合 0-100
  level: FortuneLevel;
  headline: string;
  categories: CategoryFortune[];
  luckyAction: string;
  luckyItem: string;
  luckyColor: FortuneColor;
  luckyTypeCode: string; // 今日のラッキー同担タイプ
  luckyTypeName: string;
  typeCode?: string;
  typeName?: string;
  typeLine?: string;     // タイプ診断済みユーザー向けの導入文
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

// 32bit ハッシュ（FNV-1a）→ 決定論 PRNG（mulberry32）。
function hashSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a: number): () => number {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T>(rng: () => number, arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)] ?? arr[0];
const tier = (s: number): 'high' | 'mid' | 'low' => (s >= 67 ? 'high' : s >= 34 ? 'mid' : 'low');

const pad2 = (n: number) => String(n).padStart(2, '0');

// UTC の Date から JST の日付キー（YYYY-MM-DD）を作る。
export function toJstDateKey(d: Date = new Date()): string {
  const j = new Date(d.getTime() + 9 * 3600 * 1000);
  return `${j.getUTCFullYear()}-${pad2(j.getUTCMonth() + 1)}-${pad2(j.getUTCDate())}`;
}

// 日付キーの前日を返す（前日比較用）。
export function prevDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d) - 86400000);
  return `${t.getUTCFullYear()}-${pad2(t.getUTCMonth() + 1)}-${pad2(t.getUTCDate())}`;
}

export function getFortune(opts: { date?: Date; dateKey?: string; typeCode?: string } = {}): Fortune {
  const dateKey = opts.dateKey ?? toJstDateKey(opts.date);
  const type = opts.typeCode ? getType(opts.typeCode) : undefined;
  const rng = mulberry32(hashSeed(`${dateKey}|${type?.code ?? 'ALL'}`));

  const categories: CategoryFortune[] = fortuneCategories.map((c) => {
    const score = Math.round(rng() * 100);
    return { id: c.id, label: c.label, icon: c.icon, score, comment: pick(rng, c.comments[tier(score)]) };
  });
  const score = Math.round(categories.reduce((a, c) => a + c.score, 0) / categories.length);
  const level = LEVELS.find((l) => score >= l.min) ?? LEVELS[LEVELS.length - 1];
  const headline = pick(rng, level.headlines);
  const luckyAction = pick(rng, luckyActions);
  const luckyItem = pick(rng, luckyItems);
  const luckyColor = pick(rng, luckyColors);
  const typeLine = type ? pick(rng, typeLineTemplates).replace('%s', type.name) : undefined;
  // 今日のラッキー同担タイプ（自分自身は避ける）。
  let luckyType = pick(rng, oshicoaTypes);
  if (type && luckyType.code === type.code) {
    luckyType = oshicoaTypes[(oshicoaTypes.indexOf(luckyType) + 1) % oshicoaTypes.length];
  }

  const [y, m, d] = dateKey.split('-').map(Number);
  const wd = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const displayDate = `${y}年${m}月${d}日（${wd}）`;

  return {
    dateKey, displayDate, score, level, headline, categories,
    luckyAction, luckyItem, luckyColor,
    luckyTypeCode: luckyType.code, luckyTypeName: luckyType.name,
    typeCode: type?.code, typeName: type?.name, typeLine,
  };
}
