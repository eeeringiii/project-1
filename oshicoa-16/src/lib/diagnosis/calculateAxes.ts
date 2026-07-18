import type { AxisKey, AxisScores, DiagnosisAnswer } from "@/types";
import { questionMap } from "@/data/questions";

const ALL_POLES: AxisKey[] = ["R", "C", "E", "P", "G", "M", "T", "S"];

function emptyScores(): AxisScores {
  return Object.fromEntries(ALL_POLES.map((p) => [p, 0])) as AxisScores;
}

/**
 * 回答から4軸（8極）の生スコアを集計する。
 * 各質問の極重み × 回答強度（3 / 1 / -1 / -3）を加算する。
 */
export function calculateAxes(answers: DiagnosisAnswer[]): AxisScores {
  const scores = emptyScores();
  for (const answer of answers) {
    const question = questionMap[answer.questionId];
    if (!question) continue;
    for (const pole of ALL_POLES) {
      const weight = question.weights[pole];
      if (weight) scores[pole] += weight * answer.value;
    }
  }
  return scores;
}
