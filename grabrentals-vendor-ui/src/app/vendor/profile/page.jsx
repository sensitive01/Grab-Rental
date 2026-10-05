"use client";

import { useState, useEffect, useRef } from "react";
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
  Loader2,
  Upload,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Toast from "@/components/ui/Toast";
import { vendorApi } from "@/lib/vendorApi";
import { uploadSignedToCloudinary } from "@/lib/cloudinary";

function ProofUploadCard({
  title,
  subtitle,
  field,
  url,
  required = false,
  isUploading,
  onUpload
}) {
  const fileInputRef = useRef(null);

  return (
    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            {title}
            {required && <span className="text-rose-500">*</span>}
          </p>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>
        {url ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Attached
          </span>
        ) : !required ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 shrink-0">
            Optional
          </span>
        ) : null}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onUpload(field, file);
          }
        }}
      />

      <div className="pt-1 flex items-center justify-between gap-2">
        {url ? (
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
              <span>View Proof</span>
            </a>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-amber-50 hover:text-amber-800 text-slate-600 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? "animate-spin" : ""}`} />
              <span>{isUploading ? "Uploading..." : "Replace"}</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/30 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>Uploading Document...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-amber-500" />
                <span>Upload Proof (PDF / Image)</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function VendorProfilePage() {
  const [toastMessage, setToastMessage] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [partnerType, setPartnerType] = useState("individual"); // "individual" | "business"

  const [vendorData, setVendorData] = useState({
    vendorId: "",
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
    fleetSize: 0,
    gstDocumentUrl: "",
    panDocumentUrl: "",
    bankProofDocumentUrl: "",
    businessProofDocumentUrl: "",
    idProofDocumentUrl: "",
    addressProofDocumentUrl: ""
  });

  useEffect(() => {
    vendorApi.getProfile()
      .then(res => {
        if (res) {
          const isInd = res.isIndividual || !res.gstin;
          setPartnerType(isInd ? "individual" : "business");
          const defaultBizName = res.businessName || (res.ownerName ? `${res.ownerName} Fleet` : "Independent Fleet");
          setVendorData({
            vendorId: res.vendorId || res.vendorIdCode || "",
            businessName: defaultBizName,
            tradeName: res.tradeName || defaultBizName,
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
            fleetSize: res.fleetSize || 0,
            gstDocumentUrl: res.gstDocumentUrl || "",
            panDocumentUrl: res.panDocumentUrl || "",
            bankProofDocumentUrl: res.bankProofDocumentUrl || "",
            businessProofDocumentUrl: res.businessProofDocumentUrl || "",
            idProofDocumentUrl: res.idProofDocumentUrl || "",
            addressProofDocumentUrl: res.addressProofDocumentUrl || ""
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

  const handleFileUpload = async (field, file) => {
    if (!file) return;
    try {
      setUploadingField(field);
      const url = await uploadSignedToCloudinary(file, "grabrentals/business", null, "grabrentals_business");
      if (url) {
        setVendorData(prev => ({ ...prev, [field]: url }));
        setToastMessage("Document proof attached! Click 'Update Partner Profile' below to save changes.");
      }
    } catch (err) {
      console.error(`Failed to upload ${field}:`, err);
      setToastMessage("Failed to upload document scan. Please try a different file.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...vendorData,
        // If individual, ensure tradeName is set to businessName so validation passes cleanly
        tradeName: partnerType === "individual" 
          ? (vendorData.businessName || `${vendorData.ownerName} Fleet`) 
          : vendorData.tradeName,
      };

      const updated = await vendorApi.updateProfile(payload);
      if (updated) {
        setVendorData(prev => ({ ...prev, ...updated }));
      }
      setToastMessage("Partner profile and verification proofs saved successfully!");
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

  const isIndividual = partnerType === "individual";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header & Breadcrumbs */}
      <div className="space-y-1">
        <Breadcrumbs items={[{ label: "Account", href: "/vendor/profile" }, { label: "Profile & KYC" }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 flex-wrap">
              Fleet Partner Profile
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Verified Partner
              </span>
              {vendorData.vendorId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/30 font-mono font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  ID: {vendorData.vendorId}
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage partner identity, KYC proofs, and direct bank settlement accounts.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Hero Banner Photo */}
      <div className="relative h-44 rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
        <img
          src="/images/login-hero.jpg"
          alt="Vendor Partner Profile"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex flex-col justify-end p-5 text-white">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">KYC & Banking Setup</span>
          <h2 className="text-xl font-black text-white">Partner Credentials & Settlement Account</h2>
          <p className="text-xs text-slate-200">Verified company identity, GST documentation, and automatic payout destinations.</p>
        </div>
      </div>

      {/* Account Operating Mode Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Partner Operating Structure</h3>
          <p className="text-[11px] text-slate-500">
            {isIndividual 
              ? "Operating as an independent vehicle owner without a separate registered corporate entity"
              : "Operating under a registered corporate business / enterprise with corporate GST"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => {
              setPartnerType("individual");
              if (!vendorData.businessName || vendorData.businessName === "Fleet Partner") {
                setVendorData(prev => ({
                  ...prev,
                  businessName: prev.ownerName ? `${prev.ownerName} Fleet` : "Independent Fleet",
                  tradeName: prev.ownerName ? `${prev.ownerName} Fleet` : "Independent Fleet"
                }));
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isIndividual
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Individual Partner
          </button>
          <button
            type="button"
            onClick={() => setPartnerType("business")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !isIndividual
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Registered Enterprise
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Card 1: Identity Profile */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center">
              {isIndividual ? <User className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">
                {isIndividual ? "Personal Fleet Partner Identity" : "Registered Corporate Identity"}
              </h2>
              <p className="text-xs text-slate-500">
                {isIndividual 
                  ? "Independent vehicle owner details for operations and dispatch routing"
                  : "Official legal entity name and primary business contact details"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Dedicated Vendor Partner ID banner card */}
            <div className="sm:col-span-2 p-3.5 bg-amber-50/70 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-xs">Vendor Partner ID</span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      System Generated & Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Unique Grab Rentals partner identifier for invoices, dispatch, and support.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="font-mono font-black text-xs sm:text-sm tracking-wider text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                  {vendorData.vendorId || "GR-VND-..."}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (vendorData.vendorId) {
                      navigator.clipboard.writeText(vendorData.vendorId);
                      setToastMessage("Vendor Partner ID copied to clipboard!");
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Copy ID
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">
                {isIndividual ? "Fleet / Display Tag *" : "Display Business Name *"}
              </label>
              <input
                type="text"
                required
                name="businessName"
                value={vendorData.businessName}
                onChange={handleChange}
                placeholder={isIndividual ? "e.g. Kamesh Fleet" : "e.g. Royal Travels Pvt Ltd"}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {!isIndividual && (
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Legal Corporate Entity Name *</label>
                <input
                  type="text"
                  required={!isIndividual}
                  name="tradeName"
                  value={vendorData.tradeName}
                  onChange={handleChange}
                  placeholder="Official incorporated name"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">
                {isIndividual ? "Partner Name *" : "Principal Partner / Director *"}
              </label>
              <input
                type="text"
                required
                name="ownerName"
                value={vendorData.ownerName}
                onChange={handleChange}
                placeholder="Full legal name"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Primary Mobile Phone *</label>
              <input
                type="text"
                required
                name="phone"
                value={vendorData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Primary Email *</label>
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
              <label className="font-bold text-slate-700">Alternative Phone</label>
              <input
                type="text"
                name="altPhone"
                value={vendorData.altPhone}
                onChange={handleChange}
                placeholder="Optional backup number"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700">
                {isIndividual ? "Operating Location / City *" : "Registered Corporate Office Address *"}
              </label>
              <input
                type="text"
                required
                name="address"
                value={vendorData.address}
                onChange={handleChange}
                placeholder={isIndividual ? "e.g. Anna Nagar, Chennai" : "Full registered address with pincode"}
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
              <h2 className="text-sm font-black text-slate-900">Tax & Statutory Numbers</h2>
              <p className="text-xs text-slate-500">
                {isIndividual 
                  ? "GSTIN is completely optional for independent individual operators" 
                  : "Invoices generated to passengers will reflect this corporate GSTIN"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">
                {isIndividual ? "GSTIN (Optional)" : "Goods & Services Tax (GSTIN)"}
              </label>
              <input
                type="text"
                name="gstin"
                value={vendorData.gstin}
                onChange={handleChange}
                placeholder={isIndividual ? "Optional for individuals" : "33AAAAA0000A1Z5"}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">
                {isIndividual ? "Permanent Account Number (PAN)" : "Company PAN"}
              </label>
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
              <p className="text-xs text-slate-500">
                Direct deposit account for settled trips and disbursements ({isIndividual ? "Savings or Current account" : "Current account"})
              </p>
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

        {/* Card 4: Verification Proofs & KYC Attachments */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">
                {isIndividual ? "Identity & Bank Verification Proofs" : "Commercial KYC & Registration Proofs"}
              </h2>
              <p className="text-xs text-slate-500">
                Attach document scans or PDFs for fast verification and automated payout approvals
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Proof 1: PAN Card Proof */}
            <ProofUploadCard
              title={isIndividual ? "Partner PAN Card Scan" : "Company / Business PAN Scan"}
              subtitle="Copy of permanent account number card (PDF / JPG)"
              field="panDocumentUrl"
              url={vendorData.panDocumentUrl}
              required={true}
              isUploading={uploadingField === "panDocumentUrl"}
              onUpload={handleFileUpload}
            />

            {/* Proof 2: GST Certificate */}
            <ProofUploadCard
              title={isIndividual ? "GST Certificate (Optional)" : "GST Certificate (REG-06)"}
              subtitle="Registration certificate reflecting GSTIN details"
              field="gstDocumentUrl"
              url={vendorData.gstDocumentUrl}
              required={!isIndividual}
              isUploading={uploadingField === "gstDocumentUrl"}
              onUpload={handleFileUpload}
            />

            {/* Proof 3: Bank Account Proof */}
            <ProofUploadCard
              title="Bank Account Proof"
              subtitle="Cancelled cheque or passbook copy showing account & IFSC"
              field="bankProofDocumentUrl"
              url={vendorData.bankProofDocumentUrl}
              required={true}
              isUploading={uploadingField === "bankProofDocumentUrl"}
              onUpload={handleFileUpload}
            />

            {/* Proof 4: Commercial / Identity Proof */}
            <ProofUploadCard
              title={isIndividual ? "Commercial / Business License" : "Business Registration Proof"}
              subtitle={isIndividual 
                ? "MSME Udyam, Trade License, or Municipal registration" 
                : "MSME Udyam, Trade License, or Certificate of Incorporation"}
              field="businessProofDocumentUrl"
              url={vendorData.businessProofDocumentUrl}
              isUploading={uploadingField === "businessProofDocumentUrl"}
              onUpload={handleFileUpload}
            />

            {/* Proof 5: Official Government ID Proof */}
            <ProofUploadCard
              title="Official Government ID Proof"
              subtitle="Aadhaar card, Passport, Voter ID, or Driving License"
              field="idProofDocumentUrl"
              url={vendorData.idProofDocumentUrl}
              required={true}
              isUploading={uploadingField === "idProofDocumentUrl"}
              onUpload={handleFileUpload}
            />

            {/* Proof 6: Residential / Address Proof */}
            <ProofUploadCard
              title="Residential / Address Proof"
              subtitle="Electricity bill, rental agreement, or gas connection bill"
              field="addressProofDocumentUrl"
              url={vendorData.addressProofDocumentUrl}
              required={true}
              isUploading={uploadingField === "addressProofDocumentUrl"}
              onUpload={handleFileUpload}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !!uploadingField}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Saving Profile..." : "Update Partner Profile"}
          </button>
        </div>

      </form>
    </div>
  );
}
