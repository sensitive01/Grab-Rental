import { Check, Info, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface Vehicle {
  id: string;
  name: string;
  categoryBadge: string;
  topBadge?: string;
  rating: string;
  reviewCount: string;
  tags?: string[];
  inclusions: string[];
  price: number;
  originalPrice: number;
  advanceAmount?: number;
  isRecommended?: boolean;
  ctaText: string;
  image?: string;
}

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className={`bg-white rounded-2xl border ${vehicle.isRecommended ? 'border-brand-amber shadow-md' : 'border-slate-200 shadow-sm'} hover:shadow-lg transition-shadow p-5 flex flex-col md:flex-row gap-6 items-start relative overflow-hidden`}>
      
      {/* Top Bar Badge (Recommended) */}
      {vehicle.topBadge && (
        <div className="absolute top-0 left-0 right-0 bg-orange-50 text-brand-orange text-[10px] font-extrabold uppercase tracking-widest text-center py-1 border-b border-brand-amber/20 z-10">
          {vehicle.topBadge}
        </div>
      )}

      {/* Category Badge */}
      <div className={`absolute ${vehicle.topBadge ? 'top-6' : 'top-0'} left-0 bg-brand-navy text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-br-lg z-20`}>
        {vehicle.categoryBadge}
      </div>

      {/* Left: Image & Title */}
      <div className={`w-full md:w-64 flex flex-col items-center shrink-0 ${vehicle.topBadge ? 'pt-8' : 'pt-4'}`}>
        <div className="w-full aspect-[16/9] bg-white rounded-xl mb-4 flex items-center justify-center border border-slate-100 relative overflow-hidden shadow-sm">
          {vehicle.image ? (
            <Image src={vehicle.image} alt={vehicle.name} fill sizes="256px" className="object-cover hover:scale-105 transition-transform duration-500" />
          ) : (
            <span className="text-4xl font-extrabold text-slate-200 uppercase">{vehicle.name.substring(0, 3)}</span>
          )}
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 mb-1 text-center leading-tight">{vehicle.name}</h3>
        <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-700 mb-3">
          <Star className="w-3.5 h-3.5 fill-brand-amber text-brand-amber" /> 
          {vehicle.rating} <span className="text-slate-400 font-medium">({vehicle.reviewCount})</span>
        </div>
        {vehicle.tags && (
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold text-brand-sky-dark uppercase">
            {vehicle.tags.map(tag => (
              <span key={tag} className="bg-sky-50 px-2 py-1 rounded border border-sky-100">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Middle: Inclusions */}
      <div className={`flex-1 py-2 hidden md:block ${vehicle.topBadge ? 'mt-6' : ''}`}>
        <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Check className="w-4 h-4 text-brand-emerald" /> Trip Inclusions
        </h4>
        <ul className="space-y-2.5 text-sm font-semibold text-slate-700">
          {vehicle.inclusions.map((inc, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <div className="mt-0.5 rounded-full bg-emerald-50 p-0.5 shrink-0">
                <Check className="w-3 h-3 text-brand-emerald" />
              </div>
              <span className="leading-snug">{inc}</span>
            </li>
          ))}
        </ul>
        <button className="mt-5 text-[11px] font-extrabold text-brand-sky-dark uppercase tracking-wide flex items-center gap-1 hover:underline">
          <Info className="w-4 h-4" /> Detailed Fare Breakdown & Taxes
        </button>
      </div>

      {/* Right: Pricing & CTA */}
      <div className={`w-full md:w-56 bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col items-center justify-center shrink-0 ${vehicle.topBadge ? 'mt-6' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-slate-400 line-through">₹{vehicle.originalPrice.toLocaleString()}</span>
        </div>
        <div className="text-3xl font-black text-slate-900 mb-1">
          ₹{vehicle.price.toLocaleString()}
        </div>
        <p className="text-[10px] font-extrabold text-brand-emerald-dark uppercase tracking-wider mb-4 bg-emerald-50 px-2 py-1 rounded">
          All-Inclusive Fixed Fare
        </p>
        
        <Link href="/outstation/trip-details" className={`w-full ${vehicle.isRecommended ? 'bg-brand-amber hover:bg-brand-amber-active text-white' : 'bg-brand-navy hover:bg-brand-navy-dark text-white'} py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all shadow-sm flex items-center justify-center`}>
          {vehicle.ctaText}
        </Link>

        {vehicle.advanceAmount ? (
          <p className="text-[10px] text-slate-500 font-bold mt-4 text-center">
            Pay ₹{vehicle.advanceAmount.toLocaleString()} (20%) now to book.
          </p>
        ) : (
          <p className="text-[10px] text-brand-orange font-bold mt-4 text-center">
            Zero advance option available.
          </p>
        )}
      </div>

    </div>
  );
}
