'use client';

import { useSyncExternalStore } from 'react';

// origin はブラウザにしか存在しない。`typeof window === 'undefined' ? '' : location.origin`
// のようにレンダー中で出し分けると、サーバーは空文字・クライアントは実URLを返すため
// ハイドレーションがズレる（Reactが警告を出し、表示が一瞬入れ替わる）。
//
// useSyncExternalStore はサーバー用のスナップショットを別に渡せるので、
// SSRと初期描画では空文字、ハイドレーション後に実際の origin へ切り替わる。
// stores/diagnosis.ts が端末内の状態を読むのと同じ考え方。
const subscribe = () => () => {};
const getSnapshot = () => location.origin;
const getServerSnapshot = () => '';

/**
 * 共有URLの組み立て用に origin を返す。
 * サーバー側と初期描画では空文字なので、URLを使う前に空かどうかを見てください。
 */
export function useOrigin(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
