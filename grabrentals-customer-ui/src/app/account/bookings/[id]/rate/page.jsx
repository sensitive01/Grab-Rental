"use client";

import { use, useState, useEffect } from "react";
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
  ChevronRight,
  Loader2
} from "lucide-react";
import { customerApi } from "@/lib/customerApi";

export default function RateTripPage({ params }) {
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams?.id || "";

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    let isCancelled = false;

    async function fetchTripDetails() {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let data = null;
        try {
          const res = await customerApi.getBookingById(bookingId);
          if (res?.data) data = res.data;
        } catch {
          const pub = await customerApi.getPublicBooking(bookingId);
          if (pub?.data) data = pub.data;
        }

        if (!isCancelled && data) {
          setBooking(data);
        }
      } catch (err) {
        console.warn("[RateTrip] Error fetching booking for review:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchTripDetails();

    return () => {
      isCancelled = true;
    };
  }, [bookingId]);

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
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Thank you for your feedback!</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your honest rating directly empowers our chauffeur performance rewards and ensures top service quality.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-700 font-semibold">
              <span>Overall Rating</span>
              <span className="font-extrabold text-amber-600 flex items-center gap-1">★ {rating} / 5</span>
            </div>
            {tip > 0 && (
              <div className="flex justify-between items-center text-slate-700 font-semibold">
                <span>Chauffeur Tip</span>
                <span className="font-extrabold text-emerald-600">₹{tip}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-slate-700 font-semibold">
              <span>Trip Reference</span>
              <span className="font-mono font-bold text-slate-900">{booking?.bookingReference || bookingId}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm text-center"
            >
              Back to My Trips
            </Link>
            <Link
              href={`/account/bookings/${bookingId}/invoice`}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all text-center"
            >
              Download Invoice
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const driverName = booking?.driverName || "Assigned Chauffeur";
  const driverInitials = driverName.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase() || "CH";
  const vehicleName = booking?.vehicleModel || booking?.vehicleCategory || "AC Chauffeur Fleet";
  const plate = booking?.vehicleNumber ? `(${booking.vehicleNumber})` : "";
  const routeDisplay = `${booking?.pickupCity || "Origin"} ➔ ${booking?.dropCity || "Destination"}`;

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
                Trip <span className="font-mono font-bold text-slate-700">{booking?.bookingReference || bookingId}</span> • {routeDisplay}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase">
              {booking?.status || "Completed"}
            </span>
          </div>

          {/* Chauffeur & Car Header */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-lg shadow-2xs shrink-0">
              {driverInitials}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900">{driverName}</h3>
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                  ★ 4.9
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">{vehicleName} {plate}</p>
              <p className="text-[11px] text-slate-400">Verified Professional Commercial Chauffeur</p>
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
                    className="p-1.5 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star 
                      className={`w-9 h-9 sm:w-11 sm:h-11 transition-colors ${
                        isFilled 
                          ? "text-amber-500 fill-amber-500 drop-shadow-sm" 
                          : "text-slate-200 hover:text-slate-300"
                      }`} 
                    />
                  </button>
                );
              })}
            </div>

            <p className="text-xs font-extrabold text-amber-800 bg-amber-50 py-1.5 px-4 rounded-full inline-block border border-amber-200/60">
              {getRatingLabel(hoverRating || rating)}
            </p>
          </div>

          {/* 2. Positive Feedback Badges */}
          <div className="space-y-3 border-t border-slate-100 pt-6">
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
              What went great? (Select highlights)
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Written Review */}
          <div className="space-y-2 border-t border-slate-100 pt-6">
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
              Share details about your trip (Optional)
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell other travelers about your experience: road comfort, cleanliness, chauffeur etiquette..."
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-600 outline-none transition-all placeholder:text-slate-400"
            ></textarea>
          </div>

          {/* 4. Tip the Chauffeur */}
          <div className="space-y-3 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Add a Tip for {driverName}
                </label>
                <p className="text-[11px] text-slate-500">100% of your tip goes directly to the driver.</p>
              </div>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {[50, 100, 200, 0].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setTip(amount)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all border ${
                    tip === amount
                      ? "border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-600/20"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {amount === 0 ? "No Tip" : `₹${amount}`}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 group"
          >
            <span>Submit Review</span>
            <Send className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>

        </form>

      </div>
    </main>
  );
}
