"use client";

import { useMemo } from "react";
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
import DataTable from "@/components/ui/DataTable";
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

  const columns = useMemo(() => [
    {
      key: "id",
      label: "Booking ID",
      sortable: true,
      render: (b) => (
        <Link href={`/vendor/bookings/${b.id}`} className="text-amber-600 hover:underline font-mono font-bold">
          #{b.id}
        </Link>
      )
    },
    {
      key: "pickupDate",
      label: "Trip Date",
      sortable: true,
      className: "text-slate-600"
    },
    {
      key: "customer.name",
      label: "Customer & Route",
      sortable: true,
      render: (b) => (
        <div>
          <p className="font-bold text-slate-900">{b.customer?.name}</p>
          <p className="text-[11px] text-slate-500">{b.pickup} ➔ {b.drop}</p>
        </div>
      )
    },
    {
      key: "estimatedAmount",
      label: "Gross Fare",
      align: "right",
      sortable: true,
      sortValue: (b) => Number(b.estimatedAmount) || 0,
      render: (b) => (
        <span className="font-semibold text-slate-700">
          {formatINR(b.estimatedAmount)}
        </span>
      )
    },
    {
      key: "platformFee",
      label: "Platform Fee (15%)",
      align: "right",
      sortable: true,
      sortValue: (b) => Number(b.platformFee) || 0,
      render: (b) => (
        <span className="font-medium text-rose-600">
          -{formatINR(b.platformFee)}
        </span>
      )
    },
    {
      key: "vendorNet",
      label: "Net Payout",
      align: "right",
      sortable: true,
      sortValue: (b) => Number(b.vendorNet) || 0,
      render: (b) => (
        <span className="font-black text-slate-900 text-sm">
          {formatINR(b.vendorNet)}
        </span>
      )
    },
    {
      key: "status",
      label: "Payout Status",
      sortable: true,
      render: (b) => (
        <StatusBadge status={b.status === "Completed" ? "Paid" : b.status === "Cancelled" ? "Failed" : "Processing"} />
      )
    }
  ], []);

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
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            <CreditCard className="w-4 h-4 text-amber-400" />
            View Payout Batches
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Gross Revenue"
          value={formatINR(mockEarningsData.totalRevenue)}
          change="+18.4% this month"
          trend="up"
          icon={TrendingUp}
        />
        <StatCard
          title="Net Transferred"
          value={formatINR(mockEarningsData.netEarnings)}
          subtitle="Direct deposit to bank"
          icon={CreditCard}
        />
        <StatCard
          title="Pending Next Settlement"
          value={formatINR(mockEarningsData.pendingPayout)}
          subtitle="Releasing next Friday"
          icon={Calendar}
        />
        <StatCard
          title="Average Booking Net"
          value={formatINR(mockEarningsData.averagePerBooking)}
          subtitle="Across 34 total rides"
          icon={TrendingUp}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Earnings Trend */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Net Monthly Earnings Trend
              </h2>
              <p className="text-xs text-slate-400">Past 6 months payout volume in INR</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              +24% H2 Growth
            </span>
          </div>

          <AreaLineChart
            data={chartData}
            height={200}
            color="#f59e0b"
          />
        </div>

        {/* Earnings Breakdown by Vehicle */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Revenue by Fleet Vehicle
              </h2>
              <p className="text-xs text-slate-400">Total net earnings generated per asset</p>
            </div>
          </div>

          <BarChart
            data={vehicleBarData}
            height={200}
            color="#3b82f6"
          />
        </div>

      </div>

      {/* Trip Payout Transactions DataTable */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Trip Settlement Ledger
            </h2>
            <p className="text-xs text-slate-500">
              Trip-by-trip commission deductions and net payout breakdown
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={mockBookings}
          keyField="id"
          defaultPageSize={10}
          pageSizeOptions={[5, 10, 25, 50]}
          searchPlaceholder="Search booking ID, customer, route..."
          searchKeys={["id", "customer.name", "pickup", "drop", "status"]}
          exportFileName="GrabRentals_Trip_Settlements"
          emptyTitle="No Settlements Found"
          emptyDescription="No settlements match your search query."
        />
      </div>

    </div>
  );
}
