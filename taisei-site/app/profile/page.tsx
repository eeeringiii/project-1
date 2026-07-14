import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Reveal from "@/components/Reveal";
import { siteMeta } from "@/lib/content";
import { getProfile, getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "PROFILE" };

export default function ProfilePage() {
  const profile = getProfile();
  const profileImage = getSettings().images.profile;
  return (
    <PageShell titleEn="PROFILE" titleJp="プロフィール">
      <div className="grid gap-10 md:grid-cols-[300px_1fr]">
        {profileImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profileImage}
            alt={`${siteMeta.artistName} アーティスト写真`}
            className="aspect-[3/4] w-full object-cover"
          />
        ) : (
          <div
            className="grid aspect-[3/4] place-items-center bg-gradient-to-br from-[#cfc9bb] via-[#a39c8b] to-[#6f695c] text-[0.65rem] tracking-[0.3em] text-white/60"
            role="img"
            aria-label="アーティスト写真（準備中）"
          >
            ARTIST PHOTO
          </div>
        )}
        <Reveal>
          <p className="mb-2 text-[0.7rem] tracking-[0.4em] text-gold">
            {siteMeta.artistNameEn}
          </p>
          <h2 className="mb-6 text-3xl tracking-[0.16em]">{siteMeta.artistName}</h2>
          <p className="mb-6 text-lg tracking-[0.08em]">{profile.lead}</p>
          <div className="space-y-5">
            {profile.paragraphs.map((paragraph, i) => (
              <p key={i} className="max-w-[42em] text-sm leading-loose text-sub">
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </PageShell>
  );
}
