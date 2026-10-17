"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Save,
  Building2,
  Smartphone,
  ShieldCheck,
  CreditCard,
  ExternalLink,
  Info,
  SlidersHorizontal,
} from "lucide-react";

export default function AdminUpiSettingsPage() {
  const [config, setConfig] = useState({
    upiId: "grabrentals@okaxis",
    payeeName: "Grab Rentals India Pvt Ltd",
    bankName: "Axis Bank",
    accountNumber: "",
    ifscCode: "",
    qrNote: "Grab Rentals Booking Advance",
    instructions:
      "1. Scan QR code using GPay, PhonePe, Paytm, or BHIM.\n2. Verify Payee Name shows 'Grab Rentals'.\n3. Complete the advance payment.\n4. Take a screenshot of the payment receipt and upload below along with the 12-digit UTR number.",
    active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [simulatedAmount, setSimulatedAmount] = useState(1000);

  useEffect(() => {
    fetchUpiConfig();
  }, []);

  async function fetchUpiConfig() {
    setLoading(true);
    try {
      const res = await adminApi.getUpiConfig();
      if (res?.success && res?.data) {
        setConfig(res.data);
      }
    } catch (err) {
      console.warn("Could not load UPI config, using defaults:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!config.upiId || !config.upiId.trim()) {
      setToast({ type: "error", message: "UPI ID (VPA) is required." });
      return;
    }
    if (!config.payeeName || !config.payeeName.trim()) {
      setToast({ type: "error", message: "Payee Name is required." });
      return;
    }

    setSaving(true);
    try {
      const res = await adminApi.updateUpiConfig(config);
      if (res?.success) {
        setConfig(res.data);
        setToast({ type: "success", message: "UPI Payment settings updated and live across checkout!" });
      }
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to update UPI settings." });
    } finally {
      setSaving(false);
    }
  }

  function handleCopy(text, fieldName) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  }

  // Construct standard UPI payment deep-link URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(config.upiId || "")}&pn=${encodeURIComponent(config.payeeName || "")}&am=${simulatedAmount}&cu=INR&tn=${encodeURIComponent(config.qrNote || "Grab Rentals Advance")}`;

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black uppercase tracking-wider mb-2">
            <QrCode className="w-3.5 h-3.5 text-amber-600" />
            Payment Gateway & UPI QR
          </div>
          <h1 className="text-2xl font-black text-slate-900">UPI Payment & Dynamic QR Settings</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Configure your business UPI VPA, merchant branding, and payment proof verification flow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchUpiConfig}
            disabled={loading || saving}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-amber-600/20"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving Changes..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Core UPI Settings */}
          <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Business UPI Configuration</h3>
                  <p className="text-xs text-slate-500 font-medium">Primary VPA handle for customer QR code generation</p>
                </div>
              </div>

              {/* Active Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.active}
                  onChange={(e) => setConfig({ ...config, active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-bold text-slate-700">
                  {config.active ? "Active" : "Disabled"}
                </span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Business UPI ID (VPA) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    value={config.upiId}
                    onChange={(e) => setConfig({ ...config, upiId: e.target.value })}
                    placeholder="e.g. grabrentals@okaxis or businessname@icici"
                    className="font-mono font-bold text-slate-900 pl-3 pr-24"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    VPA Handle
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Customers scan or transfer directly to this address via any UPI application (GPay, PhonePe, Paytm, CRED).
                </p>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Payee / Merchant Business Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={config.payeeName}
                  onChange={(e) => setConfig({ ...config, payeeName: e.target.value })}
                  placeholder="e.g. Grab Rentals India Pvt Ltd"
                  className="font-semibold"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Shown inside the customer&apos;s UPI banking app when they scan the QR code.
                </p>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Default Transaction Note
                </label>
                <Input
                  value={config.qrNote || ""}
                  onChange={(e) => setConfig({ ...config, qrNote: e.target.value })}
                  placeholder="e.g. Grab Rentals Booking Advance"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Appears in transaction description (booking reference number will be automatically appended).
                </p>
              </div>
            </div>
          </Card>

          {/* Card 2: Bank Account Details (Fallback) */}
          <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Direct Bank Transfer Credentials (Optional)</h3>
                <p className="text-xs text-slate-500 font-medium">Provides IMPS/NEFT account details as an alternative to QR scanning</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Bank Name
                </label>
                <Input
                  value={config.bankName || ""}
                  onChange={(e) => setConfig({ ...config, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank, Axis Bank"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  IFSC Code
                </label>
                <Input
                  value={config.ifscCode || ""}
                  onChange={(e) => setConfig({ ...config, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. UTIB0001234"
                  className="font-mono uppercase font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Account Number
                </label>
                <Input
                  value={config.accountNumber || ""}
                  onChange={(e) => setConfig({ ...config, accountNumber: e.target.value })}
                  placeholder="e.g. 919010048123456"
                  className="font-mono font-bold"
                />
              </div>
            </div>
          </Card>

          {/* Card 3: Checkout Instructions */}
          <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Payment Instructions for Customer</h3>
                <p className="text-xs text-slate-500 font-medium">Displayed above the QR code and payment proof upload on checkout</p>
              </div>
            </div>

            <div>
              <textarea
                rows={4}
                value={config.instructions || ""}
                onChange={(e) => setConfig({ ...config, instructions: e.target.value })}
                placeholder="Enter step-by-step payment instructions for customers..."
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-sans"
              />
            </div>
          </Card>
        </div>

        {/* Right Preview & Live Simulator: 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Simulator Card */}
          <Card className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">Live Customer View</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                Interactive Preview
              </span>
            </div>

            {/* QR Code Container */}
            <div className="bg-white rounded-2xl p-5 text-slate-900 shadow-2xl flex flex-col items-center text-center">
              <div className="mb-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Pay To Merchant</p>
                <h4 className="text-base font-black text-slate-900">{config.payeeName || "Grab Rentals India"}</h4>
                <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-md bg-slate-100 font-mono text-xs font-bold text-slate-700">
                  <span>{config.upiId || "grabrentals@upi"}</span>
                  <button
                    onClick={() => handleCopy(config.upiId, "upiId")}
                    className="hover:text-amber-600 transition-colors"
                    title="Copy UPI ID"
                  >
                    {copiedField === "upiId" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Dynamic QR SVG */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-inner my-3">
                <QRCodeSVG
                  value={upiUri}
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>

              {/* Amount Display */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl px-4 py-2 w-full mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                  Simulated Advance Fare
                </span>
                <span className="text-2xl font-black text-amber-700">
                  ₹{Number(simulatedAmount).toLocaleString()}
                </span>
              </div>

              {/* Simulator Amount Buttons */}
              <div className="flex items-center justify-center gap-2 w-full pt-1">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setSimulatedAmount(amt)}
                    className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg transition-all ${
                      simulatedAmount === amt
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Actions */}
            <div className="mt-5 space-y-2.5">
              <button
                onClick={() => handleCopy(upiUri, "upiUri")}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
              >
                {copiedField === "upiUri" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied UPI Deep-link!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Complete UPI URI String</span>
                  </>
                )}
              </button>

              <a
                href={upiUri}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-xs font-black text-white shadow-lg shadow-amber-500/20 transition-all text-center"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Launch Installed UPI App</span>
              </a>
            </div>

            {/* Supported Apps List */}
            <div className="mt-5 pt-4 border-t border-slate-800 text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Supported Scan & Pay Apps
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-bold text-slate-300">
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Google Pay</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">PhonePe</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Paytm</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">BHIM</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">CRED</span>
              </div>
            </div>
          </Card>

          {/* Workflow Explanation Card */}
          <Card className="p-5 bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h4 className="text-sm font-black text-slate-900">How Verification Works</h4>
            </div>

            <ol className="text-xs font-medium text-slate-600 space-y-2.5 pl-4 list-decimal leading-relaxed">
              <li>
                Customer selects <strong>Part Pay</strong> or <strong>Full Pay</strong> on the checkout screen.
              </li>
              <li>
                The customer scans this dynamic QR code and pays via their preferred UPI app.
              </li>
              <li>
                Customer uploads the screenshot and enters their 12-digit UTR number.
              </li>
              <li>
                Booking enters <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Pending Payment Verification</span> status.
              </li>
              <li>
                Admin or Operations clicks <strong>&quot;Verify Payment&quot;</strong>, inspects the receipt, and clicks <strong>Approve</strong> to automatically advance the booking to vehicle & chauffeur dispatch.
              </li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
