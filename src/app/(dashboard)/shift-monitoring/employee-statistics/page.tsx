"use client";
import { useState } from "react";
import { EmployeeStatistics } from "@/components/shift-monitoring/EmployeeStatistics";
import { EmployeeSidebar } from "@/components/shift-monitoring/EmployeeSidebar";
import type { WorkerInfo } from "@/components/shift-monitoring/types";
export default function EmployeeStatisticsPage() { const [selected, setSelected] = useState<WorkerInfo | null>(null); return <div className="space-y-6 pb-10"><EmployeeStatistics onWorkerSelect={setSelected} selectedWorkerId={selected?.id ?? null} />{selected && <EmployeeSidebar worker={selected} onClose={() => setSelected(null)} />}</div>; }
