"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import customerApi from "@/lib/customerApi";
import { useLanguage } from "@/context/LanguageContext";

export default function PageHeroSection({
  pageKey = "HOME",
  defaultBadge,
  defaultTitle1,
  defaultTitle2,
  defaultSubtitle,
  defaultImages = ["/images/customer-hero-banner.png"],
  badgeIcon,
  accentColorClass = "text-brand-orange",
  badgeClass = "bg-[#0082fe] border border-blue-400/40 text-white",
  children,
  autoSlideIntervalMs = 4500,
  hasFloatingWidget = false,
}) {
  const { language } = useLanguage();
  const isLongScript = language === "ta" || language === "ml";

  // Check memory cache to avoid flicker on route changes
  const initialCache = typeof window !== "undefined" && window.__GRAB_HERO_CACHE__?.[pageKey];

  const [heroData, setHeroData] = useState(initialCache || null);
  const [loaded, setLoaded] = useState(Boolean(initialCache));
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    let isMounted = true;

    // Fetch dynamic hero configuration from backend
    customerApi
      .getHeroSection(pageKey)
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && res?.data) {
          if (typeof window !== "undefined") {
            window.__GRAB_HERO_CACHE__ = window.__GRAB_HERO_CACHE__ || {};
            window.__GRAB_HERO_CACHE__[pageKey] = res.data;
          }
          setHeroData(res.data);
        }
      })
      .catch((err) => {
        // In case backend is offline, leave heroData as null (defaults or white screen)
        console.warn(`[PageHeroSection] Could not load hero banner for ${pageKey}:`, err?.message || err);
      })
      .finally(() => {
        if (isMounted) setLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, [pageKey]);

  // Determine whether this page has details or should render a clean white screen
  // If no details have been added by the admin, strictly show a clean white screen!
  const hasDetails = Boolean(heroData?.hasDetails);

  // Determine image list
  let images = [];
  if (heroData?.bgImages && Array.isArray(heroData.bgImages) && heroData.bgImages.length > 0) {
    images = heroData.bgImages;
  } else if (heroData?.bgImageUrl) {
    images = [heroData.bgImageUrl];
  } else if (defaultImages && defaultImages.length > 0) {
    images = defaultImages;
  }

  // Auto-scroll slideshow when multiple images are present
  useEffect(() => {
    if (!hasDetails || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, autoSlideIntervalMs);

    return () => clearInterval(timer);
  }, [hasDetails, images.length, autoSlideIntervalMs]);

  // CASE 1: If no details are added (or cleared by Admin), show clean white screen!
  if (!hasDetails) {
    return (
      <section
        className={`bg-white px-3 sm:px-4 lg:px-8 relative flex flex-col items-center ${
          hasFloatingWidget
            ? "pt-4 sm:pt-5 pb-[120px] sm:pb-[170px] md:pb-[220px] lg:pb-[290px]"
            : "pt-4 sm:pt-6 md:pt-8 pb-10 sm:pb-12 md:pb-16"
        }`}
      >
        {/* Clean white background area: zero picture fallback, zero banner text */}
      </section>
    );
  }

  // CASE 2: Details exist -> Render full Hero Banner with exact preserved styling and colors
  const badgeText = heroData?.badgeText || defaultBadge;
  const title1 = heroData?.titleLine1 || defaultTitle1;
  const title2 = heroData?.titleLine2 || defaultTitle2;
  const subtitle = heroData?.subtitle || defaultSubtitle;

  return (
    <section
      className={`text-white px-3 sm:px-4 lg:px-8 relative overflow-hidden flex flex-col items-center bg-slate-900 select-none ${
        hasFloatingWidget
          ? "pt-2.5 sm:pt-3 md:pt-3 pb-[120px] sm:pb-[170px] md:pb-[220px] lg:pb-[290px]"
          : "pt-4 sm:pt-6 md:pt-8 pb-10 sm:pb-12 md:pb-14 lg:pb-16"
      }`}
    >
      {/* Background Image(s) with Smooth Transition */}
      {images.length > 0 ? (
        images.map((imgUrl, i) => (
          <div
            key={i}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
              i === currentIdx ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
            }`}
            style={{ backgroundImage: `url("${imgUrl}")` }}
          />
        ))
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/images/customer-hero-banner.png")' }}
        />
      )}

      {/* Dark Gradient Overlay (Exact match to current theme) */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/30 to-slate-950/80 pointer-events-none" />

      {/* Content Container */}
      <div className="max-w-7xl w-full relative z-10 flex flex-col items-center text-center">
        {/* Pill Badge */}
        {badgeText && (
          <div
            className={`inline-flex items-center gap-1.5 sm:gap-2 ${badgeClass} px-3 py-1 rounded-full text-[10.5px] sm:text-xs font-extrabold uppercase tracking-widest mb-1 sm:mb-1.5 shadow-lg shadow-blue-900/30`}
          >
            {badgeIcon || <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />}
            <span>{badgeText}</span>
          </div>
        )}

        {/* Headings */}
        <h1
          className={`font-extrabold tracking-tight mb-1 sm:mb-1.5 drop-shadow-2xl w-full max-w-7xl mx-auto px-2 sm:px-4 leading-tight hero-title ${
            isLongScript
              ? "text-lg sm:text-xl md:text-[22px] lg:text-[25px] xl:text-[28px] 2xl:text-[32px]"
              : "text-xl sm:text-2xl md:text-[26px] lg:text-[28px] xl:text-[32px] 2xl:text-[36px]"
          }`}
        >
          {title1 && (
            <span className={`block ${isLongScript ? "lg:whitespace-normal xl:whitespace-nowrap" : "lg:whitespace-nowrap"}`}>
              {title1}
            </span>
          )}
          {title2 && (
            <span className={`${accentColorClass} drop-shadow-lg block mt-0.5 lg:whitespace-nowrap`}>
              {title2}
            </span>
          )}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p
            className={`font-medium drop-shadow-md px-2 leading-snug hero-subtitle ${
              isLongScript
                ? "text-xs sm:text-[13px] md:text-sm lg:text-[14.5px] text-slate-200/95 max-w-3xl mx-auto"
                : "text-xs sm:text-sm md:text-[14.5px] lg:text-[15.5px] text-slate-200/95 max-w-4xl mx-auto"
            }`}
          >
            {subtitle}
          </p>
        )}

        {/* Optional Page-Specific Sub-content */}
        {children && <div className="mt-1.5">{children}</div>}

        {/* Bottom Carousel Navigation Dots (When multiple images exist) */}
        {images.length > 1 && (
          <div className="flex items-center gap-1.5 mt-2">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIdx(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === currentIdx ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

