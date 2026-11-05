"use client";

import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  Scale,
  Car,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Printer,
  Phone,
  Check
} from "lucide-react";

export default function VendorTermsPage() {
  const lastUpdated = "November 5, 2026";

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const sections = [
    {
      id: "eligibility",
      title: "1. Partner Eligibility & Mandatory Regulatory KYC",
      icon: ShieldCheck,
      content: (
        <div className="space-y-3">
          <p>
            To onboard as a registered Fleet Operator, Vehicle Owner, or Commercial Chauffeur on the Grab Rentals platform, you must satisfy all statutory criteria prescribed under the Motor Vehicles Act (1988), Central Motor Vehicles Rules, and relevant state aggregator policies:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>
              <strong>Age Requirement:</strong> Chauffeurs must be at least 21 years of age with a minimum of 2 years of verifiable driving experience.
            </li>
            <li>
              <strong>Commercial Driving Credentials:</strong> Chauffeurs must possess an authentic and unexpired Commercial Driving License with LMV-TR, HMV, or PSV badge endorsement issued by an authorized Regional Transport Office (RTO).
            </li>
            <li>
              <strong>Vehicle Regulatory Documents:</strong> All vehicles registered under a partner roster must hold valid Commercial Registration (Yellow Board RC), Comprehensive Commercial Taxi Insurance, Fitness Certificate, State/All-India Tourist Permit (AITP), and Pollution Under Control (PUC) certificate.
            </li>
            <li>
              <strong>Identity & Police Verification:</strong> Partners and drivers must provide government-issued identity proofs (Aadhaar, PAN) and declare a clean criminal background with zero pending charges relating to reckless driving, criminal misconduct, or passenger endangerment.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "code-of-conduct",
      title: "2. Chauffeur Code of Conduct & Passenger Safety Standards",
      icon: CheckCircle2,
      content: (
        <div className="space-y-3">
          <p>
            Grab Rentals maintains uncompromising safety and executive comfort benchmarks for all customers. Every chauffeur enrolled in the roster agrees to strictly observe the following code:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>
              <strong>Absolute Sobriety (Zero Tolerance):</strong> Zero consumption or possession of alcohol, narcotics, drugs, or tobacco while on duty or within 12 hours prior to scheduled trip dispatch. Immediate permanent blacklisting and legal reporting will follow any violation.
            </li>
            <li>
              <strong>Punctuality & Reporting:</strong> Chauffeurs must arrive at the designated passenger pickup location at least 15 minutes prior to the scheduled departure time and announce arrival via the Grab Rentals Partner App or phone call.
            </li>
            <li>
              <strong>100% Functional AC Guarantee:</strong> The vehicle air conditioning must remain active and functional at all times throughout local, outstation, or airport transit without demanding unauthorized AC surcharges from passengers.
            </li>
            <li>
              <strong>Cleanliness & Hygiene:</strong> Clean interior cabin, odor-free upholstery, sanitized seat covers, and empty boot space ready for passenger luggage.
            </li>
            <li>
              <strong>Professional Demeanor:</strong> Courteous behavior, polite address, professional attire, assistance with loading/unloading luggage, and safe, smooth driving without aggressive overtaking or honking.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "trip-allocation",
      title: "3. Booking Allocation, Fulfillment & Breakdown Emergency SOP",
      icon: Clock,
      content: (
        <div className="space-y-3">
          <p>
            Trips are allocated through Grab Rentals’ Central Operations Engine based on proximity, vehicle category, partner tier, and chauffeur rating.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>
              <strong>Trip Acceptance & Commitment:</strong> Once a partner or driver accepts a dispatched booking, they are contractually obligated to fulfill it. Unilateral cancellations or refusal to service passengers is strictly prohibited.
            </li>
            <li>
              <strong>Breakdown Protocol (Passenger Safety First):</strong> In the rare event of mechanical failure or highway breakdown:
              <ol className="list-decimal pl-5 mt-1 space-y-1 text-slate-500">
                <li>Immediately ensure passengers are seated safely away from highway traffic in a secure location.</li>
                <li>Call Grab Rentals 24/7 Operations Desk (+91 90711 00200) within 5 minutes of the incident.</li>
                <li>Grab Rentals Operations will dispatch a nearby replacement vehicle immediately. Chauffeurs must stay with passengers until the replacement arrives.</li>
              </ol>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "fares-payouts",
      title: "4. Fares, Platform Commission & Driver Allowance (DA)",
      icon: Scale,
      content: (
        <div className="space-y-3">
          <p>
            Grab Rentals operates a transparent, fair commission model for fleet partners:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>
              <strong>Commission Structure:</strong> Grab Rentals deducts an agreed platform commission from the gross customer billing for booking acquisition, technology services, 24/7 support, and payment gateway facilitation.
            </li>
            <li>
              <strong>Cash & Balance Collection:</strong> For bookings where the customer pays a deposit online and the remainder is due, the chauffeur is authorized to collect the exact "Balance Payable to Chauffeur" specified on the booking invoice upon trip completion.
            </li>
            <li>
              <strong>Outstation Driver Allowance (DA):</strong> On outstation multi-day trips, standard driver night allowance is included in the invoice to cover driver boarding and lodging.
            </li>
            <li>
              <strong>Payout Cycles:</strong> Net earnings for online-paid trips are processed directly into the partner’s registered bank account or UPI on a weekly or bi-weekly settlement cycle.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "tolls-taxes",
      title: "5. FASTag Tolls, State Taxes & Parking Reimbursement Policy",
      icon: Car,
      content: (
        <div className="space-y-3">
          <p>
            Guidelines regarding outstation highway tolls and transit taxes:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>
              <strong>FASTag Deduction:</strong> All highway toll plazas must be cleared using the vehicle’s active electronic FASTag RFID.
            </li>
            <li>
              <strong>All-Inclusive vs Excluded Tolls:</strong> If a booking is explicitly marked "All-Inclusive", tolls are factored into the gross fare. If marked "Excludes Toll & State Tax", actual FASTag transaction logs and state border tax receipts must be uploaded for passenger billing or direct collection.
            </li>
            <li>
              <strong>Airport Parking:</strong> Authorized airport pickup/drop parking fees with physical or digital receipts are payable by the customer as itemized on the digital invoice.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "penalties",
      title: "6. Cancellation Policy, No-Show Penalties & Fines",
      icon: AlertTriangle,
      content: (
        <div className="space-y-3">
          <p>
            To protect customer trust and operational reliability, penalties apply in cases of partner-initiated defaults:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>
              <strong>Chauffeur No-Show / Last-Minute Drop:</strong> If an accepted booking is rejected within 4 hours of scheduled departure or the driver fails to report, a penalty of up to 25% of trip value may be deducted from partner payouts.
            </li>
            <li>
              <strong>Late Reporting:</strong> Delays exceeding 20 minutes without prior operational notification will result in fare deductions and negative impact on partner dispatch priority.
            </li>
            <li>
              <strong>Vehicle Condition Rejection:</strong> If a vehicle is rejected by customer inspection due to AC failure, cleanliness issues, or mismatched registration numbers, the partner bears the full reallocation costs.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "roadworthiness",
      title: "7. Vehicle Roadworthiness & GPS Device Compliance",
      icon: ShieldCheck,
      content: (
        <div className="space-y-3">
          <p>
            Every vehicle operated on the network must meet rigorous mechanical roadworthiness:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>
              <strong>Active GPS Tracking:</strong> Every vehicle must carry a functional AIS-140 GPS tracker or keep the Grab Rentals Chauffeur App active with background location services turned ON during trips.
            </li>
            <li>
              <strong>Mandatory Safety Kit:</strong> Functional spare tire (Stepney), jack, wheel spanner, reflective hazard warning triangle, and unexpired first-aid kit must be present in the boot at all times.
            </li>
            <li>
              <strong>Speed Compliance:</strong> Chauffeurs must obey posted highway speed limits (never exceeding 100 km/h on expressways or speed governor limits) and practice defensive driving.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "independent-contractor",
      title: "8. Independent Contractor Relationship",
      icon: FileText,
      content: (
        <div className="space-y-3">
          <p>
            The legal relationship between Grab Rentals and each Fleet Partner / Chauffeur is strictly that of independent commercial entities:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>
              Nothing in this agreement shall be construed as creating an employer-employee relationship, joint venture, franchise, or agency partnership.
            </li>
            <li>
              Partners are solely responsible for compliance with income tax, GST obligations, vehicle insurance renewals, road taxes, and driver compensation/benefits.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "data-privacy",
      title: "9. Passenger Data Protection & Confidentiality",
      icon: ShieldCheck,
      content: (
        <div className="space-y-3">
          <p>
            Customer information shared for trip coordination is strictly confidential:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>
              Passenger phone numbers, names, and pickup addresses must never be stored, copied, shared with third parties, or used for any purpose outside the assigned ride.
            </li>
            <li>
              Contacting passengers after trip completion for personal reasons or off-platform service solicitation is strictly forbidden and grounds for immediate permanent deactivation.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "termination",
      title: "10. Deactivation, Blacklisting Grounds & Jurisdiction",
      icon: Scale,
      content: (
        <div className="space-y-3">
          <p>
            Grab Rentals reserves the right to suspend or permanently terminate partner accounts under the following conditions:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>
              Submission of forged, expired, or counterfeit vehicle documents or driver licenses.
            </li>
            <li>
              Customer harassment, abusive language, passenger safety violations, or rash driving.
            </li>
            <li>
              Soliciting customers for private trips or negotiating off-platform cash transactions.
            </li>
            <li>
              Consistently low chauffeur rating falling below 4.0 stars over 10 consecutive trips.
            </li>
            <li>
              <strong>Dispute Jurisdiction:</strong> This Agreement shall be governed by the laws of India. Any legal dispute arising under this agreement shall be subject to the exclusive jurisdiction of the competent courts in <strong>Bengaluru, Karnataka</strong>.
            </li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <main className="min-h-screen bg-[#FAF4E5]/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Controls */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Onboarding
          </Link>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print Agreement
          </button>
        </div>

        {/* Header Hero Card */}
        <div className="bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-slate-900" />
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-black uppercase tracking-wider mb-3">
            <Scale className="w-3.5 h-3.5 text-amber-600" />
            <span>Master Partner & Chauffeur Services Agreement</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Terms & Conditions for Fleet Partners & Chauffeurs
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
            <span>Last Revised: <strong className="text-slate-800">{lastUpdated}</strong></span>
            <span>•</span>
            <span>Document Version: <strong className="text-slate-800">v2.4 (Statutory Compliant)</strong></span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">Motor Vehicles Act (1988) Aligned</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mt-4 leading-relaxed">
            Please read these terms and conditions carefully before onboarding as a registered fleet partner, vehicle owner, or commercial chauffeur on the Grab Rentals network. By checking the agreement box or operating trips on the platform, you legally bind yourself to these terms and the Grab Rentals Chauffeur Code of Conduct.
          </p>
        </div>

        {/* Clauses Accordion / Cards */}
        <div className="space-y-4">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.id}
                id={sec.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-3"
              >
                <div className="flex items-center gap-2.5 text-slate-900 border-b border-slate-100 pb-3">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-700 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm sm:text-base font-black tracking-tight">{sec.title}</h2>
                </div>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                  {sec.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Support & Helpline Footer Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-white">Have questions regarding Partner Policies?</h3>
            <p className="text-xs text-slate-300">
              Our Fleet Operations & Compliance Desk is available 24/7 for onboarded partners.
            </p>
          </div>
          <a
            href="tel:+919071100200"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shrink-0 shadow-xs"
          >
            <Phone className="w-4 h-4" />
            <span>Call Fleet Desk (+91 90711 00200)</span>
          </a>
        </div>

      </div>
    </main>
  );
}

