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
import { Building2, CheckCircle2, Eye, Star, Plus } from "lucide-react";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await adminApi.getVendors();
        setVendors(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return vendors.filter(
      (v) =>
        !search ||
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.contactPerson.toLowerCase().includes(q)
    );
  }, [vendors, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet Vendor Partners"
        subtitle="Manage fleet operators, commercial contract commissions, and vehicle rosters"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Vendors" }]}
        action={
          <Link href="/admin/vendors/approval">
            <Button variant="amber" size="sm" icon={CheckCircle2}>
              Review Pending Approvals (1)
            </Button>
          </Link>
        }
      />

      <Card noPadding>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search vendor by agency name, city..."
          />
          <div className="text-xs text-slate-500 font-medium">
            Active Partners: <strong className="text-slate-900">{vendors.filter(v => v.status === "APPROVED").length}</strong>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor Agency & ID</TableHead>
              <TableHead>Hub / City</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Fleet Size</TableHead>
              <TableHead>Drivers</TableHead>
              <TableHead>Commission Rate</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                  Loading vendor partners...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                  No vendors found matching search.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <div className="font-bold text-xs text-slate-900">{v.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{v.id}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-800">{v.city}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium text-slate-800">{v.contactPerson}</div>
                    <div className="text-[11px] text-slate-500">{v.phone}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-slate-900">{v.fleetCount} Vehicles</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-700">{v.driverCount} Chauffeurs</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {v.commissionRate}%
                    </span>
                  </TableCell>
                  <TableCell>
                    {v.rating > 0 ? (
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{v.rating}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Unrated</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={v.status === "APPROVED" ? "success" : "warning"} size="sm">
                      {v.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/vendors/${v.id}`}>
                      <Button size="xs" variant="secondary" icon={Eye}>
                        Dossier
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
