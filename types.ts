export const typeCodes = ['REGT','REGS','REMT','REMS','RPGT','RPGS','RPMT','RPMS','CEGT','CEGS','CEMT','CEMS','CPGT','CPGS','CPMT','CPMS'] as const;
export type TypeCode = typeof typeCodes[number];
export type AxisKey = 'R'|'C'|'E'|'P'|'G'|'M'|'T'|'S';
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
