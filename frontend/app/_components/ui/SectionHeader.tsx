import { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export const SectionHeader = ({ title, subtitle, action }: Props) => (
  <div className="flex items-start justify-between">
    <div>
      <h2 className="text-base font-semibold text-dash-fg">{title}</h2>
      {subtitle && (
        <p className="text-xs text-dash-fg-muted mt-0.5">{subtitle}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
