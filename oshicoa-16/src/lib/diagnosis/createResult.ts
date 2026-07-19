import type { DiagnosisAnswer, DiagnosisResult, OshiProfile } from "@/types";
import { questionSets, type QuestionSetId } from "@/data/questionSets";
import { calculateAxes } from "@/lib/diagnosis/calculateAxes";
import { determineType } from "@/lib/diagnosis/determineType";
import { calculateTags } from "@/lib/diagnosis/calculateTags";
import { determinePhase } from "@/lib/diagnosis/determinePhase";
import { calculateChart } from "@/lib/diagnosis/calculateChart";

export class IncompleteDiagnosisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IncompleteDiagnosisError";
  }
}

/**
 * 全回答から診断結果を生成する。
 * 指定した問題セット（標準/精密）の全質問が回答されていない場合は IncompleteDiagnosisError を投げる。
 * 同じ回答からは常に同じ結果を返す（決定的）。
 */
export function createResult(
  answers: DiagnosisAnswer[],
  oshiProfile?: OshiProfile,
  setId: QuestionSetId = "standard",
): DiagnosisResult {
  const setQuestions = questionSets[setId];
  const requiredIds = new Set(setQuestions.map((q) => q.id));

  const answered = new Map<string, DiagnosisAnswer>();
  for (const a of answers) {
    if (requiredIds.has(a.questionId)) answered.set(a.questionId, a);
  }
  if (answered.size < requiredIds.size) {
    throw new IncompleteDiagnosisError(
      `診断には全${requiredIds.size}問への回答が必要です（現在${answered.size}問）。`,
    );
  }

  // 質問定義の順序に揃えた正規化済み回答。
  const orderedAnswers: DiagnosisAnswer[] = setQuestions.map((q) => answered.get(q.id)!);

  const axisScores = calculateAxes(orderedAnswers);
  const typeCode = determineType(axisScores, orderedAnswers);
  const tags = calculateTags(orderedAnswers);
  const phase = determinePhase(orderedAnswers, oshiProfile);
  const chartScores = calculateChart(typeCode, orderedAnswers);

  return {
    typeCode,
    axisScores,
    tags,
    phase,
    chartScores,
    answers: orderedAnswers,
    oshiProfile,
    completedAt: new Date().toISOString(),
  };
}
