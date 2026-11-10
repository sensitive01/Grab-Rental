"use client";

import React, { useState, useEffect, useRef } from "react";
import { Globe } from "lucide-react";
import { useLanguage, clearAllGoogTransCookies } from "@/context/LanguageContext";

export const GOOGLE_LANGUAGES = [
  { code: "en", label: "English", name: "English" },
  { code: "kn", label: "ಕನ್ನಡ", name: "Kannada" },
  { code: "ta", label: "தமிழ்", name: "Tamil" },
  { code: "te", label: "తెలుగు", name: "Telugu" },
  { code: "hi", label: "हिंदी", name: "Hindi" },
  { code: "ml", label: "മലയാളം", name: "Malayalam" },
];

const LanguageSelector = ({ variant = "links", className = "" }) => {
  const { language, startTranslating, stopTranslating, setLanguage: setContextLang } = useLanguage();
  const observerRef = useRef(null);

  const getLanguageCookie = () => {
    if (typeof document === "undefined") return "en";
    try {
      const stored = localStorage.getItem("grab_selected_language");
      if (stored) return stored;
    } catch {}
    const match = document.cookie.match(new RegExp("(^| )googtrans=([^;]+)"));
    if (match && match[2]) {
      const parts = match[2].split("/");
      return parts[2] || "en";
    }
    return "en";
  };

  const [currentLang, setCurrentLang] = useState(() => language || getLanguageCookie());

  // On mount and whenever language changes, sync currentLang
  useEffect(() => {
    const savedLang = language || getLanguageCookie();
    setCurrentLang(savedLang);
  }, [language]);

  const handleLanguageSelect = (lang) => {
    if (lang === currentLang) return;

    const langInfo = GOOGLE_LANGUAGES.find((l) => l.code === lang) || { code: lang, label: lang, name: lang };
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-lang", lang);
    }
    startTranslating(lang, langInfo);
    setContextLang(lang);
    setCurrentLang(lang);

    // Strictly host-isolated: NO domain wildcard so customer UI and vendor UI never cross-share
    if (lang === "en") {
      clearAllGoogTransCookies();
      try {
        localStorage.setItem("grab_selected_language", "en");
      } catch {}

      const gtSelect = document.querySelector(".goog-te-combo");
      if (gtSelect) {
        gtSelect.value = "en";
        gtSelect.dispatchEvent(new Event("change", { bubbles: true }));
        gtSelect.selectedIndex = 0;
        gtSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }

      // Clean reload to restore pristine English DOM without Google Translate tags
      setTimeout(() => {
        window.location.reload();
      }, 200);
      return;
    }

    // Set isolated translation cookie for target language
    document.cookie = `googtrans=/en/${lang}; path=/; max-age=31536000; SameSite=Lax`;
    try {
      localStorage.setItem("grab_selected_language", lang);
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

    // Set up MutationObserver to detect when translation DOM updates finish
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
      setTimeout(() => {
        stopTranslating();
      }, 250);
    };

    if (typeof MutationObserver !== "undefined") {
      observerRef.current = new MutationObserver(() => {
        const isTranslated =
          document.documentElement.classList.contains("translated-ltr") ||
          document.documentElement.classList.contains("translated-rtl");
        if (isTranslated) {
          if (settleTimer) clearTimeout(settleTimer);
          settleTimer = setTimeout(cleanup, 250);
        }
      });

      observerRef.current.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
        childList: true,
        subtree: true,
      });
    }

    // Safety fallback: always dismiss after 1200ms
    setTimeout(cleanup, 1200);
  };

  // 1. Classic Horizontal Text Links separated by "|" (like as before in top blue bar)
  if (variant === "links" || variant === "topbar") {
    return (
      <div
        className={`notranslate flex items-center justify-center w-full md:w-auto gap-1.5 text-[11px] sm:text-xs font-semibold shrink-0 md:ml-auto md:pl-4 md:border-l border-white/30 whitespace-nowrap overflow-x-auto hide-scrollbar ${className}`}
        translate="no"
      >
        {GOOGLE_LANGUAGES.map((lang, idx) => {
          const isActive = currentLang === lang.code;
          return (
            <span key={lang.code} className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleLanguageSelect(lang.code)}
                className={`transition-all cursor-pointer ${
                  isActive
                    ? "text-yellow-300 font-black underline underline-offset-4 decoration-2"
                    : "text-white/90 hover:text-white font-semibold"
                }`}
                title={lang.name}
              >
                {lang.label}
              </button>
              {idx < GOOGLE_LANGUAGES.length - 1 && (
                <span className="text-white/40 font-bold select-none text-[10px]">|</span>
              )}
            </span>
          );
        })}
      </div>
    );
  }

  // 2. Mobile Drawer Pills Grid
  if (variant === "pills") {
    return (
      <div className={`notranslate flex flex-wrap gap-1.5 ${className}`} translate="no">
        {GOOGLE_LANGUAGES.map((lang) => {
          const isActive = currentLang === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageSelect(lang.code)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#0082fe] text-white font-black shadow-xs ring-2 ring-[#0082fe]/30"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
              title={lang.name}
            >
              {lang.label}
            </button>
          );
        })}
      </div>
    );
  }

  // 3. Dropdown UI (<select>)
  return (
    <div
      className={`notranslate inline-flex items-center gap-1.5 ${className}`}
      translate="no"
    >
      <Globe className="w-3.5 h-3.5 shrink-0 text-slate-500" />
      <span className="hidden sm:inline text-[11px] sm:text-xs font-bold text-slate-600">
        Language:
      </span>
      <select
        value={currentLang}
        onChange={(e) => handleLanguageSelect(e.target.value)}
        className="text-xs font-bold rounded-lg px-2 py-1 outline-none cursor-pointer transition-all border bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-2xs focus:border-[#0082fe] focus:ring-1 focus:ring-[#0082fe]"
        aria-label="Select website language"
      >
        {GOOGLE_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
