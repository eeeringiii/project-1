import type { Metadata } from "next";
import { headers } from "next/headers";
import PageShell from "@/components/PageShell";
import ShopShell from "@/components/ShopShell";
import GoodsShop from "@/components/GoodsShop";
import { getActiveGoods } from "@/lib/data";
import { shopEnabled } from "@/lib/shop";

export const metadata: Metadata = {
  title: "GOODS",
  description:
    "福本大晴オフィシャルグッズ。アパレル・音源・アクセサリーなどのオンライン販売。",
};

export default async function GoodsPage() {
  // shop. サブドメイン運用時のみ、proxy が付与する x-shop ヘッダーを見てストア表示に切り替える。
  // 未運用時は headers() を呼ばず、従来どおり本体サイト内ページ（静的）として描画する。
  let isShop = false;
  if (shopEnabled) {
    isShop = (await headers()).get("x-shop") === "1";
  }

  const shop = <GoodsShop goods={getActiveGoods()} />;

  return isShop ? (
    <ShopShell>{shop}</ShopShell>
  ) : (
    <PageShell titleEn="GOODS" titleJp="オフィシャルグッズ">
      {shop}
    </PageShell>
  );
}
