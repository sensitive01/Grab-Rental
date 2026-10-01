"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bell, 
  Car, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Clock, 
  ArrowLeft, 
  Trash2, 
  CheckCheck, 
  ChevronRight,
  ShieldCheck,
  Tag,
  Loader2
} from "lucide-react";
import { customerApi } from "@/lib/customerApi";
import { isAuthenticated } from "@/lib/auth";

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadNotifications() {
      try {
        let bookings = [];
        if (isAuthenticated()) {
          try {
            const res = await customerApi.getBookings();
            if (res?.data && Array.isArray(res.data)) {
              bookings = res.data;
            }
          } catch (err) {
            console.warn("[Notifications] Error fetching bookings:", err);
          }
        }

        // Check sessionStorage
        if (typeof window !== "undefined") {
          try {
            const stored = sessionStorage.getItem("grab_confirmed_booking");
            if (stored) {
              const parsed = JSON.parse(stored);
              const exists = bookings.some(b => b.bookingReference === parsed.bookingReference || b.id === parsed.id);
              if (!exists) bookings.unshift(parsed);
            }
          } catch {}
        }

        const generated = [];

        // Generate dynamic notifications from real bookings
        bookings.forEach((b, index) => {
          const ref = b.bookingReference || b.id || "GR-BOOKING";
          const pickup = b.pickupCity || "Origin";
          const drop = b.dropCity || "Destination";

          if (b.status === "COMPLETED") {
            generated.push({
              id: `notif-comp-${ref}`,
              category: "billing",
              title: "GST Tax Invoice Ready",
              message: `Tax Invoice for your ${pickup} to ${drop} trip (#${ref}) has been generated and is ready for download.`,
              time: "Recent",
              date: "Completed Trip",
              unread: false,
              actionUrl: `/account/bookings/${ref}/invoice`,
              actionText: "Download Invoice PDF",
              icon: FileText,
              iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20"
            });
          }

          if (b.rideOtp) {
            generated.push({
              id: `notif-otp-${ref}`,
              category: "trips",
              title: "Ride Security OTP Generated",
              message: `Your 4-digit Ride OTP for Booking #${ref} is ${b.rideOtp}. Please share this with the chauffeur only upon boarding.`,
              time: "Live Security Code",
              date: "Active Trip",
              unread: true,
              actionUrl: `/account/bookings/${ref}`,
              actionText: "View Ride OTP",
              icon: ShieldCheck,
              iconColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            });
          }

          if (b.driverName) {
            generated.push({
              id: `notif-driver-${ref}`,
              category: "trips",
              title: "Chauffeur Assigned for Your Trip",
              message: `${b.driverName} (${b.driverPhone || "Chauffeur"}) driving ${b.vehicleModel || "fleet cab"} (${b.vehicleNumber || "Commercial"}) has been assigned for your ride to ${drop}.`,
              time: "Assigned",
              date: "Active Dispatch",
              unread: true,
              actionUrl: `/account/bookings/${ref}`,
              actionText: "Track Live Chauffeur",
              icon: Car,
              iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20"
            });
          } else {
            generated.push({
              id: `notif-book-${ref}`,
              category: "trips",
              title: "Booking Confirmed & Under Dispatch",
              message: `Your outstation journey from ${pickup} to ${drop} (#${ref}) is confirmed. Operations is allocating a sanitized vehicle.`,
              time: "Just Now",
              date: "Confirmed",
              unread: true,
              actionUrl: `/account/bookings/${ref}`,
              actionText: "View Booking",
              icon: CheckCircle2,
              iconColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            });
          }
        });

        // Add standard system welcome notification
        generated.push({
          id: "sys-welcome",
          category: "offers",
          title: "Welcome to Grab Rentals",
          message: "Enjoy guaranteed on-time departure, verified highway chauffeurs, and 24x7 on-road telemetry assistance.",
          time: "Member Benefit",
          date: "Ongoing",
          unread: false,
          actionUrl: "/",
          actionText: "Book New Journey",
          icon: Sparkles,
          iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20"
        });

        if (!isCancelled) {
          setNotifications(generated);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      isCancelled = true;
    };
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return n.unread;
    return n.category === filter;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Live trip updates, ride OTPs, and tax invoice alerts.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> Mark All Read
            </button>
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition-all shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Updates", count: notifications.length },
            { id: "unread", label: "Unread", count: unreadCount },
            { id: "trips", label: "Trip Alerts", count: notifications.filter(n => n.category === "trips").length },
            { id: "billing", label: "Invoices", count: notifications.filter(n => n.category === "billing").length },
            { id: "offers", label: "Benefits", count: notifications.filter(n => n.category === "offers").length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                filter === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${
                filter === tab.id ? "bg-slate-700 text-amber-300" : "bg-slate-100 text-slate-500"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No notifications</h3>
            <p className="text-xs text-slate-500">You are all caught up! There are no alerts matching this filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const Icon = notif.icon || Bell;
              return (
                <div
                  key={notif.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    notif.unread ? "border-amber-200/80 bg-amber-50/20" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${notif.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">{notif.title}</h4>
                        {notif.unread && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-xl">{notif.message}</p>
                      <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {notif.time}
                        </span>
                        <span>•</span>
                        <span>{notif.date}</span>
                      </div>
                    </div>
                  </div>

                  {notif.actionUrl && (
                    <Link
                      href={notif.actionUrl}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs shrink-0 self-start sm:self-center"
                    >
                      <span>{notif.actionText}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
