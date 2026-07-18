import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
};

export default function SectionHeading({ eyebrow, title, description, align = "left" }: Props) {
  return (
    <div className={align === "center" ? "text-center mx-auto max-w-2xl" : "max-w-2xl"}>
      {eyebrow && (
        <p className="type-code text-xs text-violet mb-3 uppercase tracking-[0.25em]">{eyebrow}</p>
      )}
      <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">{title}</h2>
      {description && <p className="mt-4 text-text-sub leading-relaxed">{description}</p>}
    </div>
  );
}
