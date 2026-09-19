import Link from "next/link";
import { ShieldCheck, CreditCard, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-6 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Brand & ISO */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <div className="bg-white text-slate-900 px-2 py-0.5 rounded flex items-center font-bold tracking-tight">
                FLEETRIDE
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase mt-0.5">
              Chauffeur & Intercity
            </span>
          </Link>
          <p className="text-sm mt-2">
            India's premier intercity and local car rental service. ISO 9001:2015 Certified for Quality Management.
          </p>
          <div className="flex items-center gap-2 mt-4 text-brand-emerald">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-medium">100% Safe & Secure Booking</span>
          </div>
        </div>

        {/* Intercity Routes */}
        <div>
          <h3 className="text-white font-semibold mb-4">Top Intercity Routes</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/" className="hover:text-brand-amber transition-colors">Bangalore to Mysore Cabs</Link></li>
            <li><Link href="/" className="hover:text-brand-amber transition-colors">Delhi to Agra Cabs</Link></li>
            <li><Link href="/" className="hover:text-brand-amber transition-colors">Mumbai to Pune Cabs</Link></li>
            <li><Link href="/" className="hover:text-brand-amber transition-colors">Chennai to Pondicherry Cabs</Link></li>
            <li><Link href="/" className="hover:text-brand-amber transition-colors">Delhi to Jaipur Cabs</Link></li>
          </ul>
        </div>

        {/* Fleet Portfolio */}
        <div>
          <h3 className="text-white font-semibold mb-4">Our Fleet Portfolio</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/" className="hover:text-brand-amber transition-colors">Executive Sedans</Link></li>
            <li><Link href="/" className="hover:text-brand-amber transition-colors">Premium SUVs (Innova Crysta)</Link></li>
            <li><Link href="/" className="hover:text-brand-amber transition-colors">Tempo Travellers (9-26 Seater)</Link></li>
            <li><Link href="/" className="hover:text-brand-amber transition-colors">Luxury Volvo Coaches</Link></li>
            <li><Link href="/" className="hover:text-brand-amber transition-colors">EV Chauffeur Driven</Link></li>
          </ul>
        </div>

        {/* Partner/B2B Links & Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">Partner & Support</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/agency" className="hover:text-brand-amber transition-colors">Attach Your Vehicle</Link></li>
            <li><Link href="/admin" className="hover:text-brand-amber transition-colors">Corporate Travel (B2B)</Link></li>
            <li><Link href="/" className="hover:text-brand-amber transition-colors">Contact Us / Help Center</Link></li>
            <li><a href="tel:+919045450000" className="text-white font-medium hover:text-brand-amber transition-colors">Helpline: +91 90454 50000</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-xs">
          &copy; {new Date().getFullYear()} FleetRide Mobility Pvt. Ltd. All rights reserved.
          <span className="mx-2">|</span>
          <Link href="/" className="hover:text-white transition-colors">Terms of Service</Link>
          <span className="mx-2">|</span>
          <Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link>
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-slate-500" /> Secure Payments</span>
          <div className="flex gap-2">
            <span className="bg-slate-800 px-2 py-1 rounded">Razorpay</span>
            <span className="bg-slate-800 px-2 py-1 rounded">UPI</span>
            <span className="bg-slate-800 px-2 py-1 rounded">Cards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
