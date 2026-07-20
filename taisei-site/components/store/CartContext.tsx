"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Goods } from "@/lib/content";

// ストア全体で共有するカート。商品ページをまたいでも保持できるよう
// localStorage に永続化し、商品カタログ（goods）と突き合わせて明細を解決する。

export type CartLine = { id: string; variant?: string; qty: number };
export type ResolvedLine = {
  key: string;
  goods: Goods;
  variant?: string;
  qty: number;
  subtotal: number;
};

const STORAGE_KEY = "goods-cart-v1";
export const lineKey = (id: string, variant?: string) => `${id}__${variant ?? ""}`;

type CartValue = {
  items: ResolvedLine[];
  count: number;
  total: number;
  ready: boolean;
  add: (id: string, variant: string | undefined, qty: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartValue | null>(null);

export function CartProvider({
  goods,
  children,
}: {
  goods: Goods[];
  children: ReactNode;
}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  // 初回読み込み
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* 破損データは無視 */
    }
    setReady(true);
  }, []);

  // 変更を保存
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* 容量オーバー等は無視 */
    }
  }, [lines, ready]);

  const byId = useMemo(() => new Map(goods.map((g) => [g.id, g])), [goods]);
  const clamp = (g: Goods | undefined, qty: number) =>
    Math.max(0, Math.min(qty, g ? g.stock : qty));

  const add = (id: string, variant: string | undefined, qty: number) => {
    const g = byId.get(id);
    const k = lineKey(id, variant);
    setLines((prev) => {
      const found = prev.find((l) => lineKey(l.id, l.variant) === k);
      if (found) {
        return prev.map((l) =>
          lineKey(l.id, l.variant) === k ? { ...l, qty: clamp(g, l.qty + qty) } : l,
        );
      }
      return [...prev, { id, variant, qty: clamp(g, qty) }];
    });
  };

  const setQty = (key: string, qty: number) => {
    setLines((prev) =>
      prev.flatMap((l) => {
        if (lineKey(l.id, l.variant) !== key) return [l];
        const n = clamp(byId.get(l.id), qty);
        return n === 0 ? [] : [{ ...l, qty: n }];
      }),
    );
  };

  const remove = (key: string) =>
    setLines((prev) => prev.filter((l) => lineKey(l.id, l.variant) !== key));

  const clear = () => setLines([]);

  const items = useMemo<ResolvedLine[]>(
    () =>
      lines
        .map((l): ResolvedLine | null => {
          const g = byId.get(l.id);
          if (!g) return null;
          return {
            key: lineKey(l.id, l.variant),
            goods: g,
            variant: l.variant,
            qty: l.qty,
            subtotal: g.price * l.qty,
          };
        })
        .filter((x): x is ResolvedLine => x !== null),
    [lines, byId],
  );

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.subtotal, 0);

  return (
    <Ctx.Provider value={{ items, count, total, ready, add, setQty, remove, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart(): CartValue {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
