import { Building, TrendingUp, CheckCircle, Headphones } from "lucide-react";
import Link from "next/link";

export default function CorporatePage() {
  return (
    <main className="flex flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-navy-dark via-slate-800 to-slate-900 text-white py-14 px-6 relative">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-brand-navy border border-slate-700 px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-brand-amber mb-6">
            <Building className="w-3 h-3 text-brand-amber" /> B2B Mobility Solutions
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Corporate Travel <span className="text-brand-orange">Simplified</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-medium">
            Dedicated account managers, automated GST invoicing, and a zero-delay SLA for your employees and executives.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Features */}
            <div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-8">Why Partner With Us?</h2>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center shrink-0">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-900">Credit Facility & Automated Billing</h4>
                            <p className="text-sm text-slate-600 mt-1">Monthly billing cycles with 100% compliant automated GST invoices and MIS reports.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-brand-emerald-dark flex items-center justify-center shrink-0">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-900">Executive Chauffeurs</h4>
                            <p className="text-sm text-slate-600 mt-1">Specially trained chauffeurs with NDA compliance for CXO level ground transportation.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-sky-50 text-brand-sky-dark flex items-center justify-center shrink-0">
                            <Headphones className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-900">24x7 Dedicated Account Desk</h4>
                            <p className="text-sm text-slate-600 mt-1">Direct hotline to your account manager. Zero IVR wait times for corporate clients.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lead Form */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-brand-amber"></div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Request a Corporate Callback</h3>
                <p className="text-sm text-slate-500 mb-6">Fill this form and our B2B team will contact you within 2 hours.</p>
                
                <form className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Company Name</label>
                        <input type="text" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Contact Person</label>
                            <input type="text" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Phone Number</label>
                            <input type="tel" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Corporate Email</label>
                        <input type="email" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none" />
                    </div>
                    <button type="button" className="w-full bg-brand-navy hover:bg-brand-navy-dark text-white font-bold py-3 rounded-lg mt-4 transition-colors">
                        Submit Request
                    </button>
                </form>
            </div>

        </div>
      </section>
    </main>
  );
}
