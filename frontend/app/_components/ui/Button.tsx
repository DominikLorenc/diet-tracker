import { ButtonHTMLAttributes } from "react";
import { Spinner } from "./Spinner";

type Variant = "primary" | "outline";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  isLoading?: boolean;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-green text-white shadow-green-glow hover:opacity-85 disabled:opacity-50",
  outline:
    "border border-dash-border text-dash-fg-muted hover:opacity-80 disabled:opacity-50",
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
    className={`flex items-center justify-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl transition-opacity cursor-pointer font-sans ${variantClasses[variant]} ${className}`}
    {...props}
  >
    {isLoading && <Spinner />}
    {children}
  </button>
);
