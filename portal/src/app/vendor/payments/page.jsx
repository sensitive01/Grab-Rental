"use client";

import Link from "next/link";
import { 
  CreditCard, 
  Download, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck 
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import { mockPayments, currentVendor } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";

export default function VendorPaymentsPage() {
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

      {/* Payout Batches Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 tracking-tight">
            Payout Settlement Batches
          </h2>
          <span className="text-xs text-slate-400 font-medium">Auto-settled weekly on Fridays</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Payout ID</th>
                <th className="py-3.5 px-4">Billing Cycle</th>
                <th className="py-3.5 px-4">Settlement Date</th>
                <th className="py-3.5 px-4">Transfer Method</th>
                <th className="py-3.5 px-4">Bank UTR / Ref</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Net Amount</th>
                <th className="py-3.5 px-4 text-center">Tax Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-black font-mono text-slate-900">
                    {p.id}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-800">
                    {p.period}
                    <span className="block text-[11px] text-slate-400 font-normal">
                      {p.tripsIncluded} Trips Included
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-700">{p.paymentDate}</td>
                  <td className="py-4 px-4 text-slate-700">{p.paymentMethod}</td>
                  <td className="py-4 px-4 font-mono text-slate-600 text-[11px]">{p.referenceId}</td>
                  <td className="py-4 px-4"><StatusBadge status={p.status} /></td>
                  <td className="py-4 px-4 text-right font-black text-slate-900 text-sm">
                    {formatINR(p.amount)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => alert(`Downloading GST Tax Invoice for payout batch ${p.payoutBatch}...`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" /> Invoice PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
