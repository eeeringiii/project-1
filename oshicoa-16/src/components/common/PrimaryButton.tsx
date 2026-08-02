import Link from "next/link";
import type { ReactNode } from "react";

type CommonProps = {
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
};

type LinkProps = CommonProps & { href: string; onClick?: never; type?: never };
type ButtonProps = CommonProps & {
  href?: never;
  onClick?: () => void;
  type?: "button" | "submit";
};

/** リンクにもボタンにもなる共通CTA。デザインは globals.css の .btn を利用。 */
export default function PrimaryButton(props: LinkProps | ButtonProps) {
  const { children, variant = "primary", className = "" } = props;
  const cls = `btn ${variant === "primary" ? "btn-primary" : "btn-ghost"} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={props.type ?? "button"} onClick={props.onClick} className={cls}>
      {children}
    </button>
  );
}
