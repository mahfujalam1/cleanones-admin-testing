"use client";

import React, { useState } from "react";
import { MdInsertDriveFile } from "react-icons/md";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ReportRange = "Week" | "Month" | "Quarter" | "Year";

const ranges: ReportRange[] = ["Week", "Month", "Quarter", "Year"];

const shiftTrendData = [
  { month: "Jan", shifts: 265 },
  { month: "Feb", shifts: 302 },
  { month: "Mar", shifts: 278 },
  { month: "Apr", shifts: 328 },
  { month: "May", shifts: 368 },
  { month: "Jun", shifts: 232 },
];

const qualityData = [
  { name: "Approved", value: 67, color: "#0ea5e9" },
  { name: "Pending", value: 12, color: "#f59e0b" },
  { name: "Rejected", value: 8, color: "#ef4444" },
];

export default function ReportsPage() {
  const [activeRange, setActiveRange] = useState<ReportRange>("Month");

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex rounded border border-gray-200 bg-white p-1">
          {ranges.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setActiveRange(range)}
              className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${activeRange === range
                ? "bg-cyan-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              {range}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="flex h-9 items-center gap-1.5 rounded border border-gray-200 bg-gray-100 px-3 text-sm font-semibold text-slate-500 shadow-sm transition-colors hover:bg-white"
        >
          <MdInsertDriveFile className="text-base" />
          PDF
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard label="Total Shifts" value="1,245" />
        <MetricCard label="Total Photos Approved" value="67" />
        <MetricCard label="Escalations" value="23" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="dashboard-card p-5">
          <h2 className="mb-5 text-sm font-bold text-slate-950">
            Monthly Shift Trends
          </h2>
          <div className="h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftTrendData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  ticks={[0, 95, 190, 285, 380]}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(14, 165, 233, 0.08)" }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="shifts" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="dashboard-card p-5">
          <h2 className="mb-5 text-sm font-bold text-slate-950">
            Photo Quality Distribution
          </h2>
          <div className="grid min-h-[210px] grid-cols-1 items-center gap-6 md:grid-cols-[1fr_1fr]">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={qualityData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={0}
                    outerRadius={70}
                    stroke="#ffffff"
                    strokeWidth={3}
                  >
                    {qualityData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {qualityData.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-slate-500">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-950">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <section className="dashboard-card px-5 py-6">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
    </section>
  );
}
