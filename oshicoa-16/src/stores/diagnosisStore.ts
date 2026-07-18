import { create } from "zustand";
import type { AnswerValue, DiagnosisAnswer, DiagnosisResult, OshiProfile } from "@/types";
import { questions } from "@/data/questions";
import { createResult } from "@/lib/diagnosis";
import { loadPersisted, savePersisted, clearPersisted } from "@/lib/storage/diagnosisStorage";

type AnswerMap = Record<string, AnswerValue>;

type DiagnosisState = {
  hasHydrated: boolean;
  oshiProfile?: OshiProfile;
  answers: AnswerMap;
  currentIndex: number;
  result?: DiagnosisResult;

  hydrate: () => void;
  setOshiProfile: (profile: OshiProfile) => void;
  answerCurrent: (value: AnswerValue) => void;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;
  finalize: () => DiagnosisResult | null;
  restartSameOshi: () => void;
  restartNewOshi: () => void;
  resetAll: () => void;
};

function orderedAnswers(map: AnswerMap): DiagnosisAnswer[] {
  const list: DiagnosisAnswer[] = [];
  for (const q of questions) {
    const v = map[q.id];
    if (v !== undefined) list.push({ questionId: q.id, value: v });
  }
  return list;
}

function persist(state: Pick<DiagnosisState, "oshiProfile" | "answers" | "result">) {
  savePersisted({
    oshiProfile: state.oshiProfile,
    answers: orderedAnswers(state.answers),
    result: state.result,
  });
}

export const useDiagnosisStore = create<DiagnosisState>((set, get) => ({
  hasHydrated: false,
  oshiProfile: undefined,
  answers: {},
  currentIndex: 0,
  result: undefined,

  hydrate: () => {
    if (get().hasHydrated) return;
    const persisted = loadPersisted();
    const map: AnswerMap = {};
    for (const a of persisted.answers ?? []) map[a.questionId] = a.value;
    // 復元時は最初の未回答へ位置づける（リロード対策）。
    const answeredCount = questions.filter((q) => map[q.id] !== undefined).length;
    set({
      hasHydrated: true,
      oshiProfile: persisted.oshiProfile,
      answers: map,
      currentIndex: Math.min(answeredCount, questions.length),
      result: persisted.result,
    });
  },

  setOshiProfile: (profile) => {
    set({ oshiProfile: profile });
    persist(get());
  },

  answerCurrent: (value) => {
    const { currentIndex, answers } = get();
    const question = questions[currentIndex];
    if (!question) return;
    const nextAnswers = { ...answers, [question.id]: value };
    const nextIndex = Math.min(currentIndex + 1, questions.length);
    set({ answers: nextAnswers, currentIndex: nextIndex });
    persist({ ...get(), answers: nextAnswers });
  },

  goToPrevious: () => {
    set((s) => ({ currentIndex: Math.max(0, s.currentIndex - 1) }));
  },

  goToIndex: (index) => {
    set({ currentIndex: Math.max(0, Math.min(index, questions.length)) });
  },

  finalize: () => {
    const { answers, oshiProfile } = get();
    try {
      const result = createResult(orderedAnswers(answers), oshiProfile);
      set({ result });
      persist({ ...get(), result });
      return result;
    } catch {
      return null;
    }
  },

  restartSameOshi: () => {
    const next = { answers: {}, currentIndex: 0, result: undefined };
    set(next);
    persist({ oshiProfile: get().oshiProfile, answers: {}, result: undefined });
  },

  restartNewOshi: () => {
    set({ oshiProfile: undefined, answers: {}, currentIndex: 0, result: undefined });
    persist({ oshiProfile: undefined, answers: {}, result: undefined });
  },

  resetAll: () => {
    clearPersisted();
    set({ oshiProfile: undefined, answers: {}, currentIndex: 0, result: undefined });
  },
}));
