"use client";

import { useState, useEffect, useMemo } from "react";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  SortableHeader,
  Pagination,
  SearchInput,
} from "@/components/ui/Table";
import { Star, Filter } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // DataTable State
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });

  async function loadData() {
    try {
      const res = await adminApi.getReviews();
      setReviews(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];

    if (ratingFilter !== "ALL") {
      result = result.filter((r) => r.rating === Number(ratingFilter));
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.customerName?.toLowerCase().includes(q) ||
          r.bookingId?.toLowerCase().includes(q) ||
          r.comment?.toLowerCase().includes(q) ||
          r.id?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === "rating") {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [reviews, search, ratingFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedReviews.length / pageSize) || 1;
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedReviews.slice(start, start + pageSize);
  }, [filteredAndSortedReviews, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Reviews & Ratings"
        subtitle="Customer satisfaction feedback, driver reviews, and vehicle condition ratings"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Reviews" }]}
      />

      <Card noPadding>
        {/* DataTable Controls Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search by customer, booking ID, comment..."
              className="w-full sm:w-80"
            />

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={ratingFilter}
                onChange={(e) => {
                  setRatingFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              >
                <option value="ALL">All Ratings ({reviews.length})</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <span className="text-xs text-slate-500">
              Showing <strong>{filteredAndSortedReviews.length}</strong> reviews
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 font-medium focus:outline-none"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader
                columnKey="id"
                label="Review ID"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="customerName"
                label="Customer"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="bookingId"
                label="Booking ID"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="rating"
                label="Rating Score"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead>Customer Comment</TableHead>
              <SortableHeader
                columnKey="createdAt"
                label="Date Logged"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  Loading reviews...
                </TableCell>
              </TableRow>
            ) : paginatedReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                      <Star className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-slate-800 text-sm">No Reviews Found</div>
                    <p className="text-xs text-slate-500 mt-1">
                      No customer reviews match your search or rating filter.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedReviews.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <span className="font-mono font-bold text-xs text-slate-900">{r.id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-xs text-slate-900">{r.customerName}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-blue-600 font-semibold">{r.bookingId}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: r.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-700">({r.rating}.0)</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-slate-700 italic max-w-md line-clamp-2">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500">{r.createdAt}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm">{r.status || "PUBLISHED"}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!loading && filteredAndSortedReviews.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredAndSortedReviews.length}
            pageSize={pageSize}
          />
        )}
      </Card>
    </div>
  );
}
