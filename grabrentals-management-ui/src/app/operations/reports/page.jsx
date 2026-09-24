"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Download, Printer, TrendingUp, CheckCircle, Clock } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const FLEET_UTILIZATION = [
  { name: "Toyota Innova Crysta", trips: 42, onTime: 99 },
  { name: "Maruti Suzuki Ertiga", trips: 35, onTime: 97 },
  { name: "Force Urbania", trips: 28, onTime: 100 },
  { name: "Tempo Traveller", trips: 24, onTime: 96 },
  { name: "BharatBenz Coach", trips: 18, onTime: 98 },
];

const TRIP_CATEGORIES = [
  { name: "Outstation Round", value: 45, color: "#3b82f6" },
  { name: "Airport Transfer", value: 25, color: "#10b981" },
  { name: "Local City Hourly", value: 18, color: "#f59e0b" },
  { name: "Pilgrimage Circuits", value: 12, color: "#8b5cf6" },
];

export default function OperationsReportsPage() {
  function handleExportCSV() {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Vehicle,Trips Completed,On-Time Rate\n" +
      FLEET_UTILIZATION.map((e) => `"${e.name}",${e.trips},"${e.onTime}%"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "grabrentals_operations_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Dispatch & Fleet Analytics"
        subtitle="Performance KPIs, on-time arrival metrics, and vehicle utilization breakdown"
        breadcrumbs={[
          { label: "Operations", href: "/operations/dashboard" },
          { label: "Reports" },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
              Print Report
            </Button>
            <Button variant="primary" size="sm" icon={Download} onClick={handleExportCSV}>
              Export CSV
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase">On-Time Dispatch Rate</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">98.6%</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Within 15-minute SLA</p>
        </Card>
        <Card className="bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase">Average Chauffeur Rating</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">4.88 / 5.0</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Based on 1,420 customer trips</p>
        </Card>
        <Card className="bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase">Fleet Availability Ratio</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">92.4%</h3>
          <p className="text-[11px] text-blue-600 font-medium mt-1">Ready for same-day booking</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Monthly Trips by Vehicle Model">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FLEET_UTILIZATION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="trips" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Completed Trips" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Booking Distribution by Rental Service Type">
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={TRIP_CATEGORIES}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {TRIP_CATEGORIES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
