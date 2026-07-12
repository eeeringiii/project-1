import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { getNews } from "@/lib/news";

export const metadata: Metadata = { title: "NEWS" };

export default function NewsPage() {
  return (
    <PageShell titleEn="NEWS" titleJp="最新情報">
      <ul>
        {getNews().map((item) => (
          <li key={item.slug} className="border-b border-line-soft">
            <Link
              href={`/news/${item.slug}`}
              className="group grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-1 py-5 md:grid-cols-[7rem_5.5rem_1fr]"
            >
              <time className="text-xs tracking-[0.08em] text-muted">{item.date}</time>
              <span className="border border-gold-soft px-2 py-0.5 text-center text-[0.6rem] tracking-[0.2em] text-gold">
                {item.category}
              </span>
              <span className="col-span-2 text-[0.92rem] leading-relaxed transition-colors group-hover:text-gold md:col-span-1">
                {item.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
