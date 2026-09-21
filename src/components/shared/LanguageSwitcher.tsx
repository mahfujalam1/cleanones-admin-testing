"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MdLanguage } from "react-icons/md";
import { getLocale, localizePath, LOCALE_OPTIONS, setLocale } from "@/lib/locale";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const current = getLocale(pathname);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [open]);

  const choose = (code: string) => {
    setLocale(code);
    setOpen(false);

    router.replace(localizePath(pathname ?? "/login", code));
    router.refresh();
  };

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change language"
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-2xs transition-colors hover:border-slate-300 hover:text-slate-900"
      >
        <MdLanguage className="text-base text-slate-500" />
        {current.toUpperCase()}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {LOCALE_OPTIONS.map((language) => (
            <button
              key={language.code}
              type="button"
              role="menuitem"
              onClick={() => choose(language.code)}
              className={`block w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors ${
                current === language.code
                  ? "bg-sky-50 font-semibold text-primary"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {language.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
