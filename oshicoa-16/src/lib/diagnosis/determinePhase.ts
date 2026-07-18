import type { DiagnosisAnswer, OshiProfile, PhaseId, RelationshipPhase } from "@/types";
import { questionMap } from "@/data/questions";
import { phases, phaseMap } from "@/data/phases";

/** 推し歴（任意入力）が示す基準フェーズと、その重み。 */
const DURATION_BASELINE: Record<string, PhaseId> = {
  "1か月未満": "deai",
  "1〜6か月": "numaochi",
  "6か月〜1年": "zenryoku",
  "1〜3年": "antei",
  "3〜5年": "kaishaku-shinka",
  "5年以上": "eikyu",
};

// 推し歴は仕様上の主要シグナルなので強めに重み付けし、回答傾向で上書きされ得る程度に留める。
const DURATION_WEIGHT = 6;
const DEFAULT_PHASE: PhaseId = "zenryoku";

/**
 * 推し歴と回答傾向から、現在の関係フェーズを1つ選ぶ。
 * 断定ではなく「近いフェーズ」を提示する用途。同点は phases 配列順で決定的に選ぶ。
 */
export function determinePhase(
  answers: DiagnosisAnswer[],
  oshiProfile?: OshiProfile,
): RelationshipPhase {
  const scores = new Map<PhaseId, number>();
  for (const phase of phases) scores.set(phase.id, 0);

  // 推し歴による基準
  const baseline = oshiProfile?.duration
    ? DURATION_BASELINE[oshiProfile.duration]
    : undefined;
  if (baseline) scores.set(baseline, (scores.get(baseline) ?? 0) + DURATION_WEIGHT);

  // 回答による補正
  for (const answer of answers) {
    const question = questionMap[answer.questionId];
    if (!question?.phaseWeights) continue;
    if (answer.value <= 0) continue;
    for (const [phaseId, weight] of Object.entries(question.phaseWeights)) {
      if (!weight) continue;
      scores.set(phaseId, (scores.get(phaseId) ?? 0) + weight * answer.value);
    }
  }

  let best: PhaseId = baseline ?? DEFAULT_PHASE;
  let bestScore = scores.get(best) ?? 0;
  for (const phase of phases) {
    const s = scores.get(phase.id) ?? 0;
    if (s > bestScore) {
      best = phase.id;
      bestScore = s;
    }
  }

  return phaseMap[best] ?? phaseMap[DEFAULT_PHASE];
}
