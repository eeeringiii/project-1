'use client';

import { useState } from 'react';
import { getTypeTheme } from '@/lib/theme';
import { OshicoaType } from '@/types';

/** キャラクター画像の置き場所。public/characters/ に タイプコード小文字.png を置けば自動で表示されます。 */
export const characterImagePath = (code: string) => `/characters/${code.toLowerCase()}.png`;

/** 一度読み込めた画像を覚えておき、再表示のたびにフェードし直すのを防ぐ */
const loadedOnce = new Set<string>();

/** 次に出るキャラを裏で読み込んでおく（設問画面の切り替え用） */
export function prefetchCharacter(code: string) {
  if (typeof window === 'undefined') return;
  const src = characterImagePath(code);
  if (loadedOnce.has(src)) return;
  const image = new Image();
  image.onload = () => loadedOnce.add(src);
  image.src = src;
}

interface Props {
  type: OshicoaType;
  /** 大きさ・形を決めるクラス（例: .questionCharacter / .typeThumb） */
  className?: string;
  /** 一覧など画面外に大量に並ぶ場所では 'lazy' を指定する */
  loading?: 'eager' | 'lazy';
  /** すぐ隣にタイプ名がある場合は '' を渡して読み上げの重複を避ける */
  alt?: string;
}

/**
 * タイプのキャラクター画像。
 * 画像が未配置（読み込み失敗）のときは、そのタイプのマーク（絵文字）だけが残ります。
 */
export function TypeCharacter({ type, className = '', loading = 'eager', alt }: Props) {
  const src = characterImagePath(type.code);
  const theme = getTypeTheme(type.code);
  const [loaded, setLoaded] = useState(() => loadedOnce.has(src));
  const [failed, setFailed] = useState(false);

  const succeed = () => { loadedOnce.add(src); setLoaded(true); };

  /**
   * SSRされた <img> はハイドレーション前に読み込みが終わることがあり、
   * その場合 onLoad / onError は発火しない。ref がついた時点の状態も見て取りこぼしを防ぐ。
   */
  const checkOnMount = (node: HTMLImageElement | null) => {
    if (!node || !node.complete) return;
    if (node.naturalWidth === 0) setFailed(true);
    else succeed();
  };

  return (
    <div
      className={`charFigure ${failed ? 'isEmpty' : ''} ${className}`.trim()}
      style={{ ['--chip' as string]: theme.chip }}
    >
      <span className="characterMark" aria-hidden>{theme.mark}</span>
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={checkOnMount}
          src={src}
          alt={alt ?? `${type.name}のキャラクター`}
          loading={loading}
          className={loaded ? 'isLoaded' : ''}
          onLoad={succeed}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
