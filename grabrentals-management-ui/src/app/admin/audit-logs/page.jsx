"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, SearchInput } from "@/components/ui/Table";
import { History, Shield } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const res = await adminApi.getAuditLogs();
      setLogs(res.data);
    }
    load();
  }, []);

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return (
      !search ||
      l.action.toLowerCase().includes(q) ||
      l.userName.toLowerCase().includes(q) ||
      l.module.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Security & Action Audit Trail"
        subtitle="Immutable audit log of all pricing modifications, user actions, vendor approvals, and IP origins"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Audit Logs" }]}
      />

      <Card noPadding>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search audit trail by action, user, details..."
          />
          <div className="text-xs text-slate-500 font-medium">
            Recorded Events: <strong className="text-slate-900">{filtered.length}</strong>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action Code</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>User Identity</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Audit Log Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <span className="font-mono text-xs text-slate-600">{log.timestamp}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {log.action}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-slate-800">{log.module}</span>
                </TableCell>
                <TableCell>
                  <div className="text-xs font-bold text-slate-900">{log.userName}</div>
                  <div className="text-[10px] text-slate-400">{log.userId}</div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-slate-500">{log.ipAddress}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-slate-700">{log.details}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
