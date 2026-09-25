"use client";

import { useMemo } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  Download, 
  FileText 
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import DataTable from "@/components/ui/DataTable";
import { mockPayments, currentVendor } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";

export default function VendorPaymentsPage() {
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
            {p.tripsIncluded} Trips Included
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
          onClick={() => alert(`Downloading GST Tax Invoice for payout batch ${p.payoutBatch || p.id}...`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-amber-500" />
          <span>Invoice PDF</span>
        </button>
      )
    }
  ], []);

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
              Weekly automated NEFT settlements transferred directly to your verified bank account.
            </p>
          </div>
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
              <span className="font-black text-sm text-slate-900">{currentVendor.bankDetails.bankName}</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Verified for Direct Deposit
              </span>
            </div>
            <p className="text-slate-600 font-mono font-semibold">
              A/C: {currentVendor.bankDetails.accountNumber} · IFSC: {currentVendor.bankDetails.ifsc}
            </p>
            <p className="text-[11px] text-slate-400">
              Beneficiary: {currentVendor.bankDetails.accountName} ({currentVendor.bankDetails.branch})
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
        data={mockPayments}
        keyField="id"
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        searchPlaceholder="Search payout ID, period, UTR reference..."
        searchKeys={["id", "period", "referenceId", "paymentDate", "status"]}
        exportFileName="GrabRentals_Payout_Batches"
        emptyTitle="No Payout Records Found"
        emptyDescription="Settlement records will appear here after your first weekly payment cycle."
      />

    </div>
  );
}
