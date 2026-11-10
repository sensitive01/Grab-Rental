"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage, clearAllGoogTransCookies } from "@/context/LanguageContext";
import { ChevronDown, Check, Globe } from "lucide-react";

export const TOP_LANGUAGES = [
  { code: "en", label: "English", name: "English" },
  { code: "kn", label: "ಕನ್ನಡ", name: "Kannada" },
  { code: "ta", label: "தமிழ்", name: "Tamil" },
  { code: "te", label: "తెలుగు", name: "Telugu" },
  { code: "hi", label: "हिंदी", name: "Hindi" },
  { code: "ml", label: "മലയാളം", name: "Malayalam" },
];

export function TopLanguageBar({ theme = "slate", className = "" }) {
  const { language, setLanguage: setContextLang, startTranslating, stopTranslating } = useLanguage();
  const observerRef = useRef(null);

  const getLanguageCookie = () => {
    if (typeof document === "undefined") return "en";
    const match = document.cookie.match(new RegExp("(^| )googtrans=([^;]+)"));
    if (match && match[2]) {
      const parts = match[2].split("/");
      return parts[2] || "en";
    }
    return "en";
  };

  const [currentLang, setCurrentLang] = useState(() => language || getLanguageCookie());

  useEffect(() => {
    const savedLang = language || getLanguageCookie();
    setCurrentLang(savedLang);
  }, [language]);

  const handleLanguageSelect = (lang) => {
    if (lang === currentLang) return;

    const langInfo = TOP_LANGUAGES.find((l) => l.code === lang) || { code: lang, label: lang, name: lang };

    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-lang", lang);
    }

    startTranslating(lang, langInfo);
    setContextLang(lang);
    setCurrentLang(lang);

    // Strictly host-isolated cookie: NO domain wildcard so customer UI and vendor UI never cross-share
    if (lang === "en") {
      clearAllGoogTransCookies();
      try {
        localStorage.setItem("grab_vendor_selected_language", "en");
      } catch {}

      const gtSelect = document.querySelector(".goog-te-combo");
      if (gtSelect) {
        gtSelect.value = "en";
        gtSelect.dispatchEvent(new Event("change", { bubbles: true }));
        gtSelect.selectedIndex = 0;
        gtSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }

      setTimeout(() => {
        window.location.reload();
      }, 200);
      return;
    }

    // Set isolated cookie for target language
    document.cookie = `googtrans=/en/${lang}; path=/; max-age=31536000; SameSite=Lax`;

    try {
      localStorage.setItem("grab_vendor_selected_language", lang);
    } catch {}

    const gtSelect = document.querySelector(".goog-te-combo");
    if (gtSelect) {
      if (gtSelect.value !== lang) {
        gtSelect.value = lang;
        gtSelect.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        gtSelect.selectedIndex = 0;
        gtSelect.dispatchEvent(new Event("change", { bubbles: true }));
        setTimeout(() => {
          gtSelect.value = lang;
          gtSelect.dispatchEvent(new Event("change", { bubbles: true }));
        }, 50);
      }
    }

    // Set up MutationObserver to dismiss loading overlay once translation DOM stabilizes
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    let settleTimer = null;
    const cleanup = () => {
      if (settleTimer) clearTimeout(settleTimer);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      stopTranslating();
    };

    observerRef.current = new MutationObserver(() => {
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(cleanup, 200);
    });

    if (typeof document !== "undefined") {
      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    setTimeout(cleanup, 1200);
  };

  return (
    <div
      className={`w-full py-1.5 sm:py-2 px-3 sm:px-6 flex items-center justify-center sm:justify-end border-b transition-colors relative z-50 notranslate ${
        theme === "amber"
          ? "bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 text-slate-950 border-amber-600/80 shadow-xs"
          : "bg-slate-900/95 backdrop-blur-md text-white border-slate-800/80 shadow-xs"
      } ${className}`}
      translate="no"
    >
      <div className="flex items-center justify-center w-full sm:w-auto gap-1.5 text-[11px] sm:text-xs font-semibold whitespace-nowrap overflow-x-auto hide-scrollbar">
        {TOP_LANGUAGES.map((lang, idx) => {
          const isActive = currentLang === lang.code;
          return (
            <span key={lang.code} className="inline-flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => handleLanguageSelect(lang.code)}
                className={`transition-all cursor-pointer ${
                  isActive
                    ? theme === "amber"
                      ? "text-slate-950 font-black underline underline-offset-4 decoration-2"
                      : "text-amber-400 font-extrabold underline underline-offset-4 decoration-2"
                    : theme === "amber"
                      ? "text-slate-900/80 hover:text-slate-950 font-semibold"
                      : "text-slate-300 hover:text-amber-300 font-semibold"
                }`}
                title={lang.name}
              >
                {lang.label}
              </button>
              {idx < TOP_LANGUAGES.length - 1 && (
                <span
                  className={`${
                    theme === "amber" ? "text-amber-900/40" : "text-slate-600"
                  } font-bold select-none text-[10px]`}
                >
                  |
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function LanguageSelector({ variant = "header" }) {
  const { language, setLanguage: setContextLang, startTranslating, stopTranslating, supportedLanguages } = useLanguage();
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

  const handleLanguageSelect = (lang) => {
    setIsOpen(false);
    if (lang === language) return;

    const langInfo = TOP_LANGUAGES.find((l) => l.code === lang) || { code: lang, label: lang, name: lang };

    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-lang", lang);
    }

    startTranslating(lang, langInfo);
    setContextLang(lang);

    if (lang === "en") {
      clearAllGoogTransCookies();
      try {
        localStorage.setItem("grab_vendor_selected_language", "en");
      } catch {}

      const gtSelect = document.querySelector(".goog-te-combo");
      if (gtSelect) {
        gtSelect.value = "en";
        gtSelect.dispatchEvent(new Event("change", { bubbles: true }));
        gtSelect.selectedIndex = 0;
        gtSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }

      setTimeout(() => {
        window.location.reload();
      }, 200);
      return;
    }

    document.cookie = `googtrans=/en/${lang}; path=/; max-age=31536000; SameSite=Lax`;
    try {
      localStorage.setItem("grab_vendor_selected_language", lang);
    } catch {}

    const gtSelect = document.querySelector(".goog-te-combo");
    if (gtSelect) {
      if (gtSelect.value !== lang) {
        gtSelect.value = lang;
        gtSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    setTimeout(() => {
      stopTranslating();
    }, 700);
  };

  const currentLang = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];
  const isDark = variant === "dark" || variant === "dark-header";
  const forceDropdown = variant === "dropdown";
  const forceInline = variant === "inline";

  return (
    <div className="flex items-center notranslate" translate="no">
      {/* Desktop / Tablet Inline Switcher */}
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
                  onClick={() => handleLanguageSelect(lang.code)}
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
              className={`absolute right-0 mt-2 w-44 rounded-2xl shadow-xl border py-2 text-xs divide-y z-50 animate-in fade-in zoom-in-95 duration-100 ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-slate-200 divide-slate-800"
                  : "bg-white border-slate-200 text-slate-700 divide-slate-100"
              }`}
            >
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Select Language
              </div>
              <div className="py-1">
                {TOP_LANGUAGES.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? isDark
                            ? "bg-amber-500/10 text-amber-400 font-bold"
                            : "bg-amber-50 text-amber-900 font-bold"
                          : isDark
                            ? "hover:bg-slate-800 text-slate-300"
                            : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{lang.code.toUpperCase()}</span>
                        <span>{lang.label}</span>
                      </span>
                      {isSelected && (
                        <Check className={`w-3.5 h-3.5 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
