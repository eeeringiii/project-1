import { describe, expect, it } from 'vitest';
import { SCENE_ORDER } from '@/data/compatibility/sceneFit';
import { calculateCompatibility } from '@/lib/compatibility/calculateCompatibility';
import { normalizeCodeParam, normalizePairKey, parseOshicoaCode } from '@/lib/compatibility';
import { OSHICOA_CODES, isOshicoaCode } from '@/lib/compatibility/validation';
import { AxisKey, CompatibilityScene, OshicoaCode } from '@/lib/compatibility/types';

const allPairs: [OshicoaCode, OshicoaCode][] = OSHICOA_CODES.flatMap(first =>
  OSHICOA_CODES.map(second => [first, second] as [OshicoaCode, OshicoaCode]),
);

describe('タイプコードの分解と正規化', () => {
  it('4文字コードを4軸へ分解できる', () => {
    // R系コードの第2文字は "C" 表記だが、体験（E）側として扱う
    expect(parseOshicoaCode('RCGT')).toEqual({ RC: 'R', EP: 'E', GM: 'G', TS: 'T' });
    expect(parseOshicoaCode('RPMS')).toEqual({ RC: 'R', EP: 'P', GM: 'M', TS: 'S' });
    expect(parseOshicoaCode('CEGT')).toEqual({ RC: 'C', EP: 'E', GM: 'G', TS: 'T' });
    expect(parseOshicoaCode('CPMS')).toEqual({ RC: 'C', EP: 'P', GM: 'M', TS: 'S' });
  });

  it('16タイプすべてが定義済みのペアキーに分解される', () => {
    OSHICOA_CODES.forEach(code => {
      const parsed = parseOshicoaCode(code);
      expect(['R', 'C']).toContain(parsed.RC);
      expect(['E', 'P']).toContain(parsed.EP);
      expect(['G', 'M']).toContain(parsed.GM);
      expect(['T', 'S']).toContain(parsed.TS);
    });
  });

  it('順番が違っても同じペアキーになる', () => {
    const axes: [AxisKey, string, string][] = [
      ['RC', 'R', 'C'],
      ['EP', 'E', 'P'],
      ['GM', 'G', 'M'],
      ['TS', 'T', 'S'],
    ];
    axes.forEach(([axis, head, tail]) => {
      expect(normalizePairKey(axis, head, tail)).toBe(normalizePairKey(axis, tail, head));
      expect(normalizePairKey(axis, head, tail)).toBe(axis);
      expect(normalizePairKey(axis, head, head)).toBe(head + head);
      expect(normalizePairKey(axis, tail, tail)).toBe(tail + tail);
    });
  });
});

describe('必須テスト1：完全一致', () => {
  const result = calculateCompatibility('RCGT', 'RCGT');

  it('4軸すべて一致し、完全一致ボーナスが入る', () => {
    expect(result.matchedAxisCount).toBe(4);
    // ボーナスなしなら95点。ボーナス+3で98点になる
    expect(result.overallScore).toBe(98);
    expect(result.overallScore).toBeLessThanOrEqual(99);
  });

  it('ペア名・強み・注意点・コツ・5シーンが揃う', () => {
    expect(result.pairTitle).toBe('同じ生態で生きる運命共同体');
    expect(result.strengths).toHaveLength(2);
    expect(result.friction.description.length).toBeGreaterThan(0);
    expect(result.tips.length).toBeGreaterThanOrEqual(1);
    expect(result.scenes).toHaveLength(5);
    expect(result.scenes.map(scene => scene.scene)).toEqual(SCENE_ORDER);
  });
});

describe('必須テスト2：完全反対', () => {
  const result = calculateCompatibility('RCGT', 'CPMS');

  it('一致軸が0でもクラッシュせず、スコアが範囲内', () => {
    expect(result.matchedAxisCount).toBe(0);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(99);
  });

  it('ペア名・注意点・コツ・総評が揃う', () => {
    expect(result.pairTitle).toBe('推し活の世界を広げる正反対ペア');
    expect(result.friction.title.length).toBeGreaterThan(0);
    expect(result.tips.length).toBeGreaterThanOrEqual(1);
    expect(result.summary).not.toBe('');
  });
});

