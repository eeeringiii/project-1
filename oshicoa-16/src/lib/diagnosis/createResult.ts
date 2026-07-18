import type { DiagnosisAnswer, DiagnosisResult, OshiProfile } from "@/types";
import { questions } from "@/data/questions";
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

const requiredIds = new Set(questions.map((q) => q.id));

/**
 * 全回答から診断結果を生成する。
 * 全質問が回答されていない場合は IncompleteDiagnosisError を投げる。
 * 同じ回答からは常に同じ結果を返す（決定的）。
 */
export function createResult(
  answers: DiagnosisAnswer[],
  oshiProfile?: OshiProfile,
): DiagnosisResult {
  // 回答の妥当性チェック（重複を除いた有効回答が全質問を満たすか）。
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
  const orderedAnswers: DiagnosisAnswer[] = questions.map((q) => answered.get(q.id)!);

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
