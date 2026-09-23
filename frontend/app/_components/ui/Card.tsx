import { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement>;

export const Card = ({ className = "", children, ...props }: Props) => (
  <div
    className={`bg-card border-2 border-ink p-5 flex flex-col gap-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);
