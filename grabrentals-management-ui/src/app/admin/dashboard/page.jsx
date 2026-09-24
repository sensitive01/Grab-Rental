"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/utils";
import {
  IndianRupee,
  Building2,
  Users,
  Car,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const MONTHLY_REVENUE = [
  { month: "Apr", revenue: 420000, bookings: 32 },
  { month: "May", revenue: 510000, bookings: 41 },
  { month: "Jun", revenue: 480000, bookings: 38 },
  { month: "Jul", revenue: 590000, bookings: 46 },
  { month: "Aug", revenue: 640000, bookings: 53 },
  { month: "Sep", revenue: 780000, bookings: 64 },
];

const FLEET_DISTRIBUTION = [
  { name: "Sedans", value: 34, color: "#3b82f6" },
  { name: "SUVs (Innova/Ertiga)", value: 48, color: "#10b981" },
  { name: "Vans (Urbania/Traveller)", value: 26, color: "#f59e0b" },
  { name: "Buses (Coach)", value: 14, color: "#8b5cf6" },
];

const CITY_VOLUME = [
  { city: "Chennai", trips: 142, revenue: 1240000 },
  { city: "Bangalore", trips: 168, revenue: 1580000 },
  { city: "Coimbatore", trips: 84, revenue: 680000 },
  { city: "Kochi", trips: 92, revenue: 790000 },
  { city: "Madurai", trips: 56, revenue: 420000 },
];

const VENDOR_PERFORMANCE = [
  { vendor: "Royal Travels", completed: 86, rating: 4.8 },
  { vendor: "Bangalore Express", completed: 112, rating: 4.9 },
  { vendor: "Kovai Fleet", completed: 48, rating: 4.6 },
  { vendor: "Malabar Bus", completed: 58, rating: 4.7 },
  { vendor: "Southern Fleet", completed: 36, rating: 4.65 },
];

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminApi.getKPIs();
        setKpis(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Executive Dashboard"
        subtitle="Platform-wide governance, revenue performance, vendor ecosystem, and fleet capacity"
        breadcrumbs={[{ label: "Admin" }, { label: "Executive Dashboard" }]}
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/vendors/approval">
              <Button variant="secondary" size="sm" icon={Building2}>
                Vendor Approvals ({loading ? "..." : kpis?.pendingVendorApprovals ?? 1})
              </Button>
            </Link>
            <Link href="/admin/pricing">
              <Button variant="primary" size="sm" icon={IndianRupee}>
                Update Pricing Matrix
              </Button>
            </Link>
          </div>
        }
      />

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Platform GMV */}
        <Card className="bg-white border-l-4 border-l-blue-600">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Total Revenue (YTD)
          </p>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            {loading ? "..." : formatINR(kpis?.totalRevenue ?? 420000)}
          </h3>
          <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>{kpis?.growthRateMoM ?? "+18.2%"} MoM</span>
          </p>
        </Card>

        {/* Active Bookings */}
        <Card className="bg-white border-l-4 border-l-emerald-600">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Active Trips On Road
          </p>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            {loading ? "..." : kpis?.activeBookings ?? 2}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Live in transit</p>
        </Card>

        {/* Total Customers */}
        <Card className="bg-white border-l-4 border-l-purple-600">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Customer Directory
          </p>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            {loading ? "..." : kpis?.totalCustomers ?? 129}
          </h3>
          <p className="text-[10px] text-purple-600 font-medium mt-1">94% repeat rate</p>
        </Card>

        {/* Active Vendors */}
        <Card className="bg-white border-l-4 border-l-indigo-600">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Active Fleet Vendors
          </p>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            {loading ? "..." : kpis?.activeVendors ?? 5}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Across 6 major hubs</p>
        </Card>

        {/* Pending Approvals */}
        <Card className="bg-white border-l-4 border-l-amber-600">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Pending Approvals
          </p>
          <h3 className="text-xl font-black text-amber-600 mt-1">
            {loading ? "..." : kpis?.pendingVendorApprovals ?? 1}
          </h3>
          <Link
            href="/admin/vendors/approval"
            className="text-[10px] text-amber-700 font-bold hover:underline mt-1 block"
          >
            Review applications ➔
          </Link>
        </Card>

        {/* Pending Refunds */}
        <Card className="bg-white border-l-4 border-l-rose-600">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Refunds Pending
          </p>
          <h3 className="text-xl font-black text-rose-600 mt-1">
            {loading ? "..." : kpis?.pendingRefunds ?? 1}
          </h3>
          <Link
            href="/admin/refunds"
            className="text-[10px] text-rose-700 font-bold hover:underline mt-1 block"
          >
            Review authorization ➔
          </Link>
        </Card>
      </div>

      {/* Charts Grid Row 1: Revenue Growth Area Chart & Fleet Distribution Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          className="lg:col-span-2"
          title="Monthly Platform Gross Booking Value (GBV)"
          subtitle="Revenue growth and customer booking count progression in INR"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_REVENUE} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val) => [formatINR(val), "Revenue"]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Fleet Category Share"
          subtitle="Registered vehicles breakdown across partner operators"
        >
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={FLEET_DISTRIBUTION}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {FLEET_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts Grid Row 2: City Volume & Vendor Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="City Hub Trip Volume & Revenue"
          subtitle="Trips dispatched across Tamil Nadu, Karnataka, and Kerala"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CITY_VOLUME} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="city" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val, name) => [
                    name === "revenue" ? formatINR(val) : val,
                    name === "revenue" ? "Total Revenue" : "Trips",
                  ]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Vendor Partner Performance & Fulfillment"
          subtitle="Completed trips and quality score by fleet provider"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VENDOR_PERFORMANCE} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis dataKey="vendor" type="category" tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="completed" fill="#10b981" radius={[0, 4, 4, 0]} name="Completed Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
