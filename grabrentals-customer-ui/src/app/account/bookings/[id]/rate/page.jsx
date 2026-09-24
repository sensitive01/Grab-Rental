"use client";

import { use, useState } from "react";
import Link from "next/link";
import { 
  Star, 
  ArrowLeft, 
  CheckCircle2, 
  Car, 
  UserCheck, 
  ThumbsUp, 
  Sparkles, 
  Send,
  Heart,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

export default function RateTripPage({ params }) {
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams?.id || "GR-79104";

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([
    "Polite & Professional",
    "Spotless & Clean Car",
    "Smooth Highway Driving"
  ]);
  const [tip, setTip] = useState(100);
  const [feedback, setFeedback] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const tags = [
    "Polite & Professional",
    "Spotless & Clean Car",
    "Smooth Highway Driving",
    "Punctual & On-Time",
    "Excellent AC & Comfort",
    "Knowledgeable Route Guide"
  ];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getRatingLabel = (stars) => {
    switch (stars) {
      case 5: return "Outstanding & Highly Recommended!";
      case 4: return "Very Good & Enjoyable Trip";
      case 3: return "Average / Satisfactory Experience";
      case 2: return "Below Expectations";
      case 1: return "Poor / Needs Major Improvement";
      default: return "Select your rating";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-10 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm text-center space-y-6 relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-amber-500 to-emerald-500"></div>

          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border-4 border-emerald-100 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Rating Recorded
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Thank You for Your Review!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Your feedback and <strong className="text-slate-900">{rating}-star rating</strong> have been credited to chauffeur Anand M&apos;s verified profile.
            </p>
            {tip > 0 && (
              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200 inline-block">
                ₹{tip} Chauffeur gratuity added to final settlement
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/dashboard"
              className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs"
            >
              Back to My Trips
            </Link>
            <Link
              href="/"
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5"
            >
              <span>Book New Ride</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Top Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Trips
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                Rate & Review
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
                How was your journey?
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Trip <span className="font-mono font-bold text-slate-700">{bookingId}</span> • Bengaluru ➔ Coorg
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase">
              Completed
            </span>
          </div>

          {/* Chauffeur & Car Header */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-lg shadow-2xs shrink-0">
              AM
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900">Anand M</h3>
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                  ★ 5.0
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">Maruti Ertiga Hybrid (KA 05 MN 3311)</p>
              <p className="text-[11px] text-slate-400">890+ Completed Highway Trips</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
          
          {/* 1. Star Rating */}
          <div className="text-center space-y-3">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">
              Overall Driver Rating
            </label>
            
            <div className="flex items-center justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1.5 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                  >
                    <Star
                      className={`w-9 h-9 sm:w-11 sm:h-11 transition-colors ${
                        isFilled ? "text-amber-400 fill-amber-400 filter drop-shadow-xs" : "text-slate-200"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <p className="text-sm font-extrabold text-amber-600 animate-fade-in">
              {getRatingLabel(hoverRating || rating)}
            </p>
          </div>

          {/* 2. What made your trip special? (Tags) */}
          <div className="space-y-3 pt-6 border-t border-slate-100">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              What did you like about the service?
            </label>
            <div className="flex flex-wrap gap-2.5">
              {tags.map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selected
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {selected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Tip the Driver (Optional Gratuity) */}
          <div className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Tip Your Chauffeur (Optional)
              </label>
              <span className="text-[11px] text-slate-400">100% goes directly to driver</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              {[0, 50, 100, 200, 500].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setTip(amount)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    tip === amount
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {amount === 0 ? "No Tip" : `₹${amount}`}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Written Comments */}
          <div className="space-y-2 pt-6 border-t border-slate-100">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              Additional Feedback / Comments
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about the highway journey, punctuality, or car condition..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-slate-400"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" /> Submit Trip Review
            </button>
          </div>

        </form>

      </div>
    </main>
  );
}
