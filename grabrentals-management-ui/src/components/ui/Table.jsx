"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export function Table({ children, className }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <table className={cn("w-full text-left text-sm text-slate-700", className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className }) {
  return (
    <thead className={cn("bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200/80", className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }) {
  return <tbody className={cn("divide-y divide-slate-100 bg-white", className)}>{children}</tbody>;
}

export function TableRow({ children, className, onClick, isClickable = false }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "transition-colors",
        isClickable || onClick ? "cursor-pointer hover:bg-slate-50/80" : "hover:bg-slate-50/50",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className }) {
  return <th scope="col" className={cn("px-4 py-3.5 text-xs font-bold text-slate-700", className)}>{children}</th>;
}

export function TableCell({ children, className }) {
  return <td className={cn("px-4 py-3.5 text-sm whitespace-nowrap text-slate-700", className)}>{children}</td>;
}

export function Pagination({ currentPage = 1, totalPages = 1, onPageChange, totalItems = 0, pageSize = 10 }) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200/80 text-xs text-slate-600">
      <div>
        Showing <span className="font-semibold text-slate-900">{startItem}</span> to{" "}
        <span className="font-semibold text-slate-900">{endItem}</span> of{" "}
        <span className="font-semibold text-slate-900">{totalItems}</span> entries
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-3 py-1 font-medium text-slate-700">
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function Tabs({ tabs = [], activeTab, onTabChange, className }) {
  return (
    <div className={cn("flex items-center gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar", className)}>
      {tabs.map((tab) => {
        const id = typeof tab === "object" ? tab.id : tab;
        const label = typeof tab === "object" ? tab.label : tab;
        const count = typeof tab === "object" ? tab.count : undefined;
        const isActive = activeTab === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={cn(
              "px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-2 -mb-[1px]",
              isActive
                ? "border-blue-600 text-blue-600 font-bold bg-blue-50/40 rounded-t-md"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            )}
          >
            <span>{label}</span>
            {count !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.5 text-[10px] rounded-full font-bold",
                  isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search...", className }) {
  return (
    <div className={cn("relative w-full sm:w-64", className)}>
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
      />
    </div>
  );
}
