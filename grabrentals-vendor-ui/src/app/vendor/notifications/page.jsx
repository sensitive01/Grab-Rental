"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Car, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ChevronRight
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Toast from "@/components/ui/Toast";
import { mockNotifications } from "@/lib/mockData";

export default function VendorNotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);

  const filteredNotifs = notifications.filter(
    n => selectedCategory === "all" || n.category === selectedCategory
  );

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setToastMessage("All alerts marked as read.");
  };

  const handleClearAll = () => {
    setNotifications([]);
    setToastMessage("Notification feed cleared.");
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "booking":
        return <Car className="w-4 h-4 text-amber-500" />;
      case "compliance":
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case "payment":
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header & Breadcrumbs */}
      <div className="space-y-1">
        <Breadcrumbs items={[{ label: "Notifications" }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Partner Alerts & Activity
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                {notifications.filter(n => !n.read).length} Unread
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Real-time updates on incoming trip requests, weekly payouts, and statutory document expiries.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </button>
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Clear
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold pb-1">
        {["all", "booking", "compliance", "payment", "trip"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl capitalize transition-all ${
              selectedCategory === cat
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat === "all" ? "All Notifications" : cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-black text-slate-900">Feed is Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You have reviewed all partner alerts for your fleet.
            </p>
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-2xl border p-5 shadow-2xs transition-all hover:border-slate-300 flex items-start justify-between gap-4 ${
                !n.read ? "border-amber-300 bg-amber-50/20" : "border-slate-200"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  {getCategoryIcon(n.category)}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900">{n.title}</h3>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed max-w-xl">{n.message}</p>
                  <p className="text-[11px] text-slate-400 font-medium pt-0.5">{n.time}</p>
                </div>
              </div>

              {n.actionUrl && (
                <Link
                  href={n.actionUrl}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1 shrink-0 self-center"
                >
                  View <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
