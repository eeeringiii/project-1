import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Supabase セッションの更新とルート保護。
 * 未設定時は素通り（Phase 1 のクライアント側ガードが有効）。
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // 静的アセットとファビコン以外を対象
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
