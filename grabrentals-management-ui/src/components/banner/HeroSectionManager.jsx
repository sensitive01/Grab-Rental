"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Upload,
  Trash2,
  Plus,
  Check,
  AlertCircle,
  Eye,
  RefreshCw,
  Star,
  Layers,
  ArrowRight,
  ExternalLink,
  Sliders,
  Image as ImageIcon,
  CheckCircle2,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";

export const HERO_PAGES = [
  { key: "HOME", label: "Home Page", route: "/", defaultAccent: "text-brand-orange" },
  { key: "AIRPORT", label: "Airport Transfers", route: "/airport", defaultAccent: "text-brand-orange" },
  { key: "VANS", label: "Tempo Travellers & Vans", route: "/vans", defaultAccent: "text-brand-orange" },
  { key: "BUSES", label: "Luxury Coaches & Buses", route: "/buses", defaultAccent: "text-brand-orange" },
  { key: "EV_CABS", label: "⚡ EV Cabs", route: "/ev-cabs", defaultAccent: "text-emerald-400" },
  { key: "PET_FRIENDLY", label: "🐶 Pet Friendly Cabs", route: "/pet-friendly-cabs", defaultAccent: "text-amber-400" },
  { key: "PACKAGES", label: "Tour Packages", route: "/packages", defaultAccent: "text-brand-amber" },
  { key: "LOCAL", label: "Local Hourly Rentals", route: "/local", defaultAccent: "text-brand-orange" },
  { key: "FLEET", label: "Fleet Catalog", route: "/fleet", defaultAccent: "text-brand-orange" },
  { key: "CORPORATE", label: "Corporate Mobility", route: "/corporate", defaultAccent: "text-brand-orange" },
];

export const PAGE_DEFAULT_TEMPLATES = {
  HOME: {
    badgeText: "⭐ Fast-Track Online Reservation",
    titleLine1: "India's Most Trusted Cab Rental Service",
    titleLine2: "Car, Van & Bus Rentals",
    subtitle: "Transparent billing, expert verified drivers, and pristine AC vehicles for Outstation, Local & Airport transit across 2,000+ Indian cities.",
    bgImages: ["/images/customer-hero-banner.png"],
  },
  AIRPORT: {
    badgeText: "✈️ 100% On-Time Guarantee",
    titleLine1: "Reliable Airport Transfers",
    titleLine2: "Flight Tracking & Meet & Greet",
    subtitle: "Pre-book your airport pickup or drop with Grab Rentals. Enjoy flight tracking, 1 hr free waiting time, and meet-and-greet services.",
    bgImages: ["/images/customer-hero-banner.png"],
  },
  VANS: {
    badgeText: "👥 9 to 26 Seater Vehicles",
    titleLine1: "Tempo Traveller & Van Rentals",
    titleLine2: "Force Urbania & Luxury Vans",
    subtitle: "Travel together. Rent premium Force Urbania and luxury Tempo Travellers for outstation family trips and group tours.",
    bgImages: ["/images/customer-hero-banner.png"],
  },
  BUSES: {
    badgeText: "🚌 35 to 55 Seater Luxury Coaches",
    titleLine1: "Luxury Bus Rentals",
    titleLine2: "Wedding & Corporate Fleet",
    subtitle: "Volvo, Scania, and Mercedes coaches for weddings, corporate offsites, and large group travel across India.",
    bgImages: ["/images/customer-hero-banner.png"],
  },
  EV_CABS: {
    badgeText: "⚡ 100% Electric Mobility",
    titleLine1: "Zero-Emission Electric Cabs",
    titleLine2: "Eco-Friendly Travel",
    subtitle: "Travel green with Grab Rentals EV fleet. Silent rides, zero pollution, and verified professional chauffeurs.",
    bgImages: ["/images/customer-hero-banner.png"],
  },
  PET_FRIENDLY: {
    badgeText: "🐶 Grab Rentals Pet Mobility",
    titleLine1: "Travel Anywhere with Your",
    titleLine2: "Furry Best Friend",
    subtitle: "Verified pet-loving chauffeurs, spacious AC cabs, and zero refusal. Travel outstation, local, or airport transfers comfortably together.",
    bgImages: ["/images/customer-hero-banner.png"],
  },
  PACKAGES: {
    badgeText: "🌄 Special Roadtrip & Tour Packages",
    titleLine1: "Outstation Tourist Packages",
    titleLine2: "Curated Scenic Highway Expeditions",
    subtitle: "Multi-day scenic highway expeditions and curated roadtrips - Goa, Ladakh, Ooty, Coorg, and beyond. Fixed all-inclusive fares with seasoned highway chauffeurs and premium SUVs.",
    bgImages: ["/images/customer-hero-banner.png"],
  },
  LOCAL: {
    badgeText: "⏱️ Flexible Hourly Packages",
    titleLine1: "Local City Cabs by the Hour",
    titleLine2: "Chauffeur at Your Disposal",
    subtitle: "Rent a car with chauffeur for multiple stops, city shopping, meetings, and family visits with flexible 4hr/40km and 8hr/80km packages.",
    bgImages: ["/images/customer-hero-banner.png"],
  },
  FLEET: {
    badgeText: "🚘 Grab Rentals Executive Fleet",
    titleLine1: "Pristine Vehicles for Every Journey",
    titleLine2: "Hatchback to Luxury Buses",
    subtitle: "Browse our diverse fleet of hatchbacks, sedans, Innova Crysta, Hycross, Force Urbania, and luxury coaches.",
    bgImages: ["/images/customer-hero-banner.png"],
  },
  CORPORATE: {
    badgeText: "💼 Corporate Travel Solutions",
    titleLine1: "Enterprise Mobility & Employee Transit",
    titleLine2: "Monthly Invoicing & Dedicated Account",
    subtitle: "Trusted by top corporations for executive travel, airport transfers, events, and monthly fleet contracts with transparent reporting.",
    bgImages: ["/images/customer-hero-banner.png"],
  },
};


