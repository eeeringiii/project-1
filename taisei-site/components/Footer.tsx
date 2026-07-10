import Link from "next/link";
import SnsLinks from "@/components/SnsLinks";
import { siteMeta } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 md:flex-row md:justify-between md:px-9">
        <SnsLinks size={17} gap="gap-6" />
        <div className="flex flex-col items-center gap-2 md:items-end">
          <div className="flex gap-5 text-[0.62rem] tracking-[0.16em] text-muted">
            <Link href="/contact" className="nav-link">FAN CONTACT</Link>
            <Link href="/business" className="nav-link text-gold">BUSINESS</Link>
          </div>
          <small className="text-[0.62rem] tracking-[0.2em] text-muted">
            © {siteMeta.artistNameEn}
          </small>
        </div>
      </div>
    </footer>
  );
}
