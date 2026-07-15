import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { getNews } from "@/lib/news";

export const revalidate = 600;

export function generateStaticParams() {
  return getNews().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getNews().find((n) => n.slug === slug);
  return { title: item ? item.title : "NEWS" };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getNews().find((n) => n.slug === slug);
  if (!item) notFound();

  // 本文中の [写真1]〜[写真3] マーカーをその位置の画像に置き換える。
  // マーカーで使われなかった画像は本文の下にまとめて表示する
  const images = item.images ?? [];
  const usedIdx = new Set<number>();
  const blocks = item.body.map((paragraph) => {
    const m = paragraph.match(/^\[写真([1-3])\]$/);
    if (m) {
      const idx = Number(m[1]) - 1;
      if (images[idx]) {
        usedIdx.add(idx);
        return { type: "image" as const, src: images[idx], idx };
      }
    }
    return { type: "text" as const, text: paragraph };
  });
  const restImages = images.filter((_, i) => !usedIdx.has(i));

  return (
    <PageShell titleEn="NEWS" titleJp="最新情報">
      <article className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-baseline gap-4">
          <time className="text-xs tracking-[0.08em] text-muted">{item.date}</time>
          <span className="border border-gold-soft px-2 py-0.5 text-[0.6rem] tracking-[0.2em] text-gold">
            {item.category}
          </span>
        </div>
        <h2 className="mb-8 text-xl leading-relaxed tracking-[0.06em] md:text-2xl">
          {item.title}
        </h2>
        <div className="space-y-5">
          {blocks.map((block, i) =>
            block.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={block.src}
                alt={`${item.title} 写真${block.idx + 1}`}
                className="w-full border border-line-soft"
              />
            ) : (
              <p key={i} className="text-[0.95rem] leading-loose text-sub">
                {block.text}
              </p>
            ),
          )}
        </div>
        {restImages.length > 0 && (
          <div className="mt-10 space-y-5">
            {restImages.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt={`${item.title} 写真`}
                className="w-full border border-line-soft"
              />
            ))}
          </div>
        )}
        <div className="mt-12 border-t border-line pt-6">
          <Link href="/news" className="nav-link text-[0.7rem] tracking-[0.24em] text-sub">
            ← NEWS一覧へ戻る
          </Link>
        </div>
      </article>
    </PageShell>
  );
}
