import { describe, expect, it } from 'vitest';
import { questions } from '@/data/questions';
import { phases } from '@/data/phases';
import { oshicoaTypes } from '@/data/types';
import { typeCodes } from '@/types';
import type { AnswerValue, DiagnosisAnswer } from '@/types';
import {
  calculateAxes, calculateChart, calculateTags,
  createResult, determinePhase, determineType, options, typeAxes,
} from '@/lib/diagnosis';

// ---------------------------------------------------------------------------
// テスト用のヘルパー
//
// 回答パターンを作るのに Math.random は使わない。同じ種（seed）からは必ず同じ
// 回答列が出るようにして、テストが落ちたとき同じケースを再現できるようにする。
// ---------------------------------------------------------------------------

const answerValues: AnswerValue[] = [3, 1, -1, -3];

function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 種を変えるたびに違う24問の回答列を返す。 */
function answersFromSeed(seed: number): DiagnosisAnswer[] {
  const rng = seededRandom(seed);
  return questions.map(q => ({
    questionId: q.id,
    value: answerValues[Math.floor(rng() * answerValues.length)],
  }));
}

/** 全問に同じ値で答えた回答列。 */
function uniformAnswers(value: AnswerValue): DiagnosisAnswer[] {
  return questions.map(q => ({ questionId: q.id, value }));
}

const SAMPLE_COUNT = 3000;
const samples = Array.from({ length: SAMPLE_COUNT }, (_, i) => answersFromSeed(i + 1));

// ---------------------------------------------------------------------------

describe('determineType', () => {
  // これが本テストの主目的。型コードは軸の文字をそのまま連結したものではなく、
  // 第1軸が R のときだけ第2軸の体験(E)を 'C' と表記する（RCGT など）。
  // 連結のしかたを崩すと、存在しないコードが生まれて結果ページが表示できなくなる。
  it('定義済みの16タイプ以外のコードを返さない', () => {
    const invalid = samples
      .map(answers => determineType(calculateAxes(answers), answers))
      .filter(code => !typeCodes.includes(code));

    expect(invalid).toEqual([]);
  });

  it('16タイプすべてが診断結果として出うる', () => {
    const produced = new Set(
      samples.map(answers => determineType(calculateAxes(answers), answers)),
    );

    expect([...produced].sort()).toEqual([...typeCodes].sort());
  });

  it('返したコードが必ず data/types.ts に存在する', () => {
    for (const answers of samples.slice(0, 200)) {
      const code = determineType(calculateAxes(answers), answers);
      expect(oshicoaTypes.find(t => t.code === code)).toBeDefined();
    }
  });

  it('同じ回答なら何度診断しても同じタイプになる（ランダム性がない）', () => {
    for (const answers of samples.slice(0, 100)) {
      const first = determineType(calculateAxes(answers), answers);
      expect(determineType(calculateAxes(answers), answers)).toBe(first);
      expect(determineType(calculateAxes(answers), answers)).toBe(first);
    }
  });

  it('回答順が変わっても結果は変わらない', () => {
    for (const answers of samples.slice(0, 100)) {
      const shuffled = [...answers].reverse();
      expect(determineType(calculateAxes(shuffled), shuffled))
        .toBe(determineType(calculateAxes(answers), answers));
    }
  });

  // 全軸が完全に同点になる回答は、通常の24問からはまず作れない
  // （5万パターン試して0件）。ただし同点時の既定値は「同じ回答なら必ず同じ結果」を
  // 支える最後の砦なので、スコアを直接渡して固定しておく。
  // ここが変わると、引き分けた人のタイプが黙って変わる（AGENTS.md ルール2）。
  it('完全に同点のときは、決まった既定のタイプを返す', () => {
    const tied = { R: 0, C: 0, E: 0, P: 0, G: 0, M: 0, T: 0, S: 0 };

    expect(determineType(tied, [])).toBe('RCGS');
  });

  it('完全に同点でも、毎回同じタイプになる（乱数を使っていない）', () => {
    const tied = { R: 0, C: 0, E: 0, P: 0, G: 0, M: 0, T: 0, S: 0 };
    const results = new Set(Array.from({ length: 200 }, () => determineType(tied, [])));

    expect([...results]).toEqual(['RCGS']);
  });
});

describe('typeAxes', () => {
  it('16タイプすべてで4つの軸に復元できる', () => {
    const pairs: [string, string][] = [['R', 'C'], ['E', 'P'], ['G', 'M'], ['T', 'S']];

    for (const code of typeCodes) {
      const axes = typeAxes(code);
      expect(axes).toHaveLength(4);
      // 各対立軸からちょうど1つずつ選ばれていること。
      pairs.forEach(([a, b], i) => {
        expect([a, b]).toContain(axes[i]);
      });
    }
  });

  it('どの軸で絞り込んでもちょうど8タイプになる', () => {
    // コード文字での一致（code.includes）だと RC* が接続(C)に数えられて偏る。
    for (const axis of ['R', 'C', 'E', 'P', 'G', 'M', 'T', 'S'] as const) {
      const matched = oshicoaTypes.filter(t => typeAxes(t.code).includes(axis));
      expect(matched).toHaveLength(8);
    }
  });

  it('RCGT は「共鳴×体験」であって「接続」ではない', () => {
    expect(typeAxes('RCGT')).toEqual(['R', 'E', 'G', 'T']);
    expect(typeAxes('CEGT')).toEqual(['C', 'E', 'G', 'T']);
  });
});

