import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// /office 配下の簡易アクセス保護（チーム限定公開用）。
// 環境変数 OFFICE_PASSWORD を設定したときだけ有効になる。
// 未設定（ローカル開発など）では素通しなので、Vercel側でのみ設定する運用。
export function proxy(request: NextRequest) {
  const password = process.env.OFFICE_PASSWORD;
  if (!password) return NextResponse.next();

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
    // 形式は user:pass。ユーザー名は任意（team等）、パスワードのみ照合する。
    const pass = decoded.slice(decoded.indexOf(":") + 1);
    if (pass === password) return NextResponse.next();
  }

  return new NextResponse("認証が必要です", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="AI OFFICE", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: "/office/:path*",
};
