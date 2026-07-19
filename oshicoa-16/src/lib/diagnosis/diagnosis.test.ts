import { describe, it, expect } from "vitest";
import type { AnswerValue, DiagnosisAnswer, TypeCode } from "@/types";
import { ALL_TYPE_CODES } from "@/types";
import { questions } from "@/data/questions";
import { tags } from "@/data/tags";
import { calculateAxes } from "@/lib/diagnosis/calculateAxes";
import { determineType } from "@/lib/diagnosis/determineType";
import { calculateTags } from "@/lib/diagnosis/calculateTags";
import { determinePhase } from "@/lib/diagnosis/determinePhase";
import { calculateChart } from "@/lib/diagnosis/calculateChart";
import { createResult, IncompleteDiagnosisError } from "@/lib/diagnosis/createResult";
import { STANDARD_POLE_TOTALS, computePoleTotals } from "@/lib/diagnosis/normalizeScores";
import { preciseQuestions } from "@/data/questionsPrecise";

function answersFrom(value: AnswerValue): DiagnosisAnswer[] {
  return questions.map((q) => ({ questionId: q.id, value }));
}

/** 疑似ランダムだが決定的な回答列（seedで固定）。mulberry32で上位ビットを使う。 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seededAnswers(seed: number): DiagnosisAnswer[] {
  const options: AnswerValue[] = [3, 1, -1, -3];
  const rand = mulberry32(seed);
  return questions.map((q) => ({
    questionId: q.id,
    value: options[Math.floor(rand() * 4)],
  }));
}

describe("データ整合性", () => {
  it("標準・精密の両セットで全ての極が正の重みを1つ以上持つ（ゼロ割り・到達不能を防ぐ）", () => {
    const poles = ["R", "C", "E", "P", "G", "M", "T", "S"] as const;
    const preciseTotals = computePoleTotals(preciseQuestions);
    for (const pole of poles) {
      expect(STANDARD_POLE_TOTALS[pole]).toBeGreaterThan(0);
      expect(preciseTotals[pole]).toBeGreaterThan(0);
    }
  });

  it("精密版は48問である", () => {
    expect(preciseQuestions.length).toBe(48);
  });

  it("質問のtagWeightsは全て既知のタグIDを参照する（精密版=全設問）", () => {
    const tagIds = new Set(tags.map((t) => t.id));
    for (const q of preciseQuestions) {
      for (const id of Object.keys(q.tagWeights ?? {})) {
        expect(tagIds.has(id)).toBe(true);
      }
    }
  });
});

describe("calculateAxes（4軸集計）", () => {
  it("全て『めちゃくちゃ当てはまる』でRスコアが正になる", () => {
    const scores = calculateAxes(answersFrom(3));
    expect(scores.R).toBeGreaterThan(0);
  });

  it("回答強度の符号でスコアが反転する", () => {
    const pos = calculateAxes(answersFrom(3));
    const neg = calculateAxes(answersFrom(-3));
    expect(neg.R).toBe(-pos.R);
  });
});

describe("determineType（16タイプ判定）", () => {
  it("有効な4文字コードを返す", () => {
    const answers = seededAnswers(42);
    const code = determineType(calculateAxes(answers), answers);
    expect(ALL_TYPE_CODES).toContain(code);
  });

  it("同じ回答からは必ず同じ結果を返す（決定的）", () => {
    const answers = seededAnswers(7);
    const a = determineType(calculateAxes(answers), answers);
    const b = determineType(calculateAxes(answers), answers);
    expect(a).toBe(b);
  });

  it("多様なseedで複数タイプに到達できる（極端な偏りがない）", () => {
    const found = new Set<TypeCode>();
    for (let seed = 0; seed < 400; seed++) {
      const answers = seededAnswers(seed);
      found.add(determineType(calculateAxes(answers), answers));
    }
    // 16タイプの大半に到達できること（分布の極端な偏りがない）。
    expect(found.size).toBeGreaterThanOrEqual(14);
  });

  it("同点時もエラーにならず決定的なコードを返す（全て中立的な±1混在）", () => {
    const answers: DiagnosisAnswer[] = questions.map((q, i) => ({
      questionId: q.id,
      value: (i % 2 === 0 ? 1 : -1) as AnswerValue,
    }));
    const code = determineType(calculateAxes(answers), answers);
    expect(ALL_TYPE_CODES).toContain(code);
  });
});

describe("calculateTags（業タグ判定）", () => {
  it("回答から1〜2件のタグを返す", () => {
    const result = calculateTags(seededAnswers(3));
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it("全て否定回答でもフォールアックで必ずタグが付く", () => {
    const result = calculateTags(answersFrom(-3));
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});

describe("determinePhase（フェーズ判定）", () => {
  it("推し歴からフェーズを反映する", () => {
    const phase = determinePhase(answersFrom(1), { duration: "5年以上" });
    expect(phase.id).toBe("eikyu");
  });

  it("常に有効なフェーズを返す", () => {
    const phase = determinePhase(seededAnswers(99));
    expect(phase.id).toBeTruthy();
  });
});

describe("calculateChart（レーダーチャート）", () => {
  it("全項目が0〜100にクランプされる", () => {
    for (const seed of [1, 2, 3, 50, 200]) {
      const answers = seededAnswers(seed);
      const code = determineType(calculateAxes(answers), answers);
      const chart = calculateChart(code, answers);
      for (const value of Object.values(chart)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });

  it("同じタイプでも回答が違えばチャートに個人差が出る", () => {
    const a = calculateChart("CEMS", answersFrom(3));
    const b = calculateChart("CEMS", answersFrom(1));
    expect(a).not.toEqual(b);
  });
});

describe("createResult（統合）", () => {
  it("全質問回答で結果を生成する", () => {
    const result = createResult(seededAnswers(5));
    expect(ALL_TYPE_CODES).toContain(result.typeCode);
    expect(result.tags.length).toBeGreaterThanOrEqual(1);
    expect(result.phase.id).toBeTruthy();
    expect(result.answers.length).toBe(questions.length);
  });

  it("回答不足の場合はIncompleteDiagnosisErrorを投げる", () => {
    const partial = seededAnswers(5).slice(0, 10);
    expect(() => createResult(partial)).toThrow(IncompleteDiagnosisError);
  });

  it("同じ回答からは同じタイプ・タグ・チャートになる（completedAt以外）", () => {
    const answers = seededAnswers(11);
    const a = createResult(answers);
    const b = createResult(answers);
    expect(a.typeCode).toBe(b.typeCode);
    expect(a.tags).toEqual(b.tags);
    expect(a.chartScores).toEqual(b.chartScores);
  });
});

describe("精密48問版", () => {
  function precise(seed: number): DiagnosisAnswer[] {
    const options: AnswerValue[] = [3, 1, -1, -3];
    const rand = mulberry32(seed);
    return preciseQuestions.map((q) => ({
      questionId: q.id,
      value: options[Math.floor(rand() * 4)],
    }));
  }

  it("48問回答で結果が生成され、有効なタイプになる", () => {
    const result = createResult(precise(3), undefined, "precise");
    expect(ALL_TYPE_CODES).toContain(result.typeCode);
    expect(result.answers.length).toBe(48);
  });

  it("48問未満（標準セット分だけ）を精密指定で渡すとエラー", () => {
    const partial = precise(3).slice(0, 24);
    expect(() => createResult(partial, undefined, "precise")).toThrow(IncompleteDiagnosisError);
  });

  it("精密版でも同じ回答は同じ結果（決定的）", () => {
    const answers = precise(21);
    const a = createResult(answers, undefined, "precise");
    const b = createResult(answers, undefined, "precise");
    expect(a.typeCode).toBe(b.typeCode);
    expect(a.chartScores).toEqual(b.chartScores);
  });

  it("精密版でも多様なタイプへ到達できる", () => {
    const found = new Set<TypeCode>();
    for (let seed = 0; seed < 400; seed++) {
      found.add(createResult(precise(seed), undefined, "precise").typeCode);
    }
    expect(found.size).toBeGreaterThanOrEqual(14);
  });
});
