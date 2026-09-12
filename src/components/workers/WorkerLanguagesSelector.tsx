"use client";

import React from "react";

export const DEFAULT_LANGUAGES = [
  "Nederlands",
  "Engels",
  "Duits",
  "Frans",
  "Spaans",
  "Pools",
  "Turks",
  "Arabisch",
];

interface WorkerLanguagesSelectorProps {
  selectedLanguages: string[];
  onToggleLanguage: (lang: string) => void;
}

export function WorkerLanguagesSelector({
  selectedLanguages,
  onToggleLanguage,
}: WorkerLanguagesSelectorProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-700 mb-2 block">
        Languages *
      </label>
      <div className="flex flex-wrap gap-2">
        {DEFAULT_LANGUAGES.map((lang) => {
          const isSelected = selectedLanguages.includes(lang);
          return (
            <button
              type="button"
              key={lang}
              onClick={() => onToggleLanguage(lang)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                isSelected
                  ? "bg-[#0ea5e9] text-white border-[#0ea5e9]"
                  : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
              }`}
            >
              {lang}
            </button>
          );
        })}
      </div>
    </div>
  );
}
