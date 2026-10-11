"use client";

import React, { useEffect } from "react";
import { MdCheckCircle, MdErrorOutline, MdInfoOutline, MdClose } from "react-icons/md";

export type ToastType = "success" | "error" | "info";

export type ToastProps = {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
};

export function Toast({
  message,
  type = "success",
  onClose,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icon = {
    success: <MdCheckCircle className="text-emerald-400 text-lg shrink-0" />,
    error: <MdErrorOutline className="text-red-400 text-lg shrink-0" />,
    info: <MdInfoOutline className="text-sky-400 text-lg shrink-0" />,
  }[type];

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl bg-slate-900/95 px-4 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      {icon}
      <span className="max-w-md truncate">{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="ml-2 -mr-1 cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
      >
        <MdClose className="text-base" />
      </button>
    </div>
  );
}
