import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import { releases } from "@/lib/content";

export const metadata: Metadata = { title: "DISCOGRAPHY" };

export default function DiscographyPage() {
  return (
    <PageShell titleEn="DISCOGRAPHY" titleJp="ディスコグラフィ">
      <div className="space-y-12">
        {releases.map((release) => (
          <Reveal key={release.slug}>
            <div className="grid items-center gap-9 border-b border-line-soft pb-12 md:grid-cols-[220px_1fr]">
              <div
                className="grid aspect-square place-items-center bg-gradient-to-br from-[#20242c] via-[#4a5468] to-[#8e94a4] text-[0.6rem] tracking-[0.26em] text-white/60"
                role="img"
                aria-label="ジャケット写真（準備中）"
              >
                JACKET
              </div>
              <div>
                <p className="mb-2 text-[0.62rem] tracking-[0.26em] text-muted">
                  {release.type}
                </p>
                <p className="mb-3 text-[0.7rem] tracking-[0.2em] text-gold">
                  {release.date} ON SALE
                </p>
                <h2 className="mb-4 text-2xl tracking-[0.14em]">{release.title}</h2>
                <p className="mb-6 max-w-[40em] text-sm leading-loose text-sub">
                  {release.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  {release.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      className="border border-ink px-6 py-3 text-[0.68rem] tracking-[0.2em] transition-colors hover:border-gold hover:text-gold"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </PageShell>
  );
}
