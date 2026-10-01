"use client";

import { useState, useEffect } from "react";
import { operationsApi } from "@/lib/operationsApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Star } from "lucide-react";
import { getStatusStyle } from "@/lib/utils";

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await operationsApi.getDrivers();
        setDrivers(res.data || []);
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
        title="Master Chauffeur Registry"
        subtitle="Platform-wide driver commercial badges, DL numbers, and performance ratings"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Drivers" }]}
      />

      <Card noPadding>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chauffeur</TableHead>
              <TableHead>Commercial Badge</TableHead>
              <TableHead>Driving License</TableHead>
              <TableHead>Vendor Affiliation</TableHead>
              <TableHead>Badge Validity</TableHead>
              <TableHead>Trips</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12">
                  <LoadingAnimation inline title="Loading chauffeur registry from database..." />
                </TableCell>
              </TableRow>
            ) : drivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  No drivers found in database.
                </TableCell>
              </TableRow>
            ) : (
              drivers.map((d) => {
                const statusStyle = getStatusStyle(d.status);
                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div className="font-bold text-xs text-slate-900">{d.name}</div>
                      <div className="text-[11px] text-slate-500">{d.phone}</div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-slate-800">{d.badgeNumber}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-[11px] text-slate-600">{d.licenseNumber}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-slate-800">{d.vendorName}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-emerald-700 font-medium">{d.badgeValidTill}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-slate-900">{d.tripsCompleted}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
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

