export default function SectionTitle({
  en,
  jp,
}: {
  en: string;
  jp: string;
}) {
  return (
    <div className="mb-8 flex items-baseline gap-4">
      <h2 className="font-display text-xl tracking-[0.3em] md:text-2xl">{en}</h2>
      <span className="text-[0.65rem] tracking-[0.2em] text-gold">{jp}</span>
    </div>
  );
}
