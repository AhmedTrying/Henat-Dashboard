"use client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import type { TimelinePoint } from "@/lib/types";

export function ChartCard({
  data,
  height = 280,
  showSuspected = true,
  showDeaths = true,
}: {
  data: TimelinePoint[];
  height?: number;
  showSuspected?: boolean;
  showDeaths?: boolean;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 4" vertical={false} />
          <XAxis
            dataKey="week"
            stroke="var(--ink-3)"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "var(--line)" }}
            tickFormatter={(w) => `W${w}`}
          />
          <YAxis
            stroke="var(--ink-3)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{
              background: "var(--bg-elev)",
              border: "1px solid var(--line-strong)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(w) => `Week ${w}`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="confirmed"
            name="Confirmed"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          {showSuspected ? (
            <Line
              type="monotone"
              dataKey="suspected"
              name="Suspected"
              stroke="var(--ink-3)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          ) : null}
          {showDeaths ? (
            <Line
              type="monotone"
              dataKey="deaths"
              name="Deaths"
              stroke="var(--warn-ink)"
              strokeWidth={1.6}
              dot={false}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
