import type { TypeCode } from "@/types";
import { typeMap } from "@/data/types";

/**
 * タイプ別・有料コンテンツ（note等）の設定。
 *
 * 収益化の第一歩として、ここに「実URL・価格・公開フラグ」を書くだけで購入導線が有効になる。
 * 未設定（available=false）のタイプは、結果画面でデッドリンクにせず「準備中」表示になる。
 *
 * 公開したら overrides にそのタイプを追記する例:
 *   RCGT: { url: "https://note.com/xxxx/n/xxxxxxxx", price: 500, available: true },
 *
 * NEXT_PUBLIC_PREMIUM_ENABLED=1 を設定すると、overrides未指定でも既定URLで一括有効化できる
 * （公開前の動作確認用。既定URLはプレースホルダーなので本番では個別設定を推奨）。
 */
type PremiumOverride = {
  url?: string;
  /** 税込価格（円）。未設定なら価格表記を出さない。 */
  price?: number;
  /** 販売開始したら true。false（既定）は「準備中」表示。 */
  available?: boolean;
};

const overrides: Partial<Record<TypeCode, PremiumOverride>> = {
  // ここに公開済みタイプを追記していく。
};

const GLOBAL_ENABLED = process.env.NEXT_PUBLIC_PREMIUM_ENABLED === "1";

export type PremiumProduct = {
  url: string;
  price?: number;
  available: boolean;
  title: string;
  description: string;
};

export function getPremium(code: TypeCode): PremiumProduct {
  const type = typeMap[code];
  const o = overrides[code] ?? {};
  return {
    url: o.url ?? type.premiumUrl,
    price: o.price,
    available: o.available ?? GLOBAL_ENABLED,
    title: type.premiumCtaTitle,
    description: type.premiumCtaDescription,
  };
}

export function formatPrice(price?: number): string | null {
  if (typeof price !== "number") return null;
  return `¥${price.toLocaleString("ja-JP")}`;
}
