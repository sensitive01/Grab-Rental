"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { MapPin } from "lucide-react";

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await adminApi.getLocations();
      setLocations(res.data);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cities & Operational Hubs"
        subtitle="Manage active city territories, airport depots, and regional fleet deployment"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Locations" }]}
      />

      <Card noPadding>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location ID</TableHead>
              <TableHead>City Hub</TableHead>
              <TableHead>State / Territory</TableHead>
              <TableHead>Operational Hubs</TableHead>
              <TableHead>Active Fleet Deployed</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((loc) => (
              <TableRow key={loc.id}>
                <TableCell>
                  <span className="font-mono font-bold text-xs text-slate-900">{loc.id}</span>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{loc.city}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-slate-700">{loc.state}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-slate-800">{loc.hubs} Depots</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-bold text-slate-900">{loc.activeVehicles} Vehicles</span>
                </TableCell>
                <TableCell>
                  <Badge variant="success" size="sm">{loc.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
