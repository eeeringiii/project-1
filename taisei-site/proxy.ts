import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SHOP_HOST, SITE_HOST, shopEnabled } from "@/lib/shop";

// shop. サブドメインでアクセスされたらグッズストアとして見せる（見た目の分離・C-1方式）。
// この版の Next.js では middleware は proxy に改称されている。
// NEXT_PUBLIC_SHOP_HOST 未設定時は完全に何もしない（従来どおり本体サイトの /goods）。
export function proxy(req: NextRequest) {
  if (!shopEnabled) return NextResponse.next();

  const host = (req.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const { pathname, search } = req.nextUrl;

  if (host === SHOP_HOST) {
    // ストアに関係ないパスは本体サイトへ寄せる（本体ホストが分かっている場合のみ）
    const isStorePath =
      pathname === "/" || pathname === "/goods" || pathname.startsWith("/goods/");
    if (!isStorePath && SITE_HOST) {
      return NextResponse.redirect(`https://${SITE_HOST}${pathname}${search}`);
    }
    // ストア表示であることを下流（/goods）に伝え、トップは /goods を描画する
    const headers = new Headers(req.headers);
    headers.set("x-shop", "1");
    const url = req.nextUrl.clone();
    if (pathname === "/") url.pathname = "/goods";
    return NextResponse.rewrite(url, { request: { headers } });
  }

  // 本体ドメインで /goods を開いたら、正規のストアURL（サブドメイン）へ集約する
  if (pathname === "/goods" || pathname.startsWith("/goods/")) {
    const rest = pathname === "/goods" ? "/" : pathname;
    return NextResponse.redirect(`https://${SHOP_HOST}${rest}${search}`);
  }

  return NextResponse.next();
}

export const config = {
  // API・静的アセット・拡張子付きファイルは対象外（ドットを含むパスを除外）
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
