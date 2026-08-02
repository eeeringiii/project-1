import { describe, expect, it } from 'vitest';
import { getType } from '@/data/types';
import { calculateCompatibility, createShareText, createShareUrl } from '@/lib/compatibility';
import { OSHICOA_CODES } from '@/lib/compatibility/validation';

const weightedLength = (text: string) => {
  let total = 0;
  for (const character of text) total += character.charCodeAt(0) > 0x7f ? 2 : 1;
  return total;
};

describe('シェア文', () => {
  it('全256パターンでXの文字数に収まり、必要な情報が残る', () => {
    OSHICOA_CODES.forEach(first => {
      OSHICOA_CODES.forEach(second => {
        const result = calculateCompatibility(first, second);
        const partnerTypeName = getType(second)!.name;
        const url = createShareUrl('https://oshicoa16.example.com', result);
        const text = createShareText({ result, partnerTypeName, url });
        const label = `${first} × ${second}`;

        expect(weightedLength(text) + 24, label).toBeLessThanOrEqual(280);
        expect(text.includes(`${result.overallScore}％`), label).toBe(true);
        expect(text.includes(result.pairTitle), label).toBe(true);
        expect(text.includes('#OSHICOA16'), label).toBe(true);
        expect(text.includes(partnerTypeName), label).toBe(true);
      });
    });
  });

  it('結果URLにタイプコードだけが入る', () => {
    const result = calculateCompatibility('RCGT', 'CEMS');
    expect(createShareUrl('https://example.com', result)).toBe(
      'https://example.com/compatibility?me=RCGT&partner=CEMS',
    );
    expect(createShareUrl('', result)).toBe('/compatibility?me=RCGT&partner=CEMS');
  });
});
