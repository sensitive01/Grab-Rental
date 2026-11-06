"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function LanguageLoadingOverlay() {
  const { isTranslating, targetLangInfo } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isTranslating) {
      setVisible(true);
    } else {
      // Small timeout for smooth fade-out
      const timer = setTimeout(() => {
        setVisible(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isTranslating]);

  // If not translating and not in preloading mode, render nothing
  const isPreloading = mounted && typeof document !== "undefined" && document.documentElement.classList.contains("lang-preloading");
  const shouldRender = visible || isTranslating || isPreloading;

  if (!shouldRender) return null;

  const targetLabel = targetLangInfo?.label || targetLangInfo?.name || "Selected Language";
  const targetName = targetLangInfo?.name && targetLangInfo.name !== targetLangInfo.label ? ` (${targetLangInfo.name})` : "";

  return (
    <div
      id="language-loading-overlay"
      className={`notranslate fixed inset-0 z-[99999] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-opacity duration-250 select-none ${
        isTranslating || isPreloading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      translate="no"
      aria-live="polite"
      aria-busy={isTranslating}
    >
      <div className="flex flex-col items-center max-w-sm text-center">
        {/* Brand Logo */}
        <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100 mb-5">
          <img
            src="/images/brand-logo.png"
            alt="Grab Rentals"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </div>

        {/* Circular Spinner */}
        <div className="relative w-10 h-10 mb-4">
          <div className="w-10 h-10 rounded-full border-3 border-blue-100 border-t-[#0082fe] animate-spin" />
        </div>

        {/* Title */}
        <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
          {targetLangInfo?.code === "en"
            ? "Switching to English..."
            : `Updating to ${targetLabel}${targetName}...`}
        </h2>

        {/* Subtitle */}
        <p className="text-xs text-slate-500 font-medium mt-1">
          Please wait a moment while the page updates
        </p>
      </div>
    </div>
  );
}