describe('必須テスト3：順序対称性', () => {
  it('入れ替えてもスコアとランクが変わらない', () => {
    const first = calculateCompatibility('RCGT', 'CEMS');
    const second = calculateCompatibility('CEMS', 'RCGT');

    expect(second.overallScore).toBe(first.overallScore);
    expect(second.matchedAxisCount).toBe(first.matchedAxisCount);
    expect(second.bestScene).toBe(first.bestScene);
    expect(second.rank).toBe(first.rank);
    expect(second.pairTitle).toBe(first.pairTitle);
    expect(second.summary).toBe(first.summary);
    expect(second.scenes.map(scene => scene.score)).toEqual(first.scenes.map(scene => scene.score));
  });

  it('入力順（firstType / secondType）は保持される', () => {
    const first = calculateCompatibility('RCGT', 'CEMS');
    const second = calculateCompatibility('CEMS', 'RCGT');
    expect(first.firstType).toBe('RCGT');
    expect(first.secondType).toBe('CEMS');
    expect(second.firstType).toBe('CEMS');
    expect(second.secondType).toBe('RCGT');
  });

  it('全256パターンで順序を入れ替えてもスコアが同じ', () => {
    allPairs.forEach(([first, second]) => {
      const a = calculateCompatibility(first, second);
      const b = calculateCompatibility(second, first);
      expect(b.overallScore).toBe(a.overallScore);
      expect(b.scenes.map(scene => scene.score)).toEqual(a.scenes.map(scene => scene.score));
    });
  });
});

describe('必須テスト4：全256パターン', () => {
  it('エラーなく、表示に必要な項目がすべて揃う', () => {
    const validScenes: CompatibilityScene[] = [...SCENE_ORDER];

    allPairs.forEach(([first, second]) => {
      const result = calculateCompatibility(first, second);
      const label = `${first} × ${second}`;

      expect(Number.isNaN(result.overallScore), label).toBe(false);
      expect(result.overallScore, label).toBeGreaterThanOrEqual(0);
      expect(result.overallScore, label).toBeLessThanOrEqual(99);
      expect(result.strengths, label).toHaveLength(2);
      expect(result.tips.length, label).toBeGreaterThanOrEqual(1);
      expect(result.summary, label).not.toBe('');
      expect(validScenes, label).toContain(result.bestScene);
      expect(result.scenes, label).toHaveLength(5);

      result.strengths.forEach(strength => {
        expect(strength.title, label).toBeTruthy();
        expect(strength.description, label).toBeTruthy();
      });
      expect(result.friction.title, label).toBeTruthy();
      expect(result.friction.description, label).toBeTruthy();

      result.scenes.forEach(scene => {
        expect(Number.isNaN(scene.score), label).toBe(false);
        expect(scene.score, label).toBeGreaterThanOrEqual(0);
        expect(scene.score, label).toBeLessThanOrEqual(100);
        expect(scene.level.stars, label).toBeGreaterThanOrEqual(1);
        expect(scene.level.stars, label).toBeLessThanOrEqual(5);
        expect(scene.comment, label).toBeTruthy();
      });

      // undefined / NaN が文言に混ざっていないこと
      const allText = [
        result.summary,
        result.pairTitle,
        result.friction.title,
        result.friction.description,
        ...result.tips,
        ...result.strengths.flatMap(item => [item.title, item.description]),
        ...result.scenes.map(scene => scene.comment),
      ].join('|');
      expect(allText.includes('undefined'), label).toBe(false);
      expect(allText.includes('NaN'), label).toBe(false);
    });
  });

  it('総評は120〜220文字、シーンコメントは50〜90文字の範囲に収まる', () => {
    allPairs.forEach(([first, second]) => {
      const result = calculateCompatibility(first, second);
      const label = `${first} × ${second}`;
      expect(result.summary.length, `${label} 総評=${result.summary.length}`).toBeGreaterThanOrEqual(120);
      expect(result.summary.length, `${label} 総評=${result.summary.length}`).toBeLessThanOrEqual(220);
      result.scenes.forEach(scene => {
        const length = scene.comment.length;
        expect(length, `${label} ${scene.scene}=${length}`).toBeGreaterThanOrEqual(50);
        expect(length, `${label} ${scene.scene}=${length}`).toBeLessThanOrEqual(90);
      });
    });
  });

  it('否定的な表現を使っていない', () => {
    const forbidden = ['相性が悪い', '最悪', '合わない', '危険', '地雷', '絶交'];
    allPairs.forEach(([first, second]) => {
      const result = calculateCompatibility(first, second);
      const allText = [
        result.summary,
        result.pairTitle,
        result.friction.title,
        result.friction.description,
        ...result.tips,
        ...result.strengths.flatMap(item => [item.title, item.description]),
        ...result.scenes.map(scene => scene.comment),
      ].join('|');
      forbidden.forEach(word => {
        expect(allText.includes(word), `${first} × ${second} / ${word}`).toBe(false);
      });
    });
  });
});

