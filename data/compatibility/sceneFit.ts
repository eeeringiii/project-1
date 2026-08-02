import { AxisKey, AxisPairTable, CompatibilityScene } from '@/lib/compatibility/types';

/**
 * シーン別相性の設定値。
 * シーンごとに「どの軸をどれだけ重く見るか」と「軸の相性値」を持ちます。
 */

/** 画面に出す順番（固定） */
export const SCENE_ORDER: CompatibilityScene[] = [
  'renban',
  'expedition',
  'afterTalk',
  'trade',
  'supportProject',
];

export const SCENE_LABELS = {
  renban: '連番',
  expedition: '遠征',
  afterTalk: '感想会',
  trade: 'グッズ交換',
  supportProject: '応援企画',
} satisfies Record<CompatibilityScene, string>;

/** シーンの目印（絵文字1文字。差し替えたいときはここだけ変更） */
export const SCENE_ICONS = {
  renban: '🎫',
  expedition: '🚄',
  afterTalk: '☕️',
  trade: '🔁',
  supportProject: '🎪',
} satisfies Record<CompatibilityScene, string>;

/** 同点になったときの優先順位（固定） */
export const SCENE_PRIORITY: CompatibilityScene[] = [
  'renban',
  'expedition',
  'afterTalk',
  'trade',
  'supportProject',
];

export const SCENE_AXIS_WEIGHTS = {
  renban: { RC: 20, EP: 15, GM: 15, TS: 50 },
  expedition: { RC: 15, EP: 25, GM: 20, TS: 40 },
  afterTalk: { RC: 40, EP: 15, GM: 35, TS: 10 },
  trade: { RC: 10, EP: 45, GM: 10, TS: 35 },
  supportProject: { RC: 15, EP: 20, GM: 40, TS: 25 },
} satisfies Record<CompatibilityScene, Record<AxisKey, number>>;

const RENBAN_PAIR_FIT = {
  RC: { RR: 94, RC: 78, CC: 91 },
  EP: { EE: 95, EP: 81, PP: 87 },
  GM: { GG: 94, GM: 72, MM: 92 },
  TS: { TT: 98, TS: 58, SS: 86 },
} as const;

const EXPEDITION_PAIR_FIT = {
  RC: { RR: 90, RC: 80, CC: 94 },
  EP: { EE: 94, EP: 86, PP: 80 },
  GM: { GG: 92, GM: 76, MM: 89 },
  TS: { TT: 94, TS: 62, SS: 90 },
} as const;

const AFTER_TALK_PAIR_FIT = {
  RC: { RR: 98, RC: 90, CC: 86 },
  EP: { EE: 94, EP: 85, PP: 82 },
  GM: { GG: 90, GM: 82, MM: 97 },
  TS: { TT: 92, TS: 78, SS: 85 },
} as const;

const TRADE_PAIR_FIT = {
  RC: { RR: 85, RC: 84, CC: 92 },
  EP: { EE: 75, EP: 88, PP: 98 },
  GM: { GG: 88, GM: 83, MM: 86 },
  TS: { TT: 95, TS: 84, SS: 76 },
} as const;

const SUPPORT_PROJECT_PAIR_FIT = {
  RC: { RR: 88, RC: 86, CC: 94 },
  EP: { EE: 84, EP: 89, PP: 93 },
  GM: { GG: 98, GM: 86, MM: 78 },
  TS: { TT: 98, TS: 72, SS: 70 },
} as const;

export {
  RENBAN_PAIR_FIT,
  EXPEDITION_PAIR_FIT,
  AFTER_TALK_PAIR_FIT,
  TRADE_PAIR_FIT,
  SUPPORT_PROJECT_PAIR_FIT,
};

export const SCENE_PAIR_FIT = {
  renban: RENBAN_PAIR_FIT,
  expedition: EXPEDITION_PAIR_FIT,
  afterTalk: AFTER_TALK_PAIR_FIT,
  trade: TRADE_PAIR_FIT,
  supportProject: SUPPORT_PROJECT_PAIR_FIT,
} as const satisfies Record<CompatibilityScene, AxisPairTable<number>>;

/** 2軸一致のときのペア名（最も相性が高いシーンから選ぶ） */
export const SCENE_PAIR_TITLES = {
  renban: '現場で輝く連番バディ',
  expedition: 'どこまでも行ける遠征コンビ',
  afterTalk: '余韻が終わらない感想会ペア',
  trade: '推しを揃える交換同盟',
  supportProject: '推しを押し上げる作戦チーム',
} satisfies Record<CompatibilityScene, string>;

/** シーン別スコアの表示レベル。低くても否定語は使いません */
export function getSceneLevel(score: number) {
  if (score >= 90) return { label: '最高', stars: 5 };
  if (score >= 82) return { label: 'かなり得意', stars: 4 };
  if (score >= 74) return { label: 'いい感じ', stars: 3 };
  if (score >= 66) return { label: '要すり合わせ', stars: 2 };
  return { label: '別行動もおすすめ', stars: 1 };
}
