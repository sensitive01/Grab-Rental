"use client";

import { useState, useEffect, useMemo } from "react";
import { operationsApi } from "@/lib/operationsApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
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
import { UserCheck, Star, Phone, ShieldCheck } from "lucide-react";
import { getStatusStyle } from "@/lib/utils";

const TABS = [
  { id: "ALL", label: "All Drivers" },
  { id: "AVAILABLE", label: "Available" },
  { id: "ON_DUTY", label: "On Duty" },
];

export default function OperationsDriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await operationsApi.getDrivers();
        setDrivers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return drivers.filter((d) => {
      const matchTab = activeTab === "ALL" || d.status === activeTab;
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        d.name.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q) ||
        d.badgeNumber.toLowerCase().includes(q) ||
        d.vendorName.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [drivers, activeTab, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chauffeur & Driver Roster"
        subtitle="Manage licensed commercial drivers, badge validity, languages, and ratings"
        breadcrumbs={[{ label: "Operations", href: "/operations/dashboard" }, { label: "Drivers" }]}
      />

      <Card noPadding>
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search driver by name, badge, phone..."
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chauffeur Name</TableHead>
              <TableHead>Contact & Languages</TableHead>
              <TableHead>Commercial Badge & License</TableHead>
              <TableHead>Experience & Trips</TableHead>
              <TableHead>Vendor Affiliation</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  Loading chauffeur roster...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No drivers found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((d) => {
                const statusStyle = getStatusStyle(d.status);
                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div className="font-bold text-xs text-slate-900">{d.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{d.id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>{d.phone}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {d.languages ? d.languages.join(", ") : "Tamil, English"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-mono font-bold text-slate-800">{d.badgeNumber}</div>
                      <div className="text-[10px] text-slate-500">Valid till: {d.badgeValidTill}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-slate-800">{d.experienceYears} Years Exp</div>
                      <div className="text-[11px] text-slate-500">{d.tripsCompleted} Trips Completed</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-slate-800">{d.vendorName}</div>
                      <div className="text-[10px] text-slate-400">{d.currentLocation}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-amber-600 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{d.rating}</span>
                      </div>
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
