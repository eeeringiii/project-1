"use client";

import { usePathname } from "next/navigation";
import SnsLinks from "@/components/SnsLinks";

// スマホでスクロール中も常にSNSへ1タップで届くようにする浮遊バー。
// PCは追従ヘッダーに常設済みのため、モバイル幅のみ表示する。
// スタッフ用ページ（/studio）はファン向け導線が不要なため出さない
export default function FloatingSns() {
  const pathname = usePathname();
  if (pathname.startsWith("/studio")) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-40 border border-line bg-paper/90 px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur md:hidden"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <SnsLinks size={20} gap="gap-5" location="floating-bar" />
    </div>
  );
}
