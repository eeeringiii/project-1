/**
 * 診断の4軸。各ペアの左が勝てば左の文字、右が勝てば右の文字が
 * タイプコードの1〜4文字目になる（例: R + E + G + T → REGT）。
 * タイプコードはここから機械的に導出するので、手書きしないこと。
 */
export const axisPairs = [['R','C'],['E','P'],['G','M'],['T','S']] as const;
export type AxisKey = typeof axisPairs[number][number];

/** 4軸の総当たり16通り。lib/diagnosis の determineType の戻り値と型レベルで一致する。 */
export type TypeCode = `${typeof axisPairs[0][number]}${typeof axisPairs[1][number]}${typeof axisPairs[2][number]}${typeof axisPairs[3][number]}`;

export const typeCodes: readonly TypeCode[] = axisPairs[0].flatMap(first =>
  axisPairs[1].flatMap(second =>
    axisPairs[2].flatMap(third =>
      axisPairs[3].map(fourth => `${first}${second}${third}${fourth}` as TypeCode))));
export type ChartMetricId = 'event'|'spending'|'evangelism'|'interpretation'|'fandom'|'recognition'|'afterglow'|'archive';
export type BaseAbilityId = 'field'|'spending'|'evangelism'|'analysis'|'community'|'recognition'|'afterglow'|'archive';
export type BaseAbilities = Record<BaseAbilityId, number>;
export type KarmaTagId = `tag-${number}`;
export type AnswerValue = 3|1|-1|-3;
export interface DiagnosisAnswer { questionId: string; value: AnswerValue }
export interface OshiProfile { name?: string; genre?: string; duration?: string; frequency?: string }
export interface DiagnosisQuestion { id:string; text:string; weights:Partial<Record<AxisKey,number>>; tagWeights?:Record<string,number>; phaseWeights?:Record<string,number>; chartWeights?:Partial<Record<ChartMetricId,number>> }
export interface OtakuTag { id:KarmaTagId; name:string; description:string; threshold:number }
export interface RelationshipPhase { id:string; name:string; description:string; advice:string }
export interface OshicoaType {
  code: TypeCode;
  name: string;
  reading: string;
  catchphrase: string;
  characterImage?: string;
  habitat: string;
  mainFood: string;
  habitPhrase: string;
  specialAbility: string;
  weakness: string;
  extremeBehavior: string;
  top5: [string, string, string, string, string];
  strengths: [string, string, string];
  sins: [string, string, string];
  karmaTagCandidates: KarmaTagId[];
  baseAbilities: BaseAbilities;
  shortDescription: string;
  description: string[];
  traits: string[];
  habits: string[];
  shadowTraits: string[];
  compatibility: {bestTypeCode:TypeCode;description:string};
  estimatedRatio: number;
  chartBaseValues: Record<ChartMetricId,number>;
  premiumCtaTitle: string;
  premiumCtaDescription: string;
}
export interface DiagnosisResult { typeCode:TypeCode; axisScores:Record<AxisKey,number>; tags:OtakuTag[]; phase:RelationshipPhase; chartScores:Record<ChartMetricId,number>; answers:DiagnosisAnswer[]; oshiProfile?:OshiProfile; completedAt:string; characterImage?:string }
