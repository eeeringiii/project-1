"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Disc3, Mail, Lock } from "lucide-react";
import { Button, Field, Input } from "@/components/ui/primitives";
import { getSession, signIn } from "@/lib/auth";
import { APP_NAME } from "@/constants";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("manager@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getSession()) router.replace("/dashboard");
  }, [router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) {
      setError("メールアドレスの形式が正しくありません。");
      return;
    }
    if (password.length < 4) {
      setError("パスワードは4文字以上で入力してください。");
      return;
    }
    signIn(email);
    toast.show("ログインしました", "success");
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--accent-fg)]">
            <Disc3 size={24} />
          </span>
          <h1 className="text-lg font-semibold tracking-tight">{APP_NAME}</h1>
          <p className="text-xs text-[var(--muted)]">
            アーティスト事務所向け SNS統合運用（MVP）
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
        >
          <Field label="メールアドレス" required>
            <div className="relative">
              <Mail
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                autoComplete="email"
              />
            </div>
          </Field>

          <Field label="パスワード" required>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                autoComplete="current-password"
              />
            </div>
          </Field>

          {error && (
            <p className="rounded-lg bg-[var(--danger-bg)] px-3 py-2 text-xs text-[var(--danger)]">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full">
            ログイン
          </Button>

          <p className="text-center text-[11px] leading-relaxed text-[var(--muted)]">
            ※ 現在はモック認証です。任意のメール／パスワード（4文字以上）でログインできます。
            <br />
            Phase 2 で Supabase Auth に差し替えます。
          </p>
        </form>
      </div>
    </div>
  );
}
