"use client";

import { useState } from "react";
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
  Tag
} from "lucide-react";

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      category: "trips",
      title: "Chauffeur Assigned for Your Trip",
      message: "Ramesh Kumar (+91 98450 12345) driving Toyota Innova Crysta (KA 01 MJ 4521) has been assigned for your ride to Mysuru.",
      time: "15 mins ago",
      date: "Today, 06:15 AM",
      unread: true,
      actionUrl: "/account/bookings/GR-84920",
      actionText: "Track Live Chauffeur",
      icon: Car,
      iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20"
    },
    {
      id: "n2",
      category: "trips",
      title: "Ride Security OTP Generated",
      message: "Your 4-digit Ride OTP for Booking #GR-84920 is 4829. Please share this with the driver only upon boarding.",
      time: "2 hours ago",
      date: "Today, 04:30 AM",
      unread: true,
      actionUrl: "/account/bookings/GR-84920",
      actionText: "View Ride OTP",
      icon: ShieldCheck,
      iconColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      id: "n3",
      category: "billing",
      title: "GST Tax Invoice Ready",
      message: "Tax Invoice INV-2026-84920 for your Bangalore to Mysore trip has been generated and is ready for download.",
      time: "Yesterday",
      date: "20 Sep 2026",
      unread: false,
      actionUrl: "/account/bookings/GR-84920/invoice",
      actionText: "Download Invoice PDF",
      icon: FileText,
      iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20"
    },
    {
      id: "n4",
      category: "trips",
      title: "Trip Completed Successfully",
      message: "Your round-trip to Coorg (#GR-79104) with driver Anand M has concluded. How was your experience?",
      time: "14 Sep 2026",
      date: "14 Sep 2026",
      unread: false,
      actionUrl: "/account/bookings/GR-79104/rate",
      actionText: "Rate Your Chauffeur",
      icon: CheckCircle2,
      iconColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      id: "n5",
      category: "promo",
      title: "Exclusive Outstation Discount",
      message: "Plan your weekend getaway! Get flat 10% off up to ₹750 on SUV & Sedan bookings with coupon code GRAB10.",
      time: "10 Sep 2026",
      date: "10 Sep 2026",
      unread: false,
      actionUrl: "/",
      actionText: "Book with 10% Off",
      icon: Tag,
      iconColor: "text-purple-500 bg-purple-500/10 border-purple-500/20"
    }
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return n.unread;
    return n.category === filter;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Breadcrumb & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Trips
          </Link>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>Mark All Read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 text-slate-500 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Header Title Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                Customer Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs animate-pulse">
                  {unreadCount} New
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Activity & Trip Alerts
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Live chauffeur assignments, trip OTP updates, GST invoices, and service announcements.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          {[
            { id: "all", label: "All Alerts", count: notifications.length },
            { id: "unread", label: "Unread", count: unreadCount },
            { id: "trips", label: "Trip Updates", count: notifications.filter(n => n.category === "trips").length },
            { id: "billing", label: "Invoices & Billing", count: notifications.filter(n => n.category === "billing").length },
            { id: "promo", label: "Offers", count: notifications.filter(n => n.category === "promo").length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                filter === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                filter === tab.id ? "bg-slate-700 text-amber-300" : "bg-slate-100 text-slate-600"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
            <Bell className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Notifications</h3>
            <p className="text-xs text-slate-500">You are all caught up with your trips and alerts.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((n) => {
              const IconComponent = n.icon;
              return (
                <div
                  key={n.id}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-sm hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    n.unread ? "border-amber-300/80 ring-2 ring-amber-500/10 bg-amber-50/20" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${n.iconColor}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-extrabold text-slate-900">{n.title}</h4>
                        {n.unread && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-ping"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{n.message}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> {n.time}
                        </span>
                        <span>•</span>
                        <span>{n.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:shrink-0 pt-2 sm:pt-0">
                    <Link
                      href={n.actionUrl}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs w-full sm:w-auto"
                    >
                      <span>{n.actionText}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
