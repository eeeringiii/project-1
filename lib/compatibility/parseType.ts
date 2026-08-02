import { AXIS_LETTERS, AXIS_PRIORITY } from '@/data/compatibility/pairFit';
import { AxisKey, OshicoaCode, PairKey, ParsedOshicoaType } from './types';

/**
 * 4文字コードを4軸に分解する。
 *
 * 【第2軸の注意】
 * OSHICOA 16の実際のコードは RCGT / RPGT / CEGT / CPGT のように、
 * R系タイプの第2文字が "E" ではなく "C" で表記されています
 * （RC＝共鳴×体験寄り、RP＝共鳴×所有、CE＝接続×体験、CP＝接続×所有）。
 * 既存コードは共有URLやOG画像が依存しているため変更できないので、
 * 相性計算では第2軸を「P かどうか」で判定し、P以外は体験（E）として扱います。
 */
export function parseOshicoaCode(code: OshicoaCode): ParsedOshicoaType {
  return {
    RC: code[0] as 'R' | 'C',
    EP: code[1] === 'P' ? 'P' : 'E',
    GM: code[2] as 'G' | 'M',
    TS: code[3] as 'T' | 'S',
  };
}

export const AXIS_KEYS: AxisKey[] = ['RC', 'EP', 'GM', 'TS'];

/**
 * 軸ごとのペアキーを作る。
 * アルファベット順のsortではなく、軸の並び（R→C, E→P, G→M, T→S）で正規化するので、
 * 「R×C」と「C×R」は必ず同じ "RC" になります。
 */
export function normalizePairKey(axis: AxisKey, first: string, second: string): PairKey {
  if (first === second) return (first + second) as PairKey;
  const [head, tail] = AXIS_LETTERS[axis];
  return (head + tail) as PairKey;
}

/** 軸の同点をほどくための優先順位（小さいほど優先） */
export function axisPriorityIndex(axis: AxisKey): number {
  return AXIS_PRIORITY.indexOf(axis);
}

/**
 * 同じ2人には毎回同じ文章が出るように、決定論的にテンプレートを選ぶ。
 * Math.randomは使いません。
 */
export function getStableTemplateIndex(
  firstType: OshicoaCode,
  secondType: OshicoaCode,
  templateLength: number,
  salt = '',
): number {
  if (templateLength <= 0) return 0;
  const normalizedPair = [firstType, secondType].slice().sort().join('-') + salt;
  const hash = normalizedPair
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  return hash % templateLength;
}

/** 決定論的にテンプレートを1つ選ぶ（空配列でもクラッシュしない） */
export function pickTemplate(
  templates: readonly string[] | undefined,
  firstType: OshicoaCode,
  secondType: OshicoaCode,
  salt = '',
  fallback = '',
): string {
  if (!templates || templates.length === 0) return fallback;
  return templates[getStableTemplateIndex(firstType, secondType, templates.length, salt)] ?? fallback;
}
