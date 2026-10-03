"use client";

import { useState, useMemo } from "react";
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
import { formatINR } from "@/lib/utils";
import { CreditCard, Filter } from "lucide-react";

const INITIAL_TRANSACTIONS = [
  {
    id: "TXN-9901",
    bookingId: "BK-8091",
    customer: "Priya Sundaram",
    amount: 5000,
    gateway: "Razorpay UPI",
    refNo: "pay_Rzp99120482",
    date: "2026-09-24 10:32 AM",
    status: "SUCCESS",
  },
  {
    id: "TXN-9902",
    bookingId: "BK-8092",
    customer: "Anand Mahadevan",
    amount: 1450,
    gateway: "HDFC Corporate Gateway",
    refNo: "hdfc_8841029104",
    date: "2026-09-24 09:18 AM",
    status: "SUCCESS",
  },
  {
    id: "TXN-9898",
    bookingId: "BK-8089",
    customer: "Vikramaditya Rao",
    amount: 8000,
    gateway: "ICICI Net Banking",
    refNo: "ici_5541092817",
    date: "2026-09-23 03:05 PM",
    status: "SUCCESS",
  },
  {
    id: "TXN-9892",
    bookingId: "BK-8085",
    customer: "Meenakshi Iyer",
    amount: 8900,
    gateway: "PayTM UPI",
    refNo: "ptm_2210948192",
    date: "2026-09-22 08:05 AM",
    status: "SUCCESS",
  },
  {
    id: "TXN-9885",
    bookingId: "BK-8077",
    customer: "Rajesh Kumar",
    amount: 3200,
    gateway: "Razorpay UPI",
    refNo: "pay_Rzp88419201",
    date: "2026-09-21 04:12 PM",
    status: "SUCCESS",
  },
  {
    id: "TXN-9880",
    bookingId: "BK-8070",
    customer: "Sneha Nair",
    amount: 6700,
    gateway: "HDFC Corporate Gateway",
    refNo: "hdfc_7719284102",
    date: "2026-09-20 11:45 AM",
    status: "SUCCESS",
  },
];

export default function AdminPaymentsPage() {
  const [transactions] = useState(INITIAL_TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [gatewayFilter, setGatewayFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const gateways = useMemo(() => {
    const set = new Set();
    transactions.forEach((t) => set.add(t.gateway));
    return Array.from(set);
  }, [transactions]);

  const filteredAndSortedTxns = useMemo(() => {
    let result = [...transactions];

    if (gatewayFilter !== "ALL") {
      result = result.filter((t) => t.gateway === gatewayFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.bookingId.toLowerCase().includes(q) ||
          t.customer.toLowerCase().includes(q) ||
          t.gateway.toLowerCase().includes(q) ||
          t.refNo.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === "amount") {
        valA = Number(valA);
        valB = Number(valB);
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [transactions, search, gatewayFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedTxns.length / pageSize) || 1;
  const paginatedTxns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedTxns.slice(start, start + pageSize);
  }, [filteredAndSortedTxns, currentPage, pageSize]);

  const totalSettled = useMemo(() => {
    return filteredAndSortedTxns.reduce((sum, t) => sum + (t.status === "SUCCESS" ? t.amount : 0), 0);
  }, [filteredAndSortedTxns]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Gateway Transactions"
        subtitle="Gateway reconciliation, UPI & card settlement ledger, and transaction IDs"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Payments" }]}
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
              placeholder="Search txn ID, booking, customer, ref #..."
              className="w-full sm:w-80"
            />

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={gatewayFilter}
                onChange={(e) => {
                  setGatewayFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              >
                <option value="ALL">All Gateways ({transactions.length})</option>
                {gateways.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end md:self-center">
            <div className="text-xs text-slate-500">
              Total Volume: <strong className="text-emerald-700">{formatINR(totalSettled)}</strong>
            </div>
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
                label="Transaction ID"
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
                columnKey="customer"
                label="Customer"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="gateway"
                label="Gateway / Mode"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead>Gateway Reference #</TableHead>
              <SortableHeader
                columnKey="amount"
                label="Amount"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="date"
                label="Timestamp"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTxns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-slate-800 text-sm">No Transactions Found</div>
                    <p className="text-xs text-slate-500 mt-1">
                      No payment gateway records match your filter criteria.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTxns.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <span className="font-mono font-bold text-xs text-slate-900">{t.id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-blue-600 font-semibold">{t.bookingId}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-800">{t.customer}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-700">{t.gateway}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-[11px] text-slate-500">{t.refNo}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-xs text-emerald-700">{formatINR(t.amount)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500">{t.date}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm" dot>
                      Settled
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {filteredAndSortedTxns.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredAndSortedTxns.length}
            pageSize={pageSize}
          />
        )}
      </Card>
    </div>
  );
}
