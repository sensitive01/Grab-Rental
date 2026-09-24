"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { formatINR } from "@/lib/utils";
import { CreditCard, CheckCircle2 } from "lucide-react";

const TRANSACTIONS = [
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
];

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Gateway Transactions"
        subtitle="Gateway reconciliation, UPI & card settlement ledger, and transaction IDs"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Payments" }]}
      />

      <Card noPadding>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Gateway / Mode</TableHead>
              <TableHead>Gateway Reference #</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TRANSACTIONS.map((t) => (
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
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
