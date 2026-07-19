import { create } from "zustand";
import type { AnswerValue, DiagnosisAnswer, DiagnosisResult, OshiProfile } from "@/types";
import { getQuestionSet, type QuestionSetId } from "@/data/questionSets";
import { createResult } from "@/lib/diagnosis";
import { loadPersisted, savePersisted, clearPersisted } from "@/lib/storage/diagnosisStorage";

type AnswerMap = Record<string, AnswerValue>;

type DiagnosisState = {
  hasHydrated: boolean;
  mode: QuestionSetId;
  oshiProfile?: OshiProfile;
  answers: AnswerMap;
  currentIndex: number;
  result?: DiagnosisResult;

  hydrate: () => void;
  setMode: (mode: QuestionSetId) => void;
  setOshiProfile: (profile: OshiProfile) => void;
  answerCurrent: (value: AnswerValue) => void;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;
  finalize: () => DiagnosisResult | null;
  restartSameOshi: () => void;
  restartNewOshi: () => void;
  resetAll: () => void;
};

function orderedAnswers(map: AnswerMap, mode: QuestionSetId): DiagnosisAnswer[] {
  const list: DiagnosisAnswer[] = [];
  for (const q of getQuestionSet(mode)) {
    const v = map[q.id];
    if (v !== undefined) list.push({ questionId: q.id, value: v });
  }
  return list;
}

function persist(
  state: Pick<DiagnosisState, "mode" | "oshiProfile" | "answers" | "result">,
) {
  savePersisted({
    mode: state.mode,
    oshiProfile: state.oshiProfile,
    answers: orderedAnswers(state.answers, state.mode),
    result: state.result,
  });
}

export const useDiagnosisStore = create<DiagnosisState>((set, get) => ({
  hasHydrated: false,
  mode: "standard",
  oshiProfile: undefined,
  answers: {},
  currentIndex: 0,
  result: undefined,

  hydrate: () => {
    if (get().hasHydrated) return;
    const persisted = loadPersisted();
    const mode: QuestionSetId = persisted.mode ?? "standard";
    const map: AnswerMap = {};
    for (const a of persisted.answers ?? []) map[a.questionId] = a.value;
    const setQuestions = getQuestionSet(mode);
    const answeredCount = setQuestions.filter((q) => map[q.id] !== undefined).length;
    set({
      hasHydrated: true,
      mode,
      oshiProfile: persisted.oshiProfile,
      answers: map,
      currentIndex: Math.min(answeredCount, setQuestions.length),
      result: persisted.result,
    });
  },

  setMode: (mode) => {
    // セット変更時は回答をリセットして開始位置を戻す。
    set({ mode, answers: {}, currentIndex: 0, result: undefined });
    persist({ mode, oshiProfile: get().oshiProfile, answers: {}, result: undefined });
  },

  setOshiProfile: (profile) => {
    set({ oshiProfile: profile });
    persist(get());
  },

  answerCurrent: (value) => {
    const { currentIndex, answers, mode } = get();
    const setQuestions = getQuestionSet(mode);
    const question = setQuestions[currentIndex];
    if (!question) return;
    const nextAnswers = { ...answers, [question.id]: value };
    const nextIndex = Math.min(currentIndex + 1, setQuestions.length);
    set({ answers: nextAnswers, currentIndex: nextIndex });
    persist({ ...get(), answers: nextAnswers });
  },

  goToPrevious: () => {
    set((s) => ({ currentIndex: Math.max(0, s.currentIndex - 1) }));
  },

  goToIndex: (index) => {
    const len = getQuestionSet(get().mode).length;
    set({ currentIndex: Math.max(0, Math.min(index, len)) });
  },

  finalize: () => {
    const { answers, oshiProfile, mode } = get();
    try {
      const result = createResult(orderedAnswers(answers, mode), oshiProfile, mode);
      set({ result });
      persist({ ...get(), result });
      return result;
    } catch {
      return null;
    }
  },

  restartSameOshi: () => {
    const mode = get().mode;
    set({ answers: {}, currentIndex: 0, result: undefined });
    persist({ mode, oshiProfile: get().oshiProfile, answers: {}, result: undefined });
  },

  restartNewOshi: () => {
    const mode = get().mode;
    set({ oshiProfile: undefined, answers: {}, currentIndex: 0, result: undefined });
    persist({ mode, oshiProfile: undefined, answers: {}, result: undefined });
  },

  resetAll: () => {
    clearPersisted();
    set({ mode: "standard", oshiProfile: undefined, answers: {}, currentIndex: 0, result: undefined });
  },
}));
