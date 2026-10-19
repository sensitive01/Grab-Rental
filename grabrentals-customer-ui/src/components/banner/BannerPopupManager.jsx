"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X, Phone } from "lucide-react";

export default function BannerPopupManager() {
  const pathname = usePathname();
  const [activeBanner, setActiveBanner] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const scrollTriggeredRef = useRef(false);

  // Map route to targetPage enum
  const getTargetPage = (path) => {
    if (!path || path === "/") return "HOME";
    if (path.includes("/fleet")) return "FLEET";
    if (path.includes("/outstation/review-pay") || path.includes("/review-pay")) return "REVIEW_PAY";
    if (path.includes("/outstation")) return "OUTSTATION";
    if (path.includes("/local")) return "LOCAL";
    if (path.includes("/airport")) return "AIRPORT";
    return "HOME";
  };

  useEffect(() => {
    const page = getTargetPage(pathname);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    // Reset popup state on route change
    setIsOpen(false);
    setActiveBanner(null);
    scrollTriggeredRef.current = false;

    // Check if user already dismissed a popup for this page in this session
    const sessionKey = `grab_banner_dismissed_${page.toLowerCase()}`;
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    let isMounted = true;

    // Fetch active popup banners for this page
    fetch(`${API_BASE_URL}/api/banners?page=${page}&displayType=POPUP`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((res) => {
        if (!isMounted) return;

        if (res?.success && Array.isArray(res?.data) && res.data.length > 0) {
          const banner = res.data[0]; // Highest priority active banner
          setActiveBanner(banner);

          // Configure trigger
          if (banner.popupTrigger === "ON_SCROLL") {
            // Setup scroll listener
            const scrollPercentThreshold = banner.triggerScrollPercent || 30;

            const handleScroll = () => {
              if (scrollTriggeredRef.current) return;
              const scrollTop = window.scrollY || document.documentElement.scrollTop;
              const docHeight =
                document.documentElement.scrollHeight - document.documentElement.clientHeight;
              const currentPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

              if (currentPercent >= scrollPercentThreshold) {
                scrollTriggeredRef.current = true;
                setIsOpen(true);
                window.removeEventListener("scroll", handleScroll);
              }
            };

            window.addEventListener("scroll", handleScroll, { passive: true });
            return () => window.removeEventListener("scroll", handleScroll);
          } else {
            // ON_LOAD trigger with configurable delay seconds
            const delayMs = (banner.triggerDelaySeconds != null ? banner.triggerDelaySeconds : 3) * 1000;
            const timer = setTimeout(() => {
              if (isMounted) setIsOpen(true);
            }, Math.max(delayMs, 500));

            return () => clearTimeout(timer);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load dynamic banners:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const handleClose = () => {
    setIsOpen(false);
    const page = getTargetPage(pathname);
    sessionStorage.setItem(`grab_banner_dismissed_${page.toLowerCase()}`, "true");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !activeBanner) return null;

  const isVideo = activeBanner.mediaType === "VIDEO";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-99999 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Close popup"
          className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Side: Uploaded Poster Image from Admin */}
          <div className="relative bg-white flex items-center justify-center p-4 sm:p-6">
            <div className="relative w-full aspect-square max-w-[280px] md:max-w-full rounded-2xl overflow-hidden flex items-center justify-center">
              {isVideo ? (
                <video
                  src={activeBanner.mediaUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <img
                  src={activeBanner.mediaUrl}
                  alt={activeBanner.title || "Grab Rentals"}
                  className="w-full h-full object-contain rounded-2xl"
                  onError={(e) => {
                    e.target.src = "/images/promo/grab-welcome-poster-blue.jpg";
                  }}
                />
              )}
            </div>
          </div>

          {/* Right Side: Text & Contact Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-center text-center md:text-left bg-white">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {activeBanner.title || "Grab Rentals"}
            </h2>

            {activeBanner.subtitle && (
              <p className="text-sm sm:text-base font-bold text-[#0082fe] mt-1.5">
                {activeBanner.subtitle}
              </p>
            )}

            {activeBanner.description && (
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 whitespace-pre-line">
                {activeBanner.description}
              </p>
            )}

            {/* Helpline Section (Optional — only shows if configured) */}
            {activeBanner.helplineNumber && (
              <>
                <div className="my-5 border-t border-slate-200 border-dashed"></div>
                <div className="mb-5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    {activeBanner.helplineTitle || "24/7 HELPLINE & INSTANT BOOKING"}
                  </span>
                  <a
                    href={`tel:${activeBanner.helplineNumber.replace(/[^0-9+]/g, '')}`}
                    className="inline-flex items-center justify-center md:justify-start text-lg sm:text-xl font-black text-slate-900 hover:text-[#0082fe] transition-colors"
                  >
                    <span>Ph: {activeBanner.helplineNumber}</span>
                  </a>
                </div>
              </>
            )}

            {/* Call Now & WhatsApp Buttons */}
            <div className={`grid grid-cols-2 gap-3 ${!activeBanner.helplineNumber ? 'mt-4 pt-4 border-t border-slate-100' : ''}`}>
              <a
                href={`tel:${(activeBanner.helplineNumber || '+919071100200').replace(/[^0-9+]/g, '')}`}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0082fe] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>

              <a
                href="https://wa.me/919071100200?text=Hi%20Grab%20Rentals%2C%20I%20would%20like%20to%20inquire%20about%20booking%20a%20cab."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
