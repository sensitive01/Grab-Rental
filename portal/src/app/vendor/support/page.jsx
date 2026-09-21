"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  HelpCircle, 
  Phone, 
  Mail, 
  MessageSquare, 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import Toast from "@/components/ui/Toast";

export default function VendorSupportPage() {
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [ticketData, setTicketData] = useState({
    category: "dispatch",
    bookingId: "BK-2026-000124",
    subject: "Customer requested pickup point change to Terminal 2",
    description: "Passenger contacted driver requesting pickup at Coimbatore Airport Terminal 2 instead of old departure gate. Need toll allowance update."
  });

  const [recentTickets, setRecentTickets] = useState([
    {
      id: "TKT-8901",
      category: "Payout & Invoicing",
      subject: "Tax Invoice calculation query for Batch SEP-W2",
      date: "15 Sep 2026",
      status: "Resolved"
    },
    {
      id: "TKT-8842",
      category: "Vehicle Compliance",
      subject: "AITP interstate permit renewal copy submitted",
      date: "08 Sep 2026",
      status: "Closed"
    }
  ]);

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const newTicket = {
        id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        category: ticketData.category === "dispatch" ? "Live Dispatch" : "General Support",
        subject: ticketData.subject,
        date: "Today, Just now",
        status: "Open"
      };
      setRecentTickets([newTicket, ...recentTickets]);
      setToastMessage("Support ticket registered! Grab-Rental Operations team has been notified.");
      setTicketData({
        category: "dispatch",
        bookingId: "",
        subject: "",
        description: ""
      });
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header & Breadcrumbs */}
      <div className="space-y-1">
        <Breadcrumbs items={[{ label: "Support", href: "/vendor/support" }, { label: "Partner Helpdesk" }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              24/7 Partner Helpline & Support
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Immediate operational escalation, highway breakdown assistance, and billing queries.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Hotlines Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="text-xs space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">
              Breakdown & Accident SOS
            </span>
            <p className="font-black text-sm text-slate-900">+91 1800 209 8899</p>
            <p className="text-slate-400">Toll-free 24/7 roadside recovery</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div className="text-xs space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
              Dispatch Operations Desk
            </span>
            <p className="font-black text-sm text-slate-900">+91 80 4567 8900</p>
            <p className="text-slate-400">Immediate trip re-routing</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div className="text-xs space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-700">
              Partner Accounts & GST
            </span>
            <p className="font-black text-sm text-slate-900">partner@grabrentals.in</p>
            <p className="text-slate-400">Payout queries & invoices</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ticket Submission Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-sm font-black text-slate-900">Open Operational Support Ticket</h2>
              <p className="text-xs text-slate-500">Operations staff will resolve and respond within 15 minutes</p>
            </div>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Issue Category *</label>
                <select
                  value={ticketData.category}
                  onChange={(e) => setTicketData({ ...ticketData, category: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                >
                  <option value="dispatch">Live Trip & Dispatch Query</option>
                  <option value="billing">Payout & Commission Discrepancy</option>
                  <option value="vehicle">Vehicle KYC / Document Renewal</option>
                  <option value="driver">Chauffeur Performance & Rating</option>
                  <option value="general">Other Platform Query</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Related Booking ID (Optional)</label>
                <input
                  type="text"
                  value={ticketData.bookingId}
                  onChange={(e) => setTicketData({ ...ticketData, bookingId: e.target.value })}
                  placeholder="e.g. BK-2026-000124"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Subject Summary *</label>
              <input
                type="text"
                required
                value={ticketData.subject}
                onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                placeholder="Brief summary of the issue"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Detailed Description *</label>
              <textarea
                required
                rows={4}
                value={ticketData.description}
                onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
                placeholder="Provide details of the trip, location, driver, or dispute..."
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-hidden focus:border-amber-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              >
                {loading ? "Submitting..." : (
                  <>
                    <Send className="w-4 h-4" /> Submit Support Ticket
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Recent Tickets Activity */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-black text-slate-900 pb-2 border-b border-slate-100">
            Recent Support Tickets
          </h3>

          <div className="space-y-3">
            {recentTickets.map(t => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 space-y-2 hover:border-slate-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">{t.id}</span>
                  <StatusBadge status={t.status} />
                </div>
                <p className="font-bold text-slate-800 line-clamp-2">{t.subject}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>{t.category}</span>
                  <span>{t.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
