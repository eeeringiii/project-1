import { typeCodes, TypeCode } from '@/types';
import { FortuneCategory, FortuneLevel, fortuneCategories, fortuneLevels, luckyActions } from '@/data/fortune';

/**
 * 「今日のヲタク運」の算出ロジック。
 *
 * ・完全に決定論的です。日付とタイプコードだけから結果が決まるので、
 *   同じ日なら誰が見ても・何度リロードしても同じ結果になります（＝SNSで話が合う）。
 * ・乱数もサーバー通信も使いません。診断ロジック（lib/diagnosis）とは無関係です。
 * ・日付は日本時間（UTC+9）基準。端末のタイムゾーンに左右されません。
 */

/** 日本時間での YYYY-MM-DD を返します */
export function getJstDateKey(now: Date = new Date()): string {
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const month = String(jst.getUTCMonth() + 1).padStart(2, '0');
  const day = String(jst.getUTCDate()).padStart(2, '0');
  return `${jst.getUTCFullYear()}-${month}-${day}`;
}

const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

/** 2026-08-03 → 2026.08.03（月） */
export function formatDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const weekday = weekdays[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}（${weekday}）`;
}

/** FNV-1a。短い文字列から安定した数値を作るためだけに使います */
function hash(seed: string): number {
  let value = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    value ^= seed.charCodeAt(i);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

const pick = <T,>(list: T[], seed: string): T => list[hash(seed) % list.length];

/** 1位＝92点前後、16位＝24点前後になるように、順位から基準点を引きます */
const TOP_SCORE = 92;
const SCORE_STEP = 4.5;
const JITTER = 15;

export interface FortuneCategoryResult {
  id: string;
  label: string;
  icon: string;
  /** 0〜99 */
  score: number;
  /** 1〜5 */
  stars: number;
  comment: string;
}

export interface DailyFortune {
  code: TypeCode;
  /** 1〜16 */
  rank: number;
  level: FortuneLevel;
  headline: string;
  categories: FortuneCategoryResult[];
  luckyAction: string;
}

function levelForRank(rank: number): FortuneLevel {
  let filled = 0;
  for (const level of fortuneLevels) {
    filled += level.span;
    if (rank <= filled) return level;
  }
  return fortuneLevels[fortuneLevels.length - 1];
}

function categoryResult(dateKey: string, code: TypeCode, rank: number, category: FortuneCategory): FortuneCategoryResult {
  const base = TOP_SCORE - (rank - 1) * SCORE_STEP;
  const jitter = (hash(`${dateKey}/${code}/${category.id}/score`) % (JITTER * 2 + 1)) - JITTER;
  const score = Math.max(8, Math.min(99, Math.round(base + jitter)));
  const bucket = score >= 70 ? 'high' : score >= 42 ? 'mid' : 'low';
  return {
    id: category.id,
    label: category.label,
    icon: category.icon,
    score,
    stars: Math.max(1, Math.min(5, Math.ceil(score / 20))),
    comment: pick(category.comments[bucket], `${dateKey}/${code}/${category.id}/comment`),
  };
}

function createFortune(dateKey: string, code: TypeCode, rank: number): DailyFortune {
  const level = levelForRank(rank);
  return {
    code,
    rank,
    level,
    headline: pick(level.headlines, `${dateKey}/${code}/headline`),
    categories: fortuneCategories.map(category => categoryResult(dateKey, code, rank, category)),
    luckyAction: pick(luckyActions, `${dateKey}/${code}/lucky`),
  };
}

/** その日の16タイプ分の運勢を、1位から順に返します */
export function buildDailyFortunes(dateKey: string): DailyFortune[] {
  return [...typeCodes]
    .map((code, index) => ({ code, index, roll: hash(`${dateKey}/rank/${code}`) }))
    .sort((a, b) => b.roll - a.roll || a.index - b.index)
    .map(({ code }, index) => createFortune(dateKey, code, index + 1));
}
