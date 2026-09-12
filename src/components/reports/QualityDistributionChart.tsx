"use client";

import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { QualityDataPoint } from "./types";

interface QualityDistributionChartProps {
  title: string;
  data: QualityDataPoint[];
}

export function QualityDistributionChart({ title, data }: QualityDistributionChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <section className="dashboard-card p-5 bg-white rounded-xl border border-slate-200/90 shadow-xs">
      <h2 className="mb-4 text-sm font-bold text-slate-900">{title}</h2>
      <div className="grid min-h-[220px] grid-cols-1 items-center gap-6 sm:grid-cols-[1fr_1fr]">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={0}
                outerRadius={70}
                stroke="#ffffff"
                strokeWidth={3}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3.5">
          {data.map((item) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={item.name} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-medium text-slate-600">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">({pct}%)</span>
                  <span className="text-sm font-bold text-slate-900">{item.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
