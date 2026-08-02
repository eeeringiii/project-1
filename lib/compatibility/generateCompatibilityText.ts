import {
  AXIS_LABELS,
  AXIS_PRIORITY,
  COMPATIBILITY_RANKS,
} from '@/data/compatibility/pairFit';
import {
  SCENE_AXIS_WEIGHTS,
  SCENE_LABELS,
  SCENE_PAIR_TITLES,
  SCENE_PRIORITY,
} from '@/data/compatibility/sceneFit';
import {
  AXIS_TEXTS,
  AxisTextSet,
  MATCH_COUNT_PAIR_TITLES,
  RANK_SUMMARY_LEADS,
  SCENE_PRIMARY_COMMENTS,
  SCENE_SECONDARY_COMMENTS,
  SCENE_TIPS,
  SUMMARY_CLOSINGS,
} from '@/data/compatibility/textTemplates';
import { AXIS_KEYS, pickTemplate } from './parseType';
import {
  AxisCompatibilityResult,
  AxisKey,
  CompatibilityNote,
  CompatibilityRank,
  CompatibilityScene,
  OshicoaCode,
} from './types';

const SUMMARY_MIN = 120;
const SUMMARY_MAX = 220;

const axisTextSet = (axis: AxisKey, pairKey: string): AxisTextSet =>
  (AXIS_TEXTS[axis] as Record<string, AxisTextSet>)[pairKey];

/** 相性値が高い順に軸を並べる（元配列は壊さない／同点はAXIS_PRIORITY順） */
export function sortAxesByScoreDesc(axisResults: AxisCompatibilityResult[]): AxisCompatibilityResult[] {
  return [...axisResults].sort(
    (a, b) => b.score - a.score || AXIS_PRIORITY.indexOf(a.axis) - AXIS_PRIORITY.indexOf(b.axis),
  );
}

/** 相性値が低い順に軸を並べる（元配列は壊さない／同点はAXIS_PRIORITY順） */
export function sortAxesByScoreAsc(axisResults: AxisCompatibilityResult[]): AxisCompatibilityResult[] {
  return [...axisResults].sort(
    (a, b) => a.score - b.score || AXIS_PRIORITY.indexOf(a.axis) - AXIS_PRIORITY.indexOf(b.axis),
  );
}

/** シーンで重みが大きい順に軸を並べる（同点はAXIS_PRIORITY順） */
export function sortAxesBySceneWeight(scene: CompatibilityScene): AxisKey[] {
  const weights = SCENE_AXIS_WEIGHTS[scene];
  return [...AXIS_KEYS].sort(
    (a, b) => weights[b] - weights[a] || AXIS_PRIORITY.indexOf(a) - AXIS_PRIORITY.indexOf(b),
  );
}

/** 強みを2件（相性値の高い上位2軸から） */
export function buildStrengths(
  axisResults: AxisCompatibilityResult[],
  firstType: OshicoaCode,
  secondType: OshicoaCode,
): CompatibilityNote[] {
  return sortAxesByScoreDesc(axisResults)
    .slice(0, 2)
    .map(result => {
      const texts = axisTextSet(result.axis, result.pairKey);
      return {
        axis: result.axis,
        title: texts.strengthTitle,
        description: pickTemplate(texts.strength, firstType, secondType, `strength-${result.axis}`),
      };
    });
}

/** すれ違いやすいポイントを1件（相性値が最も低い軸から） */
export function buildFriction(
  axisResults: AxisCompatibilityResult[],
  firstType: OshicoaCode,
  secondType: OshicoaCode,
): CompatibilityNote {
  const lowest = sortAxesByScoreAsc(axisResults)[0];
  const texts = axisTextSet(lowest.axis, lowest.pairKey);
  return {
    axis: lowest.axis,
    title: texts.frictionTitle,
    description: pickTemplate(texts.frictionDescription, firstType, secondType, `friction-${lowest.axis}`),
  };
}

/**
 * コツを1〜2件。
 * 相性値が低い軸のうち「文字が違う軸」を優先し、
 * 足りない場合は最も低いシーンからコツを補います。
 */
export function buildTips(
  axisResults: AxisCompatibilityResult[],
  lowestScene: CompatibilityScene,
  firstType: OshicoaCode,
  secondType: OshicoaCode,
): string[] {
  const ascending = sortAxesByScoreAsc(axisResults);
  const tips = ascending
    .filter(result => !result.isMatch)
    .slice(0, 2)
    .map(result =>
      pickTemplate(axisTextSet(result.axis, result.pairKey).tips, firstType, secondType, `tip-${result.axis}`),
    );

  // 文字が違う軸が1つ以下のときは、いちばん整えたいシーンのコツで補う
  if (tips.length < 2) {
    const sceneTip = pickTemplate(SCENE_TIPS[lowestScene], firstType, secondType, `tip-${lowestScene}`);
    if (sceneTip && !tips.includes(sceneTip)) tips.push(sceneTip);
  }

  return tips.filter(Boolean).slice(0, 2);
}

