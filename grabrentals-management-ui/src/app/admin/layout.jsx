"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function AdminLayout({ children }) {
  return <DashboardLayout role="ADMIN">{children}</DashboardLayout>;
}
