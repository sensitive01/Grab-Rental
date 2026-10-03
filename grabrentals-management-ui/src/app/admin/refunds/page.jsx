"use client";

import { useState, useEffect, useMemo } from "react";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { formatINR } from "@/lib/utils";
import { RotateCcw, CheckCircle2, ShieldAlert, Filter } from "lucide-react";

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [approvedAmount, setApprovedAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [toast, setToast] = useState(null);

  // DataTable State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });

  async function loadRefunds() {
    try {
      const res = await adminApi.getRefunds();
      setRefunds(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRefunds();
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  async function handleProcessRefund(e) {
    e.preventDefault();
    if (!selectedRefund) return;
    try {
      await adminApi.processRefund(selectedRefund.id, Number(approvedAmount), notes);
      setToast({
        type: "success",
        message: `Refund of ${formatINR(approvedAmount)} authorized for ${selectedRefund.customerName}`,
      });
      setSelectedRefund(null);
      loadRefunds();
    } catch {
      setToast({ type: "error", message: "Failed to process refund" });
    }
  }

  const filteredAndSortedRefunds = useMemo(() => {
    let result = [...refunds];

    if (statusFilter !== "ALL") {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.id?.toLowerCase().includes(q) ||
          r.bookingId?.toLowerCase().includes(q) ||
          r.customerName?.toLowerCase().includes(q) ||
          r.reason?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === "approvedRefund" || sortConfig.key === "originalFare" || sortConfig.key === "cancellationFee") {
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
  }, [refunds, search, statusFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedRefunds.length / pageSize) || 1;
  const paginatedRefunds = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedRefunds.slice(start, start + pageSize);
  }, [filteredAndSortedRefunds, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="Refund Authorization Queue"
        subtitle="Review cancellation penalties, approve payout reversals, and audit reasons"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Refunds" }]}
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
              placeholder="Search refund ID, booking ID, customer..."
              className="w-full sm:w-80"
            />

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              >
                <option value="ALL">All Statuses ({refunds.length})</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <span className="text-xs text-slate-500">
              Showing <strong>{filteredAndSortedRefunds.length}</strong> requests
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
                label="Refund ID"
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
                columnKey="customerName"
                label="Customer"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="originalFare"
                label="Original Fare"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead>Cancellation Fee</TableHead>
              <SortableHeader
                columnKey="approvedRefund"
                label="Refund Amount"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead>Reason</TableHead>
              <SortableHeader
                columnKey="status"
                label="Status"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                  Loading refund requests...
                </TableCell>
              </TableRow>
            ) : paginatedRefunds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-slate-800 text-sm">No Refunds Found</div>
                    <p className="text-xs text-slate-500 mt-1">
                      No refund records match your search or filter criteria.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRefunds.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <span className="font-mono font-bold text-xs text-slate-900">{r.id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-blue-600 font-semibold">{r.bookingId}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-900">{r.customerName}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-700">{formatINR(r.originalFare)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-rose-600 font-medium">{formatINR(r.cancellationFee)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-xs text-emerald-700">{formatINR(r.approvedRefund)}</span>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-slate-600 max-w-xs truncate">{r.reason}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.status === "COMPLETED" ? "success" : "warning"} size="sm">
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status === "PROCESSING" ? (
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => {
                          setSelectedRefund(r);
                          setApprovedAmount(r.approvedRefund);
                          setNotes(r.reason);
                        }}
                      >
                        Authorize Payout
                      </Button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Reversed</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!loading && filteredAndSortedRefunds.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredAndSortedRefunds.length}
            pageSize={pageSize}
          />
        )}
      </Card>

      {/* Modal for processing refund */}
      <Modal
        isOpen={!!selectedRefund}
        onClose={() => setSelectedRefund(null)}
        title="Authorize Refund Payout"
        subtitle={`Booking: ${selectedRefund?.bookingId} • Customer: ${selectedRefund?.customerName}`}
      >
        <form onSubmit={handleProcessRefund} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              Authorizing this refund will automatically trigger an escrow payout reversal to the customer&apos;s source payment method.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-500">Original Fare</span>
              <div className="text-sm font-bold text-slate-900">{formatINR(selectedRefund?.originalFare || 0)}</div>
            </div>
            <div>
              <span className="text-xs text-slate-500">Cancellation Penalty</span>
              <div className="text-sm font-bold text-rose-600">{formatINR(selectedRefund?.cancellationFee || 0)}</div>
            </div>
          </div>

          <Input
            label="Approved Refund Amount (₹)"
            type="number"
            required
            value={approvedAmount}
            onChange={(e) => setApprovedAmount(e.target.value)}
          />

          <Textarea
            label="Audit Notes / Settlement Justification"
            required
            placeholder="Explain why this refund is authorized..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedRefund(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={CheckCircle2}>
              Confirm Authorization
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
