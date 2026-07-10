const items = [
  "NEW SINGLE 2026.08.05 ON SALE",
  "TAISEI FUKUMOTO LIVE 2026 開催決定",
];

export default function Ticker() {
  const line = items.join(" — ") + " — ";
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
