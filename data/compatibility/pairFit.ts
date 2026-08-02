import { AxisKey, AxisPairTable, CompatibilityRank } from '@/lib/compatibility/types';

/**
 * 総合相性の設定値。
 * 「数値を少し変えたい」ときは基本このファイルだけを触れば反映されます。
 * ※ 数値を変えると共有済みURLの結果表示も変わるので、変更は慎重に。
 */

/** 各軸が総合相性に占める重み（合計100） */
export const OVERALL_AXIS_WEIGHTS = {
  RC: 30,
  EP: 20,
  GM: 30,
  TS: 20,
} satisfies Record<AxisKey, number>;

/** 軸ごとの総合相性値。同じ文字なら必ず高い、という設計にはしていません */
export const OVERALL_PAIR_FIT = {
  RC: { RR: 96, RC: 72, CC: 90 },
  EP: { EE: 92, EP: 82, PP: 90 },
  GM: { GG: 96, GM: 66, MM: 93 },
  TS: { TT: 97, TS: 64, SS: 88 },
} as const satisfies AxisPairTable<number>;

/** 4軸すべて一致したときだけ足すボーナスと、その上限 */
export const PERFECT_MATCH_BONUS = 3;
export const MAX_OVERALL_SCORE = 99;

export const COMPATIBILITY_RANKS = {
  oneSoul: {
    title: '一心同体ペア',
    shortText: '説明しなくても、推し活の呼吸が合う。',
  },
  bestBuddy: {
    title: '安心の相棒ペア',
    shortText: '同じところで笑い、同じところで本気になれる。',
  },
  chemical: {
    title: '化学反応ペア',
    shortText: '違う視点が、推し活をもっと面白くする。',
  },
  balance: {
    title: '役割分担ペア',
    shortText: '得意分野を任せ合うと、強いチームになる。',
  },
  ownPace: {
    title: 'マイペース共存ペア',
    shortText: '距離感を決めておくほど、心地よく長続きする。',
  },
} satisfies Record<CompatibilityRank, { title: string; shortText: string }>;

/** 同点になったときの並び順（結果がブレないように固定） */
export const AXIS_PRIORITY: AxisKey[] = ['RC', 'GM', 'TS', 'EP'];

/** 各軸の2文字。左が先、右があと（正規化のときの並び順にも使います） */
export const AXIS_LETTERS = {
  RC: ['R', 'C'],
  EP: ['E', 'P'],
  GM: ['G', 'M'],
  TS: ['T', 'S'],
} as const satisfies Record<AxisKey, readonly [string, string]>;

/** 画面や文章で使う軸の呼び名 */
export const AXIS_LABELS = {
  RC: '感情の受け取り方',
  EP: '楽しみの残し方',
  GM: '推し活の目的',
  TS: '人との距離感',
} satisfies Record<AxisKey, string>;

/** 軸の説明（結果画面の補足に使用） */
export const AXIS_DESCRIPTIONS = {
  RC: '共鳴（R）と接続（C）。推しの感情を受け取るか、現実的な接点を重ねるか。',
  EP: '体験（E）と所有（P）。その瞬間を浴びるか、形に残すか。',
  GM: '成長（G）と自己充足（M）。推しを押し上げるか、幸福感を大切にするか。',
  TS: '連帯（T）と単独（S）。仲間と動くか、自分のペースで動くか。',
} satisfies Record<AxisKey, string>;

/** 軸文字1文字ごとの短い呼び名（タイプ選択の絞り込みなどに使用） */
export const LETTER_LABELS: Record<string, string> = {
  R: '共鳴',
  C: '接続',
  E: '体験',
  P: '所有',
  G: '成長支援',
  M: '自己充足',
  T: '連帯',
  S: '単独',
};

export type OverallPairFit = typeof OVERALL_PAIR_FIT;
