import type { Metadata } from "next";
import CartCheckout from "@/components/store/CartCheckout";

export const metadata: Metadata = {
  title: "CART",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartCheckout />;
}
