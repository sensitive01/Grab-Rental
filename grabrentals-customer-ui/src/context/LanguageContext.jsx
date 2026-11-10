"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
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

const setGoogTransCookie = (lang) => {
  if (typeof document === "undefined") return;

  // Strictly host-isolated: NO domain wildcard so customer UI and vendor UI never cross-share
  if (lang === "en" || !lang) {
    document.cookie = "googtrans=/en/en; path=/; SameSite=Lax";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  } else {
    document.cookie = `googtrans=/en/${lang}; path=/; max-age=31536000; SameSite=Lax`;
  }
};

export function LanguageProvider({ children }) {
  const pathname = usePathname();
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

  // On mount: check if a non-English language was preloaded from cookie or localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("grab_selected_language");
      if (stored && translations[stored]) {
        setLanguageState(stored);
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-lang", stored);
          document.documentElement.setAttribute("lang", stored);
        }
      }

      // Check googtrans cookie on client mount
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/(^| )googtrans=([^;]+)/);
        if (match && match[2] && match[2] !== "/en/en" && match[2] !== "en") {
          const langPart = match[2].split("/")[2] || match[2];
          if (langPart && langPart !== "en") {
            document.documentElement.setAttribute("data-lang", langPart);
            document.documentElement.setAttribute("lang", langPart);
            if (translations[langPart]) {
              setLanguageState(langPart);
            }
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

  // Route change synchronization: whenever pathname changes in Next.js SPA navigation,
  // re-apply active non-English translation to the newly mounted route's DOM!
  useEffect(() => {
    if (typeof document === "undefined") return;

    let activeLang = language;
    if (!activeLang || activeLang === "en") {
      try {
        const stored = localStorage.getItem("grab_selected_language");
        if (stored && translations[stored]) {
          activeLang = stored;
        }
      } catch {}
    }

    if (activeLang && activeLang !== "en") {
      document.documentElement.setAttribute("data-lang", activeLang);
      document.documentElement.setAttribute("lang", activeLang);

      // Give Next.js a short moment (120ms) to mount new page DOM before triggering Google Translate
      const timer = setTimeout(() => {
        const gtSelect = document.querySelector(".goog-te-combo");
        if (gtSelect) {
          if (gtSelect.value !== activeLang) {
            gtSelect.value = activeLang;
          }
          gtSelect.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }, 120);

      return () => clearTimeout(timer);
    }
  }, [pathname, language]);

  const setLanguage = (langCode) => {
    const validLang = translations[langCode] ? langCode : "en";
    setLanguageState(validLang);
    try {
      if (validLang === "en") {
        localStorage.removeItem("grab_selected_language");
      } else {
        localStorage.setItem("grab_selected_language", validLang);
      }
    } catch {}

    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-lang", validLang);
      document.documentElement.setAttribute("lang", validLang);
      setGoogTransCookie(validLang);
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
