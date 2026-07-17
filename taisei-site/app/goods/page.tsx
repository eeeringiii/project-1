import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import GoodsShop from "@/components/GoodsShop";
import { getActiveGoods } from "@/lib/data";

export const metadata: Metadata = {
  title: "GOODS",
  description:
    "福本大晴オフィシャルグッズ。アパレル・音源・アクセサリーなどのオンライン販売。",
};

export default function GoodsPage() {
  return (
    <PageShell titleEn="GOODS" titleJp="オフィシャルグッズ">
      <GoodsShop goods={getActiveGoods()} />
    </PageShell>
  );
}
