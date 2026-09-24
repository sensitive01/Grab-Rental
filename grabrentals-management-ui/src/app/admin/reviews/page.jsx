"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Star } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await adminApi.getReviews();
      setReviews(res.data);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Reviews & Ratings"
        subtitle="Customer satisfaction feedback, driver reviews, and vehicle condition ratings"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Reviews" }]}
      />

      <div className="space-y-4">
        {reviews.map((r) => (
          <Card key={r.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">{r.customerName}</span>
                <span className="text-[11px] text-slate-400 font-mono">({r.bookingId})</span>
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
              </div>
              <Badge variant="success" size="sm">{r.status}</Badge>
            </div>
            <p className="text-xs text-slate-700 italic">"{r.comment}"</p>
            <p className="text-[10px] text-slate-400">{r.createdAt}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
