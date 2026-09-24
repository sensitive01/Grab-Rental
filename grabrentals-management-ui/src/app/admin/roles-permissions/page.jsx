"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Toast } from "@/components/ui/Toast";
import { ShieldCheck, Check, Save } from "lucide-react";

const INITIAL_PERMISSIONS = [
  { module: "Dispatch & Live Allocations", admin: true, ops: true, vendor: false },
  { module: "Vehicle & Driver Rosters (Read)", admin: true, ops: true, vendor: true },
  { module: "Vehicle & Driver Creation (Write)", admin: true, ops: false, vendor: true },
  { module: "Pricing Matrix Configuration", admin: true, ops: false, vendor: false },
  { module: "Vendor Approvals & Contracts", admin: true, ops: false, vendor: false },
  { module: "Refund Authorizations", admin: true, ops: false, vendor: false },
  { module: "Customer Grievance Resolution", admin: true, ops: true, vendor: false },
  { module: "System Audit Logs (Read Only)", admin: true, ops: false, vendor: false },
];

export default function AdminRolesPermissionsPage() {
  const [matrix, setMatrix] = useState(INITIAL_PERMISSIONS);
  const [toast, setToast] = useState(null);

  function togglePermission(idx, role) {
    const next = [...matrix];
    next[idx][role] = !next[idx][role];
    setMatrix(next);
  }

  function handleSave() {
    setToast({ type: "success", message: "Role-permission security matrix policy saved" });
  }

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
        title="Role-Based Access Control (RBAC)"
        subtitle="Manage granular permission scopes across Administrator and Operations Staff roles"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Roles & Permissions" }]}
        action={
          <Button variant="primary" size="sm" icon={Save} onClick={handleSave}>
            Save Matrix Rules
          </Button>
        }
      />

      <Card noPadding>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>System Functional Module</TableHead>
              <TableHead className="text-center">System Administrator</TableHead>
              <TableHead className="text-center">Operations Dispatcher</TableHead>
              <TableHead className="text-center">Vendor Partner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matrix.map((row, idx) => (
              <TableRow key={row.module}>
                <TableCell>
                  <span className="font-semibold text-xs text-slate-900">{row.module}</span>
                </TableCell>
                <TableCell className="text-center">
                  <input
                    type="checkbox"
                    checked={row.admin}
                    onChange={() => togglePermission(idx, "admin")}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <input
                    type="checkbox"
                    checked={row.ops}
                    onChange={() => togglePermission(idx, "ops")}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <input
                    type="checkbox"
                    checked={row.vendor}
                    onChange={() => togglePermission(idx, "vendor")}
                    className="w-4 h-4 rounded text-slate-600 focus:ring-slate-500 cursor-pointer"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