export default function HeroSectionManager() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState("HOME");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [pageDropdownOpen, setPageDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Form State for currently selected page
  const [formData, setFormData] = useState({
    pageKey: "HOME",
    pageName: "Home Page",
    badgeText: "",
    titleLine1: "",
    titleLine2: "",
    subtitle: "",
    bgImages: [],
    hasDetails: false,
    active: true,
  });

  // Preview slideshow index for auto-scrolling
  const [previewIdx, setPreviewIdx] = useState(0);
  const fileInputRef = useRef(null);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getHeroSections();
      if (res?.data && Array.isArray(res.data)) {
        setSections(res.data);
        const current = res.data.find((s) => s.pageKey === selectedKey);
        if (current) {
          loadIntoForm(current);
        }
      }
    } catch (err) {
      console.error("Failed to load hero sections:", err);
      setMessage({ type: "error", text: "Failed to load hero section data from server." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setPageDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onSelectPage = (key) => {
    handleSelectPage(key);
    setPageDropdownOpen(false);
  };

  const loadIntoForm = (data) => {
    const images = Array.isArray(data.bgImages) && data.bgImages.length > 0
      ? data.bgImages
      : data.bgImageUrl
        ? [data.bgImageUrl]
        : [];

    const pageKey = data.pageKey || selectedKey;
    const template = PAGE_DEFAULT_TEMPLATES[pageKey] || PAGE_DEFAULT_TEMPLATES.HOME;

    setFormData({
      pageKey: pageKey,
      pageName: data.pageName || getPageMeta(selectedKey).label,
      badgeText: data.badgeText || template.badgeText,
      titleLine1: data.titleLine1 || template.titleLine1,
      titleLine2: data.titleLine2 || template.titleLine2,
      subtitle: data.subtitle || template.subtitle,
      bgImages: images,
      hasDetails: Boolean(data.hasDetails),
      active: data.active ?? true,
    });
    setPreviewIdx(0);
    setMessage({ type: "", text: "" });
  };

  const handleLoadDefaultTemplate = () => {
    const template = PAGE_DEFAULT_TEMPLATES[selectedKey] || PAGE_DEFAULT_TEMPLATES.HOME;
    setFormData((prev) => ({
      ...prev,
      badgeText: template.badgeText,
      titleLine1: template.titleLine1,
      titleLine2: template.titleLine2,
      subtitle: template.subtitle,
      bgImages: prev.bgImages.length > 0 ? prev.bgImages : template.bgImages,
      hasDetails: true,
      active: true,
    }));
    setMessage({
      type: "success",
      text: `Loaded default template for ${getPageMeta(selectedKey).label}! Edit as needed and click "Save & Publish Changes".`,
    });
  };

  const handleSelectPage = (key) => {
    setSelectedKey(key);
    const existing = sections.find((s) => s.pageKey === key);
    if (existing) {
      loadIntoForm(existing);
    } else {
      const meta = getPageMeta(key);
      const template = PAGE_DEFAULT_TEMPLATES[key] || PAGE_DEFAULT_TEMPLATES.HOME;
      setFormData({
        pageKey: key,
        pageName: meta.label,
        badgeText: template.badgeText,
        titleLine1: template.titleLine1,
        titleLine2: template.titleLine2,
        subtitle: template.subtitle,
        bgImages: [],
        hasDetails: false,
        active: true,
      });
      setPreviewIdx(0);
    }
  };

  // Auto-scroll slideshow in preview
  useEffect(() => {
    if (formData.bgImages.length <= 1) return;
    const interval = setInterval(() => {
      setPreviewIdx((prev) => (prev + 1) % formData.bgImages.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [formData.bgImages.length]);

  const getPageMeta = (key) => {
    return HERO_PAGES.find((p) => p.key === key) || { key, label: key, route: `/${key.toLowerCase()}` };
  };

  // Upload multiple images to Cloudinary
  const handleFilesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      setMessage({ type: "info", text: `Uploading ${files.length} photo(s) to cloud storage...` });

      const uploadedUrls = [];
      for (const file of files) {
        const res = await adminApi.uploadBannerMedia(file);
        if (res?.data?.url) {
          uploadedUrls.push(res.data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          bgImages: [...prev.bgImages, ...uploadedUrls],
          hasDetails: true,
        }));
        setMessage({
          type: "success",
          text: `Successfully uploaded ${uploadedUrls.length} image(s)! They will auto-scroll on customer view.`,
        });
      }
    } catch (err) {
      console.error("Multi-image upload error:", err);
      setMessage({ type: "error", text: "Image upload failed. Please ensure images are under 10MB." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    const trimmed = customUrlInput.trim();
    setFormData((prev) => ({
      ...prev,
      bgImages: [...prev.bgImages, trimmed],
      hasDetails: true,
    }));
    setCustomUrlInput("");
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => {
      const nextImages = prev.bgImages.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        bgImages: nextImages,
      };
    });
    setPreviewIdx(0);
  };

  // Save changes
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      const payload = {
        pageKey: formData.pageKey,
        pageName: formData.pageName,
        badgeText: formData.badgeText,
        titleLine1: formData.titleLine1,
        titleLine2: formData.titleLine2,
        subtitle: formData.subtitle,
        bgImages: formData.bgImages,
        bgImageUrl: formData.bgImages[0] || null,
        hasDetails: formData.hasDetails && (formData.bgImages.length > 0 || formData.titleLine1.trim().length > 0),
        active: formData.active,
      };

      const res = await adminApi.updateHeroSection(formData.pageKey, payload);
      if (res?.data) {
        setSections((prev) => {
          const idx = prev.findIndex((s) => s.pageKey === formData.pageKey);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = res.data;
            return next;
          }
          return [...prev, res.data];
        });
        loadIntoForm(res.data);
        setMessage({
          type: "success",
          text: `Hero banner for ${formData.pageName} saved successfully! Changes are live on customer view.`,
        });
      }
    } catch (err) {
      console.error("Save hero section error:", err);
      setMessage({ type: "error", text: "Failed to save hero section. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  // Remove details to show clean white screen
  const handleClearToWhiteScreen = async () => {
    if (!confirm(`Are you sure you want to remove all details for "${formData.pageName}"? The customer page will display a clean white screen with no banner.`)) {
      return;
    }

    try {
      setSaving(true);
      const res = await adminApi.clearHeroSection(formData.pageKey);
      if (res?.data) {
        setSections((prev) => prev.map((s) => (s.pageKey === formData.pageKey ? res.data : s)));
        loadIntoForm(res.data);
        setMessage({
          type: "success",
          text: `All hero details cleared for ${formData.pageName}. Customer page will now display a clean white screen!`,
        });
      }
    } catch (err) {
      console.error("Clear hero section error:", err);
      setMessage({ type: "error", text: "Failed to clear hero section." });
    } finally {
      setSaving(false);
    }
  };

  const currentMeta = getPageMeta(selectedKey);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Page Header Hero Section CMS
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Hero Banners & Content Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Upload single or multiple scrolling background photos, customize badge text, headings, and descriptions per page. If no details are added, the page displays a clean white screen.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchSections}
              disabled={loading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <a
              href={`http://localhost:3000${currentMeta.route}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Customer Page
            </a>
          </div>
        </div>

        {/* Page Selector Dropdown */}
        <div className="mt-6 pt-6 border-t border-slate-800/80" ref={dropdownRef}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Select Customer Page to Customize:
              </p>
              <p className="text-xs text-slate-300">
                Choose a page route from the dropdown to configure its hero banner or white screen.
              </p>
            </div>

            {/* Dropdown Selector */}
            <div className="relative min-w-full sm:min-w-[360px] md:min-w-[400px]">
              <button
                type="button"
                onClick={() => setPageDropdownOpen(!pageDropdownOpen)}
                className="w-full flex items-center justify-between gap-3 bg-slate-900/95 hover:bg-slate-800 border-2 border-slate-700 hover:border-blue-500 rounded-2xl px-4 py-3 text-left transition-all shadow-lg shadow-black/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      sections.find((s) => s.pageKey === selectedKey)?.hasDetails
                        ? "bg-emerald-400 ring-4 ring-emerald-400/20"
                        : "bg-slate-500 ring-4 ring-slate-500/20"
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white truncate">
                        {currentMeta.label}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0">
                        ({currentMeta.route})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      sections.find((s) => s.pageKey === selectedKey)?.hasDetails
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {sections.find((s) => s.pageKey === selectedKey)?.hasDetails
                      ? "Active"
                      : "White Screen"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      pageDropdownOpen ? "rotate-180 text-blue-400" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Dropdown Menu */}
              {pageDropdownOpen && (
                <div className="absolute right-0 left-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 max-h-[380px] overflow-y-auto space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1 flex items-center justify-between">
                    <span>Choose Page to Edit ({HERO_PAGES.length})</span>
                    <span className="text-[9px] text-slate-500">Live Status</span>
                  </div>
                  {HERO_PAGES.map((page) => {
                    const sec = sections.find((s) => s.pageKey === page.key);
                    const hasContent = sec && sec.hasDetails;
                    const isSelected = selectedKey === page.key;

                    return (
                      <button
                        key={page.key}
                        type="button"
                        onClick={() => onSelectPage(page.key)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-600/25 border border-blue-500/50 text-white"
                            : "hover:bg-slate-800/80 text-slate-300 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              hasContent ? "bg-emerald-400" : "bg-slate-500"
                            }`}
                          />
                          <div className="min-w-0">
                            <p className={`text-xs font-bold truncate ${isSelected ? "text-blue-300" : "text-white"}`}>
                              {page.label}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400">
                              {page.route}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              hasContent
                                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            {hasContent ? "🟢 Active" : "⚪ White Screen"}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Notification Toast */}
      {message.text && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-xs ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : message.type === "error"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-blue-50 text-blue-800 border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage({ type: "", text: "" })}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Live Preview & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Visual Preview Card (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Live Customer Preview ({formData.pageName})
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  formData.hasDetails && (formData.bgImages.length > 0 || formData.titleLine1)
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {formData.hasDetails && (formData.bgImages.length > 0 || formData.titleLine1)
                  ? `🟢 Banner Active (${formData.bgImages.length} Image${formData.bgImages.length === 1 ? "" : "s"})`
                  : "⚪ White Screen (No Details)"}
              </span>
            </div>

            {/* PREVIEW CONTAINER */}
            {!formData.hasDetails || (formData.bgImages.length === 0 && !formData.titleLine1) ? (
              /* WHITE SCREEN MOCKUP */
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center flex flex-col items-center justify-center min-h-[300px] text-slate-500 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="max-w-xs">
                  <h4 className="text-sm font-bold text-slate-800">Clean White Screen Active</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    No hero details are published for this page. The customer website displays a clean white background area with the booking widget, without any banner image or fallback picture.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLoadDefaultTemplate}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <Plus className="w-3.5 h-3.5" /> + Add Hero Banner Details
                </button>
              </div>
            ) : (
              /* ACTIVE HERO BANNER SIMULATOR */
              <div className="relative rounded-2xl overflow-hidden text-white bg-slate-900 min-h-[340px] flex flex-col items-center justify-center text-center p-6 sm:p-8 shadow-inner select-none">
                {/* Background Image(s) with Smooth Crossfade */}
                {formData.bgImages.length > 0 ? (
                  formData.bgImages.map((imgUrl, i) => (
                    <div
                      key={i}
                      className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${
                        i === previewIdx ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                      }`}
                      style={{ backgroundImage: `url("${imgUrl}")` }}
                    />
                  ))
                ) : (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url("/images/customer-hero-banner.png")' }}
                  />
                )}

                {/* Dark Gradient Overlay (Exact match from frontend) */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/30 to-slate-950/80" />

                {/* Content Layer */}
                <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
                  {/* Badge */}
                  {formData.badgeText && (
                    <div className="inline-flex items-center gap-1.5 bg-[#0082fe] border border-blue-400/40 px-3.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest text-white mb-3 shadow-lg shadow-blue-900/40">
                      <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                      <span>{formData.badgeText}</span>
                    </div>
                  )}

                  {/* Title 1 & Title 2 */}
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-2 drop-shadow-2xl">
                    <span className="block text-white">{formData.titleLine1 || "India's Most Trusted Cab Rental"}</span>
                    {formData.titleLine2 && (
                      <span className="text-brand-orange drop-shadow-lg block mt-1">
                        {formData.titleLine2}
                      </span>
                    )}
                  </h2>

                  {/* Subtitle */}
                  {formData.subtitle && (
                    <p className="text-xs sm:text-sm text-slate-200 font-medium drop-shadow-md line-clamp-3 max-w-md">
                      {formData.subtitle}
                    </p>
                  )}

                  {/* Slideshow Indicator Dots (When multiple images exist) */}
                  {formData.bgImages.length > 1 && (
                    <div className="flex items-center gap-1.5 mt-4 pt-1">
                      {formData.bgImages.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPreviewIdx(i)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            i === previewIdx ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                          }`}
                          aria-label={`Go to slide ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Left/Right manual slide controls if multiple images */}
                {formData.bgImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewIdx((prev) => (prev - 1 + formData.bgImages.length) % formData.bgImages.length)
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer transition-colors z-20"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewIdx((prev) => (prev + 1) % formData.bgImages.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer transition-colors z-20"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Preview Status Footer Info */}
            <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Route: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{currentMeta.route}</code></span>
              {formData.bgImages.length > 1 && (
                <span className="text-blue-600 font-medium flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Auto-scrolling ({previewIdx + 1} of {formData.bgImages.length})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Content Editor Form (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Configure {formData.pageName}</h3>
                <p className="text-xs text-slate-500">Edit background photos and text copy</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadDefaultTemplate}
                  className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Load recommended default headlines, badge, and description for this page"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Fill Default Text
                </button>

                {/* White Screen Toggle / Clear Button */}
                {formData.hasDetails && (
                  <button
                    type="button"
                    onClick={handleClearToWhiteScreen}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Show White Screen
                  </button>
                )}
              </div>
            </div>

            {/* SECTION 1: MULTIPLE BACKGROUND IMAGES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  Background Photos ({formData.bgImages.length} uploaded)
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Multiple photos will auto-scroll</span>
              </div>

              {/* Upload Drop Zone / Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFilesUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className={`w-4 h-4 ${uploading ? "animate-spin" : ""}`} />
                  <span>{uploading ? "Uploading Photos..." : "Upload Multiple Photos"}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      bgImages: ["/images/customer-hero-banner.png"],
                      hasDetails: true,
                    }))
                  }
                  className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  Use Default Photo
                </button>
              </div>

              {/* URL Input Helper */}
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="Or paste external image URL..."
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomUrl}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
                >
                  Add URL
                </button>
              </div>

              {/* Thumbnail Gallery of Uploaded Photos */}
              {formData.bgImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  {formData.bgImages.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-100 shadow-2xs"
                    >
                      <img src={url} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-2">
                        <span className="text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                          Slide #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="w-6 h-6 rounded-full bg-rose-600 text-white hover:bg-rose-700 flex items-center justify-center cursor-pointer shadow-md"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: TEXT CONTENTS */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              {/* Badge Text */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Pill Badge Text
                </label>
                <input
                  type="text"
                  value={formData.badgeText}
                  onChange={(e) => setFormData({ ...formData, badgeText: e.target.value, hasDetails: true })}
                  placeholder={PAGE_DEFAULT_TEMPLATES[selectedKey]?.badgeText || "e.g. ⭐ Grab Rentals - India's first ISO travel company"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Title Line 1 */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Main Title Line 1 (White Headline)
                </label>
                <input
                  type="text"
                  value={formData.titleLine1}
                  onChange={(e) => setFormData({ ...formData, titleLine1: e.target.value, hasDetails: true })}
                  placeholder={PAGE_DEFAULT_TEMPLATES[selectedKey]?.titleLine1 || "e.g. India's Most Trusted Cab Rental Service"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Title Line 2 */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Main Title Line 2 (Accent Headline)
                </label>
                <input
                  type="text"
                  value={formData.titleLine2}
                  onChange={(e) => setFormData({ ...formData, titleLine2: e.target.value, hasDetails: true })}
                  placeholder={PAGE_DEFAULT_TEMPLATES[selectedKey]?.titleLine2 || "e.g. Car, Van & Bus Rentals"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-brand-orange focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Subtitle / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Subtitle Description
                </label>
                <textarea
                  rows={3}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value, hasDetails: true })}
                  placeholder={PAGE_DEFAULT_TEMPLATES[selectedKey]?.subtitle || "e.g. Transparent billing, expert verified drivers, and pristine AC vehicles across 2,000+ Indian cities."}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Status Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-800">Banner Enabled</p>
                  <p className="text-[10px] text-slate-500">Uncheck to temporarily show white screen without deleting copy</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.hasDetails && formData.active}
                  onChange={(e) => setFormData({ ...formData, hasDetails: e.target.checked, active: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 stroke-[3]" />
                )}
                <span>Save & Publish Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

