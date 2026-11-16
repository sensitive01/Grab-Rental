"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PageHeader({ title, subtitle, action, actions, breadcrumbs = [] }) {
  const actionContent = action || actions;
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        {breadcrumbs.length > 0 && (
          <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            {breadcrumbs.map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-blue-600 transition-colors hover:underline whitespace-nowrap"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-slate-800 whitespace-nowrap">{crumb.label}</span>
                )}
              </div>
            ))}
          </nav>
        )}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 break-words">
          {title}
        </h1>
        {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1 break-words">{subtitle}</p>}
      </div>
      {actionContent && <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">{actionContent}</div>}
    </div>
  );
}
