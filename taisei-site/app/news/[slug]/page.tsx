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
          {item.body.map((paragraph, i) => (
            <p key={i} className="text-[0.95rem] leading-loose text-sub">
              {paragraph}
            </p>
          ))}
        </div>
        {item.images && item.images.length > 0 && (
          <div className="mt-10 space-y-5">
            {item.images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt={`${item.title} 写真${i + 1}`}
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
