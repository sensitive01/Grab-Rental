"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Film, Image as ImageIcon } from "lucide-react";

export default function InPageBanner({ page = "HOME", className = "" }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    fetch(`${API_BASE_URL}/api/banners?page=${page}&displayType=IN_PAGE`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.success && Array.isArray(res?.data)) {
          setBanners(res.data);
        }
      })
      .catch((err) => {
        console.warn("Could not load in-page banners:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page]);

  if (loading || banners.length === 0) return null;

  return (
    <div className={`space-y-4 my-6 ${className}`}>
      {banners.map((banner) => {
        const isVideo = banner.mediaType === "VIDEO";

        return (
          <div
            key={banner.id}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl border border-blue-800/40"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 items-center">
              {/* Media Section */}
              <div className="md:col-span-5 relative aspect-video md:aspect-auto md:h-full min-h-[200px] overflow-hidden bg-black/40">
                {isVideo ? (
                  <video
                    src={banner.mediaUrl}
                    controls={false}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={banner.mediaUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/images/promo/grab-welcome-poster-blue.jpg";
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent to-blue-900/40 pointer-events-none" />
              </div>

              {/* Text & Action Section */}
              <div className="md:col-span-7 p-5 sm:p-7 space-y-3 flex flex-col justify-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-extrabold uppercase tracking-wider w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Exclusive Grab Rental Deal
                </div>

                <h3 className="text-lg sm:text-2xl font-black tracking-tight leading-tight text-white">
                  {banner.title}
                </h3>

                {banner.description && (
                  <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
                    {banner.description}
                  </p>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href="#booking-widget"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    Claim Offer
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="tel:+919071100200"
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer backdrop-blur-sm"
                  >
                    Call: +91 90711 00200
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
