"use client";

import { useState } from "react";
import Link from "next/link";
import { initialBookings } from "@/lib/mockData";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, SearchInput } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { formatINR, getStatusStyle } from "@/lib/utils";
import { Eye, Download } from "lucide-react";

export default function AdminMasterBookingsPage() {
  const [search, setSearch] = useState("");

  const filtered = initialBookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      !search ||
      b.id.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.pickupLocation.toLowerCase().includes(q) ||
      b.dropLocation.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Booking Ledger"
        subtitle="Platform-wide booking records across all customer accounts and vendor partners"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Bookings" }]}
      />

      <Card noPadding>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search booking ledger..."
          />
          <div className="text-xs text-slate-500 font-medium">
            Total Bookings: <strong className="text-slate-900">{filtered.length}</strong>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Route / Service</TableHead>
              <TableHead>Partner Vendor</TableHead>
              <TableHead>Vehicle & Driver</TableHead>
              <TableHead>Total Fare</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b) => {
              const statusStyle = getStatusStyle(b.status);
              return (
                <TableRow key={b.id}>
                  <TableCell>
                    <span className="font-mono font-bold text-xs text-slate-900">{b.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-xs text-slate-900">{b.customerName}</div>
                    <div className="text-[11px] text-slate-500">{b.customerEmail}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium text-slate-800">{b.pickupLocation} ➔ {b.dropLocation}</div>
                    <div className="text-[11px] text-slate-500">{b.startDate}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-800">{b.vendorName || "In-House Fleet"}</span>
                  </TableCell>
                  <TableCell>
                    {b.assignedVehicleNumber ? (
                      <div className="space-y-1">
                        <NumberPlate registrationNumber={b.assignedVehicleNumber} />
                        <div className="text-[10px] text-slate-500">{b.assignedDriverName}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600 font-medium italic">Unallocated</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-xs text-slate-900">{formatINR(b.fare)}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusStyle.bg}`}>
                      {statusStyle.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/bookings/${b.id}`}>
                      <Button size="xs" variant="secondary" icon={Eye}>
                        Audit
                      </Button>
                    </Link>
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
