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

// Comprehensive multi-domain cookie clear helper: purges googtrans across all domain variations and paths
export const clearAllGoogTransCookies = () => {
  if (typeof document === "undefined") return;

  const hostname = window.location.hostname || "";
  const parts = hostname.split(".");
  const domains = ["", hostname, `.${hostname}`];

  // Include parent domains (e.g., .grabrentals.in, grabrentals.in)
  for (let i = 0; i < parts.length - 1; i++) {
    const parent = parts.slice(i).join(".");
    domains.push(parent);
    domains.push(`.${parent}`);
  }

  const paths = ["/", "/vendor", "/driver"];

  domains.forEach((d) => {
    paths.forEach((p) => {
      const dAttr = d ? `; domain=${d}` : "";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${p}${dAttr}; SameSite=Lax`;
      document.cookie = `googtrans=/en/en; path=${p}${dAttr}; SameSite=Lax`;
      document.cookie = `googtrans=; max-age=0; path=${p}${dAttr}; SameSite=Lax`;
    });
  });

  // Base host-only
  document.cookie = "googtrans=/en/en; path=/; SameSite=Lax";
  document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
};

// Strictly host-isolated cookie: NO domain wildcard so customer UI and vendor UI never cross-share
export const setGoogTransCookie = (lang) => {
  if (typeof document === "undefined") return;

  if (lang === "en" || !lang) {
    clearAllGoogTransCookies();
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

  // On mount: check localStorage as SINGLE SOURCE OF TRUTH
  useEffect(() => {
    try {
      const stored = localStorage.getItem("grab_vendor_selected_language");

      // CASE A: Stored is explicitly "en", or not set -> User wants English!
      if (!stored || stored === "en" || !translations[stored]) {
        setLanguageState("en");
        clearAllGoogTransCookies();
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-lang", "en");
          document.documentElement.setAttribute("lang", "en");
          document.documentElement.classList.remove("lang-preloading");
        }
        return;
      }

      // CASE B: Stored is an active non-English language -> User intentionally chose it
      setLanguageState(stored);
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-lang", stored);
        document.documentElement.setAttribute("lang", stored);
        setGoogTransCookie(stored);
      }
      setIsTranslating(true);
      const foundLang = SUPPORTED_LANGUAGES.find((l) => l.code === stored);
      setTargetLangInfo(foundLang || { code: stored, label: stored, name: stored });

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
    } catch {}
  }, [stopTranslating]);

  // Route change synchronization: whenever pathname changes in Next.js SPA navigation across vendor portal,
  // re-apply active non-English translation ONLY if language state is non-English!
  useEffect(() => {
    if (typeof document === "undefined") return;

    // If active language is English, NEVER resurrect a foreign language!
    if (language === "en") {
      clearAllGoogTransCookies();
      document.documentElement.setAttribute("data-lang", "en");
      document.documentElement.setAttribute("lang", "en");
      return;
    }

    // Active language is non-English -> Re-apply translation to newly mounted route's DOM
    setGoogTransCookie(language);
    document.documentElement.setAttribute("data-lang", language);
    document.documentElement.setAttribute("lang", language);

    const triggerGoogleTranslate = () => {
      const gtSelect = document.querySelector(".goog-te-combo");
      if (gtSelect) {
        if (gtSelect.value !== language) {
          gtSelect.value = language;
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
  }, [pathname, language]);

  const setLanguage = (langCode) => {
    if (langCode === "en" || !langCode) {
      setLanguageState("en");
      clearAllGoogTransCookies();
      try {
        localStorage.setItem("grab_vendor_selected_language", "en");
      } catch {}
    } else {
      setLanguageState(langCode);
      setGoogTransCookie(langCode);
      try {
        localStorage.setItem("grab_vendor_selected_language", langCode);
      } catch {}
    }
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
