"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // 本番のログ基盤があればここで送信する。デバッグログは残さない。
  }, []);

  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="type-code text-sm text-magenta">ERROR</p>
      <h1 className="mt-3 font-display text-3xl font-bold">問題が発生しました</h1>
      <p className="mt-4 max-w-md text-sm text-text-sub">
        一時的なエラーが発生しました。もう一度お試しいただくか、トップページへお戻りください。
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          もう一度試す
        </button>
        <Link href="/" className="btn btn-ghost">
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}
