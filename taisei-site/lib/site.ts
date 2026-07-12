// サイトの公開URL。独自ドメイン接続時は Vercel の環境変数 NEXT_PUBLIC_SITE_URL を差し替えるだけでよい
export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://project-1-zeta-sooty.vercel.app";
