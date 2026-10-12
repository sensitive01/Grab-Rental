"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { translations, SUPPORTED_LANGUAGES } from "@/lib/i18n";

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
  supportedLanguages: SUPPORTED_LANGUAGES,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("grab_selected_language");
      if (stored && translations[stored]) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLanguageState(stored);
      }
    } catch {}
  }, []);

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
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
