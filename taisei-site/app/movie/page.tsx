import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import { movies } from "@/lib/content";

export const metadata: Metadata = { title: "MOVIE" };

export default function MoviePage() {
  return (
    <PageShell titleEn="MOVIE" titleJp="ミュージックビデオ">
      <div className="grid gap-8 md:grid-cols-2">
        {movies.map((movie, i) => (
          <Reveal key={i}>
            {movie.youtubeId ? (
              <iframe
                className="aspect-video w-full"
                src={`https://www.youtube-nocookie.com/embed/${movie.youtubeId}`}
                title={movie.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="relative grid aspect-video place-items-center bg-gradient-to-br from-[#1a1b22] to-[#2c2f3c]">
                <span className="text-[0.6rem] tracking-[0.3em] text-white/40">
                  MV THUMBNAIL
                </span>
                <span className="absolute text-3xl text-gold-soft" aria-hidden="true">
                  ▶
                </span>
              </div>
            )}
            <p className="mt-3 text-sm leading-relaxed text-sub">{movie.title}</p>
          </Reveal>
        ))}
      </div>
    </PageShell>
  );
}
