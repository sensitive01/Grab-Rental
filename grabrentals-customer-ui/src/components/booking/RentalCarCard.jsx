"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, ChevronDown, ChevronUp, CheckCircle2, ShieldCheck } from "lucide-react";

function resolveCarImage(car) {
  if (!car) return "/images/cars/dzire.jpg";

  // Priority 1: Use explicit photo from admin model catalog or vehicle record
  if (car.image && typeof car.image === "string" && !car.image.includes("blob:")) {
    return car.image;
  }
  if (car.imageUrl && typeof car.imageUrl === "string" && !car.imageUrl.includes("blob:")) {
    return car.imageUrl;
  }

  const title = (car.title || "").toLowerCase();
  const category = (car.category || "").toLowerCase();
  
  if (title.includes("innova") || title.includes("crysta") || title.includes("hycross") || title.includes("fortuner")) {
    return "/images/cars/innova.jpg";
  }
  if (title.includes("s-presso") || title.includes("spresso")) {
    return "/images/cars/spresso.jpg";
  }
  if (title.includes("wagon") || title.includes("celerio") || title.includes("tiago") || title.includes("alto")) {
    return "/images/cars/wagon_r.jpg";
  }
  if (title.includes("ertiga") || title.includes("carens") || title.includes("triber") || title.includes("rumion")) {
    return "/images/cars/ertiga.jpg";
  }
  if (title.includes("dzire") || title.includes("etios") || title.includes("amaze") || title.includes("verna") || title.includes("aura") || title.includes("city")) {
    return "/images/cars/dzire.jpg";
  }

  if (category.includes("hatchback")) return "/images/cars/wagon_r.jpg";
  if (category.includes("suv_6")) return "/images/cars/ertiga.jpg";
  if (category.includes("suv_7")) return "/images/cars/innova.jpg";
  return "/images/cars/dzire.jpg";
}

