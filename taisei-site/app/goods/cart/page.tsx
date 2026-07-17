import type { Metadata } from "next";
import CartCheckout from "@/components/store/CartCheckout";
import { getShopConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "CART",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartCheckout shop={getShopConfig()} />;
}