/** ペア名。2軸一致のときは最も相性が高いシーンから決めます */
export function buildPairTitle(matchedAxisCount: number, bestScene: CompatibilityScene): string {
  if (matchedAxisCount === 2) return SCENE_PAIR_TITLES[bestScene];
  return MATCH_COUNT_PAIR_TITLES[matchedAxisCount] ?? MATCH_COUNT_PAIR_TITLES[1];
}

/** シーン別コメント（50〜90文字程度） */
export function buildSceneComment(
  scene: CompatibilityScene,
  axisResults: AxisCompatibilityResult[],
  firstType: OshicoaCode,
  secondType: OshicoaCode,
): string {
  const [primaryAxis, secondaryAxis] = sortAxesBySceneWeight(scene);
  const primary = axisResults.find(result => result.axis === primaryAxis);
  const secondary = axisResults.find(result => result.axis === secondaryAxis);
  const base = pickTemplate(
    SCENE_PRIMARY_COMMENTS[scene][primary?.pairKey ?? ''],
    firstType,
    secondType,
    `scene-${scene}`,
  );
  const tail = SCENE_SECONDARY_COMMENTS[scene][secondary?.pairKey ?? ''] ?? '';
  return `${base}${tail}`;
}

type SummaryInput = {
  firstType: OshicoaCode;
  secondType: OshicoaCode;
  rank: CompatibilityRank;
  axisResults: AxisCompatibilityResult[];
  bestScene: CompatibilityScene;
  firstTip: string;
};

/**
 * 総評（120〜220文字程度）。
 * 1.ランク 2.一致軸の強み 3.相違軸の補完 4.要すり合わせ軸 5.得意シーン 6.付き合い方のコツ
 * の順で組み立て、長すぎ・短すぎのときだけ末尾で調整します。
 */
export function buildSummary({
  firstType,
  secondType,
  rank,
  axisResults,
  bestScene,
  firstTip,
}: SummaryInput): string {
  const descending = sortAxesByScoreDesc(axisResults);
  const matched = descending.filter(result => result.isMatch);
  const different = descending.filter(result => !result.isMatch);
  const lowest = sortAxesByScoreAsc(axisResults)[0];

  const lead = pickTemplate(RANK_SUMMARY_LEADS[rank], firstType, secondType, 'summary-lead');

  const matchedLabels = matched
    .slice(0, 2)
    .map(result => axisTextSet(result.axis, result.pairKey).summaryMatch);
  const matchedPart = matchedLabels.length
    ? `とくに${matchedLabels.join('と')}が近く、言葉にしなくても伝わる場面が多くなります。`
    : '';

  const complementPart = different.length
    ? `違いが出る${AXIS_LABELS[different[0].axis]}は、そのまま役割分担にできるポイントです。`
    : '4つの軸がすべて同じなので、価値観のズレで疲れることがほとんどありません。';

  const frictionPart = `すり合わせたいのは${AXIS_LABELS[lowest.axis]}。`;
  const scenePart = `いちばん噛み合うのは${SCENE_LABELS[bestScene]}で、ここは自然に息が合います。`;

  const parts = [lead, matchedPart, complementPart, frictionPart, scenePart, firstTip].filter(Boolean);
  let summary = parts.join('');

  // 長すぎる場合は、後ろの補足から落として読みやすさを保つ
  const trimOrder = [5, 4, 3];
  for (const index of trimOrder) {
    if (summary.length <= SUMMARY_MAX) break;
    parts[index] = '';
    summary = parts.filter(Boolean).join('');
  }

  // 短すぎる場合は締めの一文を足す
  if (summary.length < SUMMARY_MIN) {
    summary += pickTemplate(SUMMARY_CLOSINGS, firstType, secondType, 'summary-closing');
  }

  return summary;
}

/** 表示用のランク文言 */
export function getRankText(rank: CompatibilityRank) {
  return COMPATIBILITY_RANKS[rank];
}

/** 同点シーンの優先順位を考慮して、最もスコアが高いシーンを選ぶ */
export function pickBestScene(scores: Record<CompatibilityScene, number>): CompatibilityScene {
  return [...SCENE_PRIORITY].sort(
    (a, b) => scores[b] - scores[a] || SCENE_PRIORITY.indexOf(a) - SCENE_PRIORITY.indexOf(b),
  )[0];
}

/** 同点シーンの優先順位を考慮して、最もスコアが低いシーンを選ぶ */
export function pickLowestScene(scores: Record<CompatibilityScene, number>): CompatibilityScene {
  return [...SCENE_PRIORITY].sort(
    (a, b) => scores[a] - scores[b] || SCENE_PRIORITY.indexOf(a) - SCENE_PRIORITY.indexOf(b),
  )[0];
}
