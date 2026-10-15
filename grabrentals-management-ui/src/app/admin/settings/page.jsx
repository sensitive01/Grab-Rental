"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Toast } from "@/components/ui/Toast";
import { Save, Percent, DollarSign } from "lucide-react";
import { axiosClient } from "@/lib/axiosClient";

const SETTING_TABS = [
  { id: "tax", label: "GST & Add-on Pricing" },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("tax");
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // Dynamic GST, Driver Allowance, and Add-on states from Backend
  const [gstPercentage, setGstPercentage] = useState("5.00");
  const [gstAmount, setGstAmount] = useState("0");
  const [gstType, setGstType] = useState("PERCENTAGE"); // "PERCENTAGE" | "FLAT"

  const [driverAllowancePercentage, setDriverAllowancePercentage] = useState("10.00");
  const [driverAllowanceAmount, setDriverAllowanceAmount] = useState("0");
  const [driverAllowanceType, setDriverAllowanceType] = useState("PERCENTAGE"); // "PERCENTAGE" | "FLAT"

  const [lessThan3YearsFee, setLessThan3YearsFee] = useState("299.00");
  const [luggageCarrierFee, setLuggageCarrierFee] = useState("249.00");
  const [languageChauffeurFee, setLanguageChauffeurFee] = useState("199.00");
  const [expresswayFee, setExpresswayFee] = useState("415.00");

  useEffect(() => {
    async function loadPricingTaxConfig() {
      try {
        const res = await axiosClient.get("/api/admin/settings/pricing-tax");
        if (res.data?.success && res.data?.data) {
          if (res.data.data.gstPercentage != null) {
            setGstPercentage(String(res.data.data.gstPercentage));
          }
          if (res.data.data.gstAmount != null) {
            setGstAmount(String(res.data.data.gstAmount));
          }
          if (res.data.data.gstType) {
            setGstType(res.data.data.gstType);
          }
          if (res.data.data.driverAllowancePercentage != null) {
            setDriverAllowancePercentage(String(res.data.data.driverAllowancePercentage));
          }
          if (res.data.data.driverAllowanceAmount != null) {
            setDriverAllowanceAmount(String(res.data.data.driverAllowanceAmount));
          }
          if (res.data.data.driverAllowanceType) {
            setDriverAllowanceType(res.data.data.driverAllowanceType);
          }
          if (res.data.data.lessThan3YearsFee != null) {
            setLessThan3YearsFee(String(res.data.data.lessThan3YearsFee));
          }
          if (res.data.data.luggageCarrierFee != null) {
            setLuggageCarrierFee(String(res.data.data.luggageCarrierFee));
          }
          if (res.data.data.languageChauffeurFee != null) {
            setLanguageChauffeurFee(String(res.data.data.languageChauffeurFee));
          }
          if (res.data.data.expresswayFee != null) {
            setExpresswayFee(String(res.data.data.expresswayFee));
          }
        }
      } catch (err) {
        console.warn("Could not load pricing tax config from backend:", err);
      }
    }

    loadPricingTaxConfig();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const gstVal = Math.min(100, Math.max(0, parseFloat(gstPercentage) || 5.0));
      const gstAmtVal = Math.max(0, parseFloat(gstAmount) || 0.0);
      const driverVal = Math.min(100, Math.max(0, parseFloat(driverAllowancePercentage) || 10.0));
      const driverAmtVal = Math.max(0, parseFloat(driverAllowanceAmount) || 0.0);
      const lessThan3Val = parseFloat(lessThan3YearsFee) || 299.0;
      const luggageVal = parseFloat(luggageCarrierFee) || 249.0;
      const languageVal = parseFloat(languageChauffeurFee) || 199.0;
      const expresswayVal = parseFloat(expresswayFee) || 415.0;

      await axiosClient.put("/api/admin/settings/pricing-tax", {
        gstPercentage: gstVal,
        gstAmount: gstAmtVal,
        gstType: gstType,
        driverAllowancePercentage: driverVal,
        driverAllowanceAmount: driverAmtVal,
        driverAllowanceType: driverAllowanceType,
        lessThan3YearsFee: lessThan3Val,
        luggageCarrierFee: luggageVal,
        languageChauffeurFee: languageVal,
        expresswayFee: expresswayVal,
      });

      const gstDisplay = gstType === "FLAT" ? `₹${gstAmtVal}` : `${gstVal}%`;
      const driverDisplay = driverAllowanceType === "FLAT" ? `₹${driverAmtVal}` : `${driverVal}%`;

      setToast({ 
        type: "success", 
        message: `GST & Add-on Pricing updated! GST: ${gstDisplay} | Driver Allowance: ${driverDisplay}` 
      });
    } catch (err) {
      console.error("Save error:", err);
      setToast({ type: "error", message: err.response?.data?.message || "Failed to update configuration" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="GST & Add-on Pricing Rules"
        subtitle="Manage dynamic live GST rates, driver allowance (percentage or flat amount), and journey add-on fees"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "GST & Add-on Pricing" }]}
      />

      <Card noPadding>
        <div className="p-4 border-b border-slate-100">
          <Tabs tabs={SETTING_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="space-y-5">
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-800">
                  <Percent className="w-4 h-4 text-amber-600" /> Dynamic Live Tax & Chauffeur Fee Engine
                </p>
                <p className="text-amber-700">
                  Set whether to charge by percentage (%) or flat amount (₹) for GST and Driver Allowance. Updating these values updates all live quotes instantly on the customer booking portal.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GST Configuration Box */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      GST Calculation
                    </label>
                    <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setGstType("PERCENTAGE")}
                        className={`px-2.5 py-1 rounded-md transition ${gstType === "PERCENTAGE" ? "bg-white text-amber-700 shadow-2xs font-black" : "text-slate-600 hover:text-slate-900"}`}
                      >
                        % Rate
                      </button>
                      <button
                        type="button"
                        onClick={() => setGstType("FLAT")}
                        className={`px-2.5 py-1 rounded-md transition ${gstType === "FLAT" ? "bg-white text-amber-700 shadow-2xs font-black" : "text-slate-600 hover:text-slate-900"}`}
                      >
                        ₹ Flat
                      </button>
                    </div>
                  </div>

                  {/* Single active field depending on chosen toggle */}
                  {gstType === "PERCENTAGE" ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        GST Rate (%) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        required
                        value={gstPercentage}
                        onChange={(e) => setGstPercentage(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-amber-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        GST Fixed Amount (₹) *
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        required
                        value={gstAmount}
                        onChange={(e) => setGstAmount(e.target.value)}
                        placeholder="0"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-amber-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500">
                    {gstType === "FLAT" 
                      ? `Active: Fixed GST of ₹${gstAmount || 0} applied per booking.`
                      : `Active: ${gstPercentage}% GST calculated dynamically on total ride fare.`}
                  </p>
                </div>

                {/* Driver Allowance Box */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Chauffeur / Driver Allowance
                    </label>
                    <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setDriverAllowanceType("PERCENTAGE")}
                        className={`px-2.5 py-1 rounded-md transition ${driverAllowanceType === "PERCENTAGE" ? "bg-white text-amber-700 shadow-2xs font-black" : "text-slate-600 hover:text-slate-900"}`}
                      >
                        % Rate
                      </button>
                      <button
                        type="button"
                        onClick={() => setDriverAllowanceType("FLAT")}
                        className={`px-2.5 py-1 rounded-md transition ${driverAllowanceType === "FLAT" ? "bg-white text-amber-700 shadow-2xs font-black" : "text-slate-600 hover:text-slate-900"}`}
                      >
                        ₹ Flat
                      </button>
                    </div>
                  </div>

                  {/* Single active field depending on chosen toggle */}
                  {driverAllowanceType === "PERCENTAGE" ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Driver Allowance Rate (%) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        required
                        value={driverAllowancePercentage}
                        onChange={(e) => setDriverAllowancePercentage(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-amber-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Driver Allowance Fixed Amount (₹) *
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        required
                        value={driverAllowanceAmount}
                        onChange={(e) => setDriverAllowanceAmount(e.target.value)}
                        placeholder="0"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-amber-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500">
                    {driverAllowanceType === "FLAT"
                      ? `Active: Fixed driver allowance of ₹${driverAllowanceAmount || 0} applied per booking.`
                      : `Active: ${driverAllowancePercentage}% driver allowance calculated dynamically on base fare.`}
                  </p>
                </div>
              </div>

              {/* Add-on Pricing Configuration */}
              <div className="pt-4 border-t border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Add-on Pricing &quot;Personalize Your Journey&quot; (₹)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500">
                  Configure dynamic fees shown to customers in Section 3 of checkout. Changes reflect in real time on the customer portal.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Less than 3 years Old Vehicle */}
                  <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/50 space-y-1">
                    <label className="block text-xs font-black text-amber-950">
                      Less than 3 years Old Vehicle Fee (₹) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={lessThan3YearsFee}
                      onChange={(e) => setLessThan3YearsFee(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-sm font-bold text-slate-900 focus:border-amber-600 focus:outline-none transition shadow-2xs"
                    />
                    <p className="text-[10px] text-amber-800 font-medium">
                      Amount charged when customer opts for an assured newer vehicle (&lt; 3 years old).
                    </p>
                  </div>

                  {/* Cab with Luggage Carrier */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <label className="block text-xs font-bold text-slate-900">
                      Cab with Luggage Carrier Fee (₹) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={luggageCarrierFee}
                      onChange={(e) => setLuggageCarrierFee(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-amber-500 focus:outline-none transition"
                    />
                    <p className="text-[10px] text-slate-500">
                      Amount charged for rooftop luggage carrier add-on.
                    </p>
                  </div>

                  {/* Language Knowing Chauffeur */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <label className="block text-xs font-bold text-slate-900">
                      Chauffeur Language Preference Fee (₹) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={languageChauffeurFee}
                      onChange={(e) => setLanguageChauffeurFee(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-amber-500 focus:outline-none transition"
                    />
                    <p className="text-[10px] text-slate-500">
                      Amount charged for driver matching preferred regional language.
                    </p>
                  </div>

                  {/* Expressway Toll (Commented out for now - based on routes, not common) */}
                  {/*
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <label className="block text-xs font-bold text-slate-900">
                      Expressway Fastag Toll Add-on (₹) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={expresswayFee}
                      onChange={(e) => setExpresswayFee(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-amber-500 focus:outline-none transition"
                    />
                    <p className="text-[10px] text-slate-500">
                      Amount charged for expressway toll pass add-on.
                    </p>
                  </div>
                  */}
                </div>
              </div>
            </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" variant="primary" size="sm" icon={Save} disabled={saving}>
              {saving ? "Saving Configuration..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
