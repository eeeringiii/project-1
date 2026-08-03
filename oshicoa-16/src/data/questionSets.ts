import type { DiagnosisQuestion } from "@/types";
import { standardQuestions } from "@/data/questions";
import { preciseQuestions } from "@/data/questionsPrecise";

/** 診断の問題セット。標準24問と精密48問。 */
export type QuestionSetId = "standard" | "precise";

export const questionSets: Record<QuestionSetId, DiagnosisQuestion[]> = {
  standard: standardQuestions,
  precise: preciseQuestions,
};

export const QUESTION_SET_META: Record<
  QuestionSetId,
  { id: QuestionSetId; label: string; count: number; description: string; minutes: string }
> = {
  standard: {
    id: "standard",
    label: "標準版",
    count: standardQuestions.length,
    description: "まずはこちら。手軽にヲタク生態が分かります。",
    minutes: "約3〜4分",
  },
  precise: {
    id: "precise",
    label: "精密版",
    count: preciseQuestions.length,
    description: "設問を倍にして、業タグ・能力値の解像度を上げた詳細診断。",
    minutes: "約6〜8分",
  },
};

/** 全設問（精密版が上位集合）。id→設問の参照はこのマップを使う。 */
export const allQuestions: DiagnosisQuestion[] = preciseQuestions;

export const questionMap: Record<string, DiagnosisQuestion> = Object.fromEntries(
  allQuestions.map((q) => [q.id, q]),
);

export function getQuestionSet(id: QuestionSetId): DiagnosisQuestion[] {
  return questionSets[id];
}

export function isQuestionSetId(value: string): value is QuestionSetId {
  return value === "standard" || value === "precise";
}
