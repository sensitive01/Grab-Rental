"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const Button = forwardRef(function Button(
  {
    children,
    className,
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled = false,
    type = "button",
    icon: Icon,
    iconPosition = "left",
    ...props
  },
  ref
) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-sm focus:ring-blue-500",
    secondary:
      "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs focus:ring-slate-400",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500",
    amber:
      "bg-amber-600 hover:bg-amber-700 text-white shadow-sm focus:ring-amber-500",
    emerald:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300",
    outline:
      "bg-transparent hover:bg-blue-50 text-blue-600 border border-blue-600 focus:ring-blue-500",
    dark:
      "bg-slate-900 hover:bg-slate-800 text-white shadow-sm focus:ring-slate-900",
  };

  const sizes = {
    xs: "text-xs px-2.5 py-1 gap-1",
    sm: "text-xs font-semibold px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2.5",
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!isLoading && Icon && iconPosition === "left" && (
        <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === "right" && (
        <Icon className="w-4 h-4 shrink-0" />
      )}
    </button>
  );
});
