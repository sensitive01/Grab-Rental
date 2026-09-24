"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  CreditCard, 
  Calendar, 
  Download, 
  ArrowUpRight, 
  ChevronRight, 
  ShieldCheck, 
  FileText 
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { AreaLineChart, BarChart } from "@/components/ui/Charts";
import { mockEarningsData, mockBookings } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";

export default function VendorEarningsPage() {
  const chartData = mockEarningsData.monthlyRevenue.map(m => ({
    label: m.month,
    value: m.net,
    subtitle: `Gross: ₹${m.gross.toLocaleString()}`
  }));

  const vehicleBarData = mockEarningsData.vehicleRevenueBreakdown.map(v => ({
    label: v.model.split(" ")[0] + " (" + v.model.split("(")[1],
    value: v.earnings
  }));

  return (
    <div className="space-y-6">
      
      {/* Header & Breadcrumbs */}
      <div className="space-y-1">
        <Breadcrumbs items={[{ label: "Finance", href: "/vendor/earnings" }, { label: "Earnings" }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Earnings & Revenue Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Transparent tracking of gross fares, platform commissions, and net bank payouts.
            </p>
          </div>
          <Link
            href="/vendor/payments"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <CreditCard className="w-4 h-4" /> View Payout Batches
          </Link>
        </div>
      </div>

      {/* 5 Financial Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total Lifetime Net"
          value={formatINR(mockEarningsData.totalEarnings)}
          trend="+18.4%"
          trendPositive={true}
          subtitle="After 15% platform commission"
        />
        <StatCard
          title="This Month (Sep)"
          value={formatINR(mockEarningsData.thisMonth)}
          subtitle="35 Completed Trips"
        />
        <StatCard
          title="This Week"
          value={formatINR(mockEarningsData.thisWeek)}
          subtitle="Current payout cycle"
        />
        <StatCard
          title="Pending Payout"
          value={formatINR(mockEarningsData.pendingPayout)}
          subtitle="Scheduled this Friday"
        />
        <StatCard
          title="Paid & Settled"
          value={formatINR(mockEarningsData.paidAmount)}
          subtitle="Direct bank transfers"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Monthly Net Revenue */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black text-slate-900">Monthly Net Revenue (₹ INR)</h2>
              <p className="text-xs text-slate-500">Net vendor earnings past 6 months</p>
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
              Avg ₹94,500 / mo
            </span>
          </div>

          <AreaLineChart data={chartData} height={210} strokeColor="#f59e0b" />
        </div>

        {/* Chart 2: Vehicle Revenue Contribution */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black text-slate-900">Vehicle Revenue Contribution</h2>
              <p className="text-xs text-slate-500">Earnings breakdown by vehicle model</p>
            </div>
            <span className="text-xs font-bold text-slate-500">Lifetime Revenue</span>
          </div>

          <BarChart data={vehicleBarData} height={190} barColor="#0284c7" />
        </div>

      </div>

      {/* Trip Payout Transactions Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Trip Settlement Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Trip-by-trip commission deductions and net payout breakdown
            </p>
          </div>
          <button
            onClick={() => alert("Downloading CSV statement...")}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" /> Export Excel / CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Booking ID</th>
                <th className="py-3.5 px-4">Trip Date</th>
                <th className="py-3.5 px-4">Customer & Route</th>
                <th className="py-3.5 px-4 text-right">Gross Fare</th>
                <th className="py-3.5 px-4 text-right text-rose-600">Platform Fee (15%)</th>
                <th className="py-3.5 px-4 text-right">Net Payout</th>
                <th className="py-3.5 px-4">Payout Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-black font-mono text-slate-900">
                    <Link href={`/vendor/bookings/${b.id}`} className="text-amber-600 hover:underline">
                      #{b.id}
                    </Link>
                  </td>
                  <td className="py-4 px-4 text-slate-600">{b.pickupDate}</td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-slate-900">{b.customer.name}</p>
                    <p className="text-[11px] text-slate-500">{b.pickup} ➔ {b.drop}</p>
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-slate-700">
                    {formatINR(b.estimatedAmount)}
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-rose-600">
                    -{formatINR(b.platformFee)}
                  </td>
                  <td className="py-4 px-4 text-right font-black text-slate-900">
                    {formatINR(b.vendorNet)}
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={b.status === "Completed" ? "Paid" : b.status === "Cancelled" ? "Failed" : "Processing"} />
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
