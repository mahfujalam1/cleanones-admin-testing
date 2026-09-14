"use client";

import React from "react";
import { TbClock, TbCameraCheck, TbAlertTriangle, TbCheck, TbHourglass } from "react-icons/tb";

export interface MetricCardItem {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  bg: string;
}

interface ReportMetricCardsProps {
  totalShifts: number;
  photosApproved?: number;
  escalations: number;
  resolvedIssues?: number;
  pendingIssues?: number;
  labels: {
    totalShifts: string;
    totalPhotosApproved?: string;
    escalations: string;
    resolvedIssues?: string;
    pendingIssues?: string;
  };
}

export function ReportMetricCards({
  totalShifts,
  photosApproved,
  escalations,
  resolvedIssues,
  pendingIssues,
  labels,
}: ReportMetricCardsProps) {
  const cards: MetricCardItem[] = [
    {
      label: labels.totalShifts,
      value: totalShifts.toLocaleString(),
      icon: <TbClock className="text-xl text-sky-500" />,
      bg: "bg-sky-50/70",
    },
    {
      label: labels.escalations,
      value: escalations.toLocaleString(),
      icon: <TbAlertTriangle className="text-xl text-amber-500" />,
      bg: "bg-amber-50/70",
    },
  ];

  if (typeof resolvedIssues === "number") {
    cards.push({
      label: labels.resolvedIssues || "Resolved Issues",
      value: resolvedIssues.toLocaleString(),
      icon: <TbCheck className="text-xl text-emerald-500" />,
      bg: "bg-emerald-50/70",
    });
  } else if (typeof photosApproved === "number") {
    cards.push({
      label: labels.totalPhotosApproved || "Photos Approved",
      value: photosApproved.toLocaleString(),
      icon: <TbCameraCheck className="text-xl text-emerald-500" />,
      bg: "bg-emerald-50/70",
    });
  }

  if (typeof pendingIssues === "number") {
    cards.push({
      label: labels.pendingIssues || "Pending Issues",
      value: pendingIssues.toLocaleString(),
      icon: <TbHourglass className="text-xl text-rose-500" />,
      bg: "bg-rose-50/70",
    });
  }

  const gridCols =
    cards.length === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-3";

  return (
    <div className={`grid gap-4 ${gridCols}`}>
      {cards.map((card, idx) => (
        <section
          key={idx}
          className="dashboard-card px-5 py-5 flex items-start justify-between bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {card.value}
            </p>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}>
            {card.icon}
          </div>
        </section>
      ))}
    </div>
  );
}
