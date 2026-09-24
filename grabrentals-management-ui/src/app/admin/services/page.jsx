"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Sparkles } from "lucide-react";

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await adminApi.getServices();
      setServices(res.data);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rental Service Offerings"
        subtitle="Manage available booking trip types, business travel packages, and circuit offerings"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Services" }]}
      />

      <Card noPadding>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>System Code</TableHead>
              <TableHead>Service Description</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{s.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-blue-600 font-semibold">{s.code}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-slate-600">{s.description}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="success" size="sm">Active</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
