import type { Metadata } from "next";
import ShopShell from "@/components/ShopShell";
import GoodsShop from "@/components/GoodsShop";
import { getActiveGoods } from "@/lib/data";

export const metadata: Metadata = {
  title: "GOODS STORE",
  description:
    "アーティストオフィシャルグッズ。アパレル・音源・アクセサリーなどのオンライン販売。",
};

// グッズストアは本体サイトから切り離した独立ページ。
// 同一ドメインでも本体のグローバルナビは出さず、専用の骨格（ShopShell）で表示する。
// 独自ドメイン設定後は proxy が shop. サブドメインでこのページを配信する。
export default function GoodsPage() {
  return (
    <ShopShell>
      <GoodsShop goods={getActiveGoods()} />
    </ShopShell>
  );
}
