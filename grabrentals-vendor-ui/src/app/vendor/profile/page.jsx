"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Save,
  Loader2 
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Toast from "@/components/ui/Toast";
import { vendorApi } from "@/lib/vendorApi";

export default function VendorProfilePage() {
  const [toastMessage, setToastMessage] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [vendorData, setVendorData] = useState({
    businessName: "",
    tradeName: "",
    ownerName: "",
    contactPerson: "",
    email: "",
    phone: "",
    altPhone: "",
    address: "",
    gstin: "",
    pan: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    branch: "",
    fleetSize: 0
  });

  useEffect(() => {
    vendorApi.getProfile()
      .then(res => {
        if (res) {
          setVendorData({
            businessName: res.businessName || "",
            tradeName: res.tradeName || res.businessName || "",
            ownerName: res.ownerName || "",
            contactPerson: res.contactPerson || res.ownerName || "",
            email: res.email || "",
            phone: res.phone || "",
            altPhone: res.altPhone || "",
            address: res.address || "",
            gstin: res.gstin || "",
            pan: res.pan || "",
            bankName: res.bankName || "",
            accountNumber: res.accountNumber || "",
            ifsc: res.ifsc || "",
            branch: res.branch || "",
            fleetSize: res.fleetSize || 0
          });
        }
      })
      .catch(err => console.error("Failed to load vendor profile:", err))
      .finally(() => setInitialLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVendorData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updated = await vendorApi.updateProfile(vendorData);
      if (updated) {
        setVendorData(prev => ({ ...prev, ...updated }));
      }
      setToastMessage("Business profile updated successfully in platform registry!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setToastMessage(err.response?.data?.message || "Failed to save profile changes.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
        <p className="text-xs text-slate-500 font-medium">Fetching verified vendor credentials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header & Breadcrumbs */}
      <div className="space-y-1">
        <Breadcrumbs items={[{ label: "Account", href: "/vendor/profile" }, { label: "Business Profile" }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Vendor Profile & Commercial KYC
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Verified Vendor
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage enterprise registration, GST compliance, and direct payout bank accounts.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Card 1: Enterprise Profile */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center">
              {(vendorData.businessName || "VP").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Registered Business Identity</h2>
              <p className="text-xs text-slate-500">Official legal entity name and primary contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Display Business Name *</label>
              <input
                type="text"
                required
                name="businessName"
                value={vendorData.businessName}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Legal Corporate Entity Name *</label>
              <input
                type="text"
                required
                name="tradeName"
                value={vendorData.tradeName}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Principal Partner / Owner *</label>
              <input
                type="text"
                required
                name="ownerName"
                value={vendorData.ownerName}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Primary Work Email *</label>
              <input
                type="email"
                required
                disabled
                name="email"
                value={vendorData.email}
                className="w-full py-2.5 px-3 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Primary Mobile *</label>
              <input
                type="text"
                required
                name="phone"
                value={vendorData.phone}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">24/7 Dispatch Hotline</label>
              <input
                type="text"
                name="altPhone"
                value={vendorData.altPhone}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700">Registered Office Address *</label>
              <input
                type="text"
                required
                name="address"
                value={vendorData.address}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Card 2: GST & Tax Particulars */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Tax & GSTIN Credentials</h2>
              <p className="text-xs text-slate-500">Invoices generated to passengers reflect this GST registration</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Goods & Services Tax (GSTIN)</label>
              <input
                type="text"
                name="gstin"
                value={vendorData.gstin}
                onChange={handleChange}
                placeholder="33AAAAA0000A1Z5"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Permanent Account Number (PAN)</label>
              <input
                type="text"
                name="pan"
                value={vendorData.pan}
                onChange={handleChange}
                placeholder="AAAAA0000A"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 uppercase"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Settlement Bank Account */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Direct Bank Account for Payouts</h2>
              <p className="text-xs text-slate-500">Direct deposit account for settled trips and weekly disbursements</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={vendorData.bankName}
                onChange={handleChange}
                placeholder="e.g. HDFC Bank, State Bank of India"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={vendorData.accountNumber}
                onChange={handleChange}
                placeholder="50200000000000"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">IFSC Code</label>
              <input
                type="text"
                name="ifsc"
                value={vendorData.ifsc}
                onChange={handleChange}
                placeholder="HDFC0001234"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Branch Name</label>
              <input
                type="text"
                name="branch"
                value={vendorData.branch}
                onChange={handleChange}
                placeholder="e.g. Main Branch"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Saving Profile..." : "Update Business Profile"}
          </button>
        </div>

      </form>
    </div>
  );
}
