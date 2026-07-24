'use client';
import Link from 'next/link';
import { useDiagnosisStore } from '@/stores/diagnosis';

// 診断済みなら、端末内に保存されたタイプで運勢をパーソナライズする導線を出す。
// （サーバーには送らず、localStorage のタイプコードをリンクに使うだけ）
export function FortunePersonalize({ activeTypeCode }: { activeTypeCode?: string }) {
  const { result } = useDiagnosisStore();
  const stored = result?.typeCode;
  if (!stored) {
    return (
      <p className="note">
        <Link href="/diagnosis">診断</Link>すると、あなたの16タイプ別の運勢になります。
      </p>
    );
  }
  if (stored === activeTypeCode) {
    return <p className="note">あなたのタイプ「{stored}」で占っています。</p>;
  }
  return (
    <p><Link className="button ghost" href={`/fortune?type=${stored}`}>あなたのタイプ「{stored}」で占う →</Link></p>
  );
}
