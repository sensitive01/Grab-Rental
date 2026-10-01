"use client";

import CustomerProtectedRoute from "@/components/layout/CustomerProtectedRoute";

export default function AccountLayout({ children }) {
  return <CustomerProtectedRoute>{children}</CustomerProtectedRoute>;
}
