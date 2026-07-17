import type { Metadata } from "next";
import Link from "next/link";
import {
  formatYen,
  GOODS_CATEGORY_LABEL,
  type Goods,
} from "@/lib/content";
import { getActiveGoods, getShopConfig } from "@/lib/data";
import { siteHref } from "@/lib/shop";

export const metadata: Metadata = {
  title: "GOODS STORE",
  description:
    "アーティストオフィシャルグッズ。アパレル・音源・アクセサリーなどのオンライン販売。",
};

function ProductCard({ g }: { g: Goods }) {
  const soldOut = g.stock <= 0 && !g.externalUrl;
  const low = !soldOut && !g.externalUrl && g.stock <= 5;
  return (
    <Link href={`/goods/${g.id}`} className="group flex flex-col">
      <div className="relative mb-3 aspect-[4/5] overflow-hidden border border-line bg-paper-soft">
        {g.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={g.image}
            alt={g.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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
            <span className="border border-ink px-4 py-1.5 text-[0.7rem] tracking-[0.3em]">
              SOLD OUT
            </span>
          </div>
        )}
        {low && (
          <span className="absolute left-0 top-0 bg-gold px-2 py-1 text-[0.6rem] tracking-[0.16em] text-paper">
            残りわずか
          </span>
        )}
        {g.externalUrl && (
          <span className="absolute left-0 top-0 bg-ink px-2 py-1 text-[0.6rem] tracking-[0.16em] text-paper">
            外部ショップ
          </span>
        )}
      </div>
      <p className="mb-1 text-[0.6rem] tracking-[0.26em] text-gold">
        {GOODS_CATEGORY_LABEL[g.category]}
      </p>
      <h2 className="mb-1 text-[0.95rem] leading-snug transition-colors group-hover:text-gold">
        {g.name}
      </h2>
      <p className="font-display text-base tracking-wide">{formatYen(g.price)}</p>
    </Link>
  );
}

const STEPS = [
  { n: "01", t: "商品を選ぶ", d: "気になる商品をタップして、サイズや数量を選びます。" },
  { n: "02", t: "カートに入れる", d: "複数商品もまとめて購入できます。右上のCARTでいつでも確認。" },
  { n: "03", t: "お客様情報を入力", d: "お届け先とご連絡先を入力してご注文。決済はこの時点では発生しません。" },
  { n: "04", t: "ご案内メール", d: "お支払い方法（銀行振込）と発送予定を追ってメールでお送りします。" },
];

export default function GoodsStorePage() {
  const goods = getActiveGoods();
  const shop = getShopConfig();
  const shippingText =
    shop.shippingFee <= 0
      ? "全国送料無料"
      : shop.freeShippingOver > 0
        ? `全国一律 ${formatYen(shop.shippingFee)}（${formatYen(shop.freeShippingOver)}以上で無料）`
        : `全国一律 ${formatYen(shop.shippingFee)}`;
  return (
    <div className="space-y-14">
      {/* ヒーロー */}
      <section className="border-b border-line pb-8">
        <h1 className="font-display text-3xl tracking-[0.28em] md:text-4xl">GOODS STORE</h1>
        <p className="mt-3 text-[0.7rem] tracking-[0.24em] text-gold">オフィシャルグッズ通販</p>
        <p className="mt-5 max-w-2xl text-sm leading-loose text-sub">
          アーティストのオフィシャルグッズをお届けするオンラインストアです。
          はじめての方でも迷わずご購入いただけます。気になる商品を選んでカートに入れ、
          お届け先を入力するだけ。ご購入手続きの時点で決済は発生しません。
        </p>
      </section>

      {/* 商品一覧 */}
      <section>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-lg tracking-[0.2em]">ITEMS</h2>
          <span className="text-[0.7rem] tracking-[0.1em] text-muted">全{goods.length}商品</span>
        </div>
        {goods.length === 0 ? (
          <p className="border border-line bg-paper-soft px-4 py-6 text-sm text-muted">
            ただいま販売中の商品はありません。次回入荷までお待ちください。
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {goods.map((g) => (
              <ProductCard key={g.id} g={g} />
            ))}
          </div>
        )}
      </section>

      {/* はじめての方へ（購入の流れ） */}
      <section className="border-t border-line pt-10">
        <h2 className="mb-6 font-display text-lg tracking-[0.2em]">ご購入の流れ</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="border border-line p-5">
              <span className="font-display text-xl text-gold">{s.n}</span>
              <p className="mt-2 text-sm font-medium">{s.t}</p>
              <p className="mt-1 text-[0.78rem] leading-relaxed text-sub">{s.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 grid gap-3 text-[0.8rem] leading-relaxed text-sub sm:grid-cols-3">
          <p className="border border-line-soft bg-paper-soft px-4 py-3">
            <span className="mb-1 block text-[0.68rem] tracking-[0.14em] text-gold">お支払い</span>
            銀行振込（ご注文後にご案内）
          </p>
          <p className="border border-line-soft bg-paper-soft px-4 py-3">
            <span className="mb-1 block text-[0.68rem] tracking-[0.14em] text-gold">送料</span>
            {shippingText}
          </p>
          <p className="border border-line-soft bg-paper-soft px-4 py-3">
            <span className="mb-1 block text-[0.68rem] tracking-[0.14em] text-gold">お届け</span>
            ご入金確認後、順次発送いたします
          </p>
        </div>
        <p className="mt-5 text-[0.8rem] text-sub">
          ご不明な点は{" "}
          <a
            href={siteHref("/contact")}
            className="text-gold underline underline-offset-2 hover:opacity-80"
          >
            お問い合わせ
          </a>{" "}
          からお気軽にご連絡ください。商品の交換・不良については到着後1週間以内にご連絡をお願いします。
        </p>
      </section>
    </div>
  );
}
