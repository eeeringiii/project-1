// OSHICOA 16 — ドメイン型定義
// 診断ロジックとUIはこの型を共有する。表示文言はdata/配下に分離する。

/** 4軸の両極（8極）。各対立軸から1文字ずつ選ばれ4文字コードになる。 */
export type AxisKey = "R" | "C" | "E" | "P" | "G" | "M" | "T" | "S";

/** 対立軸の定義（軸番号順）。 */
export const AXIS_PAIRS = [
  { positive: "R", negative: "C" },
  { positive: "E", negative: "P" },
  { positive: "G", negative: "M" },
  { positive: "T", negative: "S" },
] as const;

export type AxisPair = (typeof AXIS_PAIRS)[number];

/** 16タイプの4文字コード。 */
export type TypeCode =
  | "RCGT" | "RCGS" | "RCMT" | "RCMS"
  | "RPGT" | "RPGS" | "RPMT" | "RPMS"
  | "CEGT" | "CEGS" | "CEMT" | "CEMS"
  | "CPGT" | "CPGS" | "CPMT" | "CPMS";

/** レーダーチャートの8項目。 */
export type ChartMetricId =
  | "genba"
  | "tsumi"
  | "fukyo"
  | "kaishaku"
  | "rentai"
  | "ninchi"
  | "yoin"
  | "kiroku";

export type TagId = string;
export type PhaseId = string;

/** 各極の集計スコア。 */
export type AxisScores = Record<AxisKey, number>;

/** 回答の選択肢と、その強度（倍率）。中立回答は設けない。 */
export type AnswerValue = 3 | 1 | -1 | -3;

export const ANSWER_OPTIONS: {
  value: AnswerValue;
  label: string;
  key: string;
}[] = [
  { value: 3, label: "めちゃくちゃ当てはまる", key: "1" },
  { value: 1, label: "やや当てはまる", key: "2" },
  { value: -1, label: "あまり当てはまらない", key: "3" },
  { value: -3, label: "まったく当てはまらない", key: "4" },
];

export type DiagnosisQuestion = {
  id: string;
  text: string;
  /** 軸の加点先（極ごとの重み）。回答強度と掛け合わせる。 */
  weights: Partial<Record<AxisKey, number>>;
  tagWeights?: Partial<Record<TagId, number>>;
  phaseWeights?: Partial<Record<PhaseId, number>>;
  chartWeights?: Partial<Record<ChartMetricId, number>>;
};

export type DiagnosisAnswer = {
  questionId: string;
  value: AnswerValue;
};

export type OtakuTag = {
  id: TagId;
  name: string;
  description: string;
  /** このスコア以上でタグ候補になる。 */
  threshold: number;
};

export type RelationshipPhase = {
  id: PhaseId;
  name: string;
  description: string;
  advice: string;
};

export type ChartMetric = {
  id: ChartMetricId;
  name: string;
  shortName: string;
};

export type CompatibilityScore = {
  typeA: TypeCode;
  typeB: TypeCode;
  scores: {
    event: number;
    travel: number;
    discussion: number;
    trading: number;
    supportProject: number;
    fandomPeace: number;
    spendingSense: number;
  };
  summary: string;
};

export type OshicoaType = {
  code: TypeCode;
  name: string;
  reading: string;
  catchphrase: string;
  shortDescription: string;
  description: string[];
  traits: string[];
  strengths: string[];
  habits: string[];
  shadowTraits: string[];
  compatibility: {
    bestTypeCode: TypeCode;
    description: string;
  };
  /** 推定割合（%）。全タイプ合計が概ね100になるよう設定した仮値。 */
  estimatedRatio: number;
  chartBaseValues: Record<ChartMetricId, number>;
  premiumCtaTitle: string;
  premiumCtaDescription: string;
  /** note等の販売導線URL。タイプごとに差し替え可能な仮URL。 */
  premiumUrl: string;
};

/** 診断前の任意入力。サーバーへ送信しない。 */
export type OshiProfile = {
  oshiName?: string;
  genre?: string;
  duration?: string;
  frequency?: string;
};

export type DiagnosisResult = {
  typeCode: TypeCode;
  axisScores: AxisScores;
  tags: OtakuTag[];
  phase: RelationshipPhase;
  chartScores: Record<ChartMetricId, number>;
  answers: DiagnosisAnswer[];
  oshiProfile?: OshiProfile;
  completedAt: string;
};

/** タイプコードが有効かを判定する。 */
export const ALL_TYPE_CODES: TypeCode[] = [
  "RCGT", "RCGS", "RCMT", "RCMS",
  "RPGT", "RPGS", "RPMT", "RPMS",
  "CEGT", "CEGS", "CEMT", "CEMS",
  "CPGT", "CPGS", "CPMT", "CPMS",
];

export function isTypeCode(value: string): value is TypeCode {
  return (ALL_TYPE_CODES as string[]).includes(value);
}
