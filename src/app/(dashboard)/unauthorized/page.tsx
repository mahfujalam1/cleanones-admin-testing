"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdLockOutline } from "react-icons/md";
import { getLocale, localizePath } from "@/lib/locale";
import { getFirstAllowedRoute, getStoredManagerAccess } from "@/lib/access-control";

export default function UnauthorizedPage() {
  const locale = getLocale(usePathname());
  const firstAllowedRoute = getFirstAllowedRoute(getStoredManagerAccess());
  return <div className="flex min-h-[65vh] items-center justify-center"><div className="max-w-md rounded border border-slate-200 bg-white p-8 text-center shadow-sm"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500"><MdLockOutline className="text-3xl" /></span><h2 className="mt-4 text-xl font-bold text-slate-900">Access not assigned</h2><p className="mt-2 text-sm leading-6 text-slate-500">Your Super Admin has not enabled any route for the Manager dashboard.</p>{firstAllowedRoute && <Link href={localizePath(firstAllowedRoute, locale)} className="mt-5 inline-flex h-10 items-center rounded bg-primary px-5 text-sm font-semibold text-white">Open dashboard</Link>}</div></div>;
}
