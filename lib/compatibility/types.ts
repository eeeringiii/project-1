import { TypeCode } from '@/types';

/**
 * 相性診断で使う型定義。
 * 16タイプのコード自体は既存の `types.ts`（TypeCode）をそのまま使い、
 * 相性診断のためにタイプデータを複製しないようにしています。
 */
export type OshicoaCode = TypeCode;

/** 4つの軸。文字ではなく「軸そのもの」を表すキー */
export type AxisKey = 'RC' | 'EP' | 'GM' | 'TS';

export type RCPairKey = 'RR' | 'RC' | 'CC';
export type EPPairKey = 'EE' | 'EP' | 'PP';
export type GMPairKey = 'GG' | 'GM' | 'MM';
export type TSPairKey = 'TT' | 'TS' | 'SS';
export type PairKey = RCPairKey | EPPairKey | GMPairKey | TSPairKey;

/** 軸ごとに使えるペアキー（軸をまたいだ組み合わせを型で防ぎます） */
export type AxisPairKeyMap = {
  RC: RCPairKey;
  EP: EPPairKey;
  GM: GMPairKey;
  TS: TSPairKey;
};

/** 「軸 → ペアキー → 値」のテーブル型 */
export type AxisPairTable<Value> = { [K in AxisKey]: Record<AxisPairKeyMap[K], Value> };

export type ParsedOshicoaType = {
  RC: 'R' | 'C';
  EP: 'E' | 'P';
  GM: 'G' | 'M';
  TS: 'T' | 'S';
};

export type CompatibilityRank = 'oneSoul' | 'bestBuddy' | 'chemical' | 'balance' | 'ownPace';

export type CompatibilityScene = 'renban' | 'expedition' | 'afterTalk' | 'trade' | 'supportProject';

export type SceneLevel = {
  label: string;
  stars: number;
};

export type AxisCompatibilityResult = {
  axis: AxisKey;
  firstLetter: string;
  secondLetter: string;
  pairKey: string;
  score: number;
  isMatch: boolean;
};

export type SceneCompatibilityResult = {
  scene: CompatibilityScene;
  score: number;
  level: SceneLevel;
  comment: string;
};

/** 強み・すれ違いポイントの共通形 */
export type CompatibilityNote = {
  axis: AxisKey;
  title: string;
  description: string;
};

export type CompatibilityResult = {
  firstType: OshicoaCode;
  secondType: OshicoaCode;
  overallScore: number;
  rank: CompatibilityRank;
  pairTitle: string;
  matchedAxisCount: number;
  axisResults: AxisCompatibilityResult[];
  strengths: CompatibilityNote[];
  friction: CompatibilityNote;
  tips: string[];
  summary: string;
  scenes: SceneCompatibilityResult[];
  bestScene: CompatibilityScene;
};
