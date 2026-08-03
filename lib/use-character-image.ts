'use client';

import { useEffect, useState } from 'react';

// public/characters/{コード}.png が配置済みかを確認する。
// 未配置なら false を返すので、呼び出し側は代替表示に切り替えること。
// 画像を置けば、コードを変えなくても自動で表示に切り替わります。
export function useCharacterImage(src: string) {
  const [loaded, setLoaded] = useState<string>();
  useEffect(() => {
    let alive = true;
    const image = new Image();
    image.onload = () => { if (alive) setLoaded(src) };
    image.src = src;
    return () => { alive = false };
  }, [src]);
  return loaded === src;
}
