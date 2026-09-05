import { describe, expect, it } from 'vitest';
import { profileSelects } from '@/data/profile';
import {
  resumeFields, resumeFilledCount, resumeProfileRows, resumeTotalFields,
} from '@/data/resume';

describe('入力項目の定義', () => {
  it('キーが重複していない', () => {
    const keys = resumeFields.map(f => f.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('すべての項目にラベルと記入例がある', () => {
    for (const field of resumeFields) {
      expect(field.label).not.toBe('');
      expect(field.placeholder).not.toBe('');
      expect(field.maxLength).toBeGreaterThan(0);
    }
  });

  it('記入例が入力上限を超えていない', () => {
    // placeholder より maxLength が短いと、例のとおりに書くと入りきらない。
    for (const field of resumeFields) {
      expect(field.placeholder.length).toBeLessThanOrEqual(field.maxLength);
    }
  });

  it('金額や現場数を書かせる項目がない', () => {
    // README「課金額や現場数を評価せず」。金額そのものを聞く欄は作らない。
    const banned = ['金額', '課金額', 'いくら', '何回'];
    const text = resumeFields.map(f => f.label + f.placeholder).join('');
    for (const word of banned) expect(text).not.toContain(word);
  });

  it('合計項目数が基本情報5件＋自由記述の数と一致する', () => {
    expect(resumeTotalFields).toBe(5 + resumeFields.length);
  });
});

describe('resumeProfileRows', () => {
  it('未入力でも4行そろい、空欄はダッシュで埋まる', () => {
    const rows = resumeProfileRows({});
    expect(rows).toHaveLength(4);
    for (const [, value] of rows) expect(value).toBe('—');
  });

  it('入力があればその値を返す', () => {
    const rows = resumeProfileRows({ oshiName: '〇〇くん', genre: '男性アイドル' });
    expect(rows[0]).toEqual(['推し', '〇〇くん']);
    expect(rows[1]).toEqual(['ジャンル', '男性アイドル']);
  });

  it('空白だけの入力は未入力として扱う', () => {
    expect(resumeProfileRows({ oshiName: '   ' })[0][1]).toBe('—');
  });
});

describe('resumeFilledCount', () => {
  it('未入力は0件', () => {
    expect(resumeFilledCount({})).toBe(0);
  });

  it('空白だけの入力は数えない', () => {
    expect(resumeFilledCount({ displayName: '  ', trigger: '' })).toBe(0);
  });

  it('入力した数だけ増える', () => {
    expect(resumeFilledCount({ displayName: 'えりんぎ' })).toBe(1);
    expect(resumeFilledCount({ displayName: 'えりんぎ', oshiName: '〇〇くん', trigger: '友達の動画' })).toBe(3);
  });

  it('全項目を埋めると合計と一致する', () => {
    const full: Record<string, string> = {
      displayName: 'えりんぎ', oshiName: '〇〇くん',
      genre: '男性アイドル', duration: '1〜3年', frequency: '月1回程度',
    };
    for (const field of resumeFields) full[field.key] = 'テスト';
    expect(resumeFilledCount(full)).toBe(resumeTotalFields);
  });
});

describe('推しプロフィールの選択肢', () => {
  it('診断ページと履歴書で同じ定義を使っている', () => {
    expect(profileSelects.map(([key]) => key)).toEqual(['genre', 'duration', 'frequency']);
    for (const [, label, options] of profileSelects) {
      expect(label).not.toBe('');
      expect(options.length).toBeGreaterThan(0);
      expect(new Set(options).size).toBe(options.length);
    }
  });

  it('フェーズ判定が参照している期間の表記が残っている', () => {
    // lib/diagnosis の determinePhase がこの3つの文字列で分岐している。
    // 表記を変えるとフェーズ判定が黙って変わるため、ここで固定する。
    const durations = profileSelects.find(([key]) => key === 'duration')![2];
    expect(durations).toContain('1か月未満');
    expect(durations).toContain('1〜6か月');
    expect(durations).toContain('5年以上');
  });
});
