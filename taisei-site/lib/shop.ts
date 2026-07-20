// グッズストアを shop. サブドメインとして「見せ方だけ」分離するための設定。
// NEXT_PUBLIC_SHOP_HOST を設定すると /goods が独立ストア（shop.ドメイン）扱いになり、
// 未設定なら従来どおり本体サイト内の /goods として動作する（完全な後方互換）。
//
//   NEXT_PUBLIC_SHOP_HOST=shop.example.com   ← ストアのサブドメイン
//   NEXT_PUBLIC_SITE_HOST=example.com        ← 本体サイト（戻るリンク・寄せ先に使用）

export const SHOP_HOST = (process.env.NEXT_PUBLIC_SHOP_HOST ?? "").trim().toLowerCase();
export const SITE_HOST = (process.env.NEXT_PUBLIC_SITE_HOST ?? "").trim().toLowerCase();

// サブドメイン運用が有効か
export const shopEnabled = SHOP_HOST.length > 0;

// GOODSへのリンク先。サブドメイン運用なら https://shop.… 、未設定なら本体の /goods。
export function shopHref(path = ""): string {
  return shopEnabled ? `https://${SHOP_HOST}${path}` : `/goods${path}`;
}

// 本体サイトのURL（ストアから戻るリンク用）。SITE_HOST 未設定なら相対パス。
export function siteHref(path = "/"): string {
  return SITE_HOST ? `https://${SITE_HOST}${path}` : path;
}
