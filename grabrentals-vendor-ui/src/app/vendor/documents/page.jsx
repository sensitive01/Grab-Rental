"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Upload, 
  Eye, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Search,
  Filter
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import { mockDocuments } from "@/lib/mockData";

export default function VendorDocumentsPage() {
  const [documents, setDocuments] = useState(mockDocuments);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const expiringCount = documents.filter(d => d.status.toLowerCase().includes("expiring")).length;

  const handleUploadNew = (e) => {
    e.preventDefault();
    setUploadModalOpen(false);
    setToastMessage("Document uploaded successfully and queued for RTO verification!");
  };

  return (
    <div className="space-y-6">
      
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Statutory Document"
      >
        <form onSubmit={handleUploadNew} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Document Type *</label>
            <select className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500">
              <option>Commercial Vehicle Insurance Policy</option>
              <option>All India Tourist Permit (AITP)</option>
              <option>Fitness Certificate (FC)</option>
              <option>Vehicle Registration Certificate (RC)</option>
              <option>Pollution Under Control Certificate (PUCC)</option>
              <option>Driver Commercial License</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Select Vehicle / Driver *</label>
            <select className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500">
              <option>Toyota Camry Hybrid (TN-01-EF-9012)</option>
              <option>Toyota Innova Crysta (TN-38-AB-1234)</option>
              <option>Maruti Ertiga (TN-37-CD-5678)</option>
              <option>Force Urbania Van (TN-38-GH-3456)</option>
              <option>Driver: Ramesh Kumar</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">New Expiry Date *</label>
            <input
              type="date"
              required
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-2xl p-6 text-center space-y-2 cursor-pointer transition-colors bg-slate-50/50">
            <Upload className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-800">Drag & Drop PDF or Browse</p>
            <p className="text-[11px] text-slate-400">PDF, JPG, PNG up to 10MB</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black uppercase tracking-wider shadow-md"
            >
              Upload Document
            </button>
          </div>
        </form>
      </Modal>

      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Breadcrumbs items={[{ label: "Compliance", href: "/vendor/documents" }, { label: "Documents" }]} />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Fleet Compliance & Documents
            {expiringCount > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                {expiringCount} Expiries Nearing
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Keep commercial insurance, interstate tourist permits, and driver licenses valid to avoid dispatch locks.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Expiry Warning Banner */}
      {expiringCount > 0 && (
        <div className="p-4 rounded-3xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <p className="font-black text-slate-900">
                Action Required: {expiringCount} statutory documents expire within the next 30 days!
              </p>
              <p className="text-slate-600">
                Toyota Camry (AITP Permit expires in 14 days) and Tempo Traveller (FC expires in 27 days).
              </p>
            </div>
          </div>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold self-start sm:self-auto shrink-0"
          >
            Renew Now
          </button>
        </div>
      )}

      {/* Documents Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Document Particulars</th>
                <th className="py-3.5 px-4">Target Asset / Driver</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Verification Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => {
                const isExpiring = doc.status.toLowerCase().includes("expiring");
                return (
                  <tr
                    key={doc.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isExpiring ? "bg-amber-50/30" : ""
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{doc.name}</p>
                          <p className="text-[11px] text-slate-400">{doc.fileSize}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-800">
                      {doc.target}
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      {doc.type}
                    </td>

                    <td className="py-4 px-4">
                      <p className={`font-bold ${isExpiring ? "text-rose-600" : "text-slate-900"}`}>
                        {doc.expiryDate}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {isExpiring ? `⚠ Only ${doc.daysRemaining} days left` : "Valid"}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={doc.status} />
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => alert(`Opening preview of ${doc.name}...`)}
                          title="View Document"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setUploadModalOpen(true)}
                          title="Replace / Renew Document"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-amber-50 hover:text-amber-700 text-slate-600 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
