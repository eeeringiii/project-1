import { getType } from '@/data/types';
import { tags } from '@/data/tags';
import { BaseAbilities, DiagnosisResult, OshicoaType } from '@/types';

export interface DiagnosisDocument {
  type: OshicoaType;
  oshiName?: string;
  abilities: BaseAbilities;
  karmaTags: string[];
  rarity: number;
  characterImage: string;
}

const toAbilities = (result: DiagnosisResult | undefined, type: OshicoaType): BaseAbilities => result ? {
  field: result.chartScores.event,
  spending: result.chartScores.spending,
  evangelism: result.chartScores.evangelism,
  analysis: result.chartScores.interpretation,
  community: result.chartScores.fandom,
  recognition: result.chartScores.recognition,
  afterglow: result.chartScores.afterglow,
  archive: result.chartScores.archive,
} : type.baseAbilities;

const defaultCharacterPath = (type: OshicoaType) => `/characters/${type.code.toLowerCase()}.png`;

export function createDiagnosisDocument(type: OshicoaType, result?: DiagnosisResult): DiagnosisDocument {
  const current = result?.typeCode === type.code ? result : undefined;
  const candidateNames = type.karmaTagCandidates
    .map(id => tags.find(tag => tag.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  const abilityValues = Object.values(type.baseAbilities);
  const distinctiveness = abilityValues.reduce((sum, value) => sum + Math.abs(value - 50), 0) / abilityValues.length;

  return {
    type,
    oshiName: current?.oshiProfile?.name,
    abilities: toAbilities(current, type),
    karmaTags: (current?.tags.map(tag => tag.name) ?? candidateNames).slice(0, 3),
    rarity: Math.max(2, Math.min(5, Math.round(2 + distinctiveness / 15))),
    characterImage: current?.characterImage ?? type.characterImage ?? defaultCharacterPath(type),
  };
}

export function getCompatibilityName(type: OshicoaType) {
  return getType(type.compatibility.bestTypeCode)?.name ?? type.compatibility.bestTypeCode;
}
