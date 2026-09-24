"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { operationsApi } from "@/lib/operationsApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Eye } from "lucide-react";

export default function CancelledTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await operationsApi.getBookings("CANCELLED");
        setTrips(res.data);
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
        title="Cancelled Trips Log"
        subtitle="Audited cancellations, reasons, and release of fleet resources"
        breadcrumbs={[
          { label: "Operations", href: "/operations/dashboard" },
          { label: "Trips", href: "/operations/trips/active" },
          { label: "Cancelled" },
        ]}
      />

      <Card noPadding>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Scheduled Route</TableHead>
              <TableHead>Cancelled Date</TableHead>
              <TableHead>Cancellation Reason / Notes</TableHead>
              <TableHead>Original Tariff</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  Loading cancelled records...
                </TableCell>
              </TableRow>
            ) : trips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  No cancellations recorded.
                </TableCell>
              </TableRow>
            ) : (
              trips.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <span className="font-mono font-bold text-xs text-slate-900">{t.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-xs text-slate-900">{t.customerName}</div>
                    <div className="text-[11px] text-slate-500">{t.customerPhone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium text-slate-800">{t.pickupLocation}</div>
                    <div className="text-[11px] text-slate-500">to {t.dropLocation}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-800">{t.createdAt}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-rose-700 italic">
                      {t.specialInstructions || "Customer requested cancellation prior to dispatch."}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-xs text-slate-900">{formatINR(t.fare)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="danger" size="sm">Cancelled</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/operations/bookings/${t.id}`}>
                      <Button size="xs" variant="secondary" icon={Eye}>
                        Audit Details
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
