"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PageHeader({ title, subtitle, action, breadcrumbs = [] }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {breadcrumbs.length > 0 && (
          <nav className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
            {breadcrumbs.map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-blue-600 transition-colors hover:underline"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-slate-800">{crumb.label}</span>
                )}
              </div>
            ))}
          </nav>
        )}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
    </div>
  );
}
