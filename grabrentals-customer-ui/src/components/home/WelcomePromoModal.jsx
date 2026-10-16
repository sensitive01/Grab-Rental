"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Phone, X } from "lucide-react";

export default function WelcomePromoModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup once per browser session on first homepage visit
    const hasSeen = sessionStorage.getItem("grab_welcome_popup_v1");
    if (!hasSeen) {
      // Gentle delay for smooth page entrance
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("grab_welcome_popup_v1", "true");
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-amber-500/20 overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Close popup"
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Side: Uploaded Poster Image */}
          <div className="relative bg-gradient-to-b from-sky-50/30 via-slate-50 to-white flex items-center justify-center p-4 sm:p-5 border-b md:border-b-0 md:border-r border-slate-100">
            <div className="relative w-full aspect-square max-w-[280px] md:max-w-full drop-shadow-md rounded-2xl overflow-hidden">
              <Image
                src="/images/promo/grab-welcome-poster-blue.jpg"
                alt="Grab Rentals - Your Holiday Our Responsibility"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Right Side: Text & Contact Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-center text-center md:text-left bg-white">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Grab Rentals
            </h2>

            <p className="text-sm sm:text-base font-bold text-amber-600 mt-1">
              Your 365 Days Travel Partner
            </p>

            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              For your comfort in every happy mile
            </p>

            {/* Divider */}
            <div className="my-5 border-t border-slate-200 border-dashed"></div>

            {/* Phone Number */}
            <div className="mb-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                24/7 Helpline &amp; Instant Booking
              </span>
              <a
                href="tel:+919071100200"
                className="inline-flex items-center justify-center md:justify-start text-base sm:text-lg font-black text-slate-900 hover:text-amber-600 transition-colors"
              >
                <span>Ph: (+91) 9071 100 200</span>
              </a>
            </div>

            {/* Call Now & WhatsApp Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href="tel:+919071100200"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>

              <a
                href="https://wa.me/919071100200?text=Hi%20Grab%20Rentals%2C%20I%20would%20like%20to%20inquire%20about%20booking%20a%20cab."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
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
