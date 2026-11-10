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

// Strictly host-isolated cookie: NO domain wildcard so customer UI and vendor UI never cross-share
const setGoogTransCookie = (lang) => {
  if (typeof document === "undefined") return;

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

  // On mount: check if a non-English language was preloaded from vendor-isolated storage or cookie
  useEffect(() => {
    try {
      const stored = localStorage.getItem("grab_vendor_selected_language");
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

  // Route change synchronization: whenever pathname changes in Next.js SPA navigation across vendor portal,
  // re-apply active non-English translation to the newly mounted route's DOM!
  useEffect(() => {
    if (typeof document === "undefined") return;

    // Check if currently translated to non-English
    const match = document.cookie.match(/(^| )googtrans=([^;]+)/);
    const activeCookie = match?.[2];
    const isTargetNonEnglish = activeCookie && activeCookie !== "/en/en" && activeCookie !== "en";
    const currentCode = isTargetNonEnglish ? (activeCookie.split("/")[2] || activeCookie) : language;

    if (currentCode && currentCode !== "en") {
      setGoogTransCookie(currentCode);
      document.documentElement.setAttribute("data-lang", currentCode);
      document.documentElement.setAttribute("lang", currentCode);

      const triggerGoogleTranslate = () => {
        const gtSelect = document.querySelector(".goog-te-combo");
        if (gtSelect) {
          if (gtSelect.value !== currentCode) {
            gtSelect.value = currentCode;
            gtSelect.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
      };

      triggerGoogleTranslate();
      const retry1 = setTimeout(triggerGoogleTranslate, 150);
      const retry2 = setTimeout(triggerGoogleTranslate, 400);

      return () => {
        clearTimeout(retry1);
        clearTimeout(retry2);
      };
    }
  }, [pathname, language]);

  const setLanguage = (langCode) => {
    setLanguageState(langCode);
    setGoogTransCookie(langCode);

    try {
      if (langCode === "en") {
        localStorage.removeItem("grab_vendor_selected_language");
      } else {
        localStorage.setItem("grab_vendor_selected_language", langCode);
      }
    } catch {}
  };

  const t = (key) => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
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
