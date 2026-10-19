"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Upload,
  Calendar,
  Clock,
  Layers,
  Eye,
  AlertCircle,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  FileText,
  MousePointer,
  Timer,
  Info,
  ExternalLink,
  Phone,
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";

const TARGET_PAGES = [
  { value: "ALL", label: "All Pages (Site-wide)" },
  { value: "HOME", label: "Home Page" },
  { value: "FLEET", label: "Fleet & Vehicle Catalog" },
  { value: "OUTSTATION", label: "Outstation Cabs" },
  { value: "LOCAL", label: "Local Hourly Rentals" },
  { value: "AIRPORT", label: "Airport Transfers" },
  { value: "REVIEW_PAY", label: "Review & Pay (Checkout)" },
];

export default function BannersAdminPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageFilter, setPageFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewBanner, setPreviewBanner] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    subtitle: "",
    helplineTitle: "",
    helplineNumber: "",
    mediaUrl: "",
    mediaType: "IMAGE", // IMAGE, GIF, VIDEO
    description: "",
    targetPage: "HOME",
    displayType: "POPUP", // POPUP, IN_PAGE
    popupTrigger: "ON_LOAD", // ON_LOAD, ON_SCROLL
    triggerDelaySeconds: 3,
    triggerScrollPercent: 30,
    durationType: "PERMANENT", // PERMANENT, TEMPORARY
    startDate: "",
    expiryDate: "",
    notes: "",
    active: true,
    sortOrder: 0,
  });

  const [message, setMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getBanners();
      if (res && res.data) {
        setBanners(res.data);
      }
    } catch (err) {
      console.error("Failed to load banners:", err);
      setMessage({ type: "error", text: "Failed to load banners. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      title: "",
      subtitle: "",
      helplineTitle: "",
      helplineNumber: "",
      mediaUrl: "",
      mediaType: "IMAGE",
      description: "",
      targetPage: "HOME",
      displayType: "POPUP",
      popupTrigger: "ON_LOAD",
      triggerDelaySeconds: 3,
      triggerScrollPercent: 30,
      durationType: "PERMANENT",
      startDate: "",
      expiryDate: "",
      notes: "",
      active: true,
      sortOrder: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (banner) => {
    setIsEditing(true);
    setFormData({
      id: banner.id,
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      helplineTitle: banner.helplineTitle || "",
      helplineNumber: banner.helplineNumber || "",
      mediaUrl: banner.mediaUrl || "",
      mediaType: banner.mediaType || "IMAGE",
      description: banner.description || "",
      targetPage: banner.targetPage || "HOME",
      displayType: banner.displayType || "POPUP",
      popupTrigger: banner.popupTrigger || "ON_LOAD",
      triggerDelaySeconds: banner.triggerDelaySeconds ?? 3,
      triggerScrollPercent: banner.triggerScrollPercent ?? 30,
      durationType: banner.durationType || "PERMANENT",
      startDate: banner.startDate ? banner.startDate.slice(0, 16) : "",
      expiryDate: banner.expiryDate ? banner.expiryDate.slice(0, 16) : "",
      notes: banner.notes || "",
      active: banner.active ?? true,
      sortOrder: banner.sortOrder ?? 0,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await adminApi.uploadBannerMedia(file);
      if (res?.data?.url) {
        setFormData((prev) => ({
          ...prev,
          mediaUrl: res.data.url,
          mediaType: res.data.mediaType || prev.mediaType,
        }));
        setMessage({ type: "success", text: "Media file uploaded successfully!" });
      }
    } catch (err) {
      console.error("Media upload failed:", err);
      setMessage({ type: "error", text: "Upload failed. Please ensure the file is under 50MB." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setMessage({ type: "error", text: "Banner title is required." });
      return;
    }
    if (!formData.mediaUrl.trim()) {
      setMessage({ type: "error", text: "Please upload or specify a media file (image, gif, or video)." });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        startDate: formData.durationType === "TEMPORARY" && formData.startDate ? formData.startDate + ":00" : null,
        expiryDate: formData.durationType === "TEMPORARY" && formData.expiryDate ? formData.expiryDate + ":00" : null,
      };

      if (isEditing && formData.id) {
        await adminApi.updateBanner(formData.id, payload);
        setMessage({ type: "success", text: "Banner updated successfully!" });
      } else {
        await adminApi.createBanner(payload);
        setMessage({ type: "success", text: "New banner created successfully!" });
      }

      setIsModalOpen(false);
      await fetchBanners();
    } catch (err) {
      console.error("Save banner error:", err);
      setMessage({ type: "error", text: "Failed to save banner. Please check details and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await adminApi.toggleBannerStatus(id);
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
      );
      setMessage({ type: "success", text: "Banner status updated." });
    } catch (err) {
      console.error("Toggle error:", err);
      setMessage({ type: "error", text: "Failed to toggle banner status." });
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete banner "${title}"?`)) return;
    try {
      await adminApi.deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      setMessage({ type: "success", text: "Banner deleted successfully." });
    } catch (err) {
      console.error("Delete error:", err);
      setMessage({ type: "error", text: "Failed to delete banner." });
    }
  };

  const filteredBanners = banners.filter((banner) => {
    const matchesSearch =
      (banner.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (banner.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (banner.notes || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPage =
      pageFilter === "ALL" ||
      (banner.targetPage || "").toUpperCase() === pageFilter.toUpperCase();

    const matchesType =
      typeFilter === "ALL" ||
      (banner.displayType || "").toUpperCase() === typeFilter.toUpperCase();

    return matchesSearch && matchesPage && matchesType;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {message.text && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between shadow-sm transition-all animate-in fade-in slide-in-from-top-2 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-3">
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="text-sm font-semibold">{message.text}</span>
          </div>
          <button
            onClick={() => setMessage({ type: "", text: "" })}
            className="p-1 hover:bg-black/5 rounded-lg text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Banner & Promotion Rules
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Manage promotional banners, modal popups, scroll triggers, and campaign durations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBanners}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-[#0082fe] hover:bg-blue-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Banner
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, description, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Target Page Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={pageFilter}
            onChange={(e) => setPageFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500"
          >
            <option value="ALL">All Target Pages</option>
            {TARGET_PAGES.filter((p) => p.value !== "ALL").map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500"
          >
            <option value="ALL">All Display Types</option>
            <option value="POPUP">Popup (Modal Overlay)</option>
            <option value="IN_PAGE">In-Page Banner</option>
          </select>
        </div>
      </div>

      {/* Banner Cards Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">Loading banner rules...</p>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Banners Configured</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Create your first promotional banner with image, GIF, or video, and set custom page triggers and expiry schedules.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-2 px-4 py-2 bg-[#0082fe] hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create First Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBanners.map((banner) => {
            const isVideo = banner.mediaType === "VIDEO";
            const isGif = banner.mediaType === "GIF";
            const isPopup = banner.displayType === "POPUP";
            const isPermanent = banner.durationType === "PERMANENT";

            return (
              <div
                key={banner.id}
                className={`bg-white rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  banner.active ? "border-slate-200" : "border-slate-200 opacity-70 bg-slate-50/50"
                }`}
              >
                {/* Media Preview Box */}
                <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden group">
                  {isVideo ? (
                    <video
                      src={banner.mediaUrl}
                      controls={false}
                      muted
                      autoPlay
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={banner.mediaUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = "/images/promo/grab-welcome-poster-blue.jpg";
                      }}
                    />
                  )}

                  {/* Badges on Top of Media */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-xs ${
                        isPopup
                          ? "bg-purple-600/90 text-white"
                          : "bg-blue-600/90 text-white"
                      }`}
                    >
                      {banner.displayType}
                    </span>

                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-md flex items-center gap-1">
                      {isVideo ? (
                        <Film className="w-2.5 h-2.5" />
                      ) : (
                        <ImageIcon className="w-2.5 h-2.5" />
                      )}
                      {banner.mediaType}
                    </span>
                  </div>

                  {/* Target Page Pill */}
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 text-slate-900 shadow-xs">
                      Page: {banner.targetPage}
                    </span>
                  </div>

                  {/* Live Preview Button */}
                  <button
                    onClick={() => setPreviewBanner(banner)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs gap-1.5 transition-opacity backdrop-blur-xs cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Modal
                  </button>
                </div>

                {/* Details Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1">
                        {banner.title}
                      </h3>
                      {/* Active Status Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                          banner.active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {banner.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>

                    {banner.description && (
                      <p className="text-xs text-slate-600 font-medium line-clamp-2 mt-1">
                        {banner.description}
                      </p>
                    )}

                    {/* Rules Metadata Pills */}
                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-semibold">
                      {isPopup && (
                        <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          {banner.popupTrigger === "ON_LOAD" ? (
                            <>
                              <Timer className="w-3.5 h-3.5 text-blue-600" />
                              <span>On Load ({banner.triggerDelaySeconds || 3}s)</span>
                            </>
                          ) : (
                            <>
                              <MousePointer className="w-3.5 h-3.5 text-indigo-600" />
                              <span>On Scroll ({banner.triggerScrollPercent || 30}%)</span>
                            </>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>
                          {isPermanent
                            ? "Permanent"
                            : banner.expiryDate
                            ? `Expires: ${new Date(banner.expiryDate).toLocaleDateString()}`
                            : "Temporary"}
                        </span>
                      </div>
                    </div>

                    {banner.notes && (
                      <div className="mt-2 bg-amber-50/60 border border-amber-200/60 p-2 rounded-lg flex items-start gap-1.5 text-[11px] text-amber-900 font-medium">
                        <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">Note: {banner.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Toggle Active */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(banner.active)}
                        onChange={() => handleToggle(banner.id)}
                        className="w-4 h-4 accent-[#0082fe] rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        {banner.active ? "Enabled" : "Disabled"}
                      </span>
                    </label>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(banner)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Banner"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id, banner.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {isEditing ? "Edit Banner Rule" : "Create New Banner Rule"}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Configure media, page targets, triggers, and duration.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Banner Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali Flash Offer, 20% Off Outstation Cabs"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Subtitle (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subtitle <span className="text-slate-400 font-normal">(Optional — shown in blue color in popup)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Your 365 Days Travel Partner"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Media File Upload (Image, GIF, Video) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Media File (Image, GIF, or Video) *
                </label>

                {/* Upload Button & Dropzone */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/mp4,video/webm,.gif"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 text-slate-700 text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Upload className={`w-4 h-4 ${uploading ? "animate-bounce" : ""}`} />
                    {uploading ? "Uploading..." : "Upload Image / GIF / Video"}
                  </button>

                  <span className="text-xs text-slate-400 font-bold">OR</span>

                  <input
                    type="url"
                    placeholder="Paste Media Direct URL (https://...)"
                    value={formData.mediaUrl}
                    onChange={(e) => {
                      const url = e.target.value;
                      let detected = formData.mediaType;
                      if (url.endsWith(".gif")) detected = "GIF";
                      else if (url.match(/\.(mp4|webm|mov)$/i)) detected = "VIDEO";
                      else if (url.match(/\.(png|jpg|jpeg|webp)$/i)) detected = "IMAGE";
                      setFormData({ ...formData, mediaUrl: url, mediaType: detected });
                    }}
                    className="w-full sm:flex-1 px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* Media Type Selector */}
                <div className="flex items-center gap-4 pt-1">
                  <span className="text-xs font-bold text-slate-600">Media Type:</span>
                  {["IMAGE", "GIF", "VIDEO"].map((t) => (
                    <label key={t} className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="mediaType"
                        value={t}
                        checked={formData.mediaType === t}
                        onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                        className="w-3.5 h-3.5 accent-[#0082fe]"
                      />
                      {t}
                    </label>
                  ))}
                </div>

                {/* Live Preview in Modal */}
                {formData.mediaUrl && (
                  <div className="mt-2 p-2 bg-slate-100 rounded-xl border border-slate-200 aspect-video max-h-48 flex items-center justify-center overflow-hidden">
                    {formData.mediaType === "VIDEO" ? (
                      <video
                        src={formData.mediaUrl}
                        controls
                        muted
                        autoPlay
                        loop
                        className="max-h-44 w-auto rounded-lg object-contain"
                      />
                    ) : (
                      <img
                        src={formData.mediaUrl}
                        alt="Preview"
                        className="max-h-44 w-auto rounded-lg object-contain"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Promo Subtitle
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Book chauffeur driven cabs at guaranteed lowest rates this festival season."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Target Page Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Page (Where it shows)
                </label>
                <select
                  value={formData.targetPage}
                  onChange={(e) => setFormData({ ...formData, targetPage: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500"
                >
                  {TARGET_PAGES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Display Type & Triggers */}
              <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-900">Display Type</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="displayType"
                        value="POPUP"
                        checked={formData.displayType === "POPUP"}
                        onChange={() => setFormData({ ...formData, displayType: "POPUP" })}
                        className="w-3.5 h-3.5 accent-[#0082fe]"
                      />
                      Popup Modal
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="displayType"
                        value="IN_PAGE"
                        checked={formData.displayType === "IN_PAGE"}
                        onChange={() => setFormData({ ...formData, displayType: "IN_PAGE" })}
                        className="w-3.5 h-3.5 accent-[#0082fe]"
                      />
                      In-Page Banner
                    </label>
                  </div>
                </div>

                {/* If Popup -> Trigger Options */}
                {formData.displayType === "POPUP" && (
                  <div className="pt-2 border-t border-blue-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Trigger Condition
                      </label>
                      <select
                        value={formData.popupTrigger}
                        onChange={(e) => setFormData({ ...formData, popupTrigger: e.target.value })}
                        className="w-full py-1.5 px-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="ON_LOAD">On Page Load (After delay)</option>
                        <option value="ON_SCROLL">On Scroll (User scrolls page)</option>
                      </select>
                    </div>

                    {formData.popupTrigger === "ON_LOAD" ? (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Delay Time (Seconds)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={60}
                          value={formData.triggerDelaySeconds}
                          onChange={(e) =>
                            setFormData({ ...formData, triggerDelaySeconds: Number(e.target.value) })
                          }
                          className="w-full py-1.5 px-2.5 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Scroll Depth (%)
                        </label>
                        <input
                          type="number"
                          min={5}
                          max={90}
                          value={formData.triggerScrollPercent}
                          onChange={(e) =>
                            setFormData({ ...formData, triggerScrollPercent: Number(e.target.value) })
                          }
                          className="w-full py-1.5 px-2.5 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Duration: Permanent vs Temporary */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">Duration & Scheduling</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="durationType"
                        value="PERMANENT"
                        checked={formData.durationType === "PERMANENT"}
                        onChange={() => setFormData({ ...formData, durationType: "PERMANENT" })}
                        className="w-3.5 h-3.5 accent-[#0082fe]"
                      />
                      Permanent (Always Active)
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="durationType"
                        value="TEMPORARY"
                        checked={formData.durationType === "TEMPORARY"}
                        onChange={() => setFormData({ ...formData, durationType: "TEMPORARY" })}
                        className="w-3.5 h-3.5 accent-[#0082fe]"
                      />
                      Temporary (Campaign Dates)
                    </label>
                  </div>
                </div>

                {formData.durationType === "TEMPORARY" && (
                  <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Start Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full py-1.5 px-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Expiry Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        className="w-full py-1.5 px-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Helpline Information (Optional) */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-extrabold text-slate-900 block">
                  Helpline Section <span className="text-slate-400 font-normal">(Optional — shown in popup)</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Helpline Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 24/7 HELPLINE & INSTANT BOOKING"
                      value={formData.helplineTitle}
                      onChange={(e) => setFormData({ ...formData, helplineTitle: e.target.value })}
                      className="w-full py-1.5 px-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Phone Number (leave empty to hide)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. (+91) 9071 100 200"
                      value={formData.helplineNumber}
                      onChange={(e) => setFormData({ ...formData, helplineNumber: e.target.value })}
                      className="w-full py-1.5 px-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes (Admin Remarks or Terms)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Campaign running for New Year weekend. Only applicable on Outstation trips."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Active Toggle & Order */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 accent-[#0082fe] rounded cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Publish immediately (Active)
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Sort Priority:</span>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    className="w-16 py-1 px-2 text-xs font-bold rounded-lg border border-slate-200 text-center"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#0082fe] hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {isEditing ? "Save Changes" : "Create Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE TEST PREVIEW MODAL */}
      {previewBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className={`relative ${previewBanner.mediaType === "VIDEO" ? 'max-w-3xl lg:max-w-4xl' : 'max-w-2xl'} w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col transition-all`}>
            {/* Close Button */}
            <button
              onClick={() => setPreviewBanner(null)}
              className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Dynamic Content Layout */}
            <div className={`grid grid-cols-1 ${previewBanner.mediaType === "VIDEO" ? 'md:grid-cols-12 items-center' : 'md:grid-cols-2'}`}>
              {/* Left Side: Uploaded Media without cropping */}
              <div className={`relative flex items-center justify-center p-3 sm:p-5 ${previewBanner.mediaType === "VIDEO" ? 'md:col-span-7 bg-slate-900/5' : 'bg-white'}`}>
                <div className="relative w-full rounded-2xl overflow-hidden flex items-center justify-center">
                  {previewBanner.mediaType === "VIDEO" ? (
                    <video
                      src={previewBanner.mediaUrl}
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-auto max-h-[65vh] object-contain rounded-2xl shadow-xs"
                    />
                  ) : (
                    <img
                      src={previewBanner.mediaUrl}
                      alt={previewBanner.title}
                      className="w-full h-auto max-h-[65vh] object-contain rounded-2xl"
                      onError={(e) => {
                        e.target.src = "/images/promo/grab-welcome-poster-blue.jpg";
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Right Side: Text & Actions */}
              <div className={`${previewBanner.mediaType === "VIDEO" ? 'md:col-span-5' : ''} p-5 sm:p-7 flex flex-col justify-center text-center md:text-left bg-white`}>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {previewBanner.title || "Grab Rentals"}
                </h2>

                {previewBanner.subtitle && (
                  <p className="text-sm sm:text-base font-bold text-[#0082fe] mt-1.5">
                    {previewBanner.subtitle}
                  </p>
                )}

                {previewBanner.description && (
                  <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 whitespace-pre-line">
                    {previewBanner.description}
                  </p>
                )}

                {/* Helpline (Optional — only shows if phone number is provided) */}
                {previewBanner.helplineNumber && (
                  <>
                    <div className="my-5 border-t border-slate-200 border-dashed"></div>
                    <div className="mb-5">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        {previewBanner.helplineTitle || "24/7 HELPLINE & INSTANT BOOKING"}
                      </span>
                      <a
                        href={`tel:${previewBanner.helplineNumber.replace(/[^0-9+]/g, '')}`}
                        className="inline-flex items-center justify-center md:justify-start text-lg sm:text-xl font-black text-slate-900 hover:text-[#0082fe] transition-colors"
                      >
                        <span>Ph: {previewBanner.helplineNumber}</span>
                      </a>
                    </div>
                  </>
                )}

                {/* Buttons */}
                <div className={`grid grid-cols-2 gap-3 ${!previewBanner.helplineNumber ? 'mt-4 pt-4 border-t border-slate-100' : ''}`}>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0082fe] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Now</span>
                  </button>

                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
