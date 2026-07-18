import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="type-code text-sm text-violet">404</p>
      <h1 className="mt-3 font-display text-3xl font-bold">ページが見つかりません</h1>
      <p className="mt-4 max-w-md text-sm text-text-sub">
        お探しのページは存在しないか、URLが正しくない可能性があります。トップページから、もう一度お試しください。
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          トップへ戻る
        </Link>
        <Link href="/diagnosis" className="btn btn-ghost">
          診断をはじめる
        </Link>
      </div>
    </div>
  );
}
