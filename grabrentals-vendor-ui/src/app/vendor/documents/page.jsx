"use client";

import { useState, useMemo } from "react";
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
  Filter
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import DataTable from "@/components/ui/DataTable";
import { mockDocuments } from "@/lib/mockData";

export default function VendorDocumentsPage() {
  const [documents, setDocuments] = useState(mockDocuments);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const expiringCount = documents.filter(d => d.status.toLowerCase().includes("expiring")).length;

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      return selectedCategory === "all" || d.type.toLowerCase().includes(selectedCategory.toLowerCase());
    });
  }, [documents, selectedCategory]);

  const handleUploadNew = (e) => {
    e.preventDefault();
    setUploadModalOpen(false);
    setToastMessage("Document uploaded successfully and queued for RTO verification!");
  };

  const columns = useMemo(() => [
    {
      key: "name",
      label: "Document Particulars",
      sortable: true,
      render: (doc) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{doc.name}</p>
            <p className="text-[11px] text-slate-400">{doc.fileSize}</p>
          </div>
        </div>
      )
    },
    {
      key: "target",
      label: "Target Asset / Driver",
      sortable: true,
      className: "font-semibold text-slate-800"
    },
    {
      key: "type",
      label: "Category",
      sortable: true,
      className: "text-slate-600"
    },
    {
      key: "expiryDate",
      label: "Expiry Date",
      sortable: true,
      render: (doc) => {
        const isExpiring = doc.status.toLowerCase().includes("expiring");
        return (
          <div>
            <p className={`font-bold ${isExpiring ? "text-rose-600" : "text-slate-900"}`}>
              {doc.expiryDate}
            </p>
            <p className="text-[11px] text-slate-400">
              {isExpiring ? `⚠ Only ${doc.daysRemaining} days left` : "Valid"}
            </p>
          </div>
        );
      }
    },
    {
      key: "status",
      label: "Verification Status",
      sortable: true,
      render: (doc) => <StatusBadge status={doc.status} />
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      sortable: false,
      render: (doc) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => alert(`Opening preview of ${doc.name}...`)}
            title="View Document"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            title="Replace / Renew Document"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-amber-50 hover:text-amber-700 text-slate-600 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ], []);

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
              <option>Maruti Suzuki S-Presso (TN-38-XY-9901)</option>
              <option>Toyota Innova Crysta (TN-38-XY-9900)</option>
              <option>Driver: Senthil Nathan</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Document Expiry Date *</label>
            <input 
              type="date" 
              required
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Attach Document Scan (PDF / JPG) *</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-amber-400 transition-colors cursor-pointer bg-slate-50/50">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-xs">Click to browse or drag file here</p>
              <p className="text-[11px] text-slate-400 mt-1">Supports PDF, PNG, JPG up to 10MB</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
            >
              Submit for Verification
            </button>
          </div>
        </form>
      </Modal>

      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Breadcrumbs items={[{ label: "Compliance", href: "/vendor/documents" }, { label: "Documents" }]} />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Statutory Documents & Expiries
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {documents.length} Records
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track RTO registrations, tourist permits, fitness certificates, and chauffeur commercial licenses.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Expiring Alert Banner */}
      {expiringCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                {expiringCount} Document{expiringCount > 1 ? "s" : ""} Expiring Within 30 Days
              </h3>
              <p className="text-[11px] text-slate-600">
                Vehicles with expired statutory paperwork are automatically locked by operations dispatch.
              </p>
            </div>
          </div>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold self-start sm:self-auto shrink-0 cursor-pointer"
          >
            Renew Now
          </button>
        </div>
      )}

      {/* Documents DataTable */}
      <DataTable
        columns={columns}
        data={filteredDocuments}
        keyField="id"
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        searchPlaceholder="Search document name, target asset, category..."
        searchKeys={["name", "target", "type", "expiryDate", "status"]}
        exportFileName="GrabRentals_Documents_Compliance"
        emptyTitle="No Documents Found"
        emptyDescription="No statutory records matched your search query."
        filters={
          <div className="flex items-center gap-1.5 text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="insurance">Insurance</option>
              <option value="permit">Permit</option>
              <option value="fitness">Fitness (FC)</option>
              <option value="rc">Registration (RC)</option>
              <option value="license">Driver License</option>
            </select>
          </div>
        }
      />

    </div>
  );
}
