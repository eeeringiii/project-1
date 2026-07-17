"use client";

import { useMemo, useState } from "react";
import { GOODS_CATEGORY_LABEL, type Goods } from "@/lib/content";

// グッズ販売の公開UI。左に商品一覧、選択するとカートに入り、
// 下部の注文フォームから注文を送信する（/api/order）。決済は行わず、
// 注文後に振込先などのご案内をメールでお送りする運用を想定。

const yen = (n: number) => `¥${new Intl.NumberFormat("ja-JP").format(n)}`;

const fieldCls =
  "w-full border border-line bg-paper px-4 py-3 text-[0.95rem] focus:border-gold focus:outline-none";
const labelCls = "mb-1.5 block text-[0.8rem] tracking-[0.08em] text-ink";
const hintCls = "mt-1 block text-[0.72rem] leading-relaxed text-muted";

type CartLine = { id: string; qty: number };

export default function GoodsShop({ goods }: { goods: Goods[] }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const byId = useMemo(() => new Map(goods.map((g) => [g.id, g])), [goods]);

  const lines = useMemo(
    () =>
      cart
        .map((l) => {
          const g = byId.get(l.id);
          return g ? { g, qty: l.qty } : null;
        })
        .filter((x): x is { g: Goods; qty: number } => x !== null),
    [cart, byId],
  );
  const total = lines.reduce((sum, l) => sum + l.g.price * l.qty, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);

  function addToCart(g: Goods) {
    setCart((prev) => {
      const found = prev.find((l) => l.id === g.id);
      if (found) {
        if (found.qty >= g.stock) return prev; // 在庫上限
        return prev.map((l) => (l.id === g.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { id: g.id, qty: 1 }];
    });
  }

  function setQty(id: string, qty: number) {
    const g = byId.get(id);
    const capped = Math.max(0, Math.min(qty, g ? g.stock : qty));
    setCart((prev) =>
      capped === 0
        ? prev.filter((l) => l.id !== id)
        : prev.map((l) => (l.id === id ? { ...l, qty: capped } : l)),
    );
  }

  if (goods.length === 0) {
    return (
      <p className="border border-line bg-paper-soft px-4 py-6 text-sm text-muted">
        ただいま販売中のグッズはありません。次回入荷までお待ちください。
      </p>
    );
  }

  return (
    <div className="space-y-14">
      <p className="max-w-2xl text-sm leading-loose text-sub">
        オフィシャルグッズのオンライン販売ページです。ご希望の商品を「カートに追加」し、
        ページ下部のフォームからお申し込みください。ご注文後、お支払い方法（銀行振込）や
        発送のご案内をメールでお送りします。
      </p>

      {/* 商品一覧 */}
      <section className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {goods.map((g) => {
          const inCart = cart.find((l) => l.id === g.id)?.qty ?? 0;
          const soldOut = g.stock <= 0;
          const low = !soldOut && g.stock <= 5;
          return (
            <article key={g.id} className="flex flex-col">
              <div className="relative mb-4 aspect-[4/5] overflow-hidden border border-line bg-paper-soft">
                {g.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.image}
                    alt={g.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-display text-[0.7rem] tracking-[0.3em] text-muted">
                      NO IMAGE
                    </span>
                  </div>
                )}
                {soldOut && (
                  <div className="absolute inset-0 flex items-center justify-center bg-paper/70">
                    <span className="border border-ink px-4 py-1.5 text-[0.7rem] tracking-[0.3em] text-ink">
                      SOLD OUT
                    </span>
                  </div>
                )}
              </div>
              <p className="mb-1 text-[0.62rem] tracking-[0.28em] text-gold">
                {GOODS_CATEGORY_LABEL[g.category]}
              </p>
              <h2 className="mb-2 text-[1.02rem] leading-snug">{g.name}</h2>
              <p className="mb-3 whitespace-pre-line text-[0.82rem] leading-relaxed text-sub">
                {g.description}
              </p>
              <div className="mt-auto">
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="font-display text-lg tracking-wide">{yen(g.price)}</span>
                  {low && (
                    <span className="text-[0.68rem] tracking-[0.1em] text-gold">
                      残りわずか
                    </span>
                  )}
                </div>
                {g.externalUrl ? (
                  <a
                    href={g.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-ink px-4 py-3 text-center text-[0.75rem] tracking-[0.25em] transition-colors hover:bg-ink hover:text-paper"
                  >
                    外部ショップで購入
                  </a>
                ) : soldOut ? (
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed border border-line px-4 py-3 text-[0.75rem] tracking-[0.25em] text-muted"
                  >
                    完売しました
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => addToCart(g)}
                    disabled={inCart >= g.stock}
                    className="w-full border border-ink bg-ink px-4 py-3 text-[0.75rem] tracking-[0.25em] text-paper transition-opacity hover:opacity-80 disabled:opacity-40"
                  >
                    {inCart > 0 ? `カートに追加済み（${inCart}）` : "カートに追加"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {/* カート＋注文フォーム */}
      <OrderSection lines={lines} total={total} itemCount={itemCount} setQty={setQty} />
    </div>
  );
}

// ---- カート表示と注文フォーム ----

function OrderSection({
  lines,
  total,
  itemCount,
  setQty,
}: {
  lines: { g: Goods; qty: number }[];
  total: number;
  itemCount: number;
  setQty: (id: string, qty: number) => void;
}) {
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
  const [company, setCompany] = useState(""); // ハニーポット（人間には見えない）
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  const set = (k: keyof typeof customer) => (v: string) =>
    setCustomer((c) => ({ ...c, [k]: v }));

  async function submit() {
    setError("");
    if (lines.length === 0) return setError("カートに商品がありません");
    if (!customer.name.trim()) return setError("お名前を入力してください");
    if (!customer.kana.trim()) return setError("フリガナを入力してください");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))
      return setError("メールアドレスの形式をご確認ください");
    if (!customer.phone.trim()) return setError("電話番号を入力してください");
    if (!/^\d{3}-?\d{4}$/.test(customer.postal.trim()))
      return setError("郵便番号は7桁（例: 100-0001）で入力してください");
    if (!customer.address.trim()) return setError("住所を入力してください");
    if (!agree) return setError("お取り扱いについてのご同意が必要です");

    setSending(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            ...customer,
            postal: customer.postal.trim(),
          },
          items: lines.map((l) => ({ id: l.g.id, qty: l.qty })),
          note,
          company, // ハニーポット
        }),
      });
      const json = await res.json();
      setSending(false);
      if (!res.ok) return setError(json.error ?? "注文の送信に失敗しました");
      setOrderId(json.orderId ?? "受付完了");
    } catch {
      setSending(false);
      setError("通信に失敗しました。電波状況をご確認ください");
    }
  }

  if (orderId) {
    return (
      <section className="border border-gold-soft bg-paper-soft px-6 py-10 text-center">
        <p className="mb-2 text-[0.68rem] tracking-[0.3em] text-gold">THANK YOU</p>
        <h2 className="mb-4 font-display text-xl tracking-[0.15em]">ご注文を受け付けました</h2>
        <p className="text-sm leading-loose text-sub">
          注文番号
          <span className="mx-2 font-display tracking-widest text-ink">{orderId}</span>
          <br />
          ご登録のメールアドレス宛に、お支払い・発送のご案内をお送りします。
          <br />
          しばらく経っても届かない場合は、お手数ですがお問い合わせください。
        </p>
      </section>
    );
  }

  return (
    <section id="order" className="border-t border-line pt-12">
      <div className="mb-8">
        <h2 className="font-display text-xl tracking-[0.2em]">CART / ご注文</h2>
        <p className="mt-1 text-[0.68rem] tracking-[0.2em] text-gold">カートと注文手続き</p>
      </div>

      {/* カート */}
      {lines.length === 0 ? (
        <p className="mb-10 border border-line bg-paper-soft px-4 py-6 text-sm text-muted">
          カートは空です。上の商品から「カートに追加」してください。
        </p>
      ) : (
        <div className="mb-10 border border-line">
          <ul className="divide-y divide-line-soft">
            {lines.map((l) => (
              <li key={l.g.id} className="flex items-center gap-4 px-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.92rem]">{l.g.name}</p>
                  <p className="text-[0.75rem] text-muted">{yen(l.g.price)}</p>
                </div>
                <div className="flex items-center border border-line">
                  <button
                    type="button"
                    aria-label="数量を減らす"
                    className="px-3 py-1.5 text-sub hover:text-gold"
                    onClick={() => setQty(l.g.id, l.qty - 1)}
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-sm tabular-nums">{l.qty}</span>
                  <button
                    type="button"
                    aria-label="数量を増やす"
                    className="px-3 py-1.5 text-sub hover:text-gold disabled:opacity-30"
                    disabled={l.qty >= l.g.stock}
                    onClick={() => setQty(l.g.id, l.qty + 1)}
                  >
                    ＋
                  </button>
                </div>
                <span className="w-20 text-right text-[0.9rem] tabular-nums">
                  {yen(l.g.price * l.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-baseline justify-between border-t border-line px-4 py-4">
            <span className="text-[0.75rem] tracking-[0.2em] text-sub">
              合計（{itemCount}点・税込）
            </span>
            <span className="font-display text-xl tracking-wide">{yen(total)}</span>
          </div>
        </div>
      )}

      {/* お客様情報 */}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="o-name">
            お名前
          </label>
          <input
            id="o-name"
            className={fieldCls}
            value={customer.name}
            maxLength={60}
            onChange={(e) => set("name")(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="o-kana">
            フリガナ
          </label>
          <input
            id="o-kana"
            className={fieldCls}
            value={customer.kana}
            maxLength={60}
            onChange={(e) => set("kana")(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="o-email">
            メールアドレス
          </label>
          <input
            id="o-email"
            type="email"
            inputMode="email"
            className={fieldCls}
            value={customer.email}
            maxLength={120}
            onChange={(e) => set("email")(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="o-phone">
            電話番号
          </label>
          <input
            id="o-phone"
            type="tel"
            inputMode="tel"
            className={fieldCls}
            value={customer.phone}
            maxLength={20}
            onChange={(e) => set("phone")(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="o-postal">
            郵便番号
          </label>
          <input
            id="o-postal"
            inputMode="numeric"
            className={fieldCls}
            placeholder="100-0001"
            value={customer.postal}
            maxLength={8}
            onChange={(e) => set("postal")(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} htmlFor="o-address">
            ご住所（都道府県から）
          </label>
          <input
            id="o-address"
            className={fieldCls}
            value={customer.address}
            maxLength={200}
            onChange={(e) => set("address")(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls} htmlFor="o-note">
            ご要望・備考（任意）
          </label>
          <textarea
            id="o-note"
            className={`${fieldCls} min-h-24`}
            value={note}
            maxLength={1000}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      {/* ハニーポット（スパム対策・視覚的に隠す） */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          会社名
          <input
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
      </div>

      <label className="mt-6 flex items-start gap-3 text-[0.82rem] leading-relaxed text-sub">
        <input
          type="checkbox"
          className="mt-1 accent-gold"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
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
        disabled={sending || lines.length === 0}
        className="mt-6 w-full border border-ink bg-ink px-6 py-4 text-[0.85rem] tracking-[0.3em] text-paper transition-opacity hover:opacity-80 disabled:opacity-40"
      >
        {sending ? "送信中…" : `この内容で注文する（${yen(total)}）`}
      </button>
      <span className={hintCls}>
        送信の時点では決済は発生しません。折り返しお支払い方法をご案内します。
      </span>
    </section>
  );
}
