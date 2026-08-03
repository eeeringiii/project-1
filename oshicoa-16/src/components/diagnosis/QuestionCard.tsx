"use client";

import type { AnswerValue, DiagnosisQuestion } from "@/types";
import { ANSWER_OPTIONS } from "@/types";
import AnswerButton from "@/components/diagnosis/AnswerButton";

type Props = {
  question: DiagnosisQuestion;
  index: number;
  selected?: AnswerValue;
  onAnswer: (value: AnswerValue) => void;
};

export default function QuestionCard({ question, index, selected, onAnswer }: Props) {
  return (
    <div key={question.id} className="animate-slide-in">
      <p className="type-code text-xs text-violet">QUESTION {String(index + 1).padStart(2, "0")}</p>
      <h2 className="mt-3 text-lg font-medium leading-relaxed text-text sm:text-xl">
        {question.text}
      </h2>
      <div className="mt-6 flex flex-col gap-3">
        {ANSWER_OPTIONS.map((opt) => (
          <AnswerButton
            key={opt.value}
            value={opt.value}
            label={opt.label}
            shortcut={opt.key}
            selected={selected === opt.value}
            onSelect={onAnswer}
          />
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-text-muted">
        キーボードの <span className="type-code text-text-sub">1〜4</span> でも回答できます
      </p>
    </div>
  );
}