export default function RentalCarCard({ car, onSelect }) {
  const defaultFuel = typeof car.fuelOptions?.[0] === "string" 
    ? car.fuelOptions[0] 
    : (car.fuelOptions?.[0]?.name || "CNG");

  const [selectedFuel, setSelectedFuel] = useState(defaultFuel);
  const [withLuggageCarrier, setWithLuggageCarrier] = useState(false);
  const [showInclusions, setShowInclusions] = useState(false);
  const [imgSrc, setImgSrc] = useState(() => resolveCarImage(car));

  useEffect(() => {
    setImgSrc(resolveCarImage(car));
  }, [car]);

  // Dynamic price calculation based on fuel and luggage carrier
  const fuelMultiplier = selectedFuel === "Diesel" ? 1.03 : 1.0;
  const baseDiscounted = Math.round((car.pricing?.discountedPrice || 3500) * fuelMultiplier);
  const baseOriginal = Math.round((car.pricing?.originalPrice || (baseDiscounted * 1.14)) * fuelMultiplier);
  const carrierOption = car.luggageCarrierOption || {
    available: car.category !== "HATCHBACK",
    label: "Rooftop Luggage Carrier",
    price: 149
  };
  const carrierCost = withLuggageCarrier ? (carrierOption?.price || 149) : 0;
  const finalPrice = baseDiscounted + carrierCost;
  const taxesAndCharges = car.pricing?.chargesAndTaxes || Math.round(baseDiscounted * 0.35);
  const discountPercent = car.pricing?.discountPercent || Math.max(1, Math.round(((baseOriginal - baseDiscounted) / (baseOriginal || 1)) * 100));

  const handleSelectClick = () => {
    onSelect?.({
      ...car,
      selectedFuel,
      withLuggageCarrier,
      finalPrice,
      totalCharges: finalPrice + taxesAndCharges,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      
      {/* Main Content Row */}
      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        
        {/* Col 1 (3 cols): Car Image */}
        <div className="md:col-span-3 flex justify-center items-center py-2">
          <div className="relative w-48 h-32 sm:w-56 sm:h-36">
            <Image
              src={imgSrc}
              alt={car.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 192px, 224px"
              priority
              unoptimized={typeof imgSrc === "string" && imgSrc.startsWith("http")}
              onError={() => setImgSrc("/images/cars/dzire.jpg")}
            />
          </div>
        </div>

        {/* Col 2 (5-6 cols): Car Specs & Features */}
        <div className="md:col-span-6 space-y-2.5">
          
          {/* Title & Rating */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {car.title}{" "}
              <span className="font-normal italic text-slate-500 text-xs sm:text-sm">
                {car.subtitle}
              </span>
            </h3>

            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-900 text-white text-[11px] font-bold">
              <span>{car.rating}</span>
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            </div>
          </div>

          {/* Seating */}
          <p className="text-xs font-semibold text-slate-500">
            {typeof car.seating === "number" ? `${car.seating} Seats • AC • 2 Luggage Bags` : car.seating}
          </p>

          {/* Features with Icons */}
          <div className="space-y-1.5 text-xs text-slate-700 pt-1">
            <div className="flex items-center gap-2 font-medium">
              <span className="text-slate-400">👤</span>
              <span>Driver allowance included</span>
            </div>

            <div className="flex items-center gap-2 font-medium">
              <span className="text-slate-400">🛣️</span>
              <span>
                <strong className="text-slate-900">{car.includedKms} kms</strong> included | Post limit: <strong className="text-slate-900">{car.postLimitRate}</strong>
              </span>
            </div>
          </div>

          {/* Fuel Selector */}
          {car.fuelOptions && car.fuelOptions.length > 1 && (
            <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-slate-700">
              <span className="text-slate-500 text-[11px]">Select Fuel Type</span>
              <div className="flex items-center gap-3">
                {car.fuelOptions.map((opt, idx) => {
                  const fuelName = typeof opt === "string" ? opt : opt.name;
                  const fuelKey = typeof opt === "string" ? opt : (opt.id || idx);
                  return (
                    <label key={fuelKey} className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name={`fuel-${car.id}`}
                        checked={selectedFuel === fuelName}
                        onChange={() => setSelectedFuel(fuelName)}
                        className="accent-amber-600 w-3.5 h-3.5"
                      />
                      <span className={selectedFuel === fuelName ? "text-slate-900 font-bold" : "text-slate-600"}>
                        {fuelName}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Inclusions Accordion Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowInclusions(!showInclusions)}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Inclusions and Exclusions</span>
              {showInclusions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>

        {/* Col 3 (3-4 cols): Pricing & Action */}
        <div className="md:col-span-3 flex flex-col md:items-end justify-between self-stretch pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          
          <div className="md:text-right space-y-1">
            {/* Discount Pill */}
            <div className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>{discountPercent}% OFF</span>
              <span className="line-through text-slate-400 font-semibold ml-1">
                ₹{baseOriginal.toLocaleString()}
              </span>
            </div>

            {/* Final Price */}
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ₹{finalPrice.toLocaleString()}
            </div>

            {/* Taxes and charges */}
            <div className="text-[11px] text-slate-500 font-medium">
              + ₹{taxesAndCharges.toLocaleString()} Charges and Taxes
            </div>
          </div>

          {/* Select Button in Brand Amber */}
          <button
            type="button"
            onClick={handleSelectClick}
            className="w-full md:w-auto mt-4 px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-amber-600/20 cursor-pointer text-center"
          >
            SELECT CAR
          </button>

        </div>

      </div>

      {/* Luggage Carrier Strip */}
      {car.luggageCarrierOption?.available && (
        <div className="bg-amber-50/50 border-t border-amber-200/60 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-slate-800">
          <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
            <input
              type="checkbox"
              checked={withLuggageCarrier}
              onChange={(e) => setWithLuggageCarrier(e.target.checked)}
              className="accent-amber-600 w-4 h-4 rounded"
            />
            <span className="flex items-center gap-1.5">
              <span>🚖</span>
              <span className="text-slate-900">{car.luggageCarrierOption.label} @ ₹{car.luggageCarrierOption.price}</span>
            </span>
          </label>

          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Secure rooftop carrier for extra heavy luggage
          </span>
        </div>
      )}

      {/* Expandable Inclusions & Exclusions */}
      {showInclusions && (
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 text-xs text-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
          <div>
            <h4 className="font-extrabold text-emerald-700 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Inclusions
            </h4>
            <ul className="space-y-1 text-slate-600">
              {car.inclusions.map((inc, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{inc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-rose-700 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Exclusions
            </h4>
            <ul className="space-y-1 text-slate-600">
              {car.exclusions.map((exc, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{exc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </div>
  );
}
