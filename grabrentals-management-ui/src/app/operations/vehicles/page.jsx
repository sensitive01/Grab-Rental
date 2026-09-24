"use client";

import { useState, useEffect, useMemo } from "react";
import { operationsApi } from "@/lib/operationsApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Tabs,
  SearchInput,
} from "@/components/ui/Table";
import { Car, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { getStatusStyle } from "@/lib/utils";

const TABS = [
  { id: "ALL", label: "All Vehicles" },
  { id: "AVAILABLE", label: "Available" },
  { id: "ON_DUTY", label: "On Duty" },
  { id: "MAINTENANCE", label: "Under Maintenance" },
];

export default function OperationsVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await operationsApi.getVehicles();
        setVehicles(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const matchTab = activeTab === "ALL" || v.status === activeTab;
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        v.registrationNumber.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.vendorName.toLowerCase().includes(q) ||
        v.currentLocation.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [vehicles, activeTab, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet Vehicles Live Roster"
        subtitle="Real-time availability, vendor fleet partners, and operational readiness"
        breadcrumbs={[{ label: "Operations", href: "/operations/dashboard" }, { label: "Vehicles" }]}
      />

      <Card noPadding>
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by plate, model, vendor..."
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registration</TableHead>
              <TableHead>Model & Category</TableHead>
              <TableHead>Capacity / Fuel</TableHead>
              <TableHead>Vendor Fleet Partner</TableHead>
              <TableHead>Current Hub / Location</TableHead>
              <TableHead>Compliance & Permits</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  Loading fleet roster...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No vehicles found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((v) => {
                const statusStyle = getStatusStyle(v.status);
                return (
                  <TableRow key={v.id}>
                    <TableCell>
                      <NumberPlate registrationNumber={v.registrationNumber} />
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-xs text-slate-900">{v.model}</div>
                      <div className="text-[11px] text-slate-500">{v.category} • {v.transmission}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-slate-800">{v.seatingCapacity} Seater</div>
                      <div className="text-[11px] text-slate-500">{v.fuelType}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-slate-800">{v.vendorName}</div>
                      <div className="text-[10px] text-slate-400">{v.vendorId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-700">{v.currentLocation}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{v.mileage?.toLocaleString("en-IN")} KM</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[11px] font-medium text-slate-700">{v.permitType}</div>
                      <div className="text-[10px] text-slate-500">Fitness: {v.fitnessExpiry}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusStyle.bg}`}>
                        {statusStyle.label}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