describe('calculateTags', () => {
  it('該当が少なくても多くても、必ず2件返す', () => {
    for (const answers of samples.slice(0, 300)) {
      expect(calculateTags(answers)).toHaveLength(2);
    }
    // 全問「まったく当てはまらない」でも2件（閾値未満からの穴埋めが働く）。
    expect(calculateTags(uniformAnswers(-3))).toHaveLength(2);
    expect(calculateTags(uniformAnswers(3))).toHaveLength(2);
  });

  it('同じ業タグを2件返さない', () => {
    for (const answers of samples.slice(0, 300)) {
      const [first, second] = calculateTags(answers);
      expect(first.id).not.toBe(second.id);
    }
  });

  it('同じ回答なら同じ業タグになる', () => {
    for (const answers of samples.slice(0, 100)) {
      const first = calculateTags(answers).map(t => t.id);
      expect(calculateTags(answers).map(t => t.id)).toEqual(first);
    }
  });
});

describe('determinePhase', () => {
  const durations = ['1か月未満', '1〜6か月', '6か月〜1年', '1〜3年', '3〜5年', '5年以上'];

  it('推している期間の選択肢すべてで、有効なフェーズを返す', () => {
    for (const duration of durations) {
      const phase = determinePhase(answersFromSeed(1), { duration });
      expect(phases.map(p => p.id)).toContain(phase.id);
    }
  });

  it('期間が指定されたときは、その期間のフェーズを優先する', () => {
    const answers = answersFromSeed(1);
    expect(determinePhase(answers, { duration: '1か月未満' }).id).toBe('new');
    expect(determinePhase(answers, { duration: '1〜6か月' }).id).toBe('dive');
    expect(determinePhase(answers, { duration: '5年以上' }).id).toBe('hall');
  });

  it('プロフィール未入力でも、必ず有効なフェーズを返す', () => {
    for (const answers of samples.slice(0, 300)) {
      const phase = determinePhase(answers);
      expect(phase).toBeDefined();
      expect(phases.map(p => p.id)).toContain(phase.id);
    }
  });

  it('回答内容によってフェーズが分岐する', () => {
    const ids = new Set(samples.map(answers => determinePhase(answers).id));
    expect(ids.size).toBeGreaterThan(1);
  });
});

describe('calculateChart', () => {
  const metricIds = [
    'event', 'spending', 'evangelism', 'interpretation',
    'fandom', 'recognition', 'afterglow', 'archive',
  ] as const;

  it('8項目すべてを 0〜100 の範囲で返す', () => {
    for (const answers of samples.slice(0, 300)) {
      const code = determineType(calculateAxes(answers), answers);
      const chart = calculateChart(code, answers);

      expect(Object.keys(chart).sort()).toEqual([...metricIds].sort());
      for (const id of metricIds) {
        expect(chart[id]).toBeGreaterThanOrEqual(0);
        expect(chart[id]).toBeLessThanOrEqual(100);
        expect(Number.isInteger(chart[id])).toBe(true);
      }
    }
  });

  it('極端な回答でも 0〜100 をはみ出さない', () => {
    for (const value of [3, -3] as AnswerValue[]) {
      const answers = uniformAnswers(value);
      const chart = calculateChart(determineType(calculateAxes(answers), answers), answers);
      for (const id of metricIds) {
        expect(chart[id]).toBeGreaterThanOrEqual(0);
        expect(chart[id]).toBeLessThanOrEqual(100);
      }
    }
  });

  // 上限に張り付く実例。CPMT の課金は基準値が高く、全問「めちゃくちゃ当てはまる」だと
  // 補正込みで 105 に達する。上限処理を外すとレーダーが枠外へはみ出すため、
  // 偶然のパターン頼みにせず、超える組み合わせを名指しで固定しておく。
  it('上限を超える組み合わせが 100 に丸められる', () => {
    expect(calculateChart('CPMT', uniformAnswers(3)).spending).toBe(100);
  });
});

