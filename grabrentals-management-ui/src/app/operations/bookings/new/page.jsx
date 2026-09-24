"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { operationsApi } from "@/lib/operationsApi";
import { formatINR } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { AlertCircle, ArrowRight, UserCheck, ShieldAlert } from "lucide-react";

export default function NewBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await operationsApi.getBookings("PENDING_ALLOCATION");
        setBookings(res.data);
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
        title="Pending Allocations Dispatch Queue"
        subtitle="Incoming customer bookings awaiting vehicle and chauffeur assignment"
        breadcrumbs={[
          { label: "Operations", href: "/operations/dashboard" },
          { label: "Bookings", href: "/operations/bookings" },
          { label: "Pending Allocations" },
        ]}
      />

      <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 text-amber-900 text-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>Attention Dispatcher:</strong> Assign verified vehicles and licensed chauffeurs at least 4 hours before pickup to ensure on-time guarantee.
          </span>
        </div>
        <Badge variant="warning">{bookings.length} Pending</Badge>
      </div>

      <Card noPadding>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Pickup Route</TableHead>
              <TableHead>Pickup Time</TableHead>
              <TableHead>Vehicle Needed</TableHead>
              <TableHead>Total Fare</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  Loading pending bookings...
                </TableCell>
              </TableRow>
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  All bookings have been successfully allocated!
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <span className="font-mono font-bold text-xs text-slate-900">{b.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-xs text-slate-900">{b.customerName}</div>
                    <div className="text-[11px] text-slate-500">{b.customerPhone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium text-slate-800">{b.pickupLocation}</div>
                    <div className="text-[11px] text-slate-500">to {b.dropLocation}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-bold text-slate-900">{b.startDate}</div>
                    <div className="text-[11px] text-slate-500">{b.serviceType}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral" size="sm">
                      {b.vehicleCategory} ({b.preferredVehicle})
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-xs text-slate-900">{formatINR(b.fare)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.urgency === "HIGH" ? "danger" : "warning"} size="sm">
                      {b.urgency || "NORMAL"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/operations/assignments/vehicle?bookingId=${b.id}`}>
                      <Button size="xs" variant="amber" icon={UserCheck}>
                        Allocate Fleet
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
