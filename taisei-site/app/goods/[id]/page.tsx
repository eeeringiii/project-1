import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatYen } from "@/lib/content";
import { getActiveGoods } from "@/lib/data";
import ProductDetail from "@/components/store/ProductDetail";

export function generateStaticParams() {
  return getActiveGoods().map((g) => ({ id: g.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const g = getActiveGoods().find((x) => x.id === id);
  return { title: g ? g.name : "GOODS STORE" };
}

export default async function GoodsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const goods = getActiveGoods();
  const item = goods.find((g) => g.id === id);
  if (!item) notFound();

  const others = goods.filter((g) => g.id !== item.id).slice(0, 4);

  return (
    <div>
      <nav className="mb-8 text-[0.72rem] tracking-[0.12em] text-muted">
        <Link href="/goods" className="transition-colors hover:text-gold">
          GOODS STORE
        </Link>
        <span className="mx-2">/</span>
        <span className="text-sub">{item.name}</span>
      </nav>

      <ProductDetail goods={item} />

      {others.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="mb-6 font-display text-base tracking-[0.2em]">その他の商品</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
            {others.map((g) => (
              <Link key={g.id} href={`/goods/${g.id}`} className="group flex flex-col">
                <div className="mb-2 aspect-[4/5] overflow-hidden border border-line bg-paper-soft">
                  {g.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={g.image}
                      alt={g.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-display text-[0.62rem] tracking-[0.28em] text-muted">
                        NO IMAGE
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-[0.82rem] leading-snug transition-colors group-hover:text-gold">
                  {g.name}
                </p>
                <p>
                  <span className="text-[0.95rem] font-semibold tabular-nums">
                    {formatYen(g.price)}
                  </span>
                  <span className="ml-1 text-[0.6rem] text-muted">税込</span>
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 border-t border-line pt-6">
        <Link href="/goods" className="nav-link text-[0.72rem] tracking-[0.24em] text-sub">
          ← 商品一覧へ戻る
        </Link>
      </div>
    </div>
  );
}
