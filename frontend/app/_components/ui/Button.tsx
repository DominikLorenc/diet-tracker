import { ButtonHTMLAttributes } from "react";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "outline";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  isLoading?: boolean;
};

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand-primary text-white hover:opacity-90 disabled:opacity-60",
  secondary: "bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-60",
  outline:
    "border border-gray-200 text-text-secondary hover:bg-surface-muted disabled:opacity-60",
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
    className={`flex items-center justify-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors cursor-pointer ${variantClasses[variant]} ${className}`}
    {...props}
  >
    {isLoading && <Spinner />}
    {children}
  </button>
);
