'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * サーバー描画では false、クライアントでは true を返す。
 * window / navigator を安全に触りたいときに使います（hydration差分を防ぐため）。
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
