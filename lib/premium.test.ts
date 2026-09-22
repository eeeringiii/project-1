import { describe, expect, it } from 'vitest';
import { buildPremiumNoteUrl } from './premium';

const BASE = 'https://note.com/eringi/n/n1234567890ab';

describe('buildPremiumNoteUrl', () => {
  it('URLが未設定ならCTAを出さないための空文字を返す', () => {
    expect(buildPremiumNoteUrl('', 'CEMT', 'result_top')).toBe('');
  });

  it('UTMを4つとも付与する', () => {
    const url = new URL(buildPremiumNoteUrl(BASE, 'CEMT', 'result_top'));
    expect(url.origin + url.pathname).toBe(BASE);
    expect(url.searchParams.get('utm_source')).toBe('oshicoa16');
    expect(url.searchParams.get('utm_medium')).toBe('result_top');
    expect(url.searchParams.get('utm_campaign')).toBe('premium_note');
    expect(url.searchParams.get('utm_content')).toBe('CEMT');
  });

  it('設置場所ごとに utm_medium が変わる（どこから売れたか判別できる）', () => {
    const mediums = (['result_top', 'result_bottom', 'type_page'] as const).map(
      placement => new URL(buildPremiumNoteUrl(BASE, 'RPGS', placement)).searchParams.get('utm_medium'),
    );
    expect(mediums).toEqual(['result_top', 'result_bottom', 'type_page']);
  });

  it('タイプコードごとに utm_content が変わる', () => {
    const a = new URL(buildPremiumNoteUrl(BASE, 'RCGT', 'type_page')).searchParams.get('utm_content');
    const b = new URL(buildPremiumNoteUrl(BASE, 'CPMS', 'type_page')).searchParams.get('utm_content');
    expect([a, b]).toEqual(['RCGT', 'CPMS']);
  });

  it('もとから付いているクエリとハッシュを壊さない', () => {
    const url = new URL(buildPremiumNoteUrl(`${BASE}?from=x#body`, 'CEGS', 'result_bottom'));
    expect(url.searchParams.get('from')).toBe('x');
    expect(url.hash).toBe('#body');
    expect(url.searchParams.get('utm_content')).toBe('CEGS');
  });

  it('同じUTMを二重に付けない（再実行しても増えない）', () => {
    const once = buildPremiumNoteUrl(BASE, 'CEMS', 'result_top');
    const twice = buildPremiumNoteUrl(once, 'CEMS', 'result_top');
    expect(twice).toBe(once);
  });

  it('URLとして解釈できない値でもリンクを壊さずそのまま返す', () => {
    expect(buildPremiumNoteUrl('note.com/eringi', 'RPMT', 'type_page')).toBe('note.com/eringi');
  });
});
