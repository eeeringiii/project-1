"use client";

/**
 * モック認証（Phase 1）
 *
 * Supabase Auth へ差し替えやすいよう、認証状態の読み書きを本モジュールに集約する。
 * Phase 2 では signIn/signOut/getSession を Supabase クライアント呼び出しに置き換える。
 */
const AUTH_KEY = "sns-manager-auth-v1";

export interface Session {
  email: string;
  loggedInAt: string;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function signIn(email: string): Session {
  const session: Session = { email, loggedInAt: new Date().toISOString() };
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return session;
}

export function signOut(): void {
  localStorage.removeItem(AUTH_KEY);
}
