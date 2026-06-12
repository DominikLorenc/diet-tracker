"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type Props = {
  label: string;
  unit: string;
  color: string;
  data: { date: string; value: number }[];
};

export const MeasurementChart = ({ label, unit, color, data }: Props) => {
  const latest = data.at(-1)?.value;
  const first = data.at(0)?.value;

  const delta =
    latest !== undefined && first !== undefined ? latest - first : null;

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
    }),
    value: d.value,
  }));

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-dash-border bg-dash-surface-card p-4"
      style={{ boxShadow: "0 1px 20px rgba(34,197,94,0.09)" }}
    >
      <span
        className="font-['IBM_Plex_Mono'] text-[11px] font-bold tracking-[2px]"
        style={{ color }}
      >
        {label}
      </span>

      <div className="flex items-end justify-between">
        <span className="font-['IBM_Plex_Mono'] text-2xl font-bold text-dash-fg">
          {latest !== undefined ? `${latest} ${unit}` : "—"}
        </span>

        {delta !== null && (
          <span className="font-['IBM_Plex_Mono'] text-xs text-dash-fg-secondary">
            {delta > 0 ? "↑" : delta < 0 ? "↓" : "→"}{" "}
            {Math.abs(delta).toFixed(1)} {unit}
          </span>
        )}
      </div>

      <div className="h-24">
        {chartData.length >= 2 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--color-chart-tick)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fill: "var(--color-chart-tick)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-dash-surface-darker)",
                  border: "1px solid var(--color-dash-border)",
                  borderRadius: 8,
                  color: "var(--color-dash-fg)",
                  fontSize: 12,
                }}
                itemStyle={{ color }}
                formatter={(value) => [`${value} ${unit}`, label]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: color }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-chart-tick">
            Za mało danych
          </div>
        )}
      </div>
    </div>
  );
};
