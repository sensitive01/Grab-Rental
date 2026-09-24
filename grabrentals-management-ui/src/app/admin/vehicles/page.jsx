"use client";

import { useState, useEffect } from "react";
import { initialVehicles } from "@/lib/mockData";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { getStatusStyle } from "@/lib/utils";

export default function AdminVehiclesPage() {
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
            {initialVehicles.map((v) => {
              const statusStyle = getStatusStyle(v.status);
              return (
                <TableRow key={v.id}>
                  <TableCell>
                    <NumberPlate registrationNumber={v.registrationNumber} />
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-xs text-slate-900">{v.model}</div>
                    <div className="text-[11px] text-slate-500">{v.seatingCapacity} Seater • {v.fuelType}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral" size="sm">{v.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-800">{v.vendorName}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-700 font-mono">{v.insuranceExpiry}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-700 font-mono">{v.fitnessExpiry}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-[11px] text-slate-600">{v.permitType}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusStyle.bg}`}>
                      {statusStyle.label}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
