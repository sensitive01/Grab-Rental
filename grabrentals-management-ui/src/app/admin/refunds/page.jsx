"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { formatINR } from "@/lib/utils";
import { RotateCcw, CheckCircle2, ShieldAlert } from "lucide-react";

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [approvedAmount, setApprovedAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [toast, setToast] = useState(null);

  async function loadRefunds() {
    try {
      const res = await adminApi.getRefunds();
      setRefunds(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRefunds();
  }, []);

  async function handleProcessRefund(e) {
    e.preventDefault();
    if (!selectedRefund) return;
    try {
      await adminApi.processRefund(selectedRefund.id, Number(approvedAmount), notes);
      setToast({
        type: "success",
        message: `Refund of ${formatINR(approvedAmount)} authorized for ${selectedRefund.customerName}`,
      });
      setSelectedRefund(null);
      loadRefunds();
    } catch {
      setToast({ type: "error", message: "Failed to process refund" });
    }
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
        title="Refund Authorization Queue"
        subtitle="Review cancellation penalties, approve payout reversals, and audit reasons"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Refunds" }]}
      />

      <Card noPadding>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Refund ID</TableHead>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Original Fare</TableHead>
              <TableHead>Cancellation Fee</TableHead>
              <TableHead>Refund Amount</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                  Loading refund requests...
                </TableCell>
              </TableRow>
            ) : (
              refunds.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <span className="font-mono font-bold text-xs text-slate-900">{r.id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-blue-600 font-semibold">{r.bookingId}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-900">{r.customerName}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-700">{formatINR(r.originalFare)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-rose-600 font-medium">{formatINR(r.cancellationFee)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-xs text-emerald-700">{formatINR(r.approvedRefund)}</span>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-slate-600 max-w-xs truncate">{r.reason}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.status === "COMPLETED" ? "success" : "warning"} size="sm">
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status === "PROCESSING" ? (
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => {
                          setSelectedRefund(r);
                          setApprovedAmount(r.approvedRefund);
                          setNotes(r.reason);
                        }}
                      >
                        Authorize Payout
                      </Button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Reversed</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={!!selectedRefund}
        onClose={() => setSelectedRefund(null)}
        title="Authorize Customer Refund"
        subtitle={`Booking #${selectedRefund?.bookingId} for ${selectedRefund?.customerName}`}
      >
        <form onSubmit={handleProcessRefund} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Original Booking Fare:</span>
              <span className="font-bold text-slate-900">{formatINR(selectedRefund?.originalFare)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Applicable Cancellation Fee:</span>
              <span className="font-semibold text-rose-600">- {formatINR(selectedRefund?.cancellationFee)}</span>
            </div>
          </div>

          <Input
            label="Net Refund Authorization Amount (INR)"
            type="number"
            required
            value={approvedAmount}
            onChange={(e) => setApprovedAmount(e.target.value)}
          />

          <Textarea
            label="Authorization Notes & Rationale"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document rationale for audit trail..."
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedRefund(null)}>
              Cancel
            </Button>
            <Button variant="emerald" size="sm" type="submit" icon={CheckCircle2}>
              Confirm Reversal Payout
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
