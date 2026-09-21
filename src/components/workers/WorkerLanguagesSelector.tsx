"use client";

import React from "react";
import { LANGUAGE_NAMES } from "@/lib/locale";

interface WorkerLanguagesSelectorProps {
  selectedLanguages: string[];
  onToggleLanguage: (language: string) => void;
}


export function WorkerLanguagesSelector({
  selectedLanguages,
  onToggleLanguage,
}: WorkerLanguagesSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold text-slate-700">
        Languages<span className="text-red-500"> *</span>
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {LANGUAGE_NAMES.map((language) => {
          const active = selectedLanguages.includes(language);
          return (
            <button
              key={language}
              type="button"
              aria-pressed={active}
              onClick={() => onToggleLanguage(language)}
              className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {language}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
