import "server-only";

/**
 * サーバー用 Supabase クライアント
 * Server Component / Route Handler / Server Action から使用する。
 * 機密キー（service role）はここでのみ扱い、クライアントへ露出させない。
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

export async function getServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component からの set は無視（middleware がセッションを更新する）
        }
      },
    },
  });
}

/**
 * service role を用いた管理用クライアント（サーバー専用・厳重取扱い）。
 * 予約投稿ジョブ等、RLSを跨ぐ処理でのみ使用する。
 */
export function getServiceRoleClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL.startsWith("http") || !serviceKey) return null;
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
