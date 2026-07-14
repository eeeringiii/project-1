import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroGlow from "@/components/HeroGlow";
import Opening from "@/components/Opening";
import Ticker from "@/components/Ticker";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import SnsLinks from "@/components/SnsLinks";
import { siteMeta, snsListFrom } from "@/lib/content";
import { getMovies, getReleases, getSettings } from "@/lib/data";
import { getNews } from "@/lib/news";

export const revalidate = 600;

export default function Home() {
  const settings = getSettings();
  const snsLinks = snsListFrom(settings.sns);
  const latestNews = getNews().slice(0, 3);
  const release = getReleases()[0];
  const movies = getMovies().slice(0, 3);

  return (
    <>
      <Opening />
      <Header snsLinks={snsLinks} />
      <main>
        {/* ヒーロー */}
        <section className="relative grid min-h-[70vh] md:grid-cols-2">
          <div
            className="relative min-h-[240px] overflow-hidden"
            role="img"
            aria-label={settings.images.hero ? "アーティスト写真" : "アーティスト写真（準備中）"}
          >
            {settings.images.hero ? (
              <div
                className="kenburns absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${settings.images.hero})` }}
              />
            ) : (
              <>
                <div className="kenburns absolute inset-0 bg-gradient-to-br from-[#cfc9bb] via-[#a39c8b] to-[#6f695c]" />
                <span className="absolute inset-0 grid place-items-center text-[0.65rem] tracking-[0.3em] text-white/60">
                  ARTIST PHOTO
                </span>
              </>
            )}
            <HeroGlow />
          </div>
          <div className="flex flex-col justify-center gap-5 px-6 py-14 md:px-12">
            <span className="rise text-[0.7rem] tracking-[0.4em] text-gold">
              {siteMeta.artistNameEn} OFFICIAL SITE
            </span>
            <h1
              className="text-4xl font-medium tracking-[0.2em] md:text-5xl lg:text-6xl"
              aria-label={siteMeta.artistName}
            >
              {[...siteMeta.artistName].map((ch, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="kinetic-char"
                  style={{ animationDelay: `${0.4 + i * 0.14}s` }}
                >
                  {ch}
                </span>
              ))}
            </h1>
            <p className="rise rise-delay-2 text-base leading-relaxed tracking-[0.14em] md:text-lg">
              {settings.catchCopy}
            </p>
            <p className="rise rise-delay-3 max-w-[34em] text-sm leading-loose text-sub">
              {settings.description}
            </p>
          </div>
          <span
            className="absolute right-5 top-12 hidden text-[0.68rem] tracking-[0.5em] text-gold lg:block"
            style={{ writingMode: "vertical-rl" }}
            aria-hidden="true"
          >
            {siteMeta.artistName} — 二〇二六
          </span>
        </section>

        <Ticker text={settings.tickerText} />

        {/* NEWS */}
        <section className="mx-auto max-w-6xl px-6 py-16 md:px-9">
          <Reveal>
            <SectionTitle en="NEWS" jp="最新情報" />
            <ul>
              {latestNews.map((item) => (
                <li key={item.slug} className="border-b border-line-soft">
                  <Link
                    href={`/news/${item.slug}`}
                    className="group grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-1 py-4 md:grid-cols-[7rem_5.5rem_1fr]"
                  >
                    <time className="text-xs tracking-[0.08em] text-muted">
                      {item.date}
                    </time>
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
            <div className="mt-6 text-right">
              <Link href="/news" className="nav-link text-[0.7rem] tracking-[0.24em] text-sub">
                VIEW ALL →
              </Link>
            </div>
          </Reveal>
        </section>

        {/* RELEASE */}
        {release && (
          <section className="border-t border-line bg-paper-soft">
            <div className="mx-auto max-w-6xl px-6 py-16 md:px-9">
              <Reveal>
                <SectionTitle en="RELEASE" jp="リリース" />
                <div className="grid items-center gap-9 md:grid-cols-[220px_1fr]">
                  {release.jacket ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={release.jacket}
                      alt={`${release.title} ジャケット`}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div
                      className="grid aspect-square place-items-center bg-gradient-to-br from-[#20242c] via-[#4a5468] to-[#8e94a4] text-[0.6rem] tracking-[0.26em] text-white/60"
                      role="img"
                      aria-label="ジャケット写真（準備中）"
                    >
                      JACKET
                    </div>
                  )}
                  <div>
                    <p className="mb-3 text-[0.7rem] tracking-[0.2em] text-gold">
                      {release.date} ON SALE
                    </p>
                    <h3 className="mb-4 text-2xl tracking-[0.14em]">{release.title}</h3>
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
            </div>
          </section>
        )}

        {/* MOVIE */}
        <section className="mx-auto max-w-6xl px-6 py-16 md:px-9">
          <Reveal>
            <SectionTitle en="MOVIE" jp="ミュージックビデオ" />
            <div className="grid gap-4 md:grid-cols-3">
              {movies.map((movie) => (
                <div key={movie.id}>
                  {movie.youtubeId ? (
                    <a
                      href={`https://www.youtube.com/watch?v=${movie.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://i.ytimg.com/vi/${movie.youtubeId}/hqdefault.jpg`}
                        alt={movie.title}
                        className="aspect-video w-full object-cover"
                      />
                      <span className="absolute inset-0 grid place-items-center text-3xl text-white/90">
                        ▶
                      </span>
                    </a>
                  ) : (
                    <div className="relative grid aspect-video place-items-center bg-gradient-to-br from-[#1a1b22] to-[#2c2f3c]">
                      <span className="text-[0.6rem] tracking-[0.3em] text-white/40">
                        MV THUMBNAIL
                      </span>
                      <span className="absolute text-2xl text-gold-soft" aria-hidden="true">
                        ▶
                      </span>
                    </div>
                  )}
                  <p className="mt-3 text-xs leading-relaxed text-sub">{movie.title}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-right">
              <Link href="/movie" className="nav-link text-[0.7rem] tracking-[0.24em] text-sub">
                VIEW ALL →
              </Link>
            </div>
          </Reveal>
        </section>

        {/* FOLLOW — ファン獲得の本命導線 */}
        <section className="border-t border-line bg-paper-soft">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center md:px-9">
            <Reveal>
              <h2 className="mb-2 font-display text-xl tracking-[0.3em] md:text-2xl">
                FOLLOW
              </h2>
              <p className="mb-8 text-[0.7rem] tracking-[0.2em] text-gold">
                最新情報はSNSでいちはやく
              </p>
              <SnsLinks links={snsLinks} size={26} gap="gap-10" className="justify-center" location="follow-section" />
            </Reveal>
          </div>
        </section>

        {/* CONTACT 2枚看板 */}
        <section className="border-t border-line">
          <div className="grid md:grid-cols-2">
            <Link
              href="/contact"
              className="group border-b border-line px-8 py-12 text-center transition-colors hover:bg-paper-soft md:border-b-0 md:border-r"
            >
              <span className="mb-2 block font-display text-lg tracking-[0.3em] transition-colors group-hover:text-gold">
                FAN CONTACT
              </span>
              <span className="text-[0.7rem] tracking-[0.12em] text-muted">
                ファンレター・応援メッセージはこちら
              </span>
            </Link>
            <Link
              href="/business"
              className="group px-8 py-12 text-center transition-colors hover:bg-paper-soft"
            >
              <span className="mb-2 block font-display text-lg tracking-[0.3em] text-gold">
                BUSINESS
              </span>
              <span className="text-[0.7rem] tracking-[0.12em] text-muted">
                出演・タイアップ等のお仕事のご依頼
              </span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
