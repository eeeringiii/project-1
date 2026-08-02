'use client';

import { useState } from 'react';
import { getTypeTheme } from '@/lib/theme';
import { TypeCode } from '@/types';

/**
 * タイプのキャラクター画像（public/characters/コード.png）。
 * 画像が未配置・読み込み失敗のときは、lib/theme.ts のマーク絵文字に自動で切り替わります。
 */
export function TypeAvatar({
  code,
  size = 'md',
}: {
  code: TypeCode;
  size?: 'sm' | 'md' | 'lg';
}) {
  // 「どの画像が失敗したか」を持つことで、コードが変わったら自動的に再挑戦します
  const [failedSource, setFailedSource] = useState<string>();
  const theme = getTypeTheme(code);
  const source = `/characters/${code.toLowerCase()}.png`;
  const failed = failedSource === source;

  return (
    <span className={`compatAvatar ${size}`} style={{ ['--chip' as string]: theme.chip }} aria-hidden>
      {failed ? (
        <span className="compatAvatarMark">{theme.mark}</span>
      ) : (
        // 既存の結果ページと同じく、素の img で軽量に扱います
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={source}
          alt=""
          width={240}
          height={300}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSource(source)}
          ref={node => {
            // hydrationより前に読み込みが失敗した画像は onError が届かないので、
            // マウント時の状態も見てフォールバックへ切り替える
            if (node && node.complete && node.naturalWidth === 0) setFailedSource(source);
          }}
        />
      )}
    </span>
  );
}
