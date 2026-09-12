"use client";

import React from "react";
import { TbClock, TbCameraCheck, TbAlertTriangle } from "react-icons/tb";

interface ReportMetricCardsProps {
  totalShifts: number;
  photosApproved: number;
  escalations: number;
  labels: {
    totalShifts: string;
    totalPhotosApproved: string;
    escalations: string;
  };
}

export function ReportMetricCards({
  totalShifts,
  photosApproved,
  escalations,
  labels,
}: ReportMetricCardsProps) {
  const cards = [
    {
      label: labels.totalShifts,
      value: totalShifts.toLocaleString(),
      icon: <TbClock className="text-xl text-sky-500" />,
      bg: "bg-sky-50/60",
    },
    {
      label: labels.totalPhotosApproved,
      value: photosApproved.toLocaleString(),
      icon: <TbCameraCheck className="text-xl text-emerald-500" />,
      bg: "bg-emerald-50/60",
    },
    {
      label: labels.escalations,
      value: escalations.toLocaleString(),
      icon: <TbAlertTriangle className="text-xl text-amber-500" />,
      bg: "bg-amber-50/60",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card, idx) => (
        <section
          key={idx}
          className="dashboard-card px-5 py-5 flex items-start justify-between bg-white rounded-xl border border-slate-200/90 shadow-xs"
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