describe('createResult', () => {
  it('24問すべてに答えていないと診断できない', () => {
    expect(() => createResult(answersFromSeed(1).slice(0, 23))).toThrow();
    expect(() => createResult([])).toThrow();
  });

  it('同じ設問に重複して答えている回答は受け付けない', () => {
    const answers = answersFromSeed(1);
    const duplicated = [...answers.slice(0, 23), { ...answers[0] }];
    expect(duplicated).toHaveLength(questions.length);
    expect(() => createResult(duplicated)).toThrow();
  });

  it('結果に必要な項目がすべて埋まる', () => {
    const result = createResult(answersFromSeed(1), { name: 'テスト', duration: '1〜3年' });

    expect(typeCodes).toContain(result.typeCode);
    expect(result.tags).toHaveLength(2);
    expect(result.phase).toBeDefined();
    expect(result.answers).toHaveLength(questions.length);
    expect(result.oshiProfile?.name).toBe('テスト');
    expect(result.completedAt).toBeTruthy();
  });

  it('同じ回答なら、診断日時以外はすべて同じ結果になる', () => {
    // 診断日時だけは実行時刻で変わるため、比較から外す。
    const withoutTimestamp = (answers: DiagnosisAnswer[]) => {
      const result = createResult(answers);
      return { ...result, completedAt: undefined };
    };

    for (const answers of samples.slice(0, 50)) {
      expect(withoutTimestamp(answers)).toEqual(withoutTimestamp(answers));
    }
  });

  it('推し名や回答をサーバーへ送る処理を含まない', () => {
    // プライバシー最優先（AGENTS.md ルール10）。診断は端末内で完結する。
    const result = createResult(answersFromSeed(1), { name: '推しの名前' });
    expect(result.oshiProfile?.name).toBe('推しの名前');
    // 送信手段を持たないこと自体は静的に担保されるため、ここでは結果が
    // そのまま返るだけであることを確認する。
    expect(result.answers).toEqual(answersFromSeed(1));
  });
});

// ---------------------------------------------------------------------------
// スコアリングの固定（ゴールデンテスト）
//
// 「決まった回答からは、決まった結果が出る」を丸ごと固定する。16タイプすべてを
// 1件ずつ通しているので、設問の重み・軸の集計・同点規則・業タグ・フェーズ判定の
// どれかが変わると、ここが落ちる。
//
// 意図してスコアリングを変えたときは、このテストが落ちるのが正しい。
// その場合は「なぜ変えたか」を確認したうえで、下の表を更新すること。
// 逆に、見た目や文言だけの作業でここが落ちたなら、それは事故（AGENTS.md ルール2）。
// ---------------------------------------------------------------------------
describe('スコアリングの固定', () => {
  const golden: [seed: number, code: string, tags: string, phase: string][] = [
    [18, 'CEGS', 'tag-3+tag-10', 'invest'],
    [61, 'CEGT', 'tag-11+tag-29', 'steady'],
    [7, 'CEMS', 'tag-2+tag-1', 'emotional'],
    [26, 'CEMT', 'tag-1+tag-10', 'steady'],
    [130, 'CPGS', 'tag-4+tag-7', 'invest'],
    [23, 'CPGT', 'tag-4+tag-1', 'invest'],
    [1, 'CPMS', 'tag-2+tag-10', 'invest'],
    [5, 'CPMT', 'tag-6+tag-8', 'emotional'],
    [6, 'RCGS', 'tag-13+tag-2', 'steady'],
    [10, 'RCGT', 'tag-7+tag-13', 'steady'],
    [3, 'RCMS', 'tag-1+tag-3', 'steady'],
    [40, 'RCMT', 'tag-3+tag-8', 'deep'],
    [59, 'RPGS', 'tag-7+tag-6', 'invest'],
    [4, 'RPGT', 'tag-9+tag-19', 'steady'],
    [22, 'RPMS', 'tag-13+tag-1', 'deep'],
    [19, 'RPMT', 'tag-2+tag-10', 'emotional'],
  ];

  it.each(golden)('seed %i の回答は必ず %s になる', (seed, code, tags, phase) => {
    const answers = answersFromSeed(seed);

    expect(determineType(calculateAxes(answers), answers)).toBe(code);
    expect(calculateTags(answers).map(t => t.id).join('+')).toBe(tags);
    expect(determinePhase(answers).id).toBe(phase);
  });

  it('16タイプすべてを固定できている', () => {
    expect(new Set(golden.map(([, code]) => code)).size).toBe(typeCodes.length);
  });
});

describe('回答の選択肢', () => {
  it('4段階で、スコアは 3 / 1 / -1 / -3', () => {
    expect(options.map(([, value]) => value)).toEqual([3, 1, -1, -3]);
  });
});

describe('設問データ', () => {
  it('24問ある', () => {
    expect(questions).toHaveLength(24);
  });

  it('設問IDが重複していない', () => {
    expect(new Set(questions.map(q => q.id)).size).toBe(questions.length);
  });

  it('すべての設問がいずれかの軸に重みを持つ', () => {
    for (const q of questions) {
      expect(Object.keys(q.weights).length).toBeGreaterThan(0);
    }
  });
});
