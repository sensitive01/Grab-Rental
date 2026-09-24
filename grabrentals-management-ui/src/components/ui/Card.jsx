"use client";

import { cn } from "@/lib/utils";

export function Card({ children, className, title, subtitle, action, footer, noPadding = false, ...props }) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200/80 shadow-xs transition-shadow duration-200 hover:shadow-sm",
        className
      )}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            {title && <h3 className="font-semibold text-slate-900 text-sm tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(!noPadding && "p-5")}>{children}</div>
      {footer && (
        <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 rounded-b-xl text-xs text-slate-600 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
}

export function Badge({ children, variant = "neutral", dot = false, className, size = "md" }) {
  const variants = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    primary: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  const dots = {
    neutral: "bg-slate-400",
    primary: "bg-blue-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    purple: "bg-purple-500",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-md border",
        variants[variant] || variants.neutral,
        sizes[size] || sizes.md,
        className
      )}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dots[variant] || dots.neutral)}
        />
      )}
      {children}
    </span>
  );
}

export function NumberPlate({ registrationNumber, className, isCommercial = true }) {
  if (!registrationNumber) return <span className="text-slate-400 text-xs italic">Unassigned</span>;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded border border-slate-400 font-mono tracking-wider font-bold shadow-xs select-none",
        isCommercial ? "bg-amber-300 text-slate-900 border-amber-500" : "bg-white text-slate-900 border-slate-300",
        className
      )}
      style={{ fontSize: "11.5px", padding: "1px 6px" }}
      title={`Registration: ${registrationNumber}`}
    >
      <span className="flex items-center gap-0.5 mr-1 pr-1 border-r border-slate-900/30 text-[9px] uppercase font-sans text-blue-900 font-extrabold">
        IND
      </span>
      <span>{registrationNumber}</span>
    </div>
  );
}
