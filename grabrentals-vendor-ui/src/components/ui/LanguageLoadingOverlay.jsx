"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Loader2 } from "lucide-react";

export default function LanguageLoadingOverlay() {
  const { isTranslating, targetLangInfo } = useLanguage();

  if (!isTranslating) return null;

  const langLabel = targetLangInfo?.label || targetLangInfo?.name || "selected language";

  return (
    <aside
      id="language-loading-overlay"
      aria-live="polite"
      aria-busy="true"
      aria-label={`Translating page to ${langLabel}`}
      className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-all duration-300 animate-in fade-in select-none notranslate"
      translate="no"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center gap-4 shadow-2xl max-w-sm w-full text-center">
        {/* Animated Brand Pulse / Spinner */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 animate-ping absolute" />
          <div className="w-16 h-16 rounded-2xl bg-slate-850 border border-slate-750 flex items-center justify-center shadow-inner relative z-10">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        </div>

        {/* Messaging */}
        <div className="space-y-1.5">
          <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
            Changing Language...
          </h2>
          <p className="text-xs sm:text-sm font-bold text-amber-400">
            Translating to <span className="underline underline-offset-2">{langLabel}</span>
          </p>
          <p className="text-[11px] text-slate-400 font-medium pt-1">
            Applying regional fleet terminology & translations
          </p>
        </div>

        {/* Micro loader progress bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
          <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full w-2/3 animate-pulse" />
        </div>
      </div>
    </aside>
  );
}

