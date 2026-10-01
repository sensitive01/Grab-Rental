"use client";

import CustomerProtectedRoute from "@/components/layout/CustomerProtectedRoute";

export default function DashboardLayout({ children }) {
  return <CustomerProtectedRoute>{children}</CustomerProtectedRoute>;
}
