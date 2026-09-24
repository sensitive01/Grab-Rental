"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Download, Printer, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const QUARTERLY_DATA = [
  { quarter: "Q1 FY26", gmv: 1420000, margin: 170400 },
  { quarter: "Q2 FY26", gmv: 1890000, margin: 226800 },
  { quarter: "Q3 FY26", gmv: 2340000, margin: 280800 },
  { quarter: "Q4 FY26 (Est.)", gmv: 2950000, margin: 354000 },
];

export default function AdminReportsPage() {
  function handleExportCSV() {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Quarter,GMV (INR),Platform Net Commission (INR)\n" +
      QUARTERLY_DATA.map((e) => `"${e.quarter}",${e.gmv},${e.margin}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "grabrentals_admin_financial_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Business Intelligence & Financial Reports"
        subtitle="Revenue reconciliation, gross booking values (GBV), and quarterly platform margins"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Reports" }]}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
              Print Statement
            </Button>
            <Button variant="primary" size="sm" icon={Download} onClick={handleExportCSV}>
              Export Financial CSV
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase">Gross Booking Value (YTD)</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">₹56,50,000</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">+24.5% vs Prior Year</p>
        </Card>
        <Card className="bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase">Net Commission Margin</p>
          <h3 className="text-2xl font-bold text-blue-700 mt-1">₹6,78,000</h3>
          <p className="text-[11px] text-slate-500 mt-1">Average 12% take-rate</p>
        </Card>
        <Card className="bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase">Customer Retention Rate</p>
          <h3 className="text-2xl font-bold text-emerald-700 mt-1">91.8%</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Corporate & repeat B2C</p>
        </Card>
      </div>

      <Card title="Quarterly GMV & Net Platform Margin">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={QUARTERLY_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(val) => `₹${val / 1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="gmv" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Gross GMV (INR)" />
              <Bar dataKey="margin" fill="#10b981" radius={[4, 4, 0, 0]} name="Net Commission (INR)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
