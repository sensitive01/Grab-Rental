"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  X, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Loader2, 
  Download,
  Inbox
} from "lucide-react";

/**
 * Helper to get nested object values by dot notation (e.g. 'customer.name')
 */
function getNestedValue(obj, path) {
  if (!obj || !path) return "";
  if (typeof path === "function") return path(obj);
  return path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : ""), obj);
}

/**
 * Universal Enterprise DataTable Component
 * 
 * Props:
 * - columns: Array<{ key, label, sortable, align, className, headerClassName, render, sortValue }>
 * - data: Array<any>
 * - keyField: string (default "id")
 * - loading: boolean
 * - searchPlaceholder: string
 * - searchKeys: Array<string> (fields to search on)
 * - defaultPageSize: number (default 10)
 * - pageSizeOptions: Array<number> (default [5, 10, 25, 50])
 * - filters: ReactNode (slot for custom filter dropdowns)
 * - actions: ReactNode (slot for action buttons next to search)
 * - exportFileName: string (if provided, enables CSV export button)
 * - emptyTitle: string
 * - emptyDescription: string
 * - renderMobileCard: (row, index) => ReactNode (optional mobile card layout)
 * - className: string
 */
export default function DataTable({
  columns = [],
  data = [],
  keyField = "id",
  loading = false,
  searchPlaceholder = "Search records...",
  searchKeys = [],
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  filters = null,
  actions = null,
  exportFileName = null,
  emptyTitle = "No records found",
  emptyDescription = "No data matched your criteria or search filters.",
  renderMobileCard = null,
  className = ""
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc"); // 'asc' | 'desc'
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when search or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize, data.length]);

  // Handle Sort Toggle
  const handleSort = (column) => {
    if (!column.sortable) return;
    const colKey = column.key;

    if (sortKey === colKey) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        // Reset sort
        setSortKey(null);
        setSortDirection("asc");
      }
    } else {
      setSortKey(colKey);
      setSortDirection("asc");
    }
  };

  // Filter Data
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase().trim();

    return data.filter((row) => {
      // If explicit searchKeys provided, check them
      if (searchKeys && searchKeys.length > 0) {
        return searchKeys.some((k) => {
          const val = getNestedValue(row, k);
          return String(val ?? "").toLowerCase().includes(q);
        });
      }

      // Otherwise, scan all columns with a key or sortValue
      return columns.some((col) => {
        if (!col.key && !col.sortValue) return false;
        const val = col.sortValue ? col.sortValue(row) : getNestedValue(row, col.key);
        return String(val ?? "").toLowerCase().includes(q);
      });
    });
  }, [data, searchQuery, searchKeys, columns]);

  // Sort Data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    const column = columns.find((c) => c.key === sortKey);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aVal = column.sortValue ? column.sortValue(a) : getNestedValue(a, sortKey);
      let bVal = column.sortValue ? column.sortValue(b) : getNestedValue(b, sortKey);

      // Handle nulls / undefined
      if (aVal === null || aVal === undefined) aVal = "";
      if (bVal === null || bVal === undefined) bVal = "";

      // Number comparison
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      // String comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      // Check if dates
      const aDate = Date.parse(aVal);
      const bDate = Date.parse(bVal);
      if (!isNaN(aDate) && !isNaN(bDate) && isNaN(aVal) && isNaN(bVal)) {
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }

      if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection, columns]);

  // Pagination Math
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedData = useMemo(() => {
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, startIndex, pageSize]);

  // Export to CSV
  const handleExportCSV = () => {
    if (!sortedData.length) return;
    const exportColumns = columns.filter((c) => c.key && c.label && c.key !== "actions");
    const headers = exportColumns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(",");
    
    const rows = sortedData.map((row) => {
      return exportColumns.map((c) => {
        let val = c.sortValue ? c.sortValue(row) : getNestedValue(row, c.key);
        if (val === null || val === undefined) val = "";
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${exportFileName || "export"}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate numbered pagination items with ellipses
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    if (safeCurrentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (safeCurrentPage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages);
    }
    return pages;
  }, [totalPages, safeCurrentPage]);

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden ${className}`}>
      
      {/* DataTable Controls Bar (Search, Filters, Actions) */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        
        {/* Left Side: Custom Filters Slot */}
        <div className="flex flex-wrap items-center gap-3">
          {filters && (
            <div className="flex items-center gap-2 flex-wrap">
              {filters}
            </div>
          )}
        </div>

        {/* Right Side: Live Search & Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-hidden focus:border-amber-500 shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {exportFileName && (
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={sortedData.length === 0}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
              title="Export filtered records to CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {actions}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs font-semibold text-slate-600">Loading records...</p>
        </div>
      ) : paginatedData.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-800">{emptyTitle}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {emptyDescription}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold text-amber-600 hover:underline inline-block mt-1"
            >
              Clear search filter
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Card View (if renderMobileCard provided) */}
          {renderMobileCard && (
            <div className="p-3.5 space-y-3 md:hidden divide-y divide-slate-100">
              {paginatedData.map((row, idx) => (
                <div key={row[keyField] ?? idx} className="pt-3 first:pt-0">
                  {renderMobileCard(row, startIndex + idx)}
                </div>
              ))}
            </div>
          )}

          {/* Desktop Table View (or default responsive table) */}
          <div className={`${renderMobileCard ? "hidden md:block" : "block"} overflow-x-auto`}>
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {columns.map((col, idx) => {
                    const isSorted = sortKey === col.key;
                    const canSort = col.sortable !== false && col.key;
                    const alignClass = 
                      col.align === "right" 
                        ? "text-right" 
                        : col.align === "center" 
                          ? "text-center" 
                          : "text-left";

                    return (
                      <th
                        key={col.key || idx}
                        onClick={() => canSort && handleSort(col)}
                        className={`py-3.5 px-4 select-none ${alignClass} ${
                          canSort ? "cursor-pointer hover:bg-slate-100/70 transition-colors" : ""
                        } ${col.headerClassName || ""}`}
                      >
                        <div
                          className={`inline-flex items-center gap-1.5 ${
                            col.align === "right" ? "justify-end w-full" : col.align === "center" ? "justify-center w-full" : ""
                          }`}
                        >
                          <span>{col.label}</span>
                          {canSort && (
                            <span className="shrink-0">
                              {isSorted ? (
                                sortDirection === "asc" ? (
                                  <ArrowUp className="w-3.5 h-3.5 text-amber-600 font-bold" />
                                ) : (
                                  <ArrowDown className="w-3.5 h-3.5 text-amber-600 font-bold" />
                                )
                              ) : (
                                <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 hover:opacity-100 transition-opacity" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((row, rowIdx) => (
                  <tr
                    key={row[keyField] ?? rowIdx}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {columns.map((col, colIdx) => {
                      const alignClass = 
                        col.align === "right" 
                          ? "text-right" 
                          : col.align === "center" 
                            ? "text-center" 
                            : "text-left";

                      return (
                        <td
                          key={col.key || colIdx}
                          className={`py-3.5 px-4 ${alignClass} ${col.className || ""}`}
                        >
                          {col.render
                            ? col.render(row, startIndex + rowIdx)
                            : getNestedValue(row, col.key)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* DataTable Footer: Pagination Controls, Page Size & Record Stats */}
      <div className="px-4 py-3 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        
        {/* Left Side: Show Entries & Info Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-semibold text-slate-500">Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-xs shadow-2xs focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="font-semibold text-slate-500">entries</span>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Info stats */}
          <div className="font-medium text-slate-500">
            Showing{" "}
            <span className="font-black text-slate-900">
              {totalItems === 0 ? 0 : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-black text-slate-900">
              {Math.min(startIndex + pageSize, totalItems)}
            </span>{" "}
            of{" "}
            <span className="font-black text-slate-900">{totalItems}</span> entries
            {totalItems !== data.length && (
              <span className="text-slate-400 ml-1">
                (filtered from {data.length} total)
              </span>
            )}
          </div>
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-1 select-none">
          
          {/* First Page */}
          <button
            type="button"
            disabled={safeCurrentPage <= 1}
            onClick={() => setCurrentPage(1)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="First Page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          {/* Prev Page */}
          <button
            type="button"
            disabled={safeCurrentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Numbered Page Buttons */}
          <div className="flex items-center gap-1 mx-1">
            {pageNumbers.map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1 text-slate-400 font-bold"
                  >
                    ...
                  </span>
                );
              }

              const isActive = p === safeCurrentPage;
              return (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`min-w-7 h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            type="button"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Last Page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
