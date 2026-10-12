"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { operationsApi } from "@/lib/operationsApi";
import {
  Bell,
  Check,
  Clock,
  AlertTriangle,
  Info,
  RefreshCw,
  ExternalLink,
  CheckCheck,
  Car,
  MapPin,
} from "lucide-react";

export default function OperationsNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    try {
      const res = await operationsApi.getNotifications();
      if (res.data) {
        setNotifications(res.data);
      }
      if (isRefresh) {
        setToast({ type: "success", message: "Notifications refreshed from server." });
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
      if (isRefresh) {
        setToast({ type: "error", message: "Failed to refresh notifications." });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function handleMarkRead(notification) {
    if (notification.read) {
      if (notification.linkUrl) {
        router.push(notification.linkUrl);
      }
      return;
    }

    try {
      await operationsApi.markNotificationRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
      if (notification.linkUrl) {
        router.push(notification.linkUrl);
      }
    } catch {
      // Local fallback
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
    }
  }

  async function markAllRead() {
    try {
      await operationsApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setToast({ type: "success", message: "All notifications marked as read." });
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="Operational Dispatch Notifications"
        subtitle={`Live backend alerts, trip milestones, and urgent dispatch requests (${unreadCount} unread)`}
        breadcrumbs={[
          { label: "Operations", href: "/operations/dashboard" },
          { label: "Notifications" },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchNotifications(true)}
            >
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="primary"
                size="sm"
                icon={CheckCheck}
                onClick={markAllRead}
              >
                Mark All as Read
              </Button>
            )}
          </div>
        }
      />

      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
          Loading notifications from server...
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-200">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Notifications</h3>
          <p className="text-xs text-slate-500 mt-1">
            All dispatch and fleet activities are up to date.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const isHigh = n.urgency === "HIGH";
            const isMedium = n.urgency === "MEDIUM";

            return (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n)}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
                  !n.read
                    ? "border-l-4 border-l-blue-600 bg-blue-50/20 border-slate-200 hover:border-slate-300"
                    : "bg-white border-slate-200 opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isHigh
                          ? "bg-rose-100 text-rose-600"
                          : isMedium
                          ? "bg-amber-100 text-amber-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {isHigh ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : isMedium ? (
                        <Car className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            isHigh
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : isMedium
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {n.urgency}
                        </span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                      {n.linkUrl && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline mt-2">
                          Take action <ExternalLink className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                    {n.timeAgo || (n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
