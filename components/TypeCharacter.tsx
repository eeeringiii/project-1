'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { getTypeTheme } from '@/lib/theme';
import { OshicoaType } from '@/types';

/** キャラクター画像の置き場所。public/characters/ に タイプコード小文字.png を置けば自動で表示されます。 */
export const characterImagePath = (code: string) => `/characters/${code.toLowerCase()}.png`;

/**
 * 読み込みに成功した画像を覚えておく小さなストア。
 * 質問を進めるたびに代替マークへ戻ってちらつくのを防ぎ、同じ画像を何度も取りに行かないようにします。
 */
const availableImages = new Set<string>();
const requested = new Set<string>();
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

/** 画像を読み込む。存在しなければ何も起きず、代替マーク表示のままになる。 */
export function prefetchCharacter(src: string) {
  if (typeof window === 'undefined' || requested.has(src)) return;
  requested.add(src);
  const image = new Image();
  image.onload = () => {
    availableImages.add(src);
    listeners.forEach(listener => listener());
  };
  image.src = src;
}

/** public/characters/ に画像が置かれているかを返す。未配置なら false のまま。 */
export function useCharacterImage(src: string) {
  useEffect(() => { prefetchCharacter(src); }, [src]);
  return useSyncExternalStore(subscribe, () => availableImages.has(src), () => false);
}

/**
 * タイプのキャラクター画像。画像が未配置のあいだは、そのタイプのマーク（絵文字）を表示します。
 * サイズや形は className 側（例: .questionCharacter）で指定してください。
 */
export function TypeCharacter({ type, className = '' }: { type: OshicoaType; className?: string }) {
  const src = characterImagePath(type.code);
  const ready = useCharacterImage(src);
  const theme = getTypeTheme(type.code);

  return (
    <div
      className={`charFigure ${ready ? '' : 'isEmpty'} ${className}`.trim()}
      style={{ ['--chip' as string]: theme.chip }}
    >
      {ready
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={src} alt={`${type.name}のキャラクター`} />
        : <span className="characterMark" aria-hidden>{theme.mark}</span>}
    </div>
  );
}
