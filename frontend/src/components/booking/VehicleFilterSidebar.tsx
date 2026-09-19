import { ShieldAlert, Check } from "lucide-react";

export default function VehicleFilterSidebar() {
  return (
    <div className="w-72 flex-shrink-0 hidden lg:block space-y-6 sticky top-48 h-max">
      
      {/* Fleet Category */}
      <div>
        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-3">Fleet Category</h3>
        <div className="space-y-3 text-sm font-semibold text-slate-700">
          {[
            { label: "Sedan (Dzire, Etios)", checked: true },
            { label: "Premium SUV (Innova, Ertiga)", checked: true },
            { label: "Tempo Traveller (12-20 Seats)", checked: false },
            { label: "Luxury Coach (26-50 Seats)", checked: false }
          ].map((cat, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center transition-colors ${cat.checked ? 'bg-brand-amber border-brand-amber text-white' : 'border-slate-300 group-hover:border-brand-amber'}`}>
                {cat.checked && <Check className="w-3 h-3" />}
              </div>
              <span className="group-hover:text-slate-900">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Powertrain */}
      <div>
        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-3">Powertrain</h3>
        <div className="flex flex-wrap gap-2">
          {["Diesel", "EV Chauffeur", "CNG", "Petrol"].map(pt => (
            <button key={pt} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-brand-amber hover:text-brand-amber transition-colors shadow-sm">
              {pt}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Passenger Seats */}
      <div>
        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-3">Passenger Seats</h3>
        <div className="flex flex-wrap gap-2">
          {["4", "6-7", "12+", "26+"].map(cap => (
            <button key={cap} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-brand-amber hover:text-brand-amber transition-colors shadow-sm">
              {cap}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Chauffeur Rating */}
      <div>
        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-3">Chauffeur Rating</h3>
        <label className="flex items-center gap-3 cursor-pointer group text-sm font-semibold text-slate-700">
          <div className="w-4 h-4 rounded-[4px] border-2 border-brand-amber bg-brand-amber text-white flex items-center justify-center">
            <Check className="w-3 h-3" />
          </div>
          <span className="group-hover:text-slate-900">4.8★ and above rated only</span>
        </label>
      </div>

      {/* Zero Surprise Guarantee Callout */}
      <div className="bg-brand-navy-dark rounded-2xl p-5 text-white mt-8 shadow-xl relative overflow-hidden border-t-4 border-brand-amber">
        <ShieldAlert className="w-8 h-8 text-brand-emerald mb-3" />
        <h4 className="font-extrabold mb-1">Zero-Surprise Guarantee</h4>
        <p className="text-[11px] font-semibold text-slate-400 leading-relaxed">
          Tolls, tax, state permits, and driver allowance are pre-included. No hidden charges on any outstation trips. Includes 24x7 trip concierge.
        </p>
      </div>
    </div>
  );
}
