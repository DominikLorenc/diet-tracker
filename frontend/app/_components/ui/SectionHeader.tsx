import { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export const SectionHeader = ({ title, subtitle, action }: Props) => (
  <div className="flex items-end justify-between gap-3 border-b-[5px] border-ink pb-1">
    <div>
      <h2 className="font-display text-2xl uppercase text-ink">{title}</h2>
      {subtitle && (
        <p className="font-mono text-xs text-ink-muted mt-0.5">{subtitle}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
