'use client';

import Link from 'next/link';
import { useDiagnosisStore } from '@/stores/diagnosis';

/**
 * 診断済みなら、端末内に保存されたタイプで運勢をパーソナライズする導線を出す。
 * サーバーには何も送らず、localStorage のタイプコードをリンクに使うだけ。
 */
export function FortunePersonalize({ activeTypeCode }: { activeTypeCode?: string }) {
  const { result } = useDiagnosisStore();
  const stored = result?.typeCode;

  // 未診断。?type= が付いていれば「そのタイプで占っている」状態なので、案内を出し分ける。
  if (!stored) {
    return (
      <p className="fortuneHint">
        {activeTypeCode
          ? <><Link href="/diagnosis">診断</Link>すると、あなた自身のタイプで占えます。</>
          : <><Link href="/diagnosis">診断</Link>すると、あなたの16タイプ別の運勢になります。</>}
      </p>
    );
  }
  if (stored === activeTypeCode) {
    return <p className="fortuneHint">あなたのタイプ「{stored}」で占っています。</p>;
  }
  return (
    <p style={{ margin: '12px 0 0' }}>
      <Link className="button ghost" href={`/fortune?type=${stored}`}>あなたのタイプ「{stored}」で占う →</Link>
    </p>
  );
}
