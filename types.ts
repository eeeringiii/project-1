export const typeCodes = ['RCGT','RCGS','RCMT','RCMS','RPGT','RPGS','RPMT','RPMS','CEGT','CEGS','CEMT','CEMS','CPGT','CPGS','CPMT','CPMS'] as const;
export type TypeCode = typeof typeCodes[number];
export type AxisKey = 'R'|'C'|'E'|'P'|'G'|'M'|'T'|'S';
export type ChartMetricId = 'event'|'spending'|'evangelism'|'interpretation'|'fandom'|'recognition'|'afterglow'|'archive';
export type AnswerValue = 3|1|-1|-3;
export interface DiagnosisAnswer { questionId: string; value: AnswerValue }
export interface OshiProfile { name?: string; genre?: string; duration?: string; frequency?: string }
export interface DiagnosisQuestion { id:string; text:string; weights:Partial<Record<AxisKey,number>>; tagWeights?:Record<string,number>; phaseWeights?:Record<string,number>; chartWeights?:Partial<Record<ChartMetricId,number>> }
export interface OtakuTag { id:string; name:string; description:string; threshold:number }
export interface RelationshipPhase { id:string; name:string; description:string; advice:string }
export interface OshicoaType { code:TypeCode; name:string; reading:string; catchphrase:string; shortDescription:string; description:string[]; traits:string[]; strengths:string[]; habits:string[]; shadowTraits:string[]; compatibility:{bestTypeCode:TypeCode;description:string}; estimatedRatio:number; chartBaseValues:Record<ChartMetricId,number>; premiumCtaTitle:string; premiumCtaDescription:string }
export interface DiagnosisResult { typeCode:TypeCode; axisScores:Record<AxisKey,number>; tags:OtakuTag[]; phase:RelationshipPhase; chartScores:Record<ChartMetricId,number>; answers:DiagnosisAnswer[]; oshiProfile?:OshiProfile; completedAt:string }
