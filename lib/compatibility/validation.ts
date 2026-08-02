import { typeCodes } from '@/types';
import { OshicoaCode } from './types';

/**
 * 16タイプのコード一覧。
 * 既存の `types.ts` の `typeCodes` をそのまま使い、配列を二重に持たないようにしています。
 */
export const OSHICOA_CODES: OshicoaCode[] = [...typeCodes];

const CODE_SET = new Set<string>(OSHICOA_CODES);

/** 小文字も有効として扱います（URLの ?me=rcgt などを許容） */
export function isOshicoaCode(value: unknown): value is OshicoaCode {
  return typeof value === 'string' && CODE_SET.has(value.toUpperCase());
}

/** 有効なら大文字のコード、無効なら undefined を返す */
export function normalizeOshicoaCode(value: unknown): OshicoaCode | undefined {
  if (!isOshicoaCode(value)) return undefined;
  return value.toUpperCase() as OshicoaCode;
}

/**
 * URLのクエリ値をコードに変換する。
 * 配列（?me=A&me=B）、空文字、null、想定外の型が来てもクラッシュしません。
 */
export function normalizeCodeParam(value: string | string[] | undefined | null): OshicoaCode | undefined {
  if (Array.isArray(value)) {
    for (const item of value) {
      const code = normalizeOshicoaCode(item);
      if (code) return code;
    }
    return undefined;
  }
  return normalizeOshicoaCode(value);
}

/** localStorage などに保存された診断結果から、自分のタイプだけを安全に取り出す */
export function readTypeCodeFromUnknown(value: unknown): OshicoaCode | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const typeCode = (value as { typeCode?: unknown }).typeCode;
  return normalizeOshicoaCode(typeCode);
}
