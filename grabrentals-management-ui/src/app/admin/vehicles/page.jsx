"use client";

import { useState, useEffect } from "react";
import { operationsApi } from "@/lib/operationsApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { getStatusStyle } from "@/lib/utils";

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await operationsApi.getVehicles("ALL");
        setVehicles(res.data || []);
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
        title="Master Vehicle Registry"
        subtitle="Platform-wide compliance tracking, fitness certificates, and insurance audits"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Vehicles" }]}
      />

      <Card noPadding>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registration</TableHead>
              <TableHead>Model / Type</TableHead>
              <TableHead>Fleet Category</TableHead>
              <TableHead>Vendor Provider</TableHead>
              <TableHead>Insurance Expiry</TableHead>
              <TableHead>Fitness Expiry</TableHead>
              <TableHead>Permit Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12">
                  <LoadingAnimation inline title="Loading vehicle registry from database..." />
                </TableCell>
              </TableRow>
            ) : vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  No vehicles found in database.
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((v) => {
                const statusStyle = getStatusStyle(v.status);
                return (
                  <TableRow key={v.id}>
                    <TableCell>
                      <NumberPlate registrationNumber={v.registrationNumber || v.vehicleNumber} />
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-xs text-slate-900">{v.model}</div>
                      <div className="text-[11px] text-slate-500">{v.seatingCapacity || "4"} Seater • {v.fuelType || "Petrol"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm">{v.category || v.vehicleType || "Standard"}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-slate-800">{v.vendorName || "Platform Fleet"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-700 font-mono">{v.insuranceExpiry || "N/A"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-700 font-mono">{v.fitnessExpiry || "N/A"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] text-slate-600">{v.permitType || "Tourist Permit"}</span>
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

