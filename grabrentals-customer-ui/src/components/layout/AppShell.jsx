"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, Star, BadgeCheck, CheckCircle, Navigation, Phone, Briefcase, ChevronDown, User, Shield, CreditCard, Lock, LogOut, Settings, Menu, X, Bell } from "lucide-react";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("rental_access_token");
      localStorage.removeItem("rental_user");
    }
    setCurrentUser(null);
    setUserMenuOpen(false);
    router.push("/");
  };

  const navLinks = [
    { name: "Outstation Cabs", href: "/" },
    { name: "Hourly / Local", href: "/local" },
    { name: "Airport Transfers", href: "/airport" },
    { name: "Tempo Traveller", href: "/vans" },
    { name: "Luxury Buses", href: "/buses" },
    { name: "Corporate & Events", href: "/corporate" },
  ];

  // Auth pages like /login use a dedicated focused layout
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50">
      
      {/* A. Top Trust & Guarantee Ticker */}
      <div className="bg-brand-navy-dark text-slate-300 text-xs py-2 px-6 hidden md:flex items-center justify-between">
        <div className="flex items-center gap-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-emerald" />
            <span>Zero Cancellation Fee up to 6 hrs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-brand-amber" />
            <span>Expert Chauffeurs (4.8★ Avg)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BadgeCheck className="w-4 h-4 text-brand-sky" />
            <span>Transparent All-Inclusive Fares</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-brand-emerald" />
            <span>Sanitized & GPS Tracked Fleet</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-brand-amber" />
            <span>Executive Standards Verified</span>
          </div>
        </div>
      </div>

      {/* B. Sticky Main Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 h-20 px-4 lg:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 lg:gap-8 h-full min-w-0 flex-1">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-brand-navy rounded-lg flex items-center justify-center border-b-2 border-brand-sky-dark relative overflow-hidden hidden sm:flex">
              <span className="w-4 h-1.5 bg-brand-sky-dark absolute bottom-2 rounded-full"></span>
              <span className="w-6 h-3 bg-brand-amber absolute top-2.5 rounded-t-full"></span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg lg:text-xl tracking-tight text-brand-navy">GRAB RENTALS</span>
              <span className="text-[8px] lg:text-[9px] font-bold text-brand-orange uppercase tracking-widest leading-none">Chauffeur & Intercity</span>
            </div>
          </Link>

          {/* Service Tabs */}
          <nav className="hidden lg:flex items-center h-full space-x-1 lg:ml-4 whitespace-nowrap overflow-x-auto hide-scrollbar flex-1">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className={`px-2 lg:px-3 py-2 text-xs lg:text-sm font-semibold transition-colors ${
                  pathname === link.href 
                    ? "bg-brand-amber text-white font-bold rounded-full shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 ml-auto whitespace-nowrap flex-shrink-0">
          {/* Notifications Link */}
          <Link
            href="/account/notifications"
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors"
            title="Activity & Trip Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse"></span>
          </Link>
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[10px]">
                    {currentUser.name && currentUser.name !== "Customer" ? currentUser.name.charAt(0).toUpperCase() : "C"}
                  </div>
                  <span className="max-w-[130px] truncate">
                    {currentUser.name && currentUser.name !== "Customer" ? currentUser.name : currentUser.phone || "Customer"}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
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
                          <span>Account Settings</span>
                        </Link>
                        <Link 
                          href="/dashboard" 
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-slate-800/80 text-slate-200 transition-colors"
                        >
                          <User className="w-4 h-4 text-amber-400" />
                          <span>My Trips</span>
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
                          <span>Log Out</span>
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
              className="flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wide transition-all shadow-sm group"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                <User className="w-3.5 h-3.5" />
              </div>
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-x-0 top-20 bottom-0 bg-slate-950/60 backdrop-blur-xs z-50 animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div 
              className="bg-white border-b border-slate-200 px-5 py-4 shadow-2xl space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2">Services & Fleet</span>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      pathname === link.href ? "bg-amber-50 text-amber-800 font-black border border-amber-200" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{link.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">Explore →</span>
                  </Link>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2">Quick Access</span>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <User className="w-4 h-4 text-amber-500" /> My Trips & Bookings
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
                  <Phone className="w-4 h-4 text-emerald-500" /> 24/7 Helpline & Support
                </Link>
                <Link
                  href="/account/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="w-4 h-4 text-slate-500" /> Account Settings
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
      <footer className="bg-brand-navy-dark text-slate-400 pt-16 pb-10 px-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Column 1 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-bold text-brand-navy border-b-2 border-brand-sky-dark">
                GR
              </div>
              <span className="font-extrabold text-lg text-white">GRAB RENTALS</span>
            </div>
            <p className="text-sm leading-relaxed mt-2 text-slate-400">
              Grab Rentals — India's dedicated premier outstation, local, and group mobility chauffeur network with guaranteed fixed rates and sanitized fleet.
            </p>
            <div className="inline-flex items-center gap-2 mt-2 border border-slate-800 bg-slate-900 px-3 py-1.5 rounded w-max text-brand-emerald">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">ISO 9001:2015 Certified Fleet</span>
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide">Intercity Routes</h3>
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
            <h3 className="text-white font-semibold mb-4 tracking-wide">Fleet Portfolio</h3>
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
            <h3 className="text-white font-semibold mb-4 tracking-wide">For Partners & B2B</h3>
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
            <h3 className="text-white font-semibold mb-4 tracking-wide">Contact & Trust</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="tel:+919045450000" className="flex items-center gap-2 text-white font-medium hover:text-brand-amber transition-colors"><Phone className="w-4 h-4 text-brand-orange" /> +91 90454 50000</a><span className="block text-xs text-slate-500 mt-1 ml-6">(24x7 / 365 Days Toll-Free)</span></li>
              <li><a href="mailto:bookings@grabrentals.com" className="hover:text-brand-amber transition-colors ml-6">bookings@grabrentals.com</a></li>
              <li className="flex items-start gap-2 mt-4 text-slate-400">
                <Navigation className="w-4 h-4 text-brand-sky mt-1 shrink-0" />
                <span>Fleet Towers, Aerocity Transit Zone, New Delhi 110037</span>
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
