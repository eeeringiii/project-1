import { OshicoaType } from '@/types';

/**
 * 有料コンテンツ（note）への導線設定。
 *
 * ▼ 運用する人向け
 * 1. 有料noteを公開したら、下の `url` にそのURLを貼るだけでCTAが全ページに出ます。
 * 2. `url` が空のあいだ、CTAは表示されません（リンク切れを出さないため）。
 * 3. 文言を変えたいときも、このファイルだけを直せば済みます。コンポーネントは触らなくて大丈夫です。
 */
export const paidNote = {
  /** 例: 'https://note.com/oshicoa/n/nXXXXXXXXXXXX' 。空文字ならCTA非表示。 */
  url: '',
  /** CTAの上に出る小見出し。 */
  eyebrow: 'MORE',
  /** ボタンの文言。 */
  buttonLabel: '完全版を読む（note）',
  /** 価格の表示。空文字なら非表示。 */
  priceLabel: '',
};

/** どのページのCTAから来たかをnote側で判別するための計測パラメータ。 */
export function offerUrl(placement: string, typeCode: string) {
  if (!paidNote.url) return null;
  const separator = paidNote.url.includes('?') ? '&' : '?';
  const params = new URLSearchParams({ utm_source: 'oshicoa', utm_medium: placement, utm_campaign: typeCode });
  return `${paidNote.url}${separator}${params.toString()}`;
}

/**
 * タイプごとのCTA文言。16タイプぶんの原稿を別途書かなくて済むよう、
 * すでにある診断データ（弱点・限界行動）から自動で組み立てています。
 */
export function offerCopy(type: OshicoaType) {
  return {
    heading: `「${type.name}」の取扱説明書`,
    body: `${type.weakness}——診断では出しきれなかった${type.name}の深掘り解説、16タイプ相性早見表、そして推し活を長く続けるための処方箋。`,
  };
}
