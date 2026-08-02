import {
  MAX_OVERALL_SCORE,
  OVERALL_AXIS_WEIGHTS,
  OVERALL_PAIR_FIT,
  PERFECT_MATCH_BONUS,
} from '@/data/compatibility/pairFit';
import {
  SCENE_AXIS_WEIGHTS,
  SCENE_ORDER,
  SCENE_PAIR_FIT,
  getSceneLevel,
} from '@/data/compatibility/sceneFit';
import {
  buildFriction,
  buildPairTitle,
  buildSceneComment,
  buildStrengths,
  buildSummary,
  buildTips,
  pickBestScene,
  pickLowestScene,
} from './generateCompatibilityText';
import { AXIS_KEYS, normalizePairKey, parseOshicoaCode } from './parseType';
import {
  AxisCompatibilityResult,
  AxisKey,
  CompatibilityRank,
  CompatibilityResult,
  CompatibilityScene,
  OshicoaCode,
  SceneCompatibilityResult,
} from './types';

/** 軸ごとの値を重み付き平均にする（重みの合計は100の想定） */
export function calculateWeightedScore(
  values: Record<AxisKey, number>,
  weights: Record<AxisKey, number>,
): number {
  const total = Object.entries(weights).reduce((sum, [axis, weight]) => {
    return sum + values[axis as AxisKey] * (weight / 100);
  }, 0);

  return Math.round(total);
}

export function getCompatibilityRank(score: number): CompatibilityRank {
  if (score >= 90) return 'oneSoul';
  if (score >= 82) return 'bestBuddy';
  if (score >= 74) return 'chemical';
  if (score >= 66) return 'balance';
  return 'ownPace';
}

/** 2人の4文字コードから、軸ごとの一致・相違と相性値を出す */
function buildAxisResults(firstType: OshicoaCode, secondType: OshicoaCode): AxisCompatibilityResult[] {
  const first = parseOshicoaCode(firstType);
  const second = parseOshicoaCode(secondType);

  return AXIS_KEYS.map(axis => {
    const firstLetter = first[axis];
    const secondLetter = second[axis];
    const pairKey = normalizePairKey(axis, firstLetter, secondLetter);
    return {
      axis,
      firstLetter,
      secondLetter,
      pairKey,
      score: (OVERALL_PAIR_FIT[axis] as Record<string, number>)[pairKey],
      isMatch: firstLetter === secondLetter,
    };
  });
}

/** シーン別スコア（総合とは別の相性値・別のウェイトで計算） */
function calculateSceneScore(
  scene: CompatibilityScene,
  axisResults: AxisCompatibilityResult[],
): number {
  const fit = SCENE_PAIR_FIT[scene];
  const values = AXIS_KEYS.reduce((accumulator, axis) => {
    const result = axisResults.find(item => item.axis === axis);
    const table = fit[axis] as Record<string, number>;
    accumulator[axis] = table[result?.pairKey ?? ''] ?? 0;

    return accumulator;
  }, {} as Record<AxisKey, number>);

  return calculateWeightedScore(values, SCENE_AXIS_WEIGHTS[scene]);
}

/**
 * 相性診断の中核。UIから独立した純粋関数です。
 * React / window / localStorage / Math.random / 外部APIは一切使いません。
 */
export function calculateCompatibility(
  firstType: OshicoaCode,
  secondType: OshicoaCode,
): CompatibilityResult {
  // 1〜3. 4軸へ分解し、正規化したペアキーから相性値を取る
  const axisResults = buildAxisResults(firstType, secondType);

  // 4. 総合相性を加重平均で計算
  const overallValues = axisResults.reduce((accumulator, result) => {
    accumulator[result.axis] = result.score;
    return accumulator;
  }, {} as Record<AxisKey, number>);
  let overallScore = calculateWeightedScore(overallValues, OVERALL_AXIS_WEIGHTS);

  // 5〜6. 一致軸数と完全一致ボーナス
  const matchedAxisCount = axisResults.filter(result => result.isMatch).length;
  if (matchedAxisCount === 4) {
    overallScore = Math.min(MAX_OVERALL_SCORE, overallScore + PERFECT_MATCH_BONUS);
  }

  // 7. 相性ランク
  const rank = getCompatibilityRank(overallScore);

  // 8. 5シーンの相性
  const sceneScores = SCENE_ORDER.reduce((accumulator, scene) => {
    accumulator[scene] = calculateSceneScore(scene, axisResults);
    return accumulator;
  }, {} as Record<CompatibilityScene, number>);

  // 9. 最も高い／低いシーン（同点は固定の優先順位で決める）
  const bestScene = pickBestScene(sceneScores);
  const lowestScene = pickLowestScene(sceneScores);

  const scenes: SceneCompatibilityResult[] = SCENE_ORDER.map(scene => ({
    scene,
    score: sceneScores[scene],
    level: getSceneLevel(sceneScores[scene]),
    comment: buildSceneComment(scene, axisResults, firstType, secondType),
  }));

  // 10〜12. 強み・注意点・コツ
  const strengths = buildStrengths(axisResults, firstType, secondType);
  const friction = buildFriction(axisResults, firstType, secondType);
  const tips = buildTips(axisResults, lowestScene, firstType, secondType);

  // 13. ペア名
  const pairTitle = buildPairTitle(matchedAxisCount, bestScene);

  // 14. 総評
  const summary = buildSummary({
    firstType,
    secondType,
    rank,
    axisResults,
    bestScene,
    firstTip: tips[0] ?? '',
  });

  // 15. 結果を返す（firstType / secondType は入力順を保持）
  return {
    firstType,
    secondType,
    overallScore,
    rank,
    pairTitle,
    matchedAxisCount,
    axisResults,
    strengths,
    friction,
    tips,
    summary,
    scenes,
    bestScene,
  };
}
