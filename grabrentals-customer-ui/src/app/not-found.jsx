"use client";

import Link from "next/link";
import { 
  Home, 
  ArrowLeft, 
  Car, 
  Navigation, 
  Plane, 
  Package, 
  PhoneCall, 
  MessageCircle, 
  LifeBuoy,
  Compass
} from "lucide-react";

export default function NotFound() {
  const quickLinks = [
    {
      title: "Outstation Trips",
      desc: "One-way drops & roundtrips",
      href: "/",
      icon: Navigation,
      color: "bg-blue-50 text-blue-600 hover:border-blue-300",
    },
    {
      title: "Airport Transfers",
      desc: "Reliable airport pickups & drops",
      href: "/airport",
      icon: Plane,
      color: "bg-sky-50 text-sky-600 hover:border-sky-300",
    },
    {
      title: "Explore Fleet",
      desc: "Sedan, SUV, Urbania & Buses",
      href: "/fleet",
      icon: Car,
      color: "bg-indigo-50 text-indigo-600 hover:border-indigo-300",
    },
    {
      title: "Tour Packages",
      desc: "Curated holiday travel routes",
      href: "/packages",
      icon: Package,
      color: "bg-amber-50 text-amber-600 hover:border-amber-300",
    },
  ];

  return (
    <main id="not-found-page" data-page="404" className="min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50/60 via-white to-slate-50/30">
      <div className="max-w-3xl w-full text-center space-y-8">
        
        {/* Animated Badge & Icon */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0082fe] text-xs font-bold tracking-wider uppercase shadow-xs">
          <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: "12s" }} />
          <span>Route Not Found</span>
        </div>

        {/* 404 Headline */}
        <div className="space-y-2">
          <h1 className="text-7xl sm:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-[#0082fe] to-sky-500 drop-shadow-xs select-none">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Oops! Looks Like You Took an Unexpected Detour
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            The page or destination you are searching for might have been moved, renamed, or doesn't exist. Let's get your trip back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.history.back();
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-300 shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Popular Destinations / Routes Grid */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Popular Booking Destinations
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all group flex flex-col justify-between"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 24/7 Helpline Card */}
        <div className="pt-2">
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md max-w-xl mx-auto">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-sky-400 shrink-0">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-300">Need Immediate Booking Assistance?</p>
                <p className="text-[11px] text-slate-400">Our 24/7 travel desk is always online</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href="tel:+919071100200"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
                <span>+91 90711 00200</span>
              </a>

              <a
                href="https://wa.me/919071100200?text=Hi%2C%20I%20got%20lost%20on%20the%20website%20and%20need%20assistance%20with%20cab%20booking."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
