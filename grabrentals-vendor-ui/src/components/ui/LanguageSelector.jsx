"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronDown, Check } from "lucide-react";

export const TOP_LANGUAGES = [
  { code: "en", label: "English", name: "English" },
  { code: "kn", label: "ಕನ್ನಡ", name: "Kannada" },
  { code: "ta", label: "தமிழ்", name: "Tamil" },
  { code: "te", label: "తెలుగు", name: "Telugu" },
  { code: "hi", label: "हिंदी", name: "Hindi" },
];

export function LanguageSelector({ variant = "header" }) {
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];
  const isDark = variant === "dark" || variant === "dark-header";
  const forceDropdown = variant === "dropdown";
  const forceInline = variant === "inline";

  return (
    <div className="flex items-center">
      {/* Desktop / Tablet Inline Switcher (as added in customer side) */}
      {!forceDropdown && (
        <div
          className={`${
            forceInline ? "flex" : "hidden md:flex"
          } items-center gap-1.5 text-xs font-semibold shrink-0 whitespace-nowrap`}
        >
          {TOP_LANGUAGES.map((lang, idx) => {
            const isActive = language === lang.code;
            return (
              <span key={lang.code} className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`transition-all cursor-pointer ${
                    isActive
                      ? isDark
                        ? "text-amber-400 font-extrabold underline underline-offset-4 decoration-2"
                        : "text-amber-600 font-extrabold underline underline-offset-4 decoration-2"
                      : isDark
                        ? "text-white/80 hover:text-amber-400 font-semibold"
                        : "text-slate-600 hover:text-amber-600 font-semibold"
                  }`}
                  title={lang.name}
                >
                  {lang.label}
                </button>
                {idx < TOP_LANGUAGES.length - 1 && (
                  <span
                    className={`${
                      isDark ? "text-slate-600" : "text-slate-300"
                    } font-bold select-none`}
                  >
                    |
                  </span>
                )}
              </span>
            );
          })}
        </div>
      )}

      {/* Mobile / Fallback Dropdown Switcher */}
      {!forceInline && (
        <div
          className={`${
            forceDropdown ? "inline-block" : "md:hidden inline-block"
          } relative text-left z-50`}
          ref={dropdownRef}
        >
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
              isDark
                ? "border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-200"
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            }`}
            aria-label="Select Language"
          >
            <span className="text-sm">{currentLang.flag}</span>
            <span className="text-xs font-bold">{currentLang.code.toUpperCase()}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isOpen && (
            <div
              className={`absolute right-0 mt-2 w-48 rounded-2xl border shadow-xl py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-100 ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-slate-200 shadow-black/60"
                  : "bg-white border-slate-200 text-slate-700 shadow-xl"
              }`}
            >
              <div
                className={`px-3 py-1.5 border-b text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-400"
                }`}
              >
                Select Language
              </div>
              {supportedLanguages.map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? isDark
                          ? "bg-amber-500/20 text-amber-300 font-bold"
                          : "bg-amber-50 text-amber-900 font-bold"
                        : isDark
                          ? "text-slate-300 hover:bg-slate-800 font-medium"
                          : "text-slate-700 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <div>
                        <span className="block leading-tight">{lang.nativeName}</span>
                        <span className="text-[10px] text-slate-400">
                          {lang.name}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check
                        className={`w-4 h-4 shrink-0 ${
                          isDark ? "text-amber-400" : "text-amber-600"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
