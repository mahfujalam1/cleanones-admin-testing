"use client";

import { MdBlock } from "react-icons/md";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/auth.slice";
import { usePathname, useRouter } from "next/navigation";
import { getLocale, localizePath } from "@/lib/locale";

export default function BlockedPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const locale = getLocale(usePathname());
  const signOut = () => { localStorage.removeItem("token"); localStorage.removeItem("cleanones-dashboard-user"); dispatch(logout()); router.replace(localizePath("/login", locale)); };
  return <div className="flex min-h-[65vh] items-center justify-center"><div className="max-w-md rounded border border-red-200 bg-white p-8 text-center shadow-sm"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500"><MdBlock className="text-3xl" /></span><h2 className="mt-4 text-xl font-bold text-slate-900">Account blocked</h2><p className="mt-2 text-sm leading-6 text-slate-500">Your Manager account has been blocked by the Super Admin. Contact CleanOnes administration for help.</p><button onClick={signOut} className="mt-5 h-10 rounded bg-slate-900 px-5 text-sm font-semibold text-white">Return to sign in</button></div></div>;
}
