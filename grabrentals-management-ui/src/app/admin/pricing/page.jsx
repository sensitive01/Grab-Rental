"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { formatINR } from "@/lib/utils";
import { IndianRupee, Edit3, CheckCircle2 } from "lucide-react";

export default function AdminPricingPage() {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [toast, setToast] = useState(null);

  async function loadPricing() {
    try {
      const res = await adminApi.getPricing();
      setPricing(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPricing();
  }, []);

  function handleStartEdit(item) {
    setEditingItem(item);
    setFormData({ ...item });
  }

  async function handleSavePricing(e) {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await adminApi.updatePricing(editingItem.category, formData);
      setToast({ type: "success", message: `Tariff rules updated for ${editingItem.category}` });
      setEditingItem(null);
      loadPricing();
    } catch {
      setToast({ type: "error", message: "Failed to update pricing" });
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
        title="Vehicle Category Pricing Matrix"
        subtitle="Configure base fares, per-kilometer tariffs, driver allowances (batta), and night surcharges"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Pricing Matrix" }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pricing.map((p) => (
          <Card key={p.category} className="border-t-4 border-t-blue-600">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">{p.category} Category</h3>
                <p className="text-xs text-slate-500">{p.examples}</p>
              </div>
              <Badge variant="primary" size="md">
                {p.capacity}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 py-4 border-y border-slate-100 text-xs">
              <div>
                <span className="text-slate-500">Base Minimum Fare:</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {formatINR(p.baseFare)} <span className="text-[10px] text-slate-400 font-normal">({p.baseIncludedKm} KM included)</span>
                </p>
              </div>
              <div>
                <span className="text-slate-500">Extra Rate Per KM:</span>
                <p className="text-sm font-bold text-emerald-700 mt-0.5">
                  {formatINR(p.perKmRate)} / KM
                </p>
              </div>
              <div>
                <span className="text-slate-500">Driver Day Batta:</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {formatINR(p.driverBattaPerDay)} / Day
                </p>
              </div>
              <div>
                <span className="text-slate-500">Night Halt Surcharge:</span>
                <p className="text-sm font-bold text-amber-700 mt-0.5">
                  {formatINR(p.nightSurcharge)} / Night
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                size="xs"
                variant="secondary"
                icon={Edit3}
                onClick={() => handleStartEdit(p)}
              >
                Edit Category Tariffs
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title={`Edit ${editingItem?.category} Tariffs`}
        subtitle="Adjust commercial pricing matrix parameters"
      >
        <form onSubmit={handleSavePricing} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Base Fare (INR)"
              type="number"
              required
              value={formData.baseFare || ""}
              onChange={(e) => setFormData({ ...formData, baseFare: Number(e.target.value) })}
            />
            <Input
              label="Included Base Kilometers"
              type="number"
              required
              value={formData.baseIncludedKm || ""}
              onChange={(e) => setFormData({ ...formData, baseIncludedKm: Number(e.target.value) })}
            />
            <Input
              label="Per-KM Rate (INR)"
              type="number"
              required
              value={formData.perKmRate || ""}
              onChange={(e) => setFormData({ ...formData, perKmRate: Number(e.target.value) })}
            />
            <Input
              label="Driver Batta per Day (INR)"
              type="number"
              required
              value={formData.driverBattaPerDay || ""}
              onChange={(e) => setFormData({ ...formData, driverBattaPerDay: Number(e.target.value) })}
            />
            <Input
              label="Night Halt Surcharge (INR)"
              type="number"
              required
              value={formData.nightSurcharge || ""}
              onChange={(e) => setFormData({ ...formData, nightSurcharge: Number(e.target.value) })}
            />
            <Input
              label="Waiting Charge / Hour (INR)"
              type="number"
              required
              value={formData.perHourWaitingRate || ""}
              onChange={(e) => setFormData({ ...formData, perHourWaitingRate: Number(e.target.value) })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={CheckCircle2}>
              Save Tariff Updates
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
