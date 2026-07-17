"use client";

import { useState } from "react";
import Link from "next/link";
import { formatYen, GOODS_CATEGORY_LABEL, type Goods } from "@/lib/content";
import { useCart } from "@/components/store/CartContext";

// 商品詳細の購入UI（クライアント）。写真・サイズ選択・数量・カート追加。
export default function ProductDetail({ goods }: { goods: Goods }) {
  const gallery = [goods.image, ...(goods.images ?? [])].filter(
    (s): s is string => Boolean(s),
  );
  const [mainImg, setMainImg] = useState(gallery[0] ?? "");
  const [variant, setVariant] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const { add } = useCart();

  const soldOut = goods.stock <= 0;
  const needVariant = (goods.variants?.length ?? 0) > 0;

  function handleAdd() {
    setError("");
    if (needVariant && !variant) {
      return setError(`${goods.variantLabel ?? "種類"}を選択してください`);
    }
    add(goods.id, needVariant ? variant : undefined, qty);
    setAdded(true);
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-12">
      {/* 写真 */}
      <div>
        <div className="relative aspect-square overflow-hidden border border-line bg-paper-soft">
          {mainImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mainImg} alt={goods.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-display text-[0.7rem] tracking-[0.3em] text-muted">
                NO IMAGE
              </span>
            </div>
          )}
          {soldOut && !goods.externalUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-paper/70">
              <span className="border border-ink px-5 py-2 text-[0.72rem] tracking-[0.3em]">
                SOLD OUT
              </span>
            </div>
          )}
        </div>
        {gallery.length > 1 && (
          <div className="mt-3 flex gap-2">
            {gallery.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setMainImg(src)}
                className={`h-16 w-16 overflow-hidden border ${
                  mainImg === src ? "border-gold" : "border-line"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 情報・購入 */}
      <div>
        <p className="mb-2 text-[0.62rem] tracking-[0.28em] text-gold">
          {GOODS_CATEGORY_LABEL[goods.category]}
        </p>
        <h1 className="text-xl leading-snug md:text-2xl">{goods.name}</h1>
        <p className="mt-4 font-display text-2xl tracking-wide">{formatYen(goods.price)}</p>
        <p className="mt-1 text-[0.7rem] text-muted">税込</p>

        <div className="mt-6 whitespace-pre-line border-y border-line-soft py-6 text-[0.9rem] leading-loose text-sub">
          {goods.description}
        </div>

        {/* 外部ショップ商品 */}
        {goods.externalUrl ? (
          <a
            href={goods.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block border border-ink px-6 py-4 text-center text-[0.8rem] tracking-[0.25em] transition-colors hover:bg-ink hover:text-paper"
          >
            外部ショップで購入する ↗
          </a>
        ) : soldOut ? (
          <p className="mt-6 border border-line bg-paper-soft px-4 py-4 text-center text-sm text-muted">
            申し訳ありません。ただいま完売しています。
          </p>
        ) : added ? (
          <div className="mt-6 border border-gold-soft bg-paper-soft p-5">
            <p className="text-sm text-gold">カートに追加しました。</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/goods/cart"
                className="flex-1 border border-ink bg-ink px-5 py-3 text-center text-[0.78rem] tracking-[0.2em] text-paper transition-opacity hover:opacity-80"
              >
                カートを見る・購入手続き
              </Link>
              <Link
                href="/goods"
                className="flex-1 border border-line px-5 py-3 text-center text-[0.78rem] tracking-[0.2em] text-sub transition-colors hover:border-gold hover:text-gold"
                onClick={() => setAdded(false)}
              >
                買い物を続ける
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {/* バリエーション */}
            {needVariant && (
              <div>
                <label className="mb-2 block text-[0.78rem] tracking-[0.08em]">
                  {goods.variantLabel ?? "種類"}を選択
                </label>
                <div className="flex flex-wrap gap-2">
                  {goods.variants!.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVariant(v)}
                      className={`min-w-12 border px-4 py-2 text-sm transition-colors ${
                        variant === v
                          ? "border-ink bg-ink text-paper"
                          : "border-line hover:border-gold"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 数量 */}
            <div>
              <label className="mb-2 block text-[0.78rem] tracking-[0.08em]">数量</label>
              <div className="inline-flex items-center border border-line">
                <button
                  type="button"
                  aria-label="数量を減らす"
                  className="px-4 py-2 text-sub hover:text-gold disabled:opacity-30"
                  disabled={qty <= 1}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="min-w-10 text-center text-sm tabular-nums">{qty}</span>
                <button
                  type="button"
                  aria-label="数量を増やす"
                  className="px-4 py-2 text-sub hover:text-gold disabled:opacity-30"
                  disabled={qty >= goods.stock}
                  onClick={() => setQty((q) => Math.min(goods.stock, q + 1))}
                >
                  ＋
                </button>
              </div>
              {goods.stock <= 5 && (
                <span className="ml-3 text-[0.72rem] text-gold">残り{goods.stock}点</span>
              )}
            </div>

            {error && <p className="text-sm text-red-700">{error}</p>}

            <button
              type="button"
              onClick={handleAdd}
              className="w-full border border-ink bg-ink px-6 py-4 text-[0.82rem] tracking-[0.25em] text-paper transition-opacity hover:opacity-80"
            >
              カートに入れる
            </button>
            <p className="text-[0.72rem] leading-relaxed text-muted">
              ご購入手続きの時点で決済は発生しません。ご注文後にお支払い方法（銀行振込）と
              送料・お届け予定をメールでご案内します。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
