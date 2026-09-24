"use client";

import { initialDrivers } from "@/lib/mockData";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Star, ShieldCheck } from "lucide-react";
import { getStatusStyle } from "@/lib/utils";

export default function AdminDriversPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Chauffeur Registry"
        subtitle="Platform-wide driver commercial badges, DL numbers, and performance ratings"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Drivers" }]}
      />

      <Card noPadding>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chauffeur</TableHead>
              <TableHead>Commercial Badge</TableHead>
              <TableHead>Driving License</TableHead>
              <TableHead>Vendor Affiliation</TableHead>
              <TableHead>Badge Validity</TableHead>
              <TableHead>Trips</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialDrivers.map((d) => {
              const statusStyle = getStatusStyle(d.status);
              return (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="font-bold text-xs text-slate-900">{d.name}</div>
                    <div className="text-[11px] text-slate-500">{d.phone}</div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs font-bold text-slate-800">{d.badgeNumber}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-[11px] text-slate-600">{d.licenseNumber}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-800">{d.vendorName}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-emerald-700 font-medium">{d.badgeValidTill}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-slate-900">{d.tripsCompleted}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{d.rating}</span>
                    </div>
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
