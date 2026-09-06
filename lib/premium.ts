/**
 * 有料note（OSHICOA 16 完全版）への導線。
 *
 * `NEXT_PUBLIC_PREMIUM_NOTE_URL` を設定したときだけ、結果ページとタイプページに
 * 購入CTAが表示されます。未設定のあいだは CTA を描画しないので、
 * note の URL が決まる前に本番へ出しても導線が壊れません。
 *
 * 例：NEXT_PUBLIC_PREMIUM_NOTE_URL=https://note.com/xxxx/n/nyyyy
 *     NEXT_PUBLIC_PREMIUM_NOTE_PRICE=500
 */

export const premiumNoteUrl = process.env.NEXT_PUBLIC_PREMIUM_NOTE_URL ?? '';
export const premiumNotePrice = process.env.NEXT_PUBLIC_PREMIUM_NOTE_PRICE ?? '500';

/** CTA の設置場所。どこから売れたかを utm_medium で判別するために使います。 */
export type CtaPlacement = 'result_top' | 'result_bottom' | 'type_page';

/**
 * note の URL に UTM を付けて返します。
 * - baseUrl が空なら空文字（＝CTA を出さない）
 * - baseUrl が URL として解釈できない場合は、壊さずそのまま返す
 * - 既存のクエリ・ハッシュは保持する
 */
export function buildPremiumNoteUrl(baseUrl: string, typeCode: string, placement: CtaPlacement): string {
  if (!baseUrl) return '';
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('utm_source', 'oshicoa16');
    url.searchParams.set('utm_medium', placement);
    url.searchParams.set('utm_campaign', 'premium_note');
    url.searchParams.set('utm_content', typeCode);
    return url.toString();
  } catch {
    return baseUrl;
  }
}
