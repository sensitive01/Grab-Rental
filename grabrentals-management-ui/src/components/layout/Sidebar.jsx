"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarCheck,
  PlusCircle,
  Car,
  UserCheck,
  GitPullRequest,
  Users,
  Navigation,
  CheckSquare,
  XSquare,
  Clock,
  MessageSquare,
  Building2,
  FileBarChart,
  Bell,
  User,
  KeyRound,
  LifeBuoy,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  IndianRupee,
  MapPin,
  Sparkles,
  Star,
  AlertTriangle,
  Sliders,
  History,
  CheckCircle,
  X,
} from "lucide-react";

export const OPERATIONS_NAV = [
  {
    title: "Dispatch Command",
    items: [
      { label: "Dashboard", href: "/operations/dashboard", icon: LayoutDashboard },
      { label: "All Bookings", href: "/operations/bookings", icon: CalendarCheck },
      { label: "New Requests", href: "/operations/bookings/new", icon: PlusCircle, badge: "3" },
    ],
  },
  {
    title: "Fleet & Allocations",
    items: [
      { label: "Vehicles Roster", href: "/operations/vehicles", icon: Car },
      { label: "Chauffeur Roster", href: "/operations/drivers", icon: UserCheck },
      { label: "Assign Vehicle", href: "/operations/assignments/vehicle", icon: GitPullRequest },
      { label: "Assign Driver", href: "/operations/assignments/driver", icon: Users },
    ],
  },
  {
    title: "Trip Tracking",
    items: [
      { label: "Active Trips", href: "/operations/trips/active", icon: Navigation, badge: "Live" },
      { label: "Completed Trips", href: "/operations/trips/completed", icon: CheckSquare },
      { label: "Cancelled Trips", href: "/operations/trips/cancelled", icon: XSquare },
      { label: "Rescheduled", href: "/operations/trips/rescheduled", icon: Clock },
    ],
  },
  {
    title: "Coordination & Insights",
    items: [
      { label: "Customer Requests", href: "/operations/customer-requests", icon: MessageSquare, badge: "2" },
      { label: "Vendor Coordination", href: "/operations/vendor-coordination", icon: Building2 },
      { label: "Operations Reports", href: "/operations/reports", icon: FileBarChart },
      { label: "Notifications", href: "/operations/notifications", icon: Bell },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "My Profile", href: "/operations/profile", icon: User },
      { label: "Change Password", href: "/operations/change-password", icon: KeyRound },
      { label: "Ops Support", href: "/operations/support", icon: LifeBuoy },
    ],
  },
];

export const ADMIN_NAV = [
  {
    title: "Governance",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Vendors", href: "/admin/vendors", icon: Building2 },
      { label: "Vendor Approvals", href: "/admin/vendors/approval", icon: CheckCircle, badge: "1" },
      { label: "Operations Staff", href: "/admin/operations-users", icon: ShieldCheck },
    ],
  },
  {
    title: "Fleet Governance",
    items: [
      { label: "Platform Vehicles", href: "/admin/vehicles", icon: Car },
      { label: "Platform Drivers", href: "/admin/drivers", icon: UserCheck },
      { label: "Master Bookings", href: "/admin/bookings", icon: CalendarCheck },
    ],
  },
  {
    title: "Financials & Tariffs",
    items: [
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
      { label: "Refunds Queue", href: "/admin/refunds", icon: RotateCcw, badge: "1" },
      { label: "Pricing Matrix", href: "/admin/pricing", icon: IndianRupee },
    ],
  },
  {
    title: "Platform Configuration",
    items: [
      { label: "Cities & Hubs", href: "/admin/locations", icon: MapPin },
      { label: "Rental Services", href: "/admin/services", icon: Sparkles },
      { label: "Customer Reviews", href: "/admin/reviews", icon: Star },
      { label: "Complaints & Grievances", href: "/admin/complaints", icon: AlertTriangle, badge: "2" },
      { label: "Platform Reports", href: "/admin/reports", icon: FileBarChart },
    ],
  },
  {
    title: "System & Security",
    items: [
      { label: "All Users Directory", href: "/admin/users", icon: Users },
      { label: "Roles & Permissions", href: "/admin/roles-permissions", icon: ShieldCheck },
      { label: "System Settings", href: "/admin/settings", icon: Sliders },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
      { label: "Admin Profile", href: "/admin/profile", icon: User },
      { label: "Change Password", href: "/admin/change-password", icon: KeyRound },
    ],
  },
];

export function Sidebar({ role = "OPERATIONS", isOpen = true, onClose }) {
  const pathname = usePathname();
  const navSections = role === "ADMIN" ? ADMIN_NAV : OPERATIONS_NAV;
  const isOps = role === "OPERATIONS";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base shadow-md",
                isOps ? "bg-amber-600 shadow-amber-900/40" : "bg-blue-600 shadow-blue-900/40"
              )}
            >
              GR
            </div>
            <div>
              <div className="font-extrabold text-white text-sm tracking-tight flex items-center gap-1.5">
                <span>Grab Rentals</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {isOps ? "Operations Portal" : "Admin Console"}
              </div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Role Pill */}
        <div className="px-4 py-2.5 bg-slate-950/30 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">Current Role</span>
          <span
            className={cn(
              "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border",
              isOps
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "bg-blue-500/10 text-blue-400 border-blue-500/30"
            )}
          >
            {isOps ? "Operations Staff" : "System Admin"}
          </span>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 no-scrollbar">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/operations/dashboard" &&
                      item.href !== "/admin/dashboard" &&
                      pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024 && onClose) onClose();
                      }}
                      className={cn(
                        "group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                        isActive
                          ? isOps
                            ? "bg-amber-500/15 text-amber-300 font-semibold"
                            : "bg-blue-500/15 text-blue-300 font-semibold"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={cn(
                            "w-4 h-4 shrink-0 transition-colors",
                            isActive
                              ? isOps
                                ? "text-amber-400"
                                : "text-blue-400"
                              : "text-slate-500 group-hover:text-slate-300"
                          )}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                            isActive
                              ? isOps
                                ? "bg-amber-500 text-slate-950"
                                : "bg-blue-500 text-white"
                              : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Grab Rentals v2.4</span>
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Online
          </span>
        </div>
      </aside>
    </>
  );
}
