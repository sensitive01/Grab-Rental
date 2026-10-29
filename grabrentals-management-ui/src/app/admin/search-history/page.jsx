"use client";

import { useState, useEffect } from "react";
import { 
  Navigation, 
  Search, 
  Phone, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  RefreshCw, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle, 
  MessageCircle, 
  Eye, 
  Filter, 
  Layers, 
  Car, 
  Plane, 
  Package, 
  Info,
  TrendingUp,
  Globe,
  ArrowRight,
  X,
  Smartphone
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";

export default function AdminSearchHistoryPage() {
  const [searches, setSearches] = useState([]);
  const [stats, setStats] = useState({
    totalSearches: 0,
    searchesToday: 0,
    searchesThisWeek: 0,
    registeredUserSearches: 0,
    guestSearches: 0,
    searchesByService: {},
    topRoutes: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedSearch, setSelectedSearch] = useState(null);
  const [toast, setToast] = useState(null);

  // Calculate ISO date string based on date filter selection
  const getDateRangeParams = () => {
    const today = new Date();
    if (dateFilter === "TODAY") {
      const d = today.toISOString().split("T")[0];
      return { startDate: d, endDate: d };
    }
    if (dateFilter === "WEEK") {
      const past = new Date(today);
      past.setDate(past.getDate() - 7);
      return { startDate: past.toISOString().split("T")[0], endDate: today.toISOString().split("T")[0] };
    }
    if (dateFilter === "MONTH") {
      const past = new Date(today);
      past.setDate(past.getDate() - 30);
      return { startDate: past.toISOString().split("T")[0], endDate: today.toISOString().split("T")[0] };
    }
    return {};
  };

  async function loadData(showRefreshSpinner = false, page = currentPage) {
    if (showRefreshSpinner) setRefreshing(true);
    else setLoading(true);

    try {
      const dateParams = getDateRangeParams();
      const [listRes, statsRes] = await Promise.all([
        adminApi.getSearchHistory({
          serviceType: serviceFilter !== "ALL" ? serviceFilter : undefined,
          search: searchQuery.trim() || undefined,
          startDate: dateParams.startDate,
          endDate: dateParams.endDate,
          page,
          size: 20
        }),
        adminApi.getSearchHistoryStats()
      ]);

      if (listRes?.success && listRes.data) {
        setSearches(listRes.data.content || []);
        setTotalPages(listRes.data.totalPages || 1);
        setTotalElements(listRes.data.totalElements || 0);
      }

      if (statsRes?.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error("Failed to load search history:", err);
      setToast({ type: "error", message: "Failed to load search history from database." });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData(false, 0);
    setCurrentPage(0);
  }, [serviceFilter, dateFilter]);

  // Debounced search query
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(false, 0);
      setCurrentPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      loadData(false, newPage);
    }
  };

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this search history record?")) return;
    try {
      const res = await adminApi.deleteSearchHistory(id);
      if (res?.success) {
        setToast({ type: "success", message: "Search history record deleted successfully" });
        setSearches((prev) => prev.filter((item) => item.id !== id));
        if (selectedSearch?.id === id) setSelectedSearch(null);
        // Refresh stats
        const statsRes = await adminApi.getSearchHistoryStats();
        if (statsRes?.success) setStats(statsRes.data);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setToast({ type: "error", message: "Failed to delete search record" });
    }
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    try {
      // If dateStr doesn't contain a timezone indicator (Z or +/-offset), treat it as UTC
      let normalized = dateStr;
      if (typeof normalized === "string") {
        if (!normalized.endsWith("Z") && !/[+-]\d{2}(:\d{2})?$/.test(normalized)) {
          normalized = normalized + "Z";
        }
      }
      const d = new Date(normalized);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
    } catch {
      return dateStr;
    }
  };

  const formatPickupTime = (timeStr) => {
    if (!timeStr) return "—";
    const trimmed = String(timeStr).trim();
    if (/am|pm/i.test(trimmed)) return trimmed;
    const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!match) return trimmed;
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    if (isNaN(hours)) return trimmed;
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;
    const formattedHours = String(hours).padStart(2, "0");
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const formatScheduleDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        const d = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
        return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getServiceBadge = (type) => {
    switch (type?.toUpperCase()) {
      case "OUTSTATION":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Outstation</Badge>;
      case "AIRPORT":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Airport</Badge>;
      case "LOCAL":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Local</Badge>;
      case "PACKAGE":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Tour Package</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700">{type || "General"}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <PageHeader
        title="Customer Search History & Demand"
        description="Live tracking of all customer route queries, passenger contact details, and booking demand parameters."
      >
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between border-slate-200 shadow-xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Searches</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalSearches.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>{stats.searchesThisWeek} this week</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Navigation className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-slate-200 shadow-xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Searches Today</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.searchesToday.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Active demand in last 24h</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-slate-200 shadow-xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Customers</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">{stats.registeredUserSearches.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {stats.totalSearches > 0
                ? `${Math.round((stats.registeredUserSearches / stats.totalSearches) * 100)}% verified with Phone/OTP`
                : "No searches yet"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-slate-200 shadow-xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Guest Visitors</p>
            <h3 className="text-2xl font-black text-slate-700 mt-1">{stats.guestSearches.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Unregistered market inquiries</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Keyword Search */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name, phone, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 outline-hidden transition-all"
            />
          </div>

          {/* Service Tabs & Date Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Service Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              {[
                { id: "ALL", label: "All" },
                { id: "OUTSTATION", label: "Outstation" },
                { id: "AIRPORT", label: "Airport" },
                { id: "LOCAL", label: "Local" },
                { id: "PACKAGE", label: "Packages" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setServiceFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    serviceFilter === tab.id
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Date Filter Dropdown */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-hidden focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">Last 30 Days</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table Card */}
      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Service & Trip</th>
                <th className="py-3 px-4">Route (From → To)</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Distance & Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <p className="font-semibold text-sm">Loading search history...</p>
                  </td>
                </tr>
              ) : searches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Navigation className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700">No search records found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchQuery || serviceFilter !== "ALL"
                        ? "Try adjusting your search criteria or filters."
                        : "Searches performed on the customer site will appear here in real time."}
                    </p>
                  </td>
                </tr>
              ) : (
                searches.map((item) => {
                  const isRegistered = !!item.userPhone || !!item.userId || item.userRole === "CUSTOMER";
                  const cleanPhone = item.userPhone ? item.userPhone.replace(/\D/g, "").slice(-10) : "";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 whitespace-nowrap">
                        <div>{formatDateTime(item.createdAt)}</div>
                        <span className="text-[10.5px] text-slate-400 font-mono">#{item.id}</span>
                      </td>

                      {/* Customer Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isRegistered ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                          }`}>
                            {item.userName ? item.userName.charAt(0).toUpperCase() : "G"}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-sm">
                                {item.userName || "Guest Visitor"}
                              </span>
                              {isRegistered ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                  Guest
                                </span>
                              )}
                            </div>

                            {item.userPhone ? (
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-600 font-medium">{item.userPhone}</span>
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                                      `Hello ${item.userName || "Customer"}, thank you for searching on Grab Rentals for your ride from ${item.pickupLocation} to ${item.dropLocation || "destination"}. How can we assist you with best cab rates?`
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors"
                                    title="Chat on WhatsApp"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400">
                                {item.ipAddress ? `IP: ${item.ipAddress}` : "No phone provided"}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Service & Trip Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          {getServiceBadge(item.serviceType)}
                          <span className="text-xs text-slate-500 font-medium capitalize">
                            {item.tripType || "Standard"}
                          </span>
                        </div>
                      </td>

                      {/* Route (From -> To) */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-1">
                          <div className="flex items-start gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span className="text-xs font-semibold text-slate-900 truncate" title={item.pickupLocation}>
                              {item.pickupLocation}
                            </span>
                          </div>

                          {item.stops && (
                            <div className="pl-3.5 text-[11px] text-blue-600 font-medium flex items-center gap-1">
                              <span>via: {item.stops}</span>
                            </div>
                          )}

                          {item.dropLocation && (
                            <div className="flex items-start gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                              <span className="text-xs font-semibold text-slate-900 truncate" title={item.dropLocation}>
                                {item.dropLocation}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatScheduleDate(item.pickupDate)}</span>
                        </div>
                        {item.pickupTime && (
                          <div className="text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{formatPickupTime(item.pickupTime)}</span>
                          </div>
                        )}
                        {item.returnDate && (
                          <div className="text-[11px] text-blue-600 font-medium mt-0.5">
                            Return: {formatScheduleDate(item.returnDate)}
                          </div>
                        )}
                        {item.packageHoursKm && (
                          <div className="text-[11px] text-amber-700 font-bold mt-0.5">
                            Pkg: {item.packageHoursKm}
                          </div>
                        )}
                      </td>

                      {/* Distance & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                        {item.distanceKm ? (
                          <>
                            <div className="font-bold text-slate-900">{Math.round(item.distanceKm)} km</div>
                            <div className="text-slate-500 font-medium">{item.durationText || "—"}</div>
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedSearch(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>
              Showing {searches.length} of {totalElements} search inquiries
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <span className="px-3 py-1 font-bold text-slate-900">
                Page {currentPage + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      {selectedSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">Search #{selectedSearch.id}</span>
                  {getServiceBadge(selectedSearch.serviceType)}
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Search Details & Traveler Profile
                </h3>
                {selectedSearch.createdAt && (
                  <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Search Logged: <strong className="text-slate-800 font-bold">{formatDateTime(selectedSearch.createdAt)}</strong></span>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedSearch(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Customer Box */}
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm">
                    {selectedSearch.userName ? selectedSearch.userName.charAt(0).toUpperCase() : "G"}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{selectedSearch.userName || "Guest Visitor"}</h4>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {selectedSearch.userPhone || "No mobile number provided"}
                    </p>
                    {selectedSearch.userEmail && (
                      <p className="text-xs text-slate-500 font-medium">{selectedSearch.userEmail}</p>
                    )}
                  </div>
                </div>

                {selectedSearch.userPhone && (
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${selectedSearch.userPhone}`}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-all shadow-xs"
                      title="Call Passenger"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <a
                      href={`https://wa.me/91${selectedSearch.userPhone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                        `Hello ${selectedSearch.userName || "Customer"}, we noticed you searched for a cab from ${selectedSearch.pickupLocation} to ${selectedSearch.dropLocation || "destination"} on Grab Rentals. How can we help you with verified rates and booking confirmation?`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-xs flex items-center gap-1.5 font-bold text-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Route Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Route & Locations</h4>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Pickup Location</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedSearch.pickupLocation}</p>
                    {selectedSearch.pickupCoords && (
                      <span className="text-[10.5px] font-mono text-slate-500">GPS: {selectedSearch.pickupCoords}</span>
                    )}
                  </div>

                  {selectedSearch.stops && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Intermediate Stops</span>
                      <p className="text-xs font-semibold text-blue-700 mt-0.5">{selectedSearch.stops}</p>
                    </div>
                  )}

                  {selectedSearch.dropLocation && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Drop Destination</span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedSearch.dropLocation}</p>
                      {selectedSearch.dropCoords && (
                        <span className="text-[10.5px] font-mono text-slate-500">GPS: {selectedSearch.dropCoords}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule & Distance */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Pickup Schedule</span>
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    {formatScheduleDate(selectedSearch.pickupDate)} at {formatPickupTime(selectedSearch.pickupTime)}
                  </p>
                  {selectedSearch.returnDate && (
                    <p className="text-[11px] font-semibold text-blue-600 mt-0.5">Return: {formatScheduleDate(selectedSearch.returnDate)}</p>
                  )}
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Est. Distance & Toll</span>
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    {selectedSearch.distanceKm ? `${Math.round(selectedSearch.distanceKm)} km` : "—"}{" "}
                    {selectedSearch.durationText && `(${selectedSearch.durationText})`}
                  </p>
                  {selectedSearch.tollPrice ? (
                    <p className="text-[11px] font-semibold text-slate-600 mt-0.5">Toll: ₹{selectedSearch.tollPrice}</p>
                  ) : null}
                </div>
              </div>

              {/* Technical & Audit Details */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Technical Context</h4>
                <div className="grid grid-cols-2 gap-2 text-[11.5px]">
                  <div>IP Address: <span className="font-mono text-slate-700">{selectedSearch.ipAddress || "—"}</span></div>
                  <div>User Role: <span className="font-semibold text-slate-700">{selectedSearch.userRole || "GUEST"}</span></div>
                  <div>Source Page: <span className="font-mono text-slate-700">{selectedSearch.sourcePage || "/"}</span></div>
                  <div>Session: <span className="font-mono text-slate-700 truncate block">{selectedSearch.sessionId || "—"}</span></div>
                </div>
                {selectedSearch.userAgent && (
                  <div className="text-[10px] text-slate-400 font-mono break-all pt-1">
                    User Agent: {selectedSearch.userAgent}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedSearch(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
