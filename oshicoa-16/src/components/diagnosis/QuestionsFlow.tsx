"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { AnswerValue } from "@/types";
import { ANSWER_OPTIONS } from "@/types";
import { questions } from "@/data/questions";
import { useDiagnosisStore } from "@/stores/diagnosisStore";
import { trackEvent } from "@/lib/analytics";
import DiagnosisProgress from "@/components/diagnosis/DiagnosisProgress";
import QuestionCard from "@/components/diagnosis/QuestionCard";
import AnalysisLoading from "@/components/diagnosis/AnalysisLoading";

const total = questions.length;

export default function QuestionsFlow() {
  const router = useRouter();
  const hydrate = useDiagnosisStore((s) => s.hydrate);
  const hasHydrated = useDiagnosisStore((s) => s.hasHydrated);
  const answers = useDiagnosisStore((s) => s.answers);
  const currentIndex = useDiagnosisStore((s) => s.currentIndex);
  const answerCurrent = useDiagnosisStore((s) => s.answerCurrent);
  const goToPrevious = useDiagnosisStore((s) => s.goToPrevious);
  const goToIndex = useDiagnosisStore((s) => s.goToIndex);
  const finalize = useDiagnosisStore((s) => s.finalize);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 全問回答済みかどうかは currentIndex から導出する（setStateを増やさない）。
  const showAnalysis = hasHydrated && currentIndex >= total;

  const handleAnswer = useCallback(
    (value: AnswerValue) => {
      trackEvent("question_answered", { index: currentIndex + 1 });
      answerCurrent(value);
    },
    [answerCurrent, currentIndex],
  );

  // キーボード 1〜4 で回答。
  useEffect(() => {
    if (showAnalysis) return;
    const onKey = (e: KeyboardEvent) => {
      const opt = ANSWER_OPTIONS.find((o) => o.key === e.key);
      if (opt) {
        e.preventDefault();
        handleAnswer(opt.value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAnalysis, handleAnswer]);

  const handleAnalysisDone = useCallback(() => {
    const result = finalize();
    if (result) {
      trackEvent("diagnosis_completed", { typeCode: result.typeCode });
      router.push(`/result/${result.typeCode}`);
    } else {
      // 生成失敗時は最初の未回答へ戻す。
      const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;
      goToIndex(Math.min(answeredCount, total - 1));
    }
  }, [finalize, router, answers, goToIndex]);

  if (!hasHydrated) {
    return <div className="py-20 text-center text-text-muted">読み込み中…</div>;
  }

  if (showAnalysis) {
    return <AnalysisLoading onDone={handleAnalysisDone} />;
  }

  const question = questions[currentIndex];
  const selected = question ? answers[question.id] : undefined;

  return (
    <div>
      <DiagnosisProgress current={currentIndex + 1} total={total} />

      <div className="mt-8">
        {question && (
          <QuestionCard
            question={question}
            index={currentIndex}
            selected={selected}
            onAnswer={handleAnswer}
          />
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="btn btn-ghost !py-2 !px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← 前の質問へ
        </button>
        <Link
          href="/"
          onClick={() => trackEvent("diagnosis_abandoned", { index: currentIndex + 1 })}
          className="text-xs text-text-muted underline-offset-4 hover:text-text-sub hover:underline"
        >
          中断してトップへ
        </Link>
      </div>
    </div>
  );
}
