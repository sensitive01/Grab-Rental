import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText, Database, UserCheck, PhoneCall, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Grab-Rental",
  description: "Learn how Grab-Rental collects, uses, protects, and handles your personal information, trip data, and payment details."
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "September 20, 2026";

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Breadcrumb */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-emerald-500"></div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> ISO 27001 & IT Act 2000 Compliant
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Last Updated: <span className="font-semibold text-slate-700">{lastUpdated}</span> • Effective Immediately
          </p>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            At Grab-Rental Technologies Pvt. Ltd. (&ldquo;Grab-Rental&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), your privacy and data security are our top priorities. This Privacy Policy details how we collect, use, store, and safeguard your personal information across our web platform and mobile services.
          </p>
        </div>

        {/* Policy Content Sections */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-10 text-slate-700 text-sm leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900">
              <Database className="w-5 h-5 text-amber-500 shrink-0" />
              <h2 className="text-lg font-black tracking-tight">1. Information We Collect</h2>
            </div>
            <p>We collect only the information necessary to provide seamless chauffeur and car rental booking experiences:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong className="text-slate-900">Contact Details:</strong> Full name, primary mobile phone number (for OTP authentication), and optional email address.</li>
              <li><strong className="text-slate-900">Trip & Geolocation Data:</strong> Pickup address, intermediate travel stops, destination, dates, flight/train numbers, and live trip location.</li>
              <li><strong className="text-slate-900">Billing & Tax Data:</strong> Billing address and GSTIN (for corporate customers requesting B2B tax invoices).</li>
              <li><strong className="text-slate-900">Device & Usage Information:</strong> IP address, browser type, and diagnostic access timestamps.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-900">
              <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <h2 className="text-lg font-black tracking-tight">2. How We Use Your Information</h2>
            </div>
            <p>Your personal information is used exclusively to facilitate your journeys:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>To confirm reservations, generate 4-digit Ride OTPs, and coordinate with assigned chauffeurs.</li>
              <li>To dispatch real-time trip notifications via SMS and WhatsApp (e.g. driver arrival, vehicle license number).</li>
              <li>To provide 24/7 emergency SOS support and chauffeur tracking during outstation travel.</li>
              <li>To generate legally compliant GST tax invoices and process automated advance payment receipts.</li>
              <li>We <strong className="text-slate-900">never</strong> sell, rent, or trade your personal data to third-party advertisers.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-900">
              <Lock className="w-5 h-5 text-blue-600 shrink-0" />
              <h2 className="text-lg font-black tracking-tight">3. Payment & Security</h2>
            </div>
            <p>
              Grab-Rental does not store sensitive credit card numbers, debit card PINs, or UPI security credentials on our servers. All financial transactions are processed securely via PCI-DSS Level 1 certified payment gateways (Razorpay/UPI) with 256-bit SSL encryption.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-900">
              <Eye className="w-5 h-5 text-amber-600 shrink-0" />
              <h2 className="text-lg font-black tracking-tight">4. Information Shared with Chauffeurs</h2>
            </div>
            <p>
              To execute your ride safely, your assigned chauffeur receives limited trip details: your passenger name, pickup address, drop destination, and contact telephone number. Chauffeur access to passenger details automatically expires 24 hours after trip completion.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-900">
              <FileText className="w-5 h-5 text-slate-700 shrink-0" />
              <h2 className="text-lg font-black tracking-tight">5. User Rights & Account Data Management</h2>
            </div>
            <p>
              You maintain full ownership of your data. You may review and update your name, email, and addresses anytime through your <Link href="/account/settings" className="text-amber-700 font-bold underline">Account Settings</Link>. To request permanent account or booking history deletion, contact our Data Protection Officer.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-900">
              <PhoneCall className="w-5 h-5 text-emerald-600 shrink-0" />
              <h2 className="text-lg font-black tracking-tight">6. Contact Our Privacy Officer</h2>
            </div>
            <p>If you have any questions or grievances regarding this Privacy Policy, please reach us at:</p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold space-y-1">
              <p className="font-bold text-slate-900">Grab Rental Technologies Pvt. Ltd. — Data Protection Desk</p>
              <p>Email: <a href="mailto:privacy@grabrental.in" className="text-amber-700 underline">privacy@grabrental.in</a></p>
              <p>Helpline: +91 80 4710 9999</p>
              <p>Address: #12, 100 Feet Road, Indiranagar, Bengaluru, Karnataka, India - 560038</p>
            </div>
          </section>

        </div>

      </div>
    </main>
  );
}
