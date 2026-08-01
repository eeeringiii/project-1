import { TypeCode } from '@/types';

/**
 * 16タイプの見た目（色・マーク）。
 * 診断ロジックとは無関係の「見た目だけ」の設定なので、
 * 色やマークを変えたいときはこのファイルの値を書き換えるだけでOKです。
 * - chip : カードの上部やヒーローの背景に使うパステル色
 * - mark : タイプの目印（絵文字1文字。キャラ画像が入るまでの顔役）
 */
export interface TypeTheme { chip: string; mark: string }

export const typeThemes: Record<TypeCode, TypeTheme> = {
  REGT: { chip: '#ffdfea', mark: '📣' },
  REGS: { chip: '#e2e6ff', mark: '🎯' },
  REMT: { chip: '#ffe2d5', mark: '🫰' },
  REMS: { chip: '#efe0ff', mark: '🔐' },
  RPGT: { chip: '#d9f3ec', mark: '🕊️' },
  RPGS: { chip: '#e5ecff', mark: '🗃️' },
  RPMT: { chip: '#ffeecb', mark: '📷' },
  RPMS: { chip: '#f6e3ff', mark: '💎' },
  CEGT: { chip: '#ffe0e0', mark: '🚩' },
  CEGS: { chip: '#dff0ff', mark: '🚄' },
  CEMT: { chip: '#ffe6f4', mark: '🎉' },
  CEMS: { chip: '#e8e4f7', mark: '👻' },
  CPGT: { chip: '#ffe8cf', mark: '🛡️' },
  CPGS: { chip: '#e6f2e2', mark: '📦' },
  CPMT: { chip: '#defbf3', mark: '🔁' },
  CPMS: { chip: '#f3e6ff', mark: '🕯️' },
};

const fallback: TypeTheme = { chip: '#eae0ff', mark: '✧' };

export const getTypeTheme = (code: string): TypeTheme => typeThemes[code as TypeCode] ?? fallback;

/** 4つの軸の色（トップページの軸カード用） */
export const axisChips = ['#ffdfea', '#e3e0ff', '#d9f3ec', '#ffeecb'];
