"use client";

import { useState, useEffect } from "react";
import { operationsApi } from "@/lib/operationsApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { Building2, Plus, AlertCircle, Phone } from "lucide-react";

export default function VendorCoordinationPage() {
  const [logs, setLogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    vendorName: "Royal Travels Chennai",
    vendorId: "VND-101",
    issueType: "Vehicle Inspection",
    details: "",
    priority: "MEDIUM",
  });
  const [toast, setToast] = useState(null);

  async function loadData() {
    try {
      const res = await operationsApi.getVendorCoordinations();
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!formData.details) return;
    try {
      await operationsApi.addVendorCoordination(formData);
      setToast({ type: "success", message: "Coordination ticket logged with vendor partner" });
      setIsModalOpen(false);
      setFormData({
        vendorName: "Royal Travels Chennai",
        vendorId: "VND-101",
        issueType: "Vehicle Inspection",
        details: "",
        priority: "MEDIUM",
      });
      loadData();
    } catch {
      setToast({ type: "error", message: "Failed to log coordination" });
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
        title="Vendor Fleet Coordination"
        subtitle="Manage vendor communications, fleet readiness, and toll/Fastag reconciliations"
        breadcrumbs={[
          { label: "Operations", href: "/operations/dashboard" },
          { label: "Vendor Coordination" },
        ]}
        action={
          <Button variant="amber" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Log Coordination Ticket
          </Button>
        }
      />

      <div className="space-y-4">
        {logs.map((log) => (
          <Card key={log.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-slate-900">{log.id}</span>
                <Badge variant={log.priority === "HIGH" ? "danger" : "warning"} size="sm">
                  {log.priority}
                </Badge>
                <Badge variant={log.status === "OPEN" ? "neutral" : "primary"} size="sm">
                  {log.status}
                </Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{log.vendorName} - {log.issueType}</h4>
              <p className="text-xs text-slate-600 max-w-2xl">{log.details}</p>
              <p className="text-[11px] text-slate-400">Updated: {log.updatedAt}</p>
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-1.5 shrink-0 font-medium">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Direct Vendor Desk Active</span>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Vendor Coordination Ticket"
        subtitle="Record communication or issue with external fleet provider"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Vendor Fleet Partner"
            value={formData.vendorName}
            onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
            options={[
              { value: "Royal Travels Chennai", label: "Royal Travels Chennai" },
              { value: "Kovai Fleet Solutions", label: "Kovai Fleet Solutions" },
              { value: "Bangalore Express Transports", label: "Bangalore Express Transports" },
              { value: "Malabar Bus Lines", label: "Malabar Bus Lines" },
              { value: "Southern Fleet Hub", label: "Southern Fleet Hub" },
            ]}
          />
          <Select
            label="Issue Category"
            value={formData.issueType}
            onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
            options={[
              { value: "Vehicle Inspection", label: "Vehicle Inspection / Safety Check" },
              { value: "Fastag Toll Reconciliation", label: "Fastag Toll Reconciliation" },
              { value: "Chauffeur Replacement", label: "Chauffeur Replacement Request" },
              { value: "Document Renewal", label: "Permit / Insurance Renewal" },
            ]}
          />
          <Select
            label="Urgency Level"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            options={[
              { value: "LOW", label: "Low (General Query)" },
              { value: "MEDIUM", label: "Medium (Within 24 Hours)" },
              { value: "HIGH", label: "High (Immediate Dispatch Critical)" },
            ]}
          />
          <Textarea
            label="Coordination Details & Notes"
            required
            rows={3}
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            placeholder="Describe the issue, vehicle numbers, or actions agreed..."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
