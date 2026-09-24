"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/lib/auth";
import { Menu, Bell, LogOut, ShieldAlert, Sparkles, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function TopNavbar({ onMenuClick, role = "OPERATIONS" }) {
  const router = useRouter();
  const user = getCurrentUser() || {
    name: role === "ADMIN" ? "System Administrator" : "Karthik Narayanan",
    email: role === "ADMIN" ? "admin@grabrentals.com" : "ops@grabrentals.com",
    role: role,
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isOps = role === "OPERATIONS";

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile Menu Toggle & Breadcrumbs/Portal Badge */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5",
              isOps
                ? "bg-amber-100 text-amber-800 border border-amber-300"
                : "bg-blue-100 text-blue-800 border border-blue-300"
            )}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                isOps ? "bg-amber-600 animate-pulse" : "bg-blue-600 animate-pulse"
              )}
            />
            {isOps ? "Operations Portal" : "Admin Command Center"}
          </span>
          <span className="hidden sm:inline text-xs text-slate-400">|</span>
          <span className="hidden sm:inline text-xs font-medium text-slate-600">
            {isOps ? "Fleet & Trip Dispatch Console" : "System Governance & Finance"}
          </span>
        </div>
      </div>

      {/* Right: Quick actions, notifications, profile menu */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          type="button"
          onClick={() =>
            router.push(isOps ? "/operations/notifications" : "/admin/notifications")
          }
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-xs",
                isOps ? "bg-amber-600" : "bg-blue-600"
              )}
            >
              {user.avatar || (user.name ? user.name.slice(0, 2).toUpperCase() : "GR")}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-500">{user.email}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <span
                    className={cn(
                      "mt-1.5 inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded",
                      isOps ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                    )}
                  >
                    Role: {user.role}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push(isOps ? "/operations/profile" : "/admin/profile");
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Account Profile
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push(
                        isOps ? "/operations/change-password" : "/admin/change-password"
                      );
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Change Password
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
