"use client";

import {
  CartesianGrid,
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

  const title = label.charAt(0) + label.slice(1).toLowerCase();
  const lastIndex = chartData.length - 1;

  return (
    <section
      aria-label={title}
      className="flex flex-col border-2 border-ink bg-card px-3 pt-1.5 pb-3"
    >
      <div className="flex items-end justify-between gap-3">
        <h3 className="font-display text-[30px] leading-none [font-stretch:75%]">
          {title}
        </h3>
        <span className="font-mono text-[32px] font-semibold leading-none tracking-[-0.04em]">
          {latest !== undefined ? latest.toLocaleString("pl-PL") : "—"}
          <span className="text-base"> {unit}</span>
        </span>
      </div>
      <div className="rule-thick mt-2" />
      <div className="flex justify-between py-1 border-b border-ink text-xs">
        <span className="font-bold">Zmiana w okresie</span>
        <span className="font-mono font-semibold">
          {delta !== null
            ? `${delta > 0 ? "+" : delta < 0 ? "−" : "±"}${Math.abs(delta).toLocaleString("pl-PL", { maximumFractionDigits: 1 })} ${unit}`
            : "—"}
        </span>
      </div>

      <div className="h-36 mt-3">
        {chartData.length >= 2 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 6, right: 6, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--color-ink)"
                strokeDasharray="2 4"
              />
              <XAxis
                dataKey="date"
                tick={{
                  fill: "var(--color-ink)",
                  fontSize: 10,
                  fontFamily: "var(--font-ibm-plex-mono)",
                }}
                axisLine={{ stroke: "var(--color-ink)", strokeWidth: 2 }}
                tickLine={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                orientation="right"
                tick={{
                  fill: "var(--color-ink)",
                  fontSize: 10,
                  fontFamily: "var(--font-ibm-plex-mono)",
                }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "2px solid var(--color-ink)",
                  borderRadius: 0,
                  color: "var(--color-ink)",
                  fontSize: 12,
                  fontFamily: "var(--font-ibm-plex-mono)",
                }}
                itemStyle={{ color: "var(--color-ink)" }}
                cursor={{ stroke: "var(--color-ink)", strokeWidth: 1 }}
                formatter={(value) => [`${value} ${unit}`, title]}
              />
              <Line
                type="linear"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                isAnimationActive={false}
                dot={(props) => {
                  const { cx = 0, cy = 0, index } = props;
                  const isLast = index === lastIndex;
                  const size = isLast ? 10 : 7;
                  return (
                    <rect
                      key={`dot-${index}`}
                      x={cx - size / 2}
                      y={cy - size / 2}
                      width={size}
                      height={size}
                      fill={
                        isLast ? "var(--color-accent)" : "var(--color-card)"
                      }
                      stroke={isLast ? "none" : "var(--color-ink)"}
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center border-2 border-dashed border-ink font-mono text-xs uppercase">
            Za mało danych
          </div>
        )}
      </div>
    </section>
  );
};
