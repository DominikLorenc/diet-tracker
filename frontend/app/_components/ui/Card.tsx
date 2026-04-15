import { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement>;

export const Card = ({ className = "", children, ...props }: Props) => (
  <div
    className={`bg-dash-surface border border-dash-border rounded-2xl p-5 flex flex-col gap-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);
