export default function Ticker({ text }: { text: string }) {
  const line = text + " — ";
  return (
    <div
      className="overflow-hidden whitespace-nowrap border-y border-line bg-paper-soft py-3"
      aria-hidden="true"
    >
      <span className="ticker-track text-[0.68rem] tracking-[0.34em] text-gold">
        {line.repeat(3)}
      </span>
    </div>
  );
}
