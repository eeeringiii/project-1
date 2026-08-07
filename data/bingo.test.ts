import { describe, expect, it } from 'vitest';
import {
  BINGO_CENTER, BINGO_FREE_TEXT, BINGO_SIZE,
  bingoItems, bingoLines, bingoRankFor, bingoRanks,
  buildBingoCard, countBingoLines,
} from '@/data/bingo';

describe('マス目データ', () => {
  it('カードを作れるだけの数がある（24マス＋予備）', () => {
    expect(bingoItems.length).toBeGreaterThanOrEqual(24);
  });

  it('同じ文言が重複していない', () => {
    expect(new Set(bingoItems).size).toBe(bingoItems.length);
  });

  it('マスに収まる長さに収まっている', () => {
    // 5×5のマスに入るので長すぎると文字が潰れる。data/bingo.ts の決まりと揃える。
    const tooLong = bingoItems.filter(item => item.length > 15);
    expect(tooLong).toEqual([]);
  });

  it('金額や現場数で優劣をつける言い回しを含まない', () => {
    // README「課金額や現場数を評価せず」。金額そのものを煽る語を弾く。
    const banned = ['万円', '円使', '何回行', '回以上'];
    const violating = bingoItems.filter(item => banned.some(word => item.includes(word)));
    expect(violating).toEqual([]);
  });
});

describe('buildBingoCard', () => {
  it('25マスを返し、中央がフリーマスになる', () => {
    const card = buildBingoCard(1);

    expect(card).toHaveLength(BINGO_SIZE * BINGO_SIZE);
    expect(card[BINGO_CENTER]).toBe(BINGO_FREE_TEXT);
  });

  it('フリーマス以外に同じ文言が並ばない', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const card = buildBingoCard(seed).filter((_, i) => i !== BINGO_CENTER);
      expect(new Set(card).size).toBe(card.length);
    }
  });

  it('フリーマス以外はすべて項目プールから選ばれる', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const card = buildBingoCard(seed);
      card.forEach((item, i) => {
        if (i !== BINGO_CENTER) expect(bingoItems).toContain(item);
      });
    }
  });

  it('同じ種なら必ず同じカードになる（表示がズレない）', () => {
    // サーバーとクライアントで同じカードを描くための前提。
    expect(buildBingoCard(42)).toEqual(buildBingoCard(42));
  });

  it('種が違えばカードも変わる', () => {
    expect(buildBingoCard(1)).not.toEqual(buildBingoCard(2));
  });
});

describe('countBingoLines', () => {
  it('ラインは縦5・横5・斜め2の12本', () => {
    expect(bingoLines).toHaveLength(12);
    for (const line of bingoLines) expect(line).toHaveLength(BINGO_SIZE);
  });

  it('中央だけではビンゴにならない', () => {
    expect(countBingoLines(new Set([BINGO_CENTER])).count).toBe(0);
  });

  it('横一列を埋めると1ビンゴになる', () => {
    const row = new Set([0, 1, 2, 3, 4]);
    expect(countBingoLines(row).count).toBe(1);
    expect(countBingoLines(row).cells).toEqual(row);
  });

  it('中央を通る縦・横・斜めは同時に成立する', () => {
    // 中央列＋中央行＋両斜めが揃う配置。
    const filled = new Set([
      2, 7, 12, 17, 22,   // 縦（中央列）
      10, 11, 13, 14,     // 横（中央行）※12は上で追加済み
      0, 6, 18, 24,       // 斜め
      4, 8, 16, 20,       // 逆斜め
    ]);
    expect(countBingoLines(filled).count).toBe(4);
  });

  it('全マス埋めると12ビンゴになる', () => {
    const all = new Set(Array.from({ length: 25 }, (_, i) => i));
    expect(countBingoLines(all).count).toBe(12);
  });
});

describe('bingoRankFor', () => {
  it('埋めたマス数が増えてもランクが下がらない', () => {
    let previous = -1;
    for (let filled = 0; filled <= 25; filled++) {
      const index = bingoRanks.indexOf(bingoRankFor(filled));
      if (previous !== -1) expect(index).toBeLessThanOrEqual(previous);
      previous = index;
    }
  });

  it('0マスから25マスまで、必ずランクが決まる', () => {
    for (let filled = 0; filled <= 25; filled++) {
      expect(bingoRanks).toContain(bingoRankFor(filled));
    }
  });

  it('端の値が意図どおりのランクになる', () => {
    expect(bingoRankFor(0).name).toBe('見習いヲタク');
    expect(bingoRankFor(1).name).toBe('見習いヲタク');
    expect(bingoRankFor(7).name).toBe('通常運転ヲタク');
    expect(bingoRankFor(13).name).toBe('ガチヲタク');
    expect(bingoRankFor(19).name).toBe('沼の主');
    expect(bingoRankFor(25).name).toBe('伝説のヲタク');
  });
});
