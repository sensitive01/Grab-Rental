"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Car, 
  Settings, 
  Calendar, 
  MapPin, 
  Clock, 
  Phone, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight, 
  KeyRound, 
  UserCheck,
  RotateCcw,
  Headphones,
  Star
} from "lucide-react";

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("all");

  const bookings = [
    {
      id: "GR-84920",
      type: "outstation",
      tripType: "One-Way Outstation",
      from: "Indiranagar, Bengaluru",
      to: "Mysore Palace Area, Mysuru",
      distance: "145 km",
      date: "Tomorrow, 22 Sep 2026",
      time: "06:30 AM",
      car: "Toyota Innova Crysta",
      carType: "SUV • 6+1 Seater",
      status: "upcoming",
      statusLabel: "Confirmed • Driver Assigned",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
      driver: {
        name: "Ramesh Kumar",
        phone: "+91 98450 12345",
        rating: "4.9",
        plate: "KA 01 MJ 4521"
      },
      otp: "4829",
      totalFare: "₹5,950",
      paidAmount: "₹1,190",
      dueAmount: "₹4,760",
      paymentStatus: "Advance Paid (20%)"
    },
    {
      id: "GR-84210",
      type: "airport",
      tripType: "Airport Transfer",
      from: "Whitefield Tech Park, Bengaluru",
      to: "Kempegowda Int'l Airport (BLR)",
      distance: "42 km",
      date: "Today, 21 Sep 2026",
      time: "03:45 PM",
      car: "Maruti Dzire Prime",
      carType: "Sedan • 4+1 Seater",
      status: "ongoing",
      statusLabel: "Chauffeur En Route",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse",
      driver: {
        name: "Suresh Gowda",
        phone: "+91 97312 67890",
        rating: "4.8",
        plate: "KA 04 AB 8892"
      },
      otp: "1923",
      totalFare: "₹1,450",
      paidAmount: "₹1,450",
      dueAmount: "₹0",
      paymentStatus: "Fully Paid"
    },
    {
      id: "GR-79104",
      type: "outstation",
      tripType: "Round-Trip Outstation",
      from: "Koramangala, Bengaluru",
      to: "Madikeri, Coorg, Karnataka",
      distance: "540 km",
      date: "14 Sep 2026",
      time: "05:00 AM",
      car: "Maruti Ertiga Hybrid",
      carType: "MUV • 6 Seater",
      status: "completed",
      statusLabel: "Trip Completed",
      statusColor: "bg-slate-100 text-slate-700 border-slate-200",
      driver: {
        name: "Anand M",
        phone: "+91 99001 22334",
        rating: "5.0",
        plate: "KA 05 MN 3311"
      },
      totalFare: "₹11,400",
      paidAmount: "₹11,400",
      dueAmount: "₹0",
      paymentStatus: "Paid in Full"
    },
    {
      id: "GR-76521",
      type: "local",
      tripType: "Local Hourly Rental (8hr / 80km)",
      from: "Jayanagar, Bengaluru",
      to: "Multiple City Stops",
      distance: "80 km",
      date: "28 Aug 2026",
      time: "09:30 AM",
      car: "Hyundai Aura Sedan",
      carType: "Sedan • 4 Seater",
      status: "completed",
      statusLabel: "Trip Completed",
      statusColor: "bg-slate-100 text-slate-700 border-slate-200",
      driver: {
        name: "Manjunath K",
        phone: "+91 94481 99882",
        rating: "4.9",
        plate: "KA 02 HK 6401"
      },
      totalFare: "₹2,650",
      paidAmount: "₹2,650",
      dueAmount: "₹0",
      paymentStatus: "Paid in Full"
    }
  ];

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    return b.status === activeTab;
  });

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                Customer Portal
              </span>
              <span className="text-xs text-slate-400 font-medium">Logged in via Phone OTP</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              My Trips & Bookings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track live chauffeur status, view upcoming itineraries, and download GST tax invoices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/support"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            >
              <Headphones className="w-3.5 h-3.5 text-amber-600" /> 24/7 Support
            </Link>
            <Link
              href="/account/settings"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5" /> Profile Settings
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
            >
              <Car className="w-4 h-4" /> Book New Ride
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          {[
            { id: "all", label: "All Trips", count: bookings.length },
            { id: "ongoing", label: "Ongoing", count: bookings.filter(b => b.status === "ongoing").length },
            { id: "upcoming", label: "Upcoming", count: bookings.filter(b => b.status === "upcoming").length },
            { id: "completed", label: "Completed", count: bookings.filter(b => b.status === "completed").length },
            { id: "cancelled", label: "Cancelled", count: 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                activeTab === tab.id ? "bg-slate-700 text-amber-300" : "bg-slate-100 text-slate-600"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No trips found</h3>
            <p className="text-xs text-slate-500">There are no bookings matching the selected tab.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredBookings.map((booking) => (
              <div 
                key={booking.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Header Bar */}
                <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                      {booking.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{booking.tripType}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${booking.statusColor}`}>
                      {booking.statusLabel}
                    </span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  
                  {/* Route & Schedule (Col 1-6) */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup</span>
                        <p className="text-sm font-extrabold text-slate-900 leading-snug">{booking.from}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination</span>
                        <p className="text-sm font-extrabold text-slate-900 leading-snug">{booking.to}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <Calendar className="w-4 h-4 text-amber-500" /> {booking.date}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <Clock className="w-4 h-4 text-amber-500" /> {booking.time}
                      </span>
                      <span className="text-slate-400">• {booking.distance}</span>
                    </div>
                  </div>

                  {/* Vehicle & Chauffeur (Col 7-9) */}
                  <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle</span>
                      <h4 className="text-xs font-extrabold text-slate-900">{booking.car}</h4>
                      <p className="text-[11px] text-slate-500">{booking.carType}</p>
                    </div>

                    {booking.driver && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> {booking.driver.name}
                          </span>
                          <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                            ★ {booking.driver.rating}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-500">{booking.driver.plate}</p>
                      </div>
                    )}

                    {booking.otp && (
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                        <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[11px] font-bold text-slate-600">Ride OTP:</span>
                        <span className="text-xs font-mono font-black text-amber-700">{booking.otp}</span>
                      </div>
                    )}
                  </div>

                  {/* Fare & Actions (Col 10-12) */}
                  <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Fare</span>
                      <div className="text-xl font-black text-slate-900">{booking.totalFare}</div>
                      <span className="text-[11px] font-bold text-emerald-600">{booking.paymentStatus}</span>
                      {booking.dueAmount !== "₹0" && (
                        <p className="text-[11px] text-slate-500 mt-0.5">₹{booking.dueAmount.replace("₹", "")} due to driver</p>
                      )}
                    </div>

                    <div className="space-y-2 pt-2">
                      <Link
                        href={`/account/bookings/${booking.id}`}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs"
                      >
                        <span>Trip Details & Tracking</span>
                        <ChevronRight className="w-4 h-4 text-amber-400" />
                      </Link>

                      {booking.status === "completed" ? (
                        <div className="space-y-1.5">
                          <Link
                            href={`/account/bookings/${booking.id}/rate`}
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all shadow-2xs"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Rate & Review Trip
                          </Link>
                          <Link
                            href={`/account/bookings/${booking.id}/invoice`}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-400" /> Download Invoice
                          </Link>
                        </div>
                      ) : (
                        <Link
                          href="/support"
                          className="w-full flex items-center justify-center gap-1 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold"
                        >
                          Need Assistance?
                        </Link>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
