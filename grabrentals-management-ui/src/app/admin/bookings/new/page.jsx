"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { CreateBookingModal } from "@/components/bookings/CreateBookingModal";
import { ArrowLeft } from "lucide-react";

export default function AdminNewBookingPage() {
  const router = useRouter();
  const [toast, setToast] = useState(null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Create New Booking"
        subtitle="Manual customer phone, email & walk-in reservation creation"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Bookings", href: "/admin/bookings" },
          { label: "New Booking" },
        ]}
        action={
          <Link href="/admin/bookings">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back to Bookings
            </Button>
          </Link>
        }
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <CreateBookingModal
        isOpen={true}
        isPage={true}
        onClose={() => router.push("/admin/bookings")}
        onSuccess={(createdBooking) => {
          if (createdBooking?.id) {
            router.push(`/admin/bookings/${createdBooking.id}`);
          } else {
            router.push("/admin/bookings");
          }
        }}
        onToast={(t) => setToast(t)}
      />
    </div>
  );
}
