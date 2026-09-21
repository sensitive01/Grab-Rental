"use client";

import { useState } from "react";
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
  Save 
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Toast from "@/components/ui/Toast";
import { currentVendor } from "@/lib/mockData";

export default function VendorProfilePage() {
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [vendorData, setVendorData] = useState({
    businessName: currentVendor.businessName,
    tradeName: currentVendor.tradeName,
    ownerName: currentVendor.ownerName,
    email: currentVendor.email,
    phone: currentVendor.phone,
    altPhone: currentVendor.altPhone,
    address: currentVendor.address,
    gstin: currentVendor.gstin,
    pan: currentVendor.pan,
    bankName: currentVendor.bankDetails.bankName,
    accountNumber: currentVendor.bankDetails.accountNumber,
    ifsc: currentVendor.bankDetails.ifsc,
    branch: currentVendor.bankDetails.branch
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVendorData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setToastMessage("Business profile updated successfully!");
    }, 600);
  };

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
              KF
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
                name="email"
                value={vendorData.email}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
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
              <p className="text-xs text-slate-500">Invoices generated to passengers will reflect this GST registration</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Goods & Services Tax (GSTIN) *</label>
              <input
                type="text"
                required
                name="gstin"
                value={vendorData.gstin}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Permanent Account Number (PAN) *</label>
              <input
                type="text"
                required
                name="pan"
                value={vendorData.pan}
                onChange={handleChange}
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
              <h2 className="text-sm font-black text-slate-900">Bank Account for Weekly Payouts</h2>
              <p className="text-xs text-slate-500">Direct deposit account for settled trips</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Bank Name *</label>
              <input
                type="text"
                required
                name="bankName"
                value={vendorData.bankName}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Current Account Number *</label>
              <input
                type="text"
                required
                name="accountNumber"
                value={vendorData.accountNumber}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">IFSC Code *</label>
              <input
                type="text"
                required
                name="ifsc"
                value={vendorData.ifsc}
                onChange={handleChange}
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
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
          >
            {loading ? "Saving Profile..." : "Update Business Profile"}
          </button>
        </div>

      </form>
    </div>
  );
}