describe('必須テスト5：不正コード', () => {
  it('バリデーションが不正値を弾く', () => {
    expect(isOshicoaCode('AAAA')).toBe(false);
    expect(isOshicoaCode('')).toBe(false);
    expect(isOshicoaCode(null)).toBe(false);
    expect(isOshicoaCode(undefined)).toBe(false);
    expect(isOshicoaCode(1234)).toBe(false);
    expect(isOshicoaCode({ code: 'RCGT' })).toBe(false);
    expect(isOshicoaCode('RCGTT')).toBe(false);
    expect(isOshicoaCode(' RCGT')).toBe(false);
  });

  it('小文字は有効として大文字へ正規化する', () => {
    expect(isOshicoaCode('rcgt')).toBe(true);
    expect(normalizeCodeParam('rcgt')).toBe('RCGT');
    expect(normalizeCodeParam('RcGt')).toBe('RCGT');
  });

  it('配列・空文字・欠損パラメータでもクラッシュしない', () => {
    expect(normalizeCodeParam(['cems', 'RCGT'])).toBe('CEMS');
    expect(normalizeCodeParam(['xxxx', 'rcgt'])).toBe('RCGT');
    expect(normalizeCodeParam(['xxxx'])).toBeUndefined();
    expect(normalizeCodeParam([])).toBeUndefined();
    expect(normalizeCodeParam('')).toBeUndefined();
    expect(normalizeCodeParam(undefined)).toBeUndefined();
    expect(normalizeCodeParam(null)).toBeUndefined();
  });

  it('16タイプすべてが有効なコードとして扱われる', () => {
    expect(OSHICOA_CODES).toHaveLength(16);
    OSHICOA_CODES.forEach(code => expect(isOshicoaCode(code)).toBe(true));
  });
});

describe('スコア分布', () => {
  const scores = allPairs.map(([first, second]) => calculateCompatibility(first, second).overallScore);
  const sorted = [...scores].sort((a, b) => a - b);
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  it('極端に偏っていない', () => {
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    expect(min).toBeGreaterThanOrEqual(55);
    expect(max).toBeLessThanOrEqual(99);
    expect(max).toBeGreaterThanOrEqual(95);
    expect(average).toBeGreaterThanOrEqual(75);
    expect(average).toBeLessThanOrEqual(83);
    // 全部が80点以上、あるいは完全一致だけが高得点、という状態になっていないこと
    expect(scores.filter(score => score < 80).length).toBeGreaterThan(40);
    expect(scores.filter(score => score >= 90).length).toBeGreaterThan(16);
  });
});
