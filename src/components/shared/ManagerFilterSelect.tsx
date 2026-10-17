"use client";

import { useMemo } from "react";
import { Select } from "@/components/ui/select";
import { useGetAllManagersQuery } from "@/redux/api/endpoints/manager.api";
import { useAppSelector } from "@/redux/hooks";

interface ManagerFilterSelectProps {
  value: string;
  onChange: (managerId: string) => void;
  className?: string;
}

export function ManagerFilterSelect({ value, onChange, className }: ManagerFilterSelectProps) {
  const user = useAppSelector((state) => state.auth.user);
  const isCompanyAdmin = user?.role === "COMPANY_ADMIN" || (user?.role as string)?.toUpperCase() === "COMPANY";

  const { data, isLoading } = useGetAllManagersQuery(
    { limit: 100 },
    { skip: !isCompanyAdmin }
  );

  const options = useMemo(() => {
    const list = data?.result || [];
    return [
      { value: "ALL", label: "All Managers" },
      ...list.map((m) => ({
        value: m._id,
        label: `${m.name} (${m.email})`,
      })),
    ];
  }, [data]);

  if (!isCompanyAdmin) return null;

  return (
    <div className={`w-full shrink-0 ${className ? className : "sm:w-64"}`}>
      <Select
        value={value || "ALL"}
        onValueChange={(val) => onChange(val === "ALL" ? "" : val)}
        options={options}
        placeholder={isLoading ? "Loading managers..." : "Filter by Manager"}
        disabled={isLoading}
      />
    </div>
  );
}
