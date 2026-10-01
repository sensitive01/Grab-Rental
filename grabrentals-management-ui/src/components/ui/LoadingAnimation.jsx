"use client";

import { Car, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingAnimation({
  title = "Loading data...",
  subtitle = "Fetching live records from database...",
  type = "operations",
  minHeight = "min-h-[380px]",
  className = "",
  inline = false,
}) {
  const Icon = type === "admin" ? ShieldCheck : Car;

  if (inline) {
    return (
      <div className={cn("flex items-center justify-center gap-3 py-8 text-slate-500", className)}>
        <div className="relative flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-amber-500 animate-spin" />
        </div>
        <span className="text-xs font-medium text-slate-600 animate-pulse">{title}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs",
        minHeight,
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Ambient pulse halo */}
        <div className="absolute w-24 h-24 rounded-full bg-amber-500/10 animate-ping" />
        <div className="absolute w-16 h-16 rounded-full bg-amber-500/20 animate-pulse" />
        {/* Spinning dual rings */}
        <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-amber-500 border-r-amber-500 animate-spin" />
        <div className="absolute">
          <Icon className="w-6 h-6 text-amber-600 animate-pulse" />
        </div>
      </div>

      <h3 className="mt-6 text-base font-bold text-slate-900 tracking-tight">
        {title}
      </h3>
      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-500 max-w-sm">
          {subtitle}
        </p>
      )}

      {/* Progress pulse dots */}
      <div className="mt-5 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

export default LoadingAnimation;
