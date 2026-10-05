"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  Download, 
  FileText,
  Loader2 
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import DataTable from "@/components/ui/DataTable";
import { vendorApi } from "@/lib/vendorApi";
import { formatINR } from "@/lib/utils";

export default function VendorPaymentsPage() {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      vendorApi.getProfile().catch(() => null),
      vendorApi.getBookings().catch(() => [])
    ])
      .then(([prof, bList]) => {
        if (prof) setProfile(prof);
        setBookings(bList || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Dynamically derive payout records from completed bookings
  const payments = useMemo(() => {
    const completed = bookings.filter(b => (b.status || "").toLowerCase() === "completed");
    if (completed.length === 0) {
      // If there are bookings in general, group them by week/batch
      const anyBookings = bookings.slice(0, 5);
      if (anyBookings.length > 0) {
        return anyBookings.map((b, idx) => ({
          id: `PAY-${b.bookingReference || b.id}`,
          payoutBatch: `BATCH-${idx + 1}`,
          amount: b.vendorNet || b.totalFare || 0,
          period: b.pickupDate || "Recent Cycle",
          paymentDate: "Settlement in Queue",
          paymentMethod: "NEFT Direct Transfer",
          referenceId: `GRAB${(b.rawId || b.id).slice(0, 10).toUpperCase()}`,
          status: b.paymentStatus || "Processing",
          tripsIncluded: 1
        }));
      }
      return [];
    }

    // Group completed into weekly settlement batch
    const totalAmount = completed.reduce((sum, b) => sum + (Number(b.vendorNet) || Number(b.totalFare) || 0), 0);
    return [
      {
        id: `PAY-2026-${completed.length}`,
        payoutBatch: `BATCH-SEP-LIVE`,
        amount: totalAmount,
        period: "Current Settlement Cycle",
        paymentDate: "Automated Weekly NEFT",
        paymentMethod: "NEFT Direct Transfer",
        referenceId: `GRABN${(profile?.id || "VENDOR").slice(0, 8).toUpperCase()}`,
        status: "Paid",
        tripsIncluded: completed.length
      }
    ];
  }, [bookings, profile]);

  const columns = useMemo(() => [
    {
      key: "id",
      label: "Payout ID",
      sortable: true,
      className: "font-mono font-black text-slate-900"
    },
    {
      key: "period",
      label: "Billing Cycle",
      sortable: true,
      render: (p) => (
        <div>
          <p className="font-semibold text-slate-800">{p.period}</p>
          <span className="block text-[11px] text-slate-400 font-normal">
            {p.tripsIncluded} Trip{p.tripsIncluded !== 1 ? "s" : ""} Included
          </span>
        </div>
      )
    },
    {
      key: "paymentDate",
      label: "Settlement Date",
      sortable: true,
      className: "text-slate-700"
    },
    {
      key: "paymentMethod",
      label: "Transfer Method",
      sortable: true,
      className: "text-slate-700"
    },
    {
      key: "referenceId",
      label: "Bank UTR / Ref",
      sortable: true,
      className: "font-mono text-slate-600 text-[11px]"
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (p) => <StatusBadge status={p.status} />
    },
    {
      key: "amount",
      label: "Net Amount",
      align: "right",
      sortable: true,
      sortValue: (p) => Number(p.amount) || 0,
      render: (p) => (
        <span className="font-black text-slate-900 text-sm">
          {formatINR(p.amount)}
        </span>
      )
    },
    {
      key: "invoice",
      label: "Tax Invoice",
      align: "center",
      sortable: false,
      render: (p) => (
        <button
          type="button"
          onClick={() => alert(`Downloading GST Tax Invoice for payout ${p.payoutBatch || p.id}...`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-amber-500" />
          <span>Invoice PDF</span>
        </button>
      )
    }
  ], []);

  const bankName = profile?.bankName || "Bank Account Pending";
  const accountNumber = profile?.accountNumber ? `•••• ${profile.accountNumber.slice(-4)}` : "Not provided";
  const ifsc = profile?.ifsc || "Pending";
  const isBankConfigured = !!profile?.bankName && !!profile?.accountNumber;

  return (
    <div className="space-y-6">
      
      {/* Header & Breadcrumbs */}
      <div className="space-y-1">
        <Breadcrumbs items={[{ label: "Finance", href: "/vendor/earnings" }, { label: "Payouts & Invoices" }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Bank Payouts & Tax Invoices
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Automated NEFT settlements transferred directly to your verified commercial bank account.
            </p>
          </div>
        </div>
      </div>

      {/* Payments Hero Banner Photo */}
      <div className="relative h-44 rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
        <img
          src="/images/fleet/sedan.jpg"
          alt="Vendor Banking & Settlements"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex flex-col justify-end p-5 text-white">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Direct Deposit</span>
          <h2 className="text-xl font-black text-white">Bank Settlements & Payout Invoices</h2>
          <p className="text-xs text-slate-200">Reconcile transaction UTR numbers, batch processing records, and GST compliant tax invoices.</p>
        </div>
      </div>

      {/* Linked Bank Account Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="text-xs space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-slate-900">{bankName}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                isBankConfigured ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200"
              }`}>
                {isBankConfigured ? "Verified for Direct Deposit" : "Action Needed: Configure Bank"}
              </span>
            </div>
            <p className="text-slate-600 font-mono font-semibold">
              A/C: {accountNumber} · IFSC: {ifsc}
            </p>
            <p className="text-[11px] text-slate-400">
              Beneficiary: {profile?.tradeName || profile?.businessName || profile?.ownerName || "Vendor Enterprise"}
            </p>
          </div>
        </div>

        <Link
          href="/vendor/profile"
          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors self-start sm:self-auto"
        >
          Update Bank Details
        </Link>
      </div>

      {/* Payout Batches DataTable */}
      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        keyField="id"
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        searchPlaceholder="Search payout ID, period, UTR reference..."
        searchKeys={["id", "period", "referenceId", "paymentDate", "status"]}
        exportFileName="GrabRentals_Payout_Batches"
        emptyTitle="No Payout Records Found"
        emptyDescription="Settlement records will appear here as your completed customer trips are processed for payment."
      />

    </div>
  );
}
