/**
 * Supabase 設定判定
 *
 * 環境変数が揃っている場合のみ Supabase を利用する。
 * 未設定（このリポジトリの既定＝仮値）の場合は Phase 1 のモック（localStorage）で動作する。
 * これにより「仮値のまま接続レディ」を実現し、`.env.local` を設定するだけで実接続へ切り替わる。
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** URL と anon key が両方設定されていれば Supabase モード */
export const isSupabaseConfigured =
  SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 0;
