"use client";

import { useState } from "react";
import Link from "next/link";
import { calcShipping, formatYen, type ShopConfig } from "@/lib/content";
import { useCart } from "@/components/store/CartContext";

const fieldCls =
  "w-full border border-line bg-paper px-4 py-3 text-[0.95rem] focus:border-gold focus:outline-none";
const labelCls = "mb-1.5 block text-[0.8rem] tracking-[0.08em] text-ink";

export default function CartCheckout({ shop }: { shop: ShopConfig }) {
  const { items, total: subtotal, count, setQty, remove, clear, ready } = useCart();
  const shipping = calcShipping(shop, subtotal);
  const grandTotal = subtotal + shipping;
  const remainingForFree =
    shop.shippingFee > 0 && shop.freeShippingOver > 0 && subtotal < shop.freeShippingOver
      ? shop.freeShippingOver - subtotal
      : 0;
  const [customer, setCustomer] = useState({
    name: "",
    kana: "",
    email: "",
    phone: "",
    postal: "",
    address: "",
  });
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [company, setCompany] = useState(""); // ハニーポット
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  const set = (k: keyof typeof customer) => (v: string) =>
    setCustomer((c) => ({ ...c, [k]: v }));

  async function submit() {
    setError("");
    if (items.length === 0) return setError("カートに商品がありません");
    if (!customer.name.trim()) return setError("お名前を入力してください");
    if (!customer.kana.trim()) return setError("フリガナを入力してください");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))
      return setError("メールアドレスの形式をご確認ください");
    if (!customer.phone.trim()) return setError("電話番号を入力してください");
    if (!/^\d{3}-?\d{4}$/.test(customer.postal.trim()))
      return setError("郵便番号は7桁（例: 100-0001）で入力してください");
    if (!customer.address.trim()) return setError("ご住所を入力してください");
    if (!agree) return setError("お取り扱いについてのご同意が必要です");

    setSending(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { ...customer, postal: customer.postal.trim() },
          items: items.map((i) => ({ id: i.goods.id, qty: i.qty, variant: i.variant })),
          note,
          company,
        }),
      });
      const json = await res.json();
      setSending(false);
      if (!res.ok) return setError(json.error ?? "注文の送信に失敗しました");
      setOrderId(json.orderId ?? "受付完了");
      clear();
    } catch {
      setSending(false);
      setError("通信に失敗しました。電波状況をご確認ください");
    }
  }

  // 注文完了
  if (orderId) {
    return (
      <div className="mx-auto max-w-xl border border-gold-soft bg-paper-soft px-6 py-12 text-center">
        <p className="mb-2 text-[0.68rem] tracking-[0.3em] text-gold">THANK YOU</p>
        <h1 className="mb-4 font-display text-xl tracking-[0.15em]">ご注文を受け付けました</h1>
        <p className="text-sm leading-loose text-sub">
          注文番号
          <span className="mx-2 font-display tracking-widest text-ink">{orderId}</span>
          <br />
          ご登録のメールアドレス宛に、お支払い・発送のご案内をお送りします。
          <br />
          しばらく経っても届かない場合は、お手数ですがお問い合わせください。
        </p>
        <Link
          href="/goods"
          className="mt-8 inline-block border border-ink px-6 py-3 text-[0.78rem] tracking-[0.22em] transition-colors hover:bg-ink hover:text-paper"
        >
          ストアトップへ戻る
        </Link>
      </div>
    );
  }

  if (ready && items.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <h1 className="font-display text-2xl tracking-[0.2em]">CART</h1>
        <p className="mt-6 border border-line bg-paper-soft px-4 py-8 text-sm text-muted">
          カートは空です。
        </p>
        <Link
          href="/goods"
          className="mt-6 inline-block border border-ink px-6 py-3 text-[0.78rem] tracking-[0.22em] transition-colors hover:bg-ink hover:text-paper"
        >
          商品を見る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-display text-2xl tracking-[0.2em]">CART</h1>
        <p className="mt-1 text-[0.68rem] tracking-[0.2em] text-gold">
          カート（{count}点）
        </p>
      </div>

      {/* カート明細 */}
      <div className="border border-line">
        <ul className="divide-y divide-line-soft">
          {items.map((i) => (
            <li key={i.key} className="flex items-center gap-4 p-4">
              <Link
                href={`/goods/${i.goods.id}`}
                className="h-20 w-20 shrink-0 overflow-hidden border border-line bg-paper-soft"
              >
                {i.goods.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.goods.image} alt={i.goods.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[0.55rem] tracking-widest text-muted">
                    NO IMAGE
                  </span>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/goods/${i.goods.id}`} className="text-[0.92rem] hover:text-gold">
                  {i.goods.name}
                </Link>
                {i.variant && (
                  <p className="text-[0.72rem] text-muted">
                    {i.goods.variantLabel ?? "種類"}：{i.variant}
                  </p>
                )}
                <p className="text-[0.75rem] text-muted">{formatYen(i.goods.price)}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center border border-line">
                    <button
                      type="button"
                      aria-label="数量を減らす"
                      className="px-3 py-1 text-sub hover:text-gold"
                      onClick={() => setQty(i.key, i.qty - 1)}
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm tabular-nums">{i.qty}</span>
                    <button
                      type="button"
                      aria-label="数量を増やす"
                      className="px-3 py-1 text-sub hover:text-gold disabled:opacity-30"
                      disabled={i.qty >= i.goods.stock}
                      onClick={() => setQty(i.key, i.qty + 1)}
                    >
                      ＋
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-[0.7rem] text-muted underline hover:text-red-600"
                    onClick={() => remove(i.key)}
                  >
                    削除
                  </button>
                </div>
              </div>
              <span className="w-20 shrink-0 text-right text-[0.9rem] tabular-nums">
                {formatYen(i.subtotal)}
              </span>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-t border-line px-4 py-4 text-sm">
          <div className="flex items-baseline justify-between text-sub">
            <span>商品小計（税込）</span>
            <span className="tabular-nums">{formatYen(subtotal)}</span>
          </div>
          <div className="flex items-baseline justify-between text-sub">
            <span>送料</span>
            <span className="tabular-nums">
              {shop.shippingFee <= 0
                ? "無料"
                : shipping === 0
                  ? "無料"
                  : formatYen(shipping)}
            </span>
          </div>
          {remainingForFree > 0 && (
            <p className="border border-gold-soft bg-paper-soft px-3 py-2 text-[0.78rem] text-gold">
              あと {formatYen(remainingForFree)} のお買い上げで送料無料です
            </p>
          )}
          <div className="flex items-baseline justify-between border-t border-line-soft pt-3">
            <span className="text-[0.75rem] tracking-[0.2em] text-sub">お支払い合計</span>
            <span className="font-display text-xl tracking-wide">{formatYen(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* お客様情報 */}
      <div>
        <h2 className="mb-5 font-display text-lg tracking-[0.2em]">お届け先・ご連絡先</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="c-name">お名前</label>
            <input id="c-name" className={fieldCls} maxLength={60} value={customer.name} onChange={(e) => set("name")(e.target.value)} />
          </div>
          <div>
            <label className={labelCls} htmlFor="c-kana">フリガナ</label>
            <input id="c-kana" className={fieldCls} maxLength={60} value={customer.kana} onChange={(e) => set("kana")(e.target.value)} />
          </div>
          <div>
            <label className={labelCls} htmlFor="c-email">メールアドレス</label>
            <input id="c-email" type="email" inputMode="email" className={fieldCls} maxLength={120} value={customer.email} onChange={(e) => set("email")(e.target.value)} />
          </div>
          <div>
            <label className={labelCls} htmlFor="c-phone">電話番号</label>
            <input id="c-phone" type="tel" inputMode="tel" className={fieldCls} maxLength={20} value={customer.phone} onChange={(e) => set("phone")(e.target.value)} />
          </div>
          <div>
            <label className={labelCls} htmlFor="c-postal">郵便番号</label>
            <input id="c-postal" inputMode="numeric" className={fieldCls} placeholder="100-0001" maxLength={8} value={customer.postal} onChange={(e) => set("postal")(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls} htmlFor="c-address">ご住所（都道府県から）</label>
            <input id="c-address" className={fieldCls} maxLength={200} value={customer.address} onChange={(e) => set("address")(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls} htmlFor="c-note">ご要望・備考（任意）</label>
            <textarea id="c-note" className={`${fieldCls} min-h-24`} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        {/* ハニーポット */}
        <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label>
            会社名
            <input tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
          </label>
        </div>

        <label className="mt-6 flex items-start gap-3 text-[0.82rem] leading-relaxed text-sub">
          <input type="checkbox" className="mt-1 accent-gold" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>
            ご注文後にお支払い（銀行振込）と発送のご案内をメールでお送りすること、
            およびご入力の個人情報を発送・ご連絡の目的で利用することに同意します。
          </span>
        </label>

        {error && (
          <p className="mt-5 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={sending}
          className="mt-6 w-full border border-ink bg-ink px-6 py-4 text-[0.85rem] tracking-[0.3em] text-paper transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {sending ? "送信中…" : `この内容で注文する（${formatYen(grandTotal)}）`}
        </button>
        <p className="mt-2 text-[0.72rem] leading-relaxed text-muted">
          送信の時点では決済は発生しません。折り返しお支払い方法をご案内します。
        </p>
      </div>
    </div>
  );
}
