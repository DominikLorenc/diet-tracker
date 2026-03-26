import { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement>;

export const Card = ({ className = "", children, ...props }: Props) => (
  <div
    className={`bg-surface rounded-2xl shadow-sm p-5 flex flex-col gap-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);
