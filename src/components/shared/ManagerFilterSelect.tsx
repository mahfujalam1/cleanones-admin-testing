"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Select } from "@/components/ui/select";
import { useGetAllManagersQuery } from "@/redux/api/endpoints/manager.api";
import { useAppSelector } from "@/redux/hooks";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";

interface ManagerFilterSelectProps {
  value: string;
  onChange: (managerId: string) => void;
  className?: string;
}

export function ManagerFilterSelect({ value, onChange, className }: ManagerFilterSelectProps) {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);
  const user = useAppSelector((state) => state.auth.user);
  const isCompanyAdmin = user?.role === "COMPANY_ADMIN" || (user?.role as string)?.toUpperCase() === "COMPANY";

  const { data, isLoading } = useGetAllManagersQuery(
    { limit: 100 },
    { skip: !isCompanyAdmin }
  );

  const allManagersLabel = t.managers?.allManagers || t.common?.allManagers || "All Managers";
  const filterByManagerPlaceholder = t.managers?.filterByManager || t.common?.filterByManager || "Filter by Manager";
  const loadingManagersPlaceholder = t.managers?.loadingManagers || t.common?.loadingManagers || "Loading managers...";

  const options = useMemo(() => {
    const list = data?.result || [];
    return [
      { value: "ALL", label: allManagersLabel },
      ...list.map((m) => ({
        value: m._id,
        label: `${m.name} (${m.email})`,
      })),
    ];
  }, [data, allManagersLabel]);

  if (!isCompanyAdmin) return null;

  return (
    <div className={`w-full shrink-0 ${className ? className : "sm:w-64"}`}>
      <Select
        value={value || "ALL"}
        onValueChange={(val) => onChange(val === "ALL" ? "" : val)}
        options={options}
        placeholder={isLoading ? loadingManagersPlaceholder : filterByManagerPlaceholder}
        disabled={isLoading}
      />
    </div>
  );
}
