"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  SearchInput,
} from "@/components/ui/Table";
import { formatINR } from "@/lib/utils";
import { Eye, UserX, UserCheck, Phone, Mail } from "lucide-react";
import { Toast } from "@/components/ui/Toast";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  async function loadCustomers() {
    try {
      const res = await adminApi.getCustomers();
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function handleToggleStatus(id) {
    try {
      const res = await adminApi.toggleCustomerStatus(id);
      setToast({ type: "success", message: `Customer status updated to ${res.data.status}` });
      loadCustomers();
    } catch {
      setToast({ type: "error", message: "Failed to update customer status" });
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        !search ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="Customer Directory"
        subtitle="Manage registered passengers, lifetime booking volume, and account access"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Customers" }]}
      />

      <Card noPadding>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search customers by name, email, city..."
          />
          <div className="text-xs text-slate-500 font-medium">
            Total Customers: <strong className="text-slate-900">{customers.length}</strong>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer ID & Name</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>City Hub</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Lifetime Spend</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  Loading customers...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No customers found matching search.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-bold text-xs text-slate-900">{c.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{c.id}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-800 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>{c.phone}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-800">{c.city}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-slate-900">{c.totalBookings} Trips</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-emerald-700">{formatINR(c.totalSpent)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.status === "ACTIVE" ? "success" : "danger"} size="sm">
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/admin/customers/${c.id}`}>
                        <Button size="xs" variant="secondary" icon={Eye}>
                          360 View
                        </Button>
                      </Link>
                      <Button
                        size="xs"
                        variant={c.status === "ACTIVE" ? "danger" : "emerald"}
                        onClick={() => handleToggleStatus(c.id)}
                      >
                        {c.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </Button>
                    </div>
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
