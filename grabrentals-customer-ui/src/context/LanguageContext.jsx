"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { translations, SUPPORTED_LANGUAGES } from "@/lib/i18n";

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
  supportedLanguages: SUPPORTED_LANGUAGES,
  isTranslating: false,
  targetLangInfo: null,
  startTranslating: () => {},
  stopTranslating: () => {},
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLangInfo, setTargetLangInfo] = useState(null);
  const safetyTimerRef = useRef(null);

  const stopTranslating = useCallback(() => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("lang-preloading");
    }
    setIsTranslating(false);
    setTargetLangInfo(null);
  }, []);

  const startTranslating = useCallback((langCode, langInfo = null) => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
    }
    setIsTranslating(true);
    setTargetLangInfo(langInfo || { code: langCode, label: langCode, name: langCode });

    // 1800ms safety timeout fallback so loader never gets stuck
    safetyTimerRef.current = setTimeout(() => {
      stopTranslating();
    }, 1800);
  }, [stopTranslating]);

  // On mount: check if a non-English language was preloaded from cookie
  useEffect(() => {
    try {
      const stored = localStorage.getItem("grab_selected_language");
      if (stored && translations[stored]) {
        setLanguageState(stored);
      }

      // Check googtrans cookie on client mount
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/(^| )googtrans=([^;]+)/);
        if (match && match[2] && match[2] !== "/en/en" && match[2] !== "en") {
          const langPart = match[2].split("/")[2] || match[2];
          if (langPart && langPart !== "en") {
            setIsTranslating(true);
            const foundLang = SUPPORTED_LANGUAGES.find((l) => l.code === langPart);
            setTargetLangInfo(foundLang || { code: langPart, label: langPart, name: langPart });

            // Watch for Google Translate class on <html> or timeout
            let checkCount = 0;
            const checkInterval = setInterval(() => {
              checkCount++;
              const isTranslated = document.documentElement.classList.contains("translated-ltr") ||
                                   document.documentElement.classList.contains("translated-rtl");
              if (isTranslated || checkCount >= 18) {
                clearInterval(checkInterval);
                setTimeout(() => {
                  stopTranslating();
                }, 200);
              }
            }, 100);

            return () => clearInterval(checkInterval);
          }
        }
      }
    } catch {}
  }, [stopTranslating]);

  const setLanguage = (langCode) => {
    if (translations[langCode]) {
      setLanguageState(langCode);
      try {
        localStorage.setItem("grab_selected_language", langCode);
      } catch {}
    }
  };

  const t = (key) => {
    if (!key) return "";
    const langDict = translations[language] || translations.en || {};
    if (langDict[key]) return langDict[key];
    if (translations.en && translations.en[key]) return translations.en[key];
    // Clean fallback: remove underscores and convert to title case
    return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
        isTranslating,
        targetLangInfo,
        startTranslating,
        stopTranslating,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
