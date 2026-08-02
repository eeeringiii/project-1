'use client';

import { useEffect, useState } from 'react';
import { useIsClient } from '@/app/hooks/useIsClient';
import { getType } from '@/data/types';
import { SHARE_TITLE, createShareText, createShareUrl } from '@/lib/compatibility/createShareText';
import { CompatibilityResult } from '@/lib/compatibility/types';

/**
 * 結果の共有。推し名などの自由入力値は一切扱いません（URLにもシェア文にも含めない）。
 */
export function CompatibilityShare({
  result,
  onShare,
  onCopy,
}: {
  result: CompatibilityResult;
  onShare: (method: string) => void;
  onCopy: () => void;
}) {
  const isClient = useIsClient();
  const [message, setMessage] = useState('');

  // SSR時は window / navigator を触らない（hydration差分を防ぐ）
  const origin = isClient ? window.location.origin : '';
  const canNativeShare = isClient && typeof navigator.share === 'function';

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(''), 2600);
    return () => window.clearTimeout(timer);
  }, [message]);

  const shareUrl = createShareUrl(origin, result);
  const partnerTypeName = getType(result.secondType)?.name ?? result.secondType;
  const shareText = createShareText({ result, partnerTypeName, url: shareUrl });
  const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  const nativeShare = async () => {
    try {
      await navigator.share({ title: SHARE_TITLE, text: shareText, url: shareUrl });
      onShare('web_share');
    } catch {
      // ユーザーがキャンセルした場合もここに来るため、エラー表示はしない
    }
  };

  const copy = async () => {
    try {
      if (!navigator.clipboard) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(shareUrl);
      setMessage('結果URLをコピーしました');
      onCopy();
    } catch {
      // Clipboard APIが使えない環境向けのフォールバック
      window.prompt('このURLをコピーしてください', shareUrl);
    }
  };

  return (
    <div className="compatShare">
      <div className="shareRow">
        {canNativeShare && (
          <button type="button" className="button" onClick={nativeShare}>
            この結果をシェア
          </button>
        )}
        <a
          className={canNativeShare ? 'button ghost' : 'button'}
          href={xUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => onShare('x')}
        >
          Xでシェア
        </a>
        <button type="button" className="button ghost" onClick={copy}>
          結果URLをコピー
        </button>
      </div>
      <p className="compatShareMessage" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
