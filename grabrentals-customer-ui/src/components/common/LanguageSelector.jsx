"use client";

import React, { useState, useEffect } from "react";
import { Globe } from "lucide-react";

export const GOOGLE_LANGUAGES = [
  { code: "en", label: "English", name: "English" },
  { code: "kn", label: "ಕನ್ನಡ", name: "Kannada" },
  { code: "ta", label: "தமிழ்", name: "Tamil" },
  { code: "te", label: "తెలుగు", name: "Telugu" },
  { code: "hi", label: "हिंदी", name: "Hindi" },
];

const LanguageSelector = ({ variant = "links", className = "" }) => {
  const getLanguageCookie = () => {
    if (typeof document === "undefined") return "en";
    const match = document.cookie.match(new RegExp("(^| )googtrans=([^;]+)"));
    if (match && match[2]) {
      const parts = match[2].split("/");
      return parts[2] || "en";
    }
    return "en";
  };

  const [currentLang, setCurrentLang] = useState("en");

  useEffect(() => {
    setCurrentLang(getLanguageCookie());
  }, []);

  useEffect(() => {
    const applyTranslation = () => {
      const gtSelect = document.querySelector(".goog-te-combo");
      if (gtSelect && currentLang !== "en") {
        gtSelect.value = currentLang;
        gtSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };
    applyTranslation();
    const timer = setTimeout(applyTranslation, 500);
    return () => clearTimeout(timer);
  }, [currentLang]);

  const handleLanguageSelect = (lang) => {
    setCurrentLang(lang);

    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

    if (lang === "en") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      if (!isLocalhost && hostname) {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname};`;
      }
    } else {
      document.cookie = `googtrans=/en/${lang}; path=/;`;
      if (!isLocalhost && hostname) {
        document.cookie = `googtrans=/en/${lang}; path=/; domain=.${hostname};`;
      }
    }

    const gtSelect = document.querySelector(".goog-te-combo");
    if (gtSelect) {
      gtSelect.value = lang === "en" ? "en" : lang;
      gtSelect.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
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
      <span className="text-[11px] sm:text-xs font-bold text-slate-600">
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
