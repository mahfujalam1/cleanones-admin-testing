"use client";

import { useEffect, useState } from "react";
import { Share, PlusSquare, X } from "lucide-react";

export function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if device is iOS and not already running in standalone PWA mode
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;

    // Check if user dismissed prompt previously in this session
    const isDismissed = sessionStorage.getItem("ios_pwa_prompt_dismissed");

    if (isIOS && !isStandalone && !isDismissed) {
      setShowPrompt(true);
    }
  }, []);

  if (!showPrompt) return null;

  const handleDismiss = () => {
    sessionStorage.setItem("ios_pwa_prompt_dismissed", "true");
    setShowPrompt(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl bg-slate-900 p-4 text-white shadow-2xl border border-slate-700/80 backdrop-blur-lg transition-all animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-md">
            CO
          </div>
          <div>
            <h4 className="text-sm font-semibold">CleanOnes App ইনস্টল করুন</h4>
            <p className="text-xs text-slate-300">
              সহজে ব্যবহার করতে আপনার হোম স্ক্রিনে যোগ করুন
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="Close prompt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-around rounded-xl bg-slate-800/80 p-2.5 text-xs text-slate-200 border border-slate-700/50">
        <div className="flex items-center gap-1.5">
          <span>১. Safari-তে</span>
          <Share className="h-4 w-4 text-blue-400 inline" />
          <span>ট্যাপ করুন</span>
        </div>
        <span className="text-slate-500">➔</span>
        <div className="flex items-center gap-1.5">
          <span>২.</span>
          <PlusSquare className="h-4 w-4 text-blue-400 inline" />
          <span>Add to Home Screen</span>
        </div>
      </div>
    </div>
  );
}
