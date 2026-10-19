"use client";

import { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Phone, 
  Calendar, 
  Search, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  User, 
  ExternalLink,
  Save,
  MessageCircle,
  FileText
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, converted: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  // Editing notes state: { [enquiryId]: string }
  const [editingNotes, setEditingNotes] = useState({});
  const [savingNotesId, setSavingNotesId] = useState(null);

  async function loadData(showRefreshSpinner = false) {
    if (showRefreshSpinner) setRefreshing(true);
    else setLoading(true);

    try {
      const [listRes, statsRes] = await Promise.all([
        adminApi.getEnquiries(statusFilter),
        adminApi.getEnquiryStats(),
      ]);

      if (listRes?.success && Array.isArray(listRes.data)) {
        setEnquiries(listRes.data);
        // Initialize editing notes with current admin notes
        const notesMap = {};
        listRes.data.forEach((item) => {
          notesMap[item.id] = item.adminNotes || "";
        });
        setEditingNotes(notesMap);
      }

      if (statsRes?.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error("Failed to load enquiries:", err);
      setToast({ type: "error", message: "Failed to load enquiries from database." });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  async function handleStatusChange(enquiry, newStatus) {
    try {
      const res = await adminApi.updateEnquiryStatus(enquiry.id, {
        status: newStatus,
        adminNotes: editingNotes[enquiry.id] || enquiry.adminNotes || "",
      });

      if (res?.success) {
        setToast({ type: "success", message: `Enquiry #${enquiry.id} marked as ${newStatus}` });
        // Update local state
        setEnquiries((prev) =>
          prev.map((item) => (item.id === enquiry.id ? { ...item, status: newStatus } : item))
        );
        // Refresh stats
        const statsRes = await adminApi.getEnquiryStats();
        if (statsRes?.success) setStats(statsRes.data);
      }
    } catch (err) {
      console.error("Status update error:", err);
      setToast({ type: "error", message: "Failed to update enquiry status" });
    }
  }

  async function handleSaveNotes(enquiry) {
    const currentNote = editingNotes[enquiry.id] ?? "";
    setSavingNotesId(enquiry.id);

    try {
      const res = await adminApi.updateEnquiryStatus(enquiry.id, {
        status: enquiry.status,
        adminNotes: currentNote,
      });

      if (res?.success) {
        setToast({ type: "success", message: `Notes saved for Enquiry #${enquiry.id}` });
        setEnquiries((prev) =>
          prev.map((item) => (item.id === enquiry.id ? { ...item, adminNotes: currentNote } : item))
        );
      }
    } catch (err) {
      console.error("Notes update error:", err);
      setToast({ type: "error", message: "Failed to save remarks" });
    } finally {
      setSavingNotesId(null);
    }
  }

  async function handleDelete(id) {
    if (!confirm(`Are you sure you want to delete enquiry #${id}?`)) return;

    try {
      const res = await adminApi.deleteEnquiry(id);
      if (res?.success) {
        setToast({ type: "success", message: `Enquiry #${id} deleted` });
        setEnquiries((prev) => prev.filter((item) => item.id !== id));
        const statsRes = await adminApi.getEnquiryStats();
        if (statsRes?.success) setStats(statsRes.data);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setToast({ type: "error", message: "Failed to delete enquiry" });
    }
  }

  // Filtered list by search query
  const filteredEnquiries = enquiries.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.phone?.toLowerCase().includes(q) ||
      item.requirements?.toLowerCase().includes(q) ||
      item.sourcePage?.toLowerCase().includes(q)
    );
  });

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "NEW":
        return "warning";
      case "CONTACTED":
        return "info";
      case "CONVERTED":
        return "success";
      case "CLOSED":
        return "secondary";
      default:
        return "default";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Customer Enquiries & Leads"
          subtitle="Direct requirements submitted by customers from the website enquiry section"
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Enquiries & Leads" },
          ]}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => loadData(true)}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-slate-900 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Leads</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.total || 0}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
            <MessageSquare className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">New / Pending</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{stats.new || 0}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Contacted</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{stats.contacted || 0}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Phone className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Converted</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.converted || 0}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Filters & Search Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {["ALL", "NEW", "CONTACTED", "CONVERTED", "CLOSED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st === "ALL" ? "All Leads" : st}
                {st === "NEW" && stats.new > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white">
                    {stats.new}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone, or requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
            />
          </div>

        </div>
      </Card>

      {/* Enquiries List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-400" />
            <p className="text-xs font-medium">Loading enquiries from database...</p>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <Card className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">No Enquiries Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? "No customer enquiries match your search query."
                : statusFilter !== "ALL"
                ? `No enquiries found with status "${statusFilter}".`
                : "Customer enquiries submitted on the website will appear here in real-time."}
            </p>
          </Card>
        ) : (
          filteredEnquiries.map((enquiry) => (
            <Card key={enquiry.id} className="p-5 hover:border-slate-300 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                
                {/* Left: Customer Info & Requirements */}
                <div className="space-y-3 flex-1">
                  
                  {/* Top Bar: ID, Date, Source Page */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      LEAD-#{enquiry.id}
                    </span>
                    <Badge variant={getStatusBadgeVariant(enquiry.status)} size="sm">
                      {enquiry.status}
                    </Badge>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      {formatDate(enquiry.createdAt)}
                    </span>
                    {enquiry.sourcePage && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium border border-blue-100">
                        Page: {enquiry.sourcePage}
                      </span>
                    )}
                  </div>

                  {/* Customer Identity & Contact Links */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        {enquiry.name ? enquiry.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{enquiry.name}</h4>
                        <p className="text-xs text-slate-500 font-mono">+91 {enquiry.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      {/* One-click Call */}
                      <a
                        href={`tel:+91${enquiry.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors border border-emerald-200"
                        title="Call Customer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>

                      {/* One-click WhatsApp */}
                      <a
                        href={`https://wa.me/91${enquiry.phone}?text=${encodeURIComponent(
                          `Hello ${enquiry.name}, thank you for contacting Grab Rentals regarding your trip requirement: "${enquiry.requirements}". How can we assist you?`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-colors shadow-xs"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Requirements Box */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-brand-primary" />
                      <span>Customer Requirements</span>
                    </p>
                    <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-medium">
                      {enquiry.requirements}
                    </p>
                  </div>

                  {/* Admin Follow-up Remarks */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add admin follow-up notes (e.g. Quoted Rs 6,500, waiting for confirmation)..."
                      value={editingNotes[enquiry.id] ?? ""}
                      onChange={(e) =>
                        setEditingNotes((prev) => ({ ...prev, [enquiry.id]: e.target.value }))
                      }
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-900 outline-none"
                    />
                    <Button
                      size="xs"
                      variant="outline"
                      icon={Save}
                      loading={savingNotesId === enquiry.id}
                      onClick={() => handleSaveNotes(enquiry)}
                    >
                      Save Note
                    </Button>
                  </div>

                </div>

                {/* Right: Status Change Actions & Delete */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  
                  {/* Status Dropdown */}
                  <div className="space-y-1 text-left lg:text-right">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Update Status
                    </label>
                    <select
                      value={enquiry.status}
                      onChange={(e) => handleStatusChange(enquiry, e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:border-slate-900 outline-none cursor-pointer"
                    >
                      <option value="NEW">🟡 NEW (Pending)</option>
                      <option value="CONTACTED">🔵 CONTACTED</option>
                      <option value="CONVERTED">🟢 CONVERTED</option>
                      <option value="CLOSED">⚪ CLOSED</option>
                    </select>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(enquiry.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Enquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              </div>
            </Card>
          ))
        )}
      </div>

    </div>
  );
}
