"use client";

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ShiftTrendItem } from "./types";

interface ShiftTrendsChartProps {
  title: string;
  data: ShiftTrendItem[];
}

export function ShiftTrendsChart({ title, data }: ShiftTrendsChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 10);
  const step = Math.ceil(maxCount / 4);
  const ticks = [0, step, step * 2, step * 3, step * 4];

  return (
    <section className="dashboard-card p-5 bg-white rounded-xl border border-slate-200/90 shadow-xs">
      <h2 className="mb-4 text-sm font-bold text-slate-900">{title}</h2>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              ticks={ticks}
              domain={[0, step * 4]}
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(14, 165, 233, 0.06)" }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                fontSize: 12,
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
              }}
            />
            <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
