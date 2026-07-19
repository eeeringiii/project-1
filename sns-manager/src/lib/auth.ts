"use client";

/**
 * 認証（Supabase Auth ＋ モックのハイブリッド）
 *
 * Supabase が設定されていれば Supabase Auth を使用し、
 * 未設定（仮値のまま）の場合は Phase 1 のモック認証（localStorage）で動作する。
 * 画面側はこのモジュールの async 関数のみ参照する。
 */
import { isSupabaseConfigured } from "./supabase/config";
import { getBrowserClient } from "./supabase/client";

const AUTH_KEY = "sns-manager-auth-v1";

export interface Session {
  email: string;
  loggedInAt: string;
}

// ---- モック（localStorage） ----

function getMockSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function setMockSession(email: string): Session {
  const session: Session = { email, loggedInAt: new Date().toISOString() };
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return session;
}

// ---- 公開API（async） ----

/** ログイン中かどうか */
export async function hasSession(): Promise<boolean> {
  if (isSupabaseConfigured) {
    const {
      data: { user },
    } = await getBrowserClient().auth.getUser();
    return Boolean(user);
  }
  return getMockSession() !== null;
}

/** メール＋パスワードでログイン。成功時 true、失敗時はエラーメッセージ */
export async function signIn(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (isSupabaseConfigured) {
    const { error } = await getBrowserClient().auth.signInWithPassword({
      email,
      password,
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  }
  // モック: 形式チェックのみ
  if (!email.includes("@")) return { ok: false, error: "メールアドレスの形式が正しくありません。" };
  if (password.length < 4) return { ok: false, error: "パスワードは4文字以上で入力してください。" };
  setMockSession(email);
  return { ok: true };
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured) {
    await getBrowserClient().auth.signOut();
    return;
  }
  localStorage.removeItem(AUTH_KEY);
}
