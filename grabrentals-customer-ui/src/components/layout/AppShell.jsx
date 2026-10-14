"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Star, 
  BadgeCheck, 
  CheckCircle, 
  Navigation, 
  Phone, 
  Briefcase, 
  ChevronDown, 
  User, 
  Shield, 
  CreditCard, 
  Lock, 
  LogOut, 
  Settings, 
  Menu, 
  X, 
  Bell,
  Car,
  Clock,
  Plane
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookNowOpen, setBookNowOpen] = useState(false);
  const bookNowRef = useRef(null);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = typeof window !== "undefined" ? localStorage.getItem("rental_user") : null;
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, [pathname]);

  // Close dropdowns on route change
  useEffect(() => {
    setBookNowOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Click outside to close Book Now dropdown
  useEffect(() => {
    const handleDocClick = (e) => {
      if (bookNowRef.current && !bookNowRef.current.contains(e.target)) {
        setBookNowOpen(false);
      }
    };
    if (bookNowOpen) {
      document.addEventListener("mousedown", handleDocClick);
    }
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, [bookNowOpen]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("rental_access_token");
      localStorage.removeItem("rental_user");
    }
    setCurrentUser(null);
    setUserMenuOpen(false);
    router.push("/");
  };

  const { t, language, setLanguage } = useLanguage();

  const TOP_LANGUAGES = [
    { code: "en", label: "English", name: "English" },
    { code: "kn", label: "ಕನ್ನಡ", name: "Kannada" },
    { code: "ta", label: "தமிழ்", name: "Tamil" },
    { code: "te", label: "తెలుగు", name: "Telugu" },
    { code: "hi", label: "हिंदी", name: "Hindi" },
  ];

  const bookNowItems = [
    { 
      name: t("outstation_cabs") || "Outstation Cabs", 
      href: "/", 
      icon: Car, 
      desc: "One-way & round-trip car rentals" 
    },
    { 
      name: t("hourly_local") || "Hourly Rental", 
      href: "/local", 
      icon: Clock, 
      desc: "Flexible local city rental packages" 
    },
    { 
      name: t("airport_transfers") || "Airport Transfers", 
      href: "/airport", 
      icon: Plane, 
      desc: "Guaranteed on-time airport pickup & drop" 
    },
  ];

  const mainNavLinks = [
    { name: t("tempo_traveller") || "Urbania / Tempo Traveller", href: "/vans" },
    { name: t("luxury_buses") || "Bus Hire", href: "/buses" },
    { name: t("packages") || "Tour Packages", href: "/packages" },
    { name: t("corporate_events") || "Corporate & Events", href: "/corporate" },
  ];

  const isNavActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname?.startsWith(href + "/");
  };

  const isBookNowActive = pathname === "/" || pathname === "/local" || pathname?.startsWith("/local") || pathname === "/airport" || pathname?.startsWith("/airport");

  // Auth pages like /login use a dedicated focused layout
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50">
      
      {/* A. Top Trust & Guarantee Ticker with Language Options */}
      <div className="bg-brand-navy-dark text-slate-300 text-xs py-1.5 sm:py-2 px-3 sm:px-6 lg:px-8 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center justify-between w-full gap-2 sm:gap-4">
          
          {/* Trust Guarantees on Desktop, Helpline on Mobile */}
          <div className="flex items-center gap-3.5 lg:gap-5 whitespace-nowrap text-[11px] lg:text-xs min-w-0 select-none">
            {/* Mobile Quick Helpline */}
            <a 
              href="tel:+919071100200" 
              className="md:hidden flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span>+91 90711 00200</span>
            </a>

            <div className="hidden md:flex items-center gap-1.5 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
              <span>{t("zero_cancellation")}</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 shrink-0">
              <Star className="w-3.5 h-3.5 text-brand-amber shrink-0" />
              <span>{t("expert_chauffeurs")}</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 shrink-0">
              <BadgeCheck className="w-3.5 h-3.5 text-brand-sky shrink-0" />
              <span>{t("all_inclusive")}</span>
            </div>
            <div className="hidden xl:flex items-center gap-1.5 shrink-0">
              <CheckCircle className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
              <span>{t("sanitized_fleet")}</span>
            </div>
            <div className="hidden 2xl:flex items-center gap-1.5 shrink-0">
              <Shield className="w-3.5 h-3.5 text-brand-amber shrink-0" />
              <span>{t("executive_standards")}</span>
            </div>
          </div>

          {/* Top Bar Language Selector */}
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold shrink-0 ml-auto pl-2 sm:pl-4 border-l border-slate-700/60 whitespace-nowrap">
            {TOP_LANGUAGES.map((lang, idx) => {
              const isActive = language === lang.code;
              return (
                <span key={lang.code} className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`transition-all cursor-pointer ${
                      isActive
                        ? "text-brand-amber font-extrabold underline underline-offset-4 decoration-2"
                        : "text-white/90 hover:text-amber-400 font-semibold"
                    }`}
                    title={lang.name}
                  >
                    {lang.label}
                  </button>
                  {idx < TOP_LANGUAGES.length - 1 && (
                    <span className="text-slate-500 font-bold select-none text-[10px]">|</span>
                  )}
                </span>
              );
            })}
          </div>

        </div>
      </div>

      {/* B. Sticky Main Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 h-16 sm:h-20 px-3 sm:px-6 lg:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 lg:gap-8 h-full min-w-0 flex-1">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 flex-shrink-0 min-w-0">
            <img
              src="/images/brand-logo.png"
              alt="Grab Rentals"
              className="h-9 sm:h-12 w-auto object-contain drop-shadow-sm shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-black text-sm sm:text-lg lg:text-xl tracking-tight text-brand-navy leading-tight truncate">
                GRAB RENTALS
              </span>
              <span className="hidden sm:block text-[8px] sm:text-[9px] font-bold text-amber-600 uppercase tracking-widest leading-tight truncate">
                Grab Comfort in Every Mile
              </span>
            </div>
          </Link>

          {/* Service Tabs */}
          <nav className="hidden lg:flex items-center h-full space-x-1 lg:ml-4 whitespace-nowrap overflow-visible flex-1">
            
            {/* 1. Book Now Dropdown */}
            <div 
              ref={bookNowRef} 
              className="relative h-full flex items-center"
              onMouseEnter={() => setBookNowOpen(true)}
              onMouseLeave={() => setBookNowOpen(false)}
            >
              <button
                type="button"
                onClick={() => setBookNowOpen(!bookNowOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs lg:text-sm font-bold rounded-full transition-all cursor-pointer ${
                  isBookNowActive 
                    ? "bg-brand-amber text-white shadow-sm"
                    : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                }`}
              >
                <span>{t("book_now") || "Book Now"}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${bookNowOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {bookNowOpen && (
                <div className="absolute top-[80%] left-0 pt-2 z-50 w-72 animate-in fade-in zoom-in-95 duration-150">
                  <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-2 space-y-1">
                    {bookNowItems.map((item) => {
                      const Icon = item.icon;
                      const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setBookNowOpen(false)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                            active
                              ? "bg-amber-50 text-amber-950 font-bold"
                              : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            active ? "bg-amber-500 text-white shadow-xs" : "bg-slate-100 text-slate-600"
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold leading-tight">{item.name}</div>
                            <div className="text-[11px] text-slate-500 font-normal leading-tight mt-0.5">{item.desc}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Main Navigation Links */}
            {mainNavLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className={`px-2.5 lg:px-3.5 py-2 text-xs lg:text-sm font-semibold transition-colors rounded-full ${
                  isNavActive(link.href) 
                    ? "bg-brand-amber text-white font-bold shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto whitespace-nowrap flex-shrink-0">
          
          {/* Call 24/7 Helpline Icon (Visible sm and up) */}
          <a
            href="tel:+919071100200"
            className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-600 border border-slate-200/90 items-center justify-center transition-all shadow-2xs hover:scale-105 shrink-0 group cursor-pointer"
            title="Call 24/7 Helpline (+91 90711 00200)"
            aria-label="Call 24/7 Helpline"
          >
            <Phone className="w-4 h-4 text-slate-600 group-hover:text-amber-600 transition-colors" />
          </a>

          {/* WhatsApp Support Icon */}
          <a
            href="https://wa.me/919071100200?text=Hi%20Grab%20Rentals,%20I%20have%20an%20enquiry%20regarding%20booking%20a%20cab%20or%20bus."
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-all shadow-2xs hover:scale-105 shrink-0 group cursor-pointer"
            title="Chat on WhatsApp (+91 90711 00200)"
            aria-label="Chat on WhatsApp"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white p-1 sm:px-3.5 sm:py-2 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <div className="w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[11px] sm:text-[10px]">
                    {(currentUser.name && currentUser.name !== "Customer" ? currentUser.name : t("customer_badge") || "Customer").charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[110px] truncate">
                    {currentUser.name && currentUser.name !== "Customer" ? currentUser.name : currentUser.phone || t("customer_badge") || "Customer"}
                  </span>
                  <ChevronDown className={`hidden sm:block w-3 h-3 text-slate-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-[#0B0F17] border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs text-slate-200 divide-y divide-slate-800/80">
                      <div className="px-3.5 py-2.5 text-[11px] text-slate-400">
                        Signed in as <strong className="text-white block text-xs truncate mt-0.5">{currentUser.phone || currentUser.name}</strong>
                      </div>
                      <div className="py-1">
                        <Link 
                          href="/account/settings" 
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-slate-800/80 text-slate-200 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-amber-400" />
                          <span>{t("my_account") || "Account Settings"}</span>
                        </Link>
                        <Link 
                          href="/dashboard" 
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-slate-800/80 text-slate-200 transition-colors"
                        >
                          <User className="w-4 h-4 text-amber-400" />
                          <span>{t("my_bookings") || "My Trips"}</span>
                        </Link>
                        <Link 
                          href="/account/notifications" 
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-slate-800/80 text-slate-200 transition-colors"
                        >
                          <Bell className="w-4 h-4 text-amber-400" />
                          <span>Notifications</span>
                        </Link>
                        <Link 
                          href="/account/reviews" 
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-slate-800/80 text-slate-200 transition-colors"
                        >
                          <Star className="w-4 h-4 text-amber-400" />
                          <span>Reviews & Ratings</span>
                        </Link>
                      </div>
                      <div className="pt-1">
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-red-950/40 text-red-400 transition-colors cursor-pointer font-semibold"
                        >
                          <LogOut className="w-4 h-4 text-red-400" />
                          <span>{t("log_out") || "Log Out"}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <Link 
              href="/login"
              className="flex items-center gap-1.5 sm:gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white p-2 sm:px-4 sm:py-2 rounded-full text-xs font-extrabold tracking-wide transition-all shadow-sm group"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline">{t("sign_in_register") || "SignIn"}</span>
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-x-0 top-16 sm:top-20 bottom-0 bg-slate-950/60 backdrop-blur-xs z-50 animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div 
              className="bg-white border-b border-slate-200 px-5 py-4 shadow-2xl space-y-4 max-h-[calc(100vh-64px)] sm:max-h-[calc(100vh-80px)] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Language Switcher */}
              <div className="p-3 bg-slate-900 text-white rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                  Select Language
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {TOP_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setMobileMenuOpen(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        language === lang.code
                          ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                      title={lang.name}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {/* Book Now Section */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider px-2">Book Now</span>
                  {bookNowItems.map((item) => {
                    const Icon = item.icon;
                    const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                          active ? "bg-amber-50 text-amber-950 font-black border border-amber-200" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-amber-500" />
                          <span>{item.name}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Search →</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Main Menu Links */}
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2">Fleet & Corporate</span>
                  {mainNavLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                        isNavActive(link.href) ? "bg-amber-50 text-amber-950 font-black border border-amber-200" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{link.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">Search →</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2">Quick Access</span>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <User className="w-4 h-4 text-amber-500" /> {t("my_trips_title")}
                </Link>
                <Link
                  href="/account/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-500" /> Activity & Alerts
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">2</span>
                </Link>
                <Link
                  href="/account/reviews"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Star className="w-4 h-4 text-amber-500" /> Reviews & Ratings
                </Link>
                <Link
                  href="/support"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Phone className="w-4 h-4 text-emerald-500" /> {t("helpline_support")}
                </Link>
                <Link
                  href="/account/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="w-4 h-4 text-slate-500" /> {t("profile_settings")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* C. Enterprise Multi-Column Footer */}
      <footer className="bg-brand-navy-dark text-slate-400 pt-10 sm:pt-16 pb-8 sm:pb-10 px-4 sm:px-8 lg:px-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Column 1 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/brand-logo.png"
                alt="Grab Rentals"
                className="h-10 w-auto object-contain drop-shadow-sm"
              />
              <div className="flex flex-col">
                <span className="font-black text-lg text-white leading-tight">GRAB RENTALS</span>
                <span className="text-[9px] font-bold text-amber-400 tracking-wider uppercase">Grab Comfort in Every Mile</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mt-2 text-slate-400">
              {t("footer_tagline") || "Grab Rentals — India's dedicated premier outstation, local, and group mobility chauffeur network with guaranteed fixed rates and sanitized fleet."}
            </p>
            <div className="inline-flex items-center gap-2 mt-2 border border-slate-800 bg-slate-900 px-3 py-1.5 rounded w-max text-brand-emerald">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">ISO 9001:2015 Certified Fleet</span>
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide">{t("top_routes") || "Intercity Routes"}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-brand-amber transition-colors">Delhi to Agra</Link></li>
              <li><Link href="/" className="hover:text-brand-amber transition-colors">Bangalore to Ooty</Link></li>
              <li><Link href="/" className="hover:text-brand-amber transition-colors">Mumbai to Pune</Link></li>
              <li><Link href="/" className="hover:text-brand-amber transition-colors">Chennai to Pondicherry</Link></li>
              <li><Link href="/" className="hover:text-brand-amber transition-colors">Chandigarh to Manali</Link></li>
              <li><Link href="/" className="hover:text-brand-amber transition-colors">Hyderabad to Vijayawada</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide">{t("our_fleet") || "Fleet Portfolio"}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-brand-amber transition-colors">Executive Sedan (Dzire, Etios)</Link></li>
              <li><Link href="/" className="hover:text-brand-amber transition-colors">Maruti Ertiga 6-Seater</Link></li>
              <li><Link href="/" className="hover:text-brand-amber transition-colors">Innova Crysta Premium</Link></li>
              <li><Link href="/" className="hover:text-brand-amber transition-colors">12-Seater Luxury Tempo</Link></li>
              <li><Link href="/" className="hover:text-brand-amber transition-colors">26-Seater Mini Bus</Link></li>
              <li><Link href="/" className="hover:text-brand-amber transition-colors">45-Seater Volvo</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide">{t("corporate_events") || "For Partners & B2B"}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-brand-amber transition-colors">Attach Taxi & Fleet</Link></li>
              <li><Link href="/" className="hover:text-brand-amber transition-colors">Travel Agent Partner Login</Link></li>
              <li><Link href="/" className="hover:text-brand-amber transition-colors">Corporate Travel Desk</Link></li>
              <li><Link href="/" className="hover:text-brand-amber transition-colors">Hotel Concierge</Link></li>
              <li><Link href="/" className="hover:text-brand-amber transition-colors">Driver Safety Protocol</Link></li>
              <li><Link href="/" className="hover:text-brand-amber transition-colors">Automated GST Invoicing</Link></li>
            </ul>
          </div>

          {/* Column 5 */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide">{t("helpline_support") || "Contact & Trust"}</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="tel:+919071100200" className="flex items-center gap-2 text-white font-medium hover:text-brand-amber transition-colors"><Phone className="w-4 h-4 text-brand-orange" /> +91 90711 00200</a><span className="block text-xs text-slate-500 mt-1 ml-6">(24x7 / 365 Days Toll-Free)</span></li>
              <li><a href="mailto:info@grabrentals.in" className="hover:text-brand-amber transition-colors ml-6">info@grabrentals.in</a></li>
              <li className="flex items-start gap-2 mt-4 text-slate-400">
                <Navigation className="w-4 h-4 text-brand-sky mt-1 shrink-0" />
                <span>Anjananagar, Bangalore, Karnataka</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
            <span>&copy; {new Date().getFullYear()} Grab Rental Technologies Pvt. Ltd. All rights reserved.</span>
            <span className="hidden md:inline">|</span>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="hidden md:inline">|</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <span className="hidden md:inline">|</span>
            <Link href="/refund-policy" className="hover:text-white transition-colors">Cancellation & Refund Policy</Link>
            <span className="hidden md:inline">|</span>
            <Link href="/support" className="hover:text-white transition-colors">Customer Support</Link>
          </div>
          
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-slate-400"><Lock className="w-3.5 h-3.5" /> Secure Payments:</span>
            <div className="flex gap-2 font-semibold text-slate-300">
              <span className="bg-slate-800 px-2 py-1 rounded">UPI</span>
              <span className="bg-slate-800 px-2 py-1 rounded">Cards</span>
              <span className="bg-slate-800 px-2 py-1 rounded">NetBanking</span>
              <span className="bg-slate-800 px-2 py-1 rounded text-brand-sky">Razorpay</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
