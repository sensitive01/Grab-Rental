"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Lock, 
  ChevronDown, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { mockNotifications } from "@/lib/mockData";

export default function TopNavbar({ onMenuClick }) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-2xs">
      
      {/* Left: Mobile Menu Button & Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vehicles (TN-38...), bookings (#BK...), or chauffeurs..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {/* Right: Role Badge, Notifications & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Role Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-black uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          Vendor Partner
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setUserDropdownOpen(false);
            }}
            className="relative p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
              2
            </span>
          </button>

          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-3 space-y-2 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                  <span className="text-xs font-black text-slate-900">Notifications</span>
                  <Link
                    href="/vendor/notifications"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {mockNotifications.slice(0, 3).map((n) => (
                    <Link
                      key={n.id}
                      href={n.actionUrl}
                      onClick={() => setNotificationsOpen(false)}
                      className="block p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-900">{n.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{n.time}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs">
              KK
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-black text-slate-900 leading-tight">Rajesh Kannan</p>
              <p className="text-[10px] text-slate-500 font-medium">Kaveri Travels</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {userDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setUserDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 py-2 text-xs divide-y divide-slate-100 animate-in zoom-in-95 duration-150">
                <div className="px-4 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Signed in as</p>
                  <p className="font-bold text-slate-900 truncate">partner@kaveritravels.in</p>
                  <p className="text-[10px] text-amber-700 font-bold mt-0.5">Vendor ID: VND-101</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/vendor/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    <User className="w-4 h-4 text-slate-400" /> Business Profile
                  </Link>
                  <Link
                    href="/vendor/change-password"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    <Lock className="w-4 h-4 text-slate-400" /> Security Settings
                  </Link>
                </div>
                <div className="pt-1">
                  <Link
                    href="/login"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 font-bold"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

    </header>
  );
}
