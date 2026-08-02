import type { FaqItem } from "@/data/faq";

/** JSなしで開閉できる details/summary ベースのFAQ。 */
export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <details key={item.id} className="panel group p-0 [&_summary]:list-none">
          <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 text-text">
            <span className="font-medium">{item.question}</span>
            <span
              aria-hidden="true"
              className="type-code text-violet transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="border-t border-line px-5 pb-5 pt-4 text-sm text-text-sub leading-relaxed">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
