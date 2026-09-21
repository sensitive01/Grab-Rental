"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  CalendarCheck, 
  Navigation, 
  TrendingUp, 
  CreditCard, 
  FileText, 
  Bell, 
  User, 
  Lock, 
  HelpCircle, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  ShieldCheck,
  X,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  
  // Expandable submenus state
  const [vehiclesOpen, setVehiclesOpen] = useState(
    pathname.startsWith("/vendor/vehicles")
  );
  const [driversOpen, setDriversOpen] = useState(
    pathname.startsWith("/vendor/drivers")
  );
  const [bookingsOpen, setBookingsOpen] = useState(
    pathname.startsWith("/vendor/bookings")
  );
  const [tripsOpen, setTripsOpen] = useState(
    pathname.startsWith("/vendor/trips")
  );

  const isActive = (href) => {
    if (href === "/vendor/dashboard") {
      return pathname === "/vendor/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950">
          <Link href="/vendor/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-base shadow-md shadow-amber-500/20">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight text-white flex items-center gap-1.5">
                GRAB RENTALS
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  VENDOR
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">
                Kaveri Fleet & Travels
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-xs font-semibold">
          
          {/* Main: Dashboard */}
          <Link
            href="/vendor/dashboard"
            onClick={() => onClose && onClose()}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
              isActive("/vendor/dashboard")
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </div>
          </Link>

          {/* Section: Fleet Assets */}
          <div className="pt-3 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
            Fleet Management
          </div>

          {/* Vehicles Submenu */}
          <div>
            <button
              type="button"
              onClick={() => setVehiclesOpen(!vehiclesOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                pathname.startsWith("/vendor/vehicles")
                  ? "bg-slate-900 text-white"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Car className="w-4 h-4 text-amber-400" />
                <span>Vehicles</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  vehiclesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {vehiclesOpen && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-[11px]">
                <Link
                  href="/vendor/vehicles"
                  onClick={() => onClose && onClose()}
                  className={`block py-1.5 px-2 rounded-lg transition-colors ${
                    pathname === "/vendor/vehicles"
                      ? "text-amber-400 font-bold bg-amber-400/10"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  All Vehicles (7)
                </Link>
                <Link
                  href="/vendor/vehicles/add"
                  onClick={() => onClose && onClose()}
                  className={`block py-1.5 px-2 rounded-lg transition-colors ${
                    pathname === "/vendor/vehicles/add"
                      ? "text-amber-400 font-bold bg-amber-400/10"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  + Add New Vehicle
                </Link>
                <Link
                  href="/vendor/vehicles/availability"
                  onClick={() => onClose && onClose()}
                  className={`block py-1.5 px-2 rounded-lg transition-colors ${
                    pathname === "/vendor/vehicles/availability"
                      ? "text-amber-400 font-bold bg-amber-400/10"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Availability Calendar
                </Link>
              </div>
            )}
          </div>

          {/* Drivers Submenu */}
          <div>
            <button
              type="button"
              onClick={() => setDriversOpen(!driversOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                pathname.startsWith("/vendor/drivers")
                  ? "bg-slate-900 text-white"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-sky-400" />
                <span>Chauffeurs / Drivers</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  driversOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {driversOpen && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-[11px]">
                <Link
                  href="/vendor/drivers"
                  onClick={() => onClose && onClose()}
                  className={`block py-1.5 px-2 rounded-lg transition-colors ${
                    pathname === "/vendor/drivers"
                      ? "text-amber-400 font-bold bg-amber-400/10"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  All Chauffeurs (6)
                </Link>
                <Link
                  href="/vendor/drivers/add"
                  onClick={() => onClose && onClose()}
                  className={`block py-1.5 px-2 rounded-lg transition-colors ${
                    pathname === "/vendor/drivers/add"
                      ? "text-amber-400 font-bold bg-amber-400/10"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  + Add Chauffeur
                </Link>
              </div>
            )}
          </div>

          {/* Section: Bookings & Operations */}
          <div className="pt-3 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
            Bookings & Dispatch
          </div>

          {/* Bookings Submenu */}
          <div>
            <button
              type="button"
              onClick={() => setBookingsOpen(!bookingsOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                pathname.startsWith("/vendor/bookings")
                  ? "bg-slate-900 text-white"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                <span>Bookings</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                  2
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    bookingsOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {bookingsOpen && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-[11px]">
                <Link
                  href="/vendor/bookings"
                  onClick={() => onClose && onClose()}
                  className={`block py-1.5 px-2 rounded-lg transition-colors ${
                    pathname === "/vendor/bookings"
                      ? "text-amber-400 font-bold bg-amber-400/10"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  All Bookings
                </Link>
                <Link
                  href="/vendor/bookings/requests"
                  onClick={() => onClose && onClose()}
                  className={`flex items-center justify-between py-1.5 px-2 rounded-lg transition-colors ${
                    pathname === "/vendor/bookings/requests"
                      ? "text-amber-400 font-bold bg-amber-400/10"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>New Requests</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-black text-[9px]">
                    2 New
                  </span>
                </Link>
                <Link
                  href="/vendor/bookings/assigned"
                  onClick={() => onClose && onClose()}
                  className={`block py-1.5 px-2 rounded-lg transition-colors ${
                    pathname === "/vendor/bookings/assigned"
                      ? "text-amber-400 font-bold bg-amber-400/10"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Assigned Trips
                </Link>
                <Link
                  href="/vendor/bookings/cancelled"
                  onClick={() => onClose && onClose()}
                  className={`block py-1.5 px-2 rounded-lg transition-colors ${
                    pathname === "/vendor/bookings/cancelled"
                      ? "text-amber-400 font-bold bg-amber-400/10"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Cancelled
                </Link>
              </div>
            )}
          </div>

          {/* Trips Submenu */}
          <div>
            <button
              type="button"
              onClick={() => setTripsOpen(!tripsOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                pathname.startsWith("/vendor/trips")
                  ? "bg-slate-900 text-white"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Navigation className="w-4 h-4 text-purple-400" />
                <span>Trips Tracking</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  tripsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {tripsOpen && (
              <div className="pl-9 pr-2 py-1 space-y-1 text-[11px]">
                <Link
                  href="/vendor/trips/active"
                  onClick={() => onClose && onClose()}
                  className={`flex items-center justify-between py-1.5 px-2 rounded-lg transition-colors ${
                    pathname === "/vendor/trips/active"
                      ? "text-amber-400 font-bold bg-amber-400/10"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>Active Live Trips</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </Link>
                <Link
                  href="/vendor/trips/completed"
                  onClick={() => onClose && onClose()}
                  className={`block py-1.5 px-2 rounded-lg transition-colors ${
                    pathname === "/vendor/trips/completed"
                      ? "text-amber-400 font-bold bg-amber-400/10"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Completed Trips
                </Link>
              </div>
            )}
          </div>

          {/* Section: Finance & Documents */}
          <div className="pt-3 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
            Finance & Compliance
          </div>

          <Link
            href="/vendor/earnings"
            onClick={() => onClose && onClose()}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
              pathname === "/vendor/earnings"
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Earnings & Revenue</span>
          </Link>

          <Link
            href="/vendor/payments"
            onClick={() => onClose && onClose()}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
              pathname === "/vendor/payments"
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <CreditCard className="w-4 h-4 text-sky-400" />
            <span>Payouts & Invoices</span>
          </Link>

          <Link
            href="/vendor/documents"
            onClick={() => onClose && onClose()}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
              pathname === "/vendor/documents"
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Documents & Expiries</span>
            </div>
            <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-black">
              3 Alerts
            </span>
          </Link>

          <Link
            href="/vendor/notifications"
            onClick={() => onClose && onClose()}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
              pathname === "/vendor/notifications"
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Notifications</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
              2
            </span>
          </Link>

          {/* Section: Account */}
          <div className="pt-3 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
            Account & Support
          </div>

          <Link
            href="/vendor/profile"
            onClick={() => onClose && onClose()}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
              pathname === "/vendor/profile"
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <User className="w-4 h-4 text-slate-400" />
            <span>Business Profile</span>
          </Link>

          <Link
            href="/vendor/change-password"
            onClick={() => onClose && onClose()}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
              pathname === "/vendor/change-password"
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Lock className="w-4 h-4 text-slate-400" />
            <span>Security & Password</span>
          </Link>

          <Link
            href="/vendor/support"
            onClick={() => onClose && onClose()}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
              pathname === "/vendor/support"
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Partner Helpline (24/7)</span>
          </Link>

        </nav>

        {/* Footer User Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs shrink-0">
                RK
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">Rajesh Kannan</p>
                <p className="text-[10px] text-slate-400 truncate">Fleet Partner</p>
              </div>
            </div>
            <Link
              href="/login"
              title="Log Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </aside>
    </>
  );
}
