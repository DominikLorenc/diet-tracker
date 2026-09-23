import { ButtonHTMLAttributes } from "react";
import { Spinner } from "./Spinner";

type Variant = "primary" | "outline";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  isLoading?: boolean;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ink text-paper border-2 border-ink hover:bg-accent hover:border-accent disabled:opacity-50",
  outline:
    "border-2 border-ink text-ink bg-transparent hover:bg-ink hover:text-paper disabled:opacity-50",
};

export const Button = ({
  variant = "primary",
  isLoading = false,
  disabled,
  className = "",
  children,
  ...props
}: Props) => (
  <button
    disabled={disabled || isLoading}
    className={`flex items-center justify-center gap-2 min-h-11 text-sm font-extrabold uppercase tracking-wide px-5 py-2.5 transition-colors cursor-pointer font-sans ${variantClasses[variant]} ${className}`}
    {...props}
  >
    {isLoading && <Spinner />}
    {children}
  </button>
);
