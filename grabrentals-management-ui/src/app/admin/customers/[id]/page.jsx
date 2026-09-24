"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { formatINR } from "@/lib/utils";
import { Phone, Mail, MapPin, Calendar, Eye, ArrowLeft } from "lucide-react";

export default function CustomerProfile360Page({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminApi.getCustomerById(id);
        setCustomer(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading customer profile...</div>;
  }

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-base font-bold text-slate-800">Customer Not Found</h2>
        <Link href="/admin/customers">
          <Button variant="secondary" size="sm" className="mt-4">
            Back to Customers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Customer 360: ${customer.name}`}
        subtitle={`Registered ${customer.joinedDate} • ${customer.city} Hub`}
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Customers", href: "/admin/customers" },
          { label: customer.id },
        ]}
        action={
          <Link href="/admin/customers">
            <Button variant="secondary" size="sm" icon={ArrowLeft}>
              Back to Directory
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase">Lifetime Spend</p>
          <h3 className="text-2xl font-bold text-emerald-700 mt-1">{formatINR(customer.totalSpent)}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Direct Gross Value</p>
        </Card>
        <Card className="bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Completed Trips</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{customer.totalBookings} Bookings</h3>
          <p className="text-[11px] text-blue-600 mt-1">Zero payment disputes</p>
        </Card>
        <Card className="bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase">Account Status</p>
          <div className="mt-1">
            <Badge variant={customer.status === "ACTIVE" ? "success" : "danger"} size="lg">
              {customer.status}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Verified Mobile & Email</p>
        </Card>
      </div>

      <Card title="Customer Trip History">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Service Route</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Vehicle Category</TableHead>
              <TableHead>Fare</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customer.bookings && customer.bookings.length > 0 ? (
              customer.bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <span className="font-mono font-bold text-xs text-slate-900">{b.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium text-slate-800">{b.pickupLocation} ➔ {b.dropLocation}</div>
                    <div className="text-[11px] text-slate-500">{b.serviceType}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-700">{b.startDate}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral" size="sm">{b.vehicleCategory}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-xs text-slate-900">{formatINR(b.fare)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.status === "COMPLETED" ? "success" : "warning"} size="sm">
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/bookings/${b.id}`}>
                      <Button size="xs" variant="secondary" icon={Eye}>
                        Audit Trip
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-slate-500">
                  No active or past bookings found for this customer.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
