"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  CreditCard,
  Wallet,
  Clock,
  ChevronRight,
  CheckCircle2,
  Smartphone,
  Loader2,
  User,
  Phone,
  FileText,
  Calendar,
  AlertCircle,
  Tag,
  X,
  ArrowRight,
  Navigation,
  QrCode,
  UploadCloud,
  Copy,
  Check,
  ExternalLink,
  Building2
} from "lucide-react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import SearchSummaryBar from "@/components/booking/SearchSummaryBar";
import { customerApi } from "@/lib/customerApi";
import { isAuthenticated, getCurrentUser, setAuthSession, logout } from "@/lib/auth";
import { useLanguage } from "@/context/LanguageContext";
import LocationPickerModal from "@/components/booking/LocationPickerModal";
import MapView from "@/components/booking/MapView";
import { padZero, formatLocalDateTime, isNightPickup } from "@/lib/dateTimeUtils";
import { fetchGoogleRouteDistance, findCityCoordinates } from "@/lib/cities";

function resolveCarImage(title, category, rawImage) {
  if (rawImage && typeof rawImage === "string" && !rawImage.includes("blob:")) {
    return rawImage;
  }

  const t = (title || "").toLowerCase();
  const c = (category || "").toLowerCase();

  if (t.includes("innova") || t.includes("crysta") || t.includes("hycross") || t.includes("fortuner")) {
    return "/images/cars/innova.jpg";
  }
  if (t.includes("s-presso") || t.includes("spresso")) {
    return "/images/cars/spresso-clean.jpg";
  }
  if (t.includes("wagon") || t.includes("celerio") || t.includes("tiago") || t.includes("alto")) {
    return "/images/cars/wagon_r.jpg";
  }
  if (t.includes("ertiga") || t.includes("carens") || t.includes("triber") || t.includes("rumion")) {
    return "/images/cars/ertiga.jpg";
  }
  if (t.includes("dzire") || t.includes("etios") || t.includes("amaze") || t.includes("verna") || t.includes("aura") || t.includes("city")) {
    return "/images/cars/dzire.jpg";
  }

  if (c.includes("hatchback")) return "/images/cars/wagon_r.jpg";
  if (c.includes("suv_6")) return "/images/cars/ertiga.jpg";
  if (c.includes("suv_7")) return "/images/cars/innova.jpg";
  return "/images/cars/dzire.jpg";
}

export default function ReviewPayPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const [paymentPlan, setPaymentPlan] = useState("advance");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Add-ons, Inclusions/Exclusions, and Terms states
  const [selectedAddons, setSelectedAddons] = useState({
    expressway: false,
    languageChauffeur: false,
    luggageCarrier: false,
    lessThan3Years: false,
  });
  const [chauffeurLanguage, setChauffeurLanguage] = useState("English");
  const [termsOpen, setTermsOpen] = useState(false);
  const [fareBreakupOpen, setFareBreakupOpen] = useState(true);
  const [pricingConfig, setPricingConfig] = useState({
    gstPercentage: 5,
    gstAmount: 0,
    gstType: "PERCENTAGE",
    driverAllowancePercentage: 10,
    driverAllowanceAmount: 0,
    driverAllowanceType: "PERCENTAGE",
    lessThan3YearsFee: 299,
    luggageCarrierFee: 249,
    languageChauffeurFee: 199,
    expresswayFee: 415,
  });
  const [pricingConfigLoaded, setPricingConfigLoaded] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [appliedCouponData, setAppliedCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // UPI QR & Payment Verification states
  const [upiConfig, setUpiConfig] = useState(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [paymentUtrNumber, setPaymentUtrNumber] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [proofFileName, setProofFileName] = useState("");
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiModalError, setUpiModalError] = useState("");

  const [bookingConfig, setBookingConfig] = useState(null);
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupDoorNo, setPickupDoorNo] = useState("");
  const [pickupStreet, setPickupStreet] = useState("");
  const [pickupLandmark, setPickupLandmark] = useState("");
  const [pickupArea, setPickupArea] = useState("");
  const [pickupCityName, setPickupCityName] = useState("");
  const [pickupStateName, setPickupStateName] = useState("");
  const [pickupPincode, setPickupPincode] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [dropAddress, setDropAddress] = useState("");
  const [customDistanceKm, setCustomDistanceKm] = useState(null);
  const [customDuration, setCustomDuration] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState("pickup");
  const [liveToll, setLiveToll] = useState(null);

  // Inline OTP Auth Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState("phone"); // 'phone' | 'otp'
  const [authPhone, setAuthPhone] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [authDevOtp, setAuthDevOtp] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authCountdown, setAuthCountdown] = useState(30);

  // OTP resend countdown timer
  useEffect(() => {
    let timer;
    if (showAuthModal && authStep === "otp" && authCountdown > 0) {
      timer = setInterval(() => {
        setAuthCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showAuthModal, authStep, authCountdown]);

  useEffect(() => {
    async function loadPricingConfig() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/vehicles/pricing-tax`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            setPricingConfig({
              gstPercentage: Number(json.data.gstPercentage) || 5,
              gstAmount: Number(json.data.gstAmount) || 0,
              gstType: json.data.gstType || "PERCENTAGE",
              driverAllowancePercentage: Number(json.data.driverAllowancePercentage) || 10,
              driverAllowanceAmount: Number(json.data.driverAllowanceAmount) || 0,
              driverAllowanceType: json.data.driverAllowanceType || "PERCENTAGE",
              lessThan3YearsFee: Number(json.data.lessThan3YearsFee) || 299,
              luggageCarrierFee: Number(json.data.luggageCarrierFee) || 249,
              languageChauffeurFee: Number(json.data.languageChauffeurFee) || 199,
              expresswayFee: Number(json.data.expresswayFee) || 415,
            });
            setPricingConfigLoaded(true);
          }
        }
      } catch (err) {
        console.warn("Could not load pricing config, using defaults:", err);
      }
    }
    loadPricingConfig();
  }, [API_BASE_URL]);

  useEffect(() => {
    async function loadUpi() {
      try {
        const res = await customerApi.getUpiConfig();
        if (res?.data) {
          setUpiConfig(res.data);
        }
      } catch (err) {
        console.warn("Could not load UPI configuration:", err);
      }
    }
    loadUpi();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("grab_selected_booking");
        if (stored) {
          const parsed = JSON.parse(stored);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setBookingConfig(parsed);

          // Prefill pickup & drop addresses if empty
          const isLocalTrip = parsed.trip?.serviceType === "LOCAL" || (parsed.trip?.to && parsed.trip.to.toLowerCase().includes("hr"));
          const isAirportTrip = parsed.trip?.serviceType === "AIRPORT" || (parsed.trip?.tripType && parsed.trip.tripType.toLowerCase().includes("airport"));
          if (parsed.trip?.pickupDetails) {
            const pd = parsed.trip.pickupDetails;
            if (pd.area) setPickupArea(pd.area);
            if (pd.city) setPickupCityName(pd.city);
            if (pd.state) setPickupStateName(pd.state);
            if (pd.pincode) setPickupPincode(pd.pincode);
            if (pd.fullAddress) {
              setPickupAddress(pd.fullAddress);
            } else if (parsed.trip?.from) {
              setPickupAddress(parsed.trip.from);
            }
          } else if (parsed.trip?.from) {
            const rawFrom = parsed.trip.from;
            const parts = rawFrom.split(",").map((s) => s.trim());
            if (parts.length >= 3) {
              setPickupArea(parts[0] || "");
              setPickupCityName(parts[1] || "");
              setPickupStateName(parts[2] || "");
            } else if (parts.length === 2) {
              setPickupCityName(parts[0] || "");
              setPickupStateName(parts[1] || "");
            } else {
              setPickupCityName(parts[0] || "");
            }
            setPickupAddress(isAirportTrip && rawFrom.toLowerCase().includes("airport")
              ? `${rawFrom} (Arrivals Terminal)`
              : `${rawFrom} (Pickup Point)`);
          }

          const rawFromCity = parsed.trip?.from;
          if (parsed.trip?.pickupCoords) {
            setPickupCoords(parsed.trip.pickupCoords);
          } else if (rawFromCity) {
            const pc = findCityCoordinates(rawFromCity);
            if (pc) setPickupCoords(pc);
          }
          if (parsed.trip?.dropCoords) {
            setDropCoords(parsed.trip.dropCoords);
          } else if (parsed.trip?.to) {
            const dc = findCityCoordinates(parsed.trip.to);
            if (dc) setDropCoords(dc);
          }
          if (parsed.trip?.to) {
            if (isLocalTrip) {
              setDropAddress(`Within ${parsed.trip.from.split(",")[0].trim()} (Local City Limits / As Directed)`);
            } else if (isAirportTrip && parsed.trip.to.toLowerCase().includes("airport")) {
              setDropAddress(`${parsed.trip.to} (Departures Terminal)`);
            } else {
              setDropAddress(`${parsed.trip.to} (City Center / Main Landmark)`);
            }
          }

          // Background sync: Fetch fresh vehicle tariff pricing & pet charges from backend
          if (parsed?.car && parsed?.trip?.from && parsed?.trip?.to) {
            const searchUrl = `${API_BASE_URL}/api/vehicles/search?from=${encodeURIComponent(parsed.trip.from)}&to=${encodeURIComponent(parsed.trip.to)}&tripType=${encodeURIComponent(parsed.trip.tripType || "ONE_WAY")}&serviceType=${encodeURIComponent(parsed.trip.serviceType || "OUTSTATION")}&distanceKm=${parsed.distanceKm || 0}`;
            fetch(searchUrl)
              .then((r) => r.json())
              .then((res) => {
                if (res?.data?.vehicles && Array.isArray(res.data.vehicles)) {
                  const match = res.data.vehicles.find((v) => v.id === parsed.car?.id || v.title?.toLowerCase() === parsed.car?.title?.toLowerCase() || v.category?.toLowerCase() === parsed.car?.category?.toLowerCase());
                  if (match?.pricing) {
                    setBookingConfig((prev) => {
                      if (!prev) return prev;
                      const freshPet = match.pricing.petCharge != null ? Number(match.pricing.petCharge) : prev.petDetails?.petCharge;
                      const freshVendPet = match.pricing.vendorPetCharge != null ? Number(match.pricing.vendorPetCharge) : prev.petDetails?.vendorPetCharge;
                      const freshDiscPct = match.pricing.discountPercentage != null ? Number(match.pricing.discountPercentage) : prev.car?.discountPercentage;
                      const freshPerKm = match.perKmRate != null ? Number(match.perKmRate) : prev.car?.perKmRate;
                      const freshOrigPrice = match.pricing.originalPrice != null ? Number(match.pricing.originalPrice) : prev.car?.originalPrice;
                      const updated = {
                        ...prev,
                        petDetails: {
                          ...prev.petDetails,
                          petCharge: freshPet,
                          vendorPetCharge: freshVendPet,
                        },
                        car: {
                          ...prev.car,
                          petCharge: freshPet,
                          vendorPetCharge: freshVendPet,
                          discountPercentage: freshDiscPct,
                          perKmRate: freshPerKm,
                          originalPrice: freshOrigPrice,
                          pricing: {
                            ...(prev.car?.pricing || {}),
                            ...match.pricing
                          }
                        },
                      };
                      sessionStorage.setItem("grab_selected_booking", JSON.stringify(updated));
                      return updated;
                    });
                  }
                }
              })
              .catch((err) => console.warn("Live tariff re-sync error:", err));
          }
        }

        // 1. Resolve logged-in user profile details for autofill
        let profileName = "";
        let profilePhone = "";
        const user = getCurrentUser();
        if (user) {
          if (user.name && user.name.trim().toLowerCase() !== "customer") {
            profileName = user.name.trim();
          } else if (user.fullName) {
            profileName = user.fullName.trim();
          }
          const rawPhone = user.phone || user.mobile || user.phoneNumber || "";
          if (rawPhone) {
            const digits = rawPhone.replace(/[^0-9]/g, "");
            profilePhone = digits.length > 10 ? digits.slice(-10) : digits;
          }
        }

        // Secondary fallback to previous booking info
        if (!profileName || !profilePhone) {
          try {
            const lastBooking = sessionStorage.getItem("grab_confirmed_booking");
            if (lastBooking) {
              const parsedLast = JSON.parse(lastBooking);
              if (!profileName && parsedLast.passengerName) profileName = parsedLast.passengerName;
              if (!profilePhone && parsedLast.passengerPhone) {
                const digits = String(parsedLast.passengerPhone).replace(/[^0-9]/g, "");
                profilePhone = digits.length > 10 ? digits.slice(-10) : digits;
              }
            }
          } catch { }
        }

        // Restore draft if user previously filled it out
        const savedDraft = sessionStorage.getItem("grab_review_pay_draft");
        if (savedDraft) {
          try {
            const draft = JSON.parse(savedDraft);
            setPassengerName(draft.passengerName || profileName);
            setPassengerPhone(draft.passengerPhone || profilePhone);
            if (draft.pickupDoorNo) setPickupDoorNo(draft.pickupDoorNo);
            if (draft.pickupStreet) setPickupStreet(draft.pickupStreet);
            if (draft.pickupLandmark) setPickupLandmark(draft.pickupLandmark);
            if (draft.pickupArea) setPickupArea(draft.pickupArea);
            if (draft.pickupCityName) setPickupCityName(draft.pickupCityName);
            if (draft.pickupStateName) setPickupStateName(draft.pickupStateName);
            if (draft.pickupPincode) setPickupPincode(draft.pickupPincode);
            if (draft.pickupCoords) setPickupCoords(draft.pickupCoords);
            if (draft.dropCoords) setDropCoords(draft.dropCoords);
            if (draft.pickupAddress) setPickupAddress(draft.pickupAddress);
            if (draft.dropAddress) setDropAddress(draft.dropAddress);
            if (draft.specialInstructions) setSpecialInstructions(draft.specialInstructions);
            if (draft.paymentPlan) setPaymentPlan(draft.paymentPlan);
          } catch { }
        } else {
          if (profileName) setPassengerName(profileName);
          if (profilePhone) setPassengerPhone(profilePhone);
        }
      } catch (err) {
        console.warn("Could not load stored booking config:", err);
      }
    }
  }, []);

  const isLocal = bookingConfig?.trip?.serviceType === "LOCAL" || (bookingConfig?.trip?.to && bookingConfig.trip.to.toLowerCase().includes("hr"));
  const isAirport = bookingConfig?.trip?.serviceType === "AIRPORT" || (bookingConfig?.trip?.tripType && bookingConfig.trip.tripType.toLowerCase().includes("airport"));
  const isRoundTrip = !isLocal && !isAirport && (bookingConfig?.trip?.tripType || "").toLowerCase().includes("round");

  const formatPackageLabel = (pkgStr) => {
    if (!pkgStr) return "8 Hours / 80 Kms";
    const lower = pkgStr.toLowerCase();
    if (lower.includes("4hr") || lower.includes("40")) return "4 Hours / 40 Kms";
    if (lower.includes("12hr") || lower.includes("120")) return "12 Hours / 120 Kms";
    if (lower.includes("8hr") || lower.includes("80")) return "8 Hours / 80 Kms";
    return pkgStr;
  };
  const packageLabel = formatPackageLabel(bookingConfig?.trip?.to);

  // Dynamic pricing from backend tariff engine
  const car = bookingConfig?.car || {};
  const distanceKm = customDistanceKm != null ? customDistanceKm : (bookingConfig?.distanceKm || 0);
  const perKmRate = Number(car.perKmRate) || 0;

  // Pet Friendly Booking configuration
  const isPetFriendly = Boolean(
    bookingConfig?.petDetails?.isPetFriendly ||
    bookingConfig?.isPetFriendly ||
    bookingConfig?.trip?.isPetFriendly
  );
  const petType = bookingConfig?.petDetails?.petType || bookingConfig?.petType || bookingConfig?.trip?.petType || "Dog / Pet";
  const petCount = Number(bookingConfig?.petDetails?.petCount || bookingConfig?.petCount || 1);
  const petCharge = isPetFriendly
    ? Number(
      bookingConfig?.petDetails?.petCharge != null
        ? bookingConfig.petDetails.petCharge
        : car?.petCharge != null
          ? car.petCharge
          : pricingConfig?.defaultPetCharge != null
            ? pricingConfig.defaultPetCharge
            : 0
    )
    : 0;
  const vendorPetPayout = isPetFriendly
    ? Number(
      bookingConfig?.petDetails?.vendorPetCharge != null
        ? bookingConfig.petDetails.vendorPetCharge
        : car?.vendorPetCharge != null
          ? car.vendorPetCharge
          : pricingConfig?.defaultVendorPetCharge != null
            ? pricingConfig.defaultVendorPetCharge
            : 0
    )
    : 0;

  // Dynamic discount & Base fare (exclusive of taxes & driver allowance)
  const discountPercentage = Number(car.discountPercentage ?? car.pricing?.discountPercentage ?? 0);

  // Standard (undiscounted) Base Fare before route discount
  const standardBaseFare = isLocal
    ? (car.pricing?.originalPrice || car.baseFare || car.fare || 4047)
    : (perKmRate > 0 && distanceKm > 0
      ? Math.round(perKmRate * distanceKm)
      : (car.pricing?.originalPrice || car.baseFare || 4047));

  // Route Tariff Discount Amount
  const tariffDiscountAmount = discountPercentage > 0
    ? Math.round(standardBaseFare * (discountPercentage / 100))
    : 0;

  // Final Discounted Base Fare
  const baseFare = Math.max(0, standardBaseFare - tariffDiscountAmount);

  // Dynamic percentages, flat amounts & add-on pricing from Backend / Settings
  const gstType = pricingConfig.gstType || "PERCENTAGE";
  const gstPercentage = pricingConfigLoaded
    ? pricingConfig.gstPercentage
    : (Number(car.gstPercentage) || pricingConfig.gstPercentage || 5);
  const gstAmount = Number(pricingConfig.gstAmount) || 0;

  const driverAllowanceType = pricingConfig.driverAllowanceType || "PERCENTAGE";
  const driverAllowancePercentage = pricingConfigLoaded
    ? pricingConfig.driverAllowancePercentage
    : (Number(car.driverAllowancePercentage) || pricingConfig.driverAllowancePercentage || 10);
  const driverAllowanceAmount = Number(pricingConfig.driverAllowanceAmount) || 0;

  const lessThan3YearsFee = pricingConfig.lessThan3YearsFee || 299;
  const luggageCarrierFee = pricingConfig.luggageCarrierFee || 249;
  const languageChauffeurFee = pricingConfig.languageChauffeurFee || 199;
  const expresswayFee = pricingConfig.expresswayFee || 415;

  // Night pickup detection (10:00 PM to 06:00 AM)
  const pickupTimeStr = bookingConfig?.trip?.time || "";
  const isNightTrip = isNightPickup(pickupTimeStr);

  // Driver Allowance (prioritizing dedicated rule from car.pricing)
  const carDriverAllowance = car.pricing?.driverAllowance ?? car.driverAllowance;
  const isCarAllowanceDefined = carDriverAllowance != null && !isNaN(Number(carDriverAllowance));
  const isDriverAllowanceFlat = isCarAllowanceDefined
    ? (car.pricing?.driverAllowanceType === "FLAT" || (!car.pricing?.driverAllowancePercentage || Number(car.pricing?.driverAllowancePercentage) === 0))
    : (driverAllowanceType === "FLAT" && driverAllowanceAmount > 0);

  const rawDriverAllowance = isCarAllowanceDefined
    ? Math.round(Number(carDriverAllowance))
    : (isDriverAllowanceFlat
      ? Math.round(driverAllowanceAmount)
      : (pricingConfigLoaded
        ? Math.round(baseFare * (driverAllowancePercentage / 100))
        : (car.driverAllowance || Math.round(baseFare * (driverAllowancePercentage / 100)))));

  const driverAllowance = rawDriverAllowance;

  const driverAllowanceLabel = (
    car.pricing?.driverAllowanceLabel ||
    (isDriverAllowanceFlat
      ? `Driver Allowance (₹${rawDriverAllowance})`
      : `Driver Allowance (${car.pricing?.driverAllowancePercentage || driverAllowancePercentage}%)`)
  ).replace(/\s*Included/gi, "").trim();

  // Add-ons total
  const addonsTotal =
    (selectedAddons.expressway ? expresswayFee : 0) +
    (selectedAddons.languageChauffeur ? languageChauffeurFee : 0) +
    (selectedAddons.luggageCarrier ? luggageCarrierFee : 0) +
    (selectedAddons.lessThan3Years ? lessThan3YearsFee : 0);

  // Dynamic GST (e.g. 5% or Flat amount)
  const isGstFlat = gstType === "FLAT" && gstAmount > 0;
  const taxes = isGstFlat
    ? Math.round(gstAmount)
    : Math.round((baseFare + driverAllowance + addonsTotal) * (gstPercentage / 100));

  const gstLabel = isGstFlat
    ? `GST (₹${taxes})`
    : `GST (${gstPercentage}%)`;

  // Dynamic route distance & FASTag toll recalculation when pickup/drop addresses or coordinates change
  const effectiveFrom = pickupAddress || [pickupArea, pickupCityName, pickupStateName].filter(Boolean).join(", ") || bookingConfig?.trip?.from;
  const effectiveTo = dropAddress || bookingConfig?.trip?.to;
  const tripType = bookingConfig?.trip?.tripType || "one-way";

  useEffect(() => {
    if (!bookingConfig || isLocal || !effectiveFrom || !effectiveTo) return;

    // Clean placeholder decorations like "(Pickup Point)" or "(City Center / Main Landmark)"
    const cleanFrom = (effectiveFrom || "")
      .replace(/\s*\((Pickup Point|Arrivals Terminal)[^)]*\)/i, "")
      .trim();
    const cleanTo = (effectiveTo || "")
      .replace(/\s*\((City Center \/ Main Landmark|Departures Terminal)[^)]*\)/i, "")
      .trim();

    // Check if user has entered custom address or selected coords
    const originCity = (bookingConfig.trip?.from || "").trim().toLowerCase();
    const destCity = (bookingConfig.trip?.to || "").trim().toLowerCase();
    const isFromCustom = cleanFrom.toLowerCase() !== originCity && cleanFrom.length > 0;
    const isToCustom = cleanTo.toLowerCase() !== destCity && cleanTo.length > 0;
    const hasCustomCoords = Boolean(pickupCoords || dropCoords);

    // If address hasn't actually been customized by user, maintain the verified distance from select-vehicle
    if (!isFromCustom && !isToCustom && !hasCustomCoords && bookingConfig.distanceKm > 0) {
      return;
    }

    let cancelled = false;
    async function recalculateRoute() {
      try {
        const res = await fetchGoogleRouteDistance(
          cleanFrom,
          cleanTo,
          bookingConfig.trip?.stops || [],
          tripType,
          {
            originCoords: pickupCoords,
            destinationCoords: dropCoords,
            stopsCoords: bookingConfig.trip?.stopsCoords
          }
        );
        if (!cancelled && res?.isDetected && res.distanceKm > 0) {
          setCustomDistanceKm(res.distanceKm);
          if (res.durationText) setCustomDuration(res.durationText);
          if (res.tollPrice !== undefined && res.tollPrice > 0) {
            setLiveToll(res.tollPrice);
          } else if (res.distanceKm > 0) {
            setLiveToll(Math.round(res.distanceKm * 1.35));
          }
          try {
            const rawStored = sessionStorage.getItem("grab_selected_booking");
            if (rawStored) {
              const currentBooking = JSON.parse(rawStored);
              currentBooking.distanceKm = res.distanceKm;
              if (res.durationText) currentBooking.duration = res.durationText;
              sessionStorage.setItem("grab_selected_booking", JSON.stringify(currentBooking));
            }
          } catch {
            // Ignore session write errors
          }
        }
      } catch (err) {
        console.warn("Could not recalculate route distance on address change:", err);
      }
    }

    const timer = setTimeout(recalculateRoute, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLocal,
    bookingConfig,
    effectiveFrom,
    effectiveTo,
    tripType,
    pickupCoords?.lat,
    pickupCoords?.lng,
    dropCoords?.lat,
    dropCoords?.lng
  ]);

  const tollPrice = (isLocal || isRoundTrip)
    ? 0
    : (liveToll !== null
      ? liveToll
      : (bookingConfig?.tollPrice > 0
        ? Math.round(Number(bookingConfig.tollPrice))
        : (distanceKm > 0 ? Math.round(distanceKm * 1.35) : 0)));
  const duration = customDuration || (isLocal ? null : (bookingConfig?.duration || null));

  const couponDiscount = appliedCouponData?.discountAmount ? Math.round(Number(appliedCouponData.discountAmount)) : 0;
  const totalAmount = Math.max(0, baseFare + driverAllowance + taxes + addonsTotal + tollPrice + petCharge - couponDiscount);

  // Advance Part Pay = 25%, Full Pay = 100%, Book at Zero = 0
  const advanceAmount = Math.round(totalAmount * 0.25);
  const driverLaterAmount = totalAmount - (paymentPlan === "zero" ? 0 : (paymentPlan === "advance" ? advanceAmount : totalAmount));

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");
    try {
      const rideAmount = baseFare + driverAllowance + addonsTotal;
      const currentUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;
      const phone = (passengerPhone || authPhone || currentUser?.phone || currentUser?.mobile || "").trim();
      const email = (currentUser?.email || "").trim();

      const res = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          rideAmount: rideAmount,
          customerPhone: phone || null,
          customerEmail: email || null,
          tripType: "OUTSTATION",
          state: (pickupStateName || "").trim() || null,
          city: (pickupCityName || bookingConfig?.trip?.from || "").trim() || null,
        }),
      });
      const data = await res.json();
      if (data?.success && data?.data?.valid) {
        setAppliedCouponData(data.data);
        setCouponApplied(true);
        setCouponSuccess(data.message || `Coupon "${data.data.code}" applied! You saved ₹${Number(data.data.discountAmount).toLocaleString()}`);
      } else {
        setCouponApplied(false);
        setAppliedCouponData(null);
        setCouponError(data?.message || data?.data?.message || "Invalid coupon code");
      }
    } catch (err) {
      console.error("Coupon validation error:", err);
      setCouponError("Could not validate coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setAppliedCouponData(null);
    setCouponCode("");
    setCouponSuccess("");
    setCouponError("");
  };

  const saveDraft = (overrides = {}) => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          "grab_review_pay_draft",
          JSON.stringify({
            passengerName,
            passengerPhone,
            pickupAddress,
            pickupDoorNo,
            pickupStreet,
            pickupLandmark,
            pickupArea,
            pickupCityName,
            pickupStateName,
            pickupPincode,
            pickupCoords,
            dropCoords,
            dropAddress,
            specialInstructions,
            paymentPlan,
            ...overrides,
          })
        );
      } catch (e) {
        console.warn("Could not save draft:", e);
      }
    }
  };

  const sendOtpForAuth = async (targetPhone) => {
    const cleaned = (targetPhone || authPhone || passengerPhone).replace(/[^0-9]/g, "");
    if (cleaned.length < 10) {
      setAuthError("Please enter a valid 10-digit mobile number");
      return;
    }

    setAuthLoading(true);
    setAuthError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to send verification code");
      }
      if (result.data?.devOtp) {
        setAuthDevOtp(result.data.devOtp);
      }
      setAuthStep("otp");
      setAuthCountdown(30);
    } catch (err) {
      setAuthError(err.message || "Failed to send OTP. Please check mobile number.");
    } finally {
      setAuthLoading(false);
    }
  };

  const triggerOtpVerification = (customMsg = "") => {
    saveDraft();
    const cleaned = passengerPhone.replace(/[^0-9]/g, "");
    setAuthPhone(cleaned);
    setAuthOtp("");
    setAuthError(customMsg);
    setShowAuthModal(true);

    if (cleaned.length >= 10) {
      sendOtpForAuth(cleaned);
    } else {
      setAuthStep("phone");
    }
  };

  const verifyOtpAndBook = async () => {
    if (!authOtp || authOtp.trim().length !== 6) {
      setAuthError("Please enter the complete 6-digit OTP");
      return;
    }

    setAuthLoading(true);
    setAuthError("");
    try {
      const cleaned = authPhone.replace(/[^0-9]/g, "");
      const response = await fetch(`${API_BASE_URL}/api/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned, otp: authOtp.trim() }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Invalid OTP entered");
      }

      setAuthSession(result.data.accessToken, result.data.user);
      setShowAuthModal(false);

      if (result.data.user) {
        if (!passengerName && result.data.user.name && result.data.user.name.toLowerCase() !== "customer") {
          setPassengerName(result.data.user.name);
        }
        if (!passengerPhone && result.data.user.phone) {
          const digits = result.data.user.phone.replace(/[^0-9]/g, "");
          setPassengerPhone(digits.slice(-10));
        }
      }

      // If zero advance, create booking immediately; otherwise open UPI payment modal
      if (paymentPlan === "zero") {
        await executeBooking();
      } else {
        setUpiModalError("");
        setShowUpiModal(true);
      }
    } catch (err) {
      setAuthError(err.message || "Invalid OTP code");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCopyUpi = (text) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleProofFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload an image file (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Receipt image must be smaller than 10MB.");
      return;
    }

    setProofFileName(file.name);
    setUploadingProof(true);
    setErrorMsg(null);
    try {
      const res = await customerApi.uploadPaymentProof(file);
      if (res?.data?.url) {
        setPaymentProofUrl(res.data.url);
      } else {
        throw new Error("Could not obtain receipt URL from upload.");
      }
    } catch (err) {
      console.error("Payment proof upload failed:", err);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to upload payment proof. Please try again.");
    } finally {
      setUploadingProof(false);
    }
  };

  const executeBooking = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const advancePaid = paymentPlan === "zero" ? 0 : (paymentPlan === "advance" ? advanceAmount : totalAmount);

      // Construct local date-time string (without UTC shift) so Spring Boot's LocalDateTime stores exact local pickup time
      let pickupIso = null;
      if (bookingConfig?.trip?.date) {
        try {
          const dateParts = String(bookingConfig.trip.date).split("-");
          let yyyy, mm, dd;
          if (dateParts[0].length === 4) {
            [yyyy, mm, dd] = dateParts;
          } else {
            [dd, mm, yyyy] = dateParts;
          }
          const timeParts = (bookingConfig.trip.time || "08:00").split(":");
          const hh = padZero(Number(timeParts[0] || 8));
          const min = padZero(Number(timeParts[1] || 0));
          yyyy = String(yyyy).padStart(4, "0");
          mm = padZero(Number(mm));
          dd = padZero(Number(dd));
          pickupIso = `${yyyy}-${mm}-${dd}T${hh}:${min}:00`;
        } catch {
          // Keep fallback ISO
        }
      }
      if (!pickupIso) {
        // eslint-disable-next-line react-hooks/purity
        pickupIso = `${formatLocalDateTime(new Date(Date.now() + 86400000))}:00`;
      }

      // Construct return date-time string if round trip
      let returnIso = null;
      const rawDropDate = bookingConfig?.trip?.dropDate || bookingConfig?.trip?.returnDate;
      if (isRoundTrip && rawDropDate) {
        try {
          const dateParts = String(rawDropDate).split("-");
          let yyyy, mm, dd;
          if (dateParts[0].length === 4) {
            [yyyy, mm, dd] = dateParts;
          } else {
            [dd, mm, yyyy] = dateParts;
          }
          yyyy = String(yyyy).padStart(4, "0");
          mm = padZero(Number(mm));
          dd = padZero(Number(dd));
          returnIso = `${yyyy}-${mm}-${dd}T23:59:00`;
        } catch {
          // Keep null fallback
        }
      }

      const rawStops = bookingConfig?.trip?.stops || bookingConfig?.stops || null;
      let stopsVal = null;
      if (rawStops) {
        if (Array.isArray(rawStops)) {
          const filtered = rawStops.filter(Boolean);
          if (filtered.length > 0) stopsVal = filtered.join("|");
        } else if (typeof rawStops === "string" && rawStops.trim()) {
          stopsVal = rawStops.trim();
        }
      }

      const addrParts = [
        pickupDoorNo ? pickupDoorNo.trim() : "",
        pickupStreet ? pickupStreet.trim() : "",
        pickupLandmark ? `Near ${pickupLandmark.trim()}` : "",
        pickupArea ? pickupArea.trim() : "",
        pickupCityName ? pickupCityName.trim() : "",
        pickupStateName ? pickupStateName.trim() : "",
        pickupPincode ? `- ${pickupPincode.trim()}` : ""
      ].filter(Boolean);
      const computedPickupAddress = addrParts.length > 0 ? addrParts.join(", ") : (pickupAddress || bookingConfig?.trip?.from || "Pickup Point");

      const bookingPayload = {
        tripType: isLocal ? "HOURLY_PACKAGE" : isAirport ? (bookingConfig?.trip?.tripType || "AIRPORT_TRANSFER") : ((bookingConfig?.trip?.tripType || "One way").toLowerCase().includes("round") ? "ROUND_TRIP" : "ONE_WAY"),
        serviceType: isLocal ? "LOCAL" : isAirport ? "AIRPORT" : (bookingConfig?.trip?.serviceType || "OUTSTATION"),
        pickupCity: pickupCityName || bookingConfig?.trip?.from || "Bangalore",
        dropCity: isLocal ? (bookingConfig?.trip?.from?.split(",")[0]?.trim() || "Bangalore") : (bookingConfig?.trip?.to || "Coimbatore"),
        stops: (isLocal || isAirport) ? "" : stopsVal,
        pickupAddress: computedPickupAddress,
        pickupLat: pickupCoords?.lat != null ? Number(pickupCoords.lat) : null,
        pickupLng: pickupCoords?.lng != null ? Number(pickupCoords.lng) : null,
        pickupDoorNo: pickupDoorNo.trim() || null,
        pickupStreet: pickupStreet.trim() || null,
        pickupArea: pickupArea.trim() || null,
        pickupLandmark: pickupLandmark.trim() || null,
        pickupPincode: pickupPincode.trim() || null,
        dropAddress: dropAddress.trim() || (isLocal ? "Within City Limits / Local Disposal" : `${bookingConfig?.trip?.to || "Destination"} Center`),
        pickupDateTime: pickupIso,
        returnDateTime: returnIso,
        vehicleCategory: bookingConfig?.car?.category || "SEDAN",
        passengerCount: 2,
        passengerName: passengerName.trim(),
        passengerPhone: passengerPhone.trim(),
        totalFare: totalAmount,
        advancePaid: paymentPlan === "zero" ? 0 : (paymentPlan === "advance" ? advanceAmount : totalAmount),
        paymentStatus: paymentPlan === "zero" ? "PAY_LATER" : (paymentPlan === "advance" ? "ADVANCE_PAID" : "FULL_PAID"),
        paymentMethod: paymentPlan === "zero" ? "PAY_LATER" : "UPI_QR",
        paymentProofUrl: paymentPlan === "zero" ? null : paymentProofUrl,
        paymentUtrNumber: paymentPlan === "zero" ? null : paymentUtrNumber.trim(),
        couponCode: appliedCouponData?.code || null,
        couponDiscount: couponDiscount > 0 ? couponDiscount : null,
        isPetFriendly,
        petType: isPetFriendly ? petType : null,
        petCount: isPetFriendly ? petCount : null,
        petCharge: isPetFriendly ? petCharge : 0,
        vendorPetPayout: isPetFriendly ? vendorPetPayout : 0,
        specialInstructions: `${specialInstructions ? specialInstructions.trim() + " | " : ""}${isPetFriendly ? `🐾 Pet Friendly Cab (${petType} × ${petCount}, Pet Fee: ₹${petCharge}) | ` : ""}${isLocal ? "Package: " + packageLabel + " | " : ""}${stopsVal ? "Intermediate Stops: " + stopsVal.replace(/\|/g, ", ") + " | " : ""}Vehicle: ${bookingConfig?.car?.title || "Fleet"} | Image: ${bookingConfig?.car?.image || ""} | Fuel: ${bookingConfig?.car?.fuel || "CNG"} | Distance: ${distanceKm} km${tollPrice > 0 ? " | FASTag Toll: ₹" + tollPrice : ""}${duration ? " | Est. Duration: " + duration : ""} | Rate: ₹${perKmRate}/km${tariffDiscountAmount > 0 ? ` | Standard Rate: ₹${standardBaseFare} | Route Discount: ₹${tariffDiscountAmount} (${discountPercentage}% OFF)` : ""} | BaseFare: ₹${baseFare} | DriverAllowance: ₹${driverAllowance} (${driverAllowanceLabel}) | Taxes: ₹${taxes} (${gstLabel})${selectedAddons.expressway ? ` | Expressway Fastag Included (₹${expresswayFee})` : ""}${selectedAddons.languageChauffeur ? ` | Language Chauffeur (${chauffeurLanguage}) (₹${languageChauffeurFee})` : ""}${selectedAddons.luggageCarrier ? ` | Luggage Carrier Added (₹${luggageCarrierFee})` : ""}${selectedAddons.lessThan3Years ? ` | Less than 3 years Old Vehicle (₹${lessThan3YearsFee})` : ""}${appliedCouponData ? ` | Coupon Applied: ${appliedCouponData.code} (Saved ₹${couponDiscount})` : ""}`,
      };

      const res = await customerApi.createBooking(bookingPayload);
      if (res && res.data) {
        sessionStorage.removeItem("grab_review_pay_draft");
        const confirmedData = {
          ...res.data,
          pickupCoords: pickupCoords || (res.data.pickupLat && res.data.pickupLng ? { lat: res.data.pickupLat, lng: res.data.pickupLng } : null) || findCityCoordinates(pickupCityName || bookingConfig?.trip?.from),
          dropCoords: dropCoords || findCityCoordinates(dropAddress || bookingConfig?.trip?.to),
          stopsCoords: bookingConfig?.trip?.stopsCoords || null,
          returnDateTime: res.data.returnDateTime || returnIso,
          dropDate: rawDropDate || null,
          stops: res.data.stops || stopsVal,
          createdAt: res.data.createdAt || new Date().toISOString(),
          carTitle: bookingConfig?.car?.title || "Fleet",
          carImage: bookingConfig?.car?.image || "",
          carFuel: bookingConfig?.car?.fuel || "CNG",
          carSeating: bookingConfig?.car?.seating || 4,
          distanceKm,
          duration,
          perKmRate,
          standardBaseFare,
          tariffDiscountAmount,
          discountPercentage,
          baseFare,
          driverAllowance,
          driverAllowanceLabel,
          taxes,
          gstLabel,
          tollPrice,
          addonsTotal,
          selectedAddons,
          chauffeurLanguage,
          lessThan3YearsFee,
          luggageCarrierFee,
          languageChauffeurFee,
          expresswayFee,
          couponCode: appliedCouponData?.code || null,
          couponDiscount,
          paymentPlan,
          paymentMethod: paymentPlan === "zero" ? "PAY_LATER" : "UPI_QR",
          paymentProofUrl: paymentPlan === "zero" ? null : paymentProofUrl,
          paymentUtrNumber: paymentPlan === "zero" ? null : paymentUtrNumber.trim(),
          passengerName: passengerName.trim(),
          passengerPhone: passengerPhone.trim(),
          pickupAddress: pickupAddress.trim(),
          dropAddress: dropAddress.trim(),
          userSpecialInstructions: specialInstructions.trim(),
          isPetFriendly,
          petType: isPetFriendly ? petType : null,
          petCount: isPetFriendly ? petCount : null,
          petCharge: isPetFriendly ? petCharge : 0,
          vendorPetPayout: isPetFriendly ? vendorPetPayout : 0,
        };
        sessionStorage.setItem("grab_confirmed_booking", JSON.stringify(confirmedData));
        const bookingRef = res.data.bookingReference || res.data.id;
        router.push(`/booking/confirmation?id=${encodeURIComponent(bookingRef)}`);
      } else {
        throw new Error("Unable to confirm booking. Please try again.");
      }
    } catch (err) {
      console.error("[ReviewPay] Booking creation error:", err);
      if (err.response?.status === 401) {
        logout();
        triggerOtpVerification("Your session expired. Please verify with OTP to complete your booking.");
      } else {
        const errorText = err.response?.data?.message || err.message || "Failed to confirm booking. Please verify your connection.";
        setErrorMsg(errorText);
        setUpiModalError(errorText);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmUpiPayment = async () => {
    if (!paymentProofUrl) {
      setUpiModalError("Please upload your UPI payment screenshot / receipt.");
      return;
    }
    if (!paymentUtrNumber.trim() || paymentUtrNumber.trim().length < 6) {
      setUpiModalError("Please enter your 12-digit UPI UTR / Transaction Reference Number.");
      return;
    }
    setUpiModalError("");
    await executeBooking();
  };

  const handlePayAndBook = async (e) => {
    e.preventDefault();

    if (!pickupAddress.trim()) {
      setErrorMsg("Please enter your exact pickup address or landmark.");
      return;
    }

    if (!passengerName.trim() || !passengerPhone.trim()) {
      setErrorMsg("Please provide passenger name and mobile number.");
      return;
    }

    saveDraft();

    if (!isAuthenticated()) {
      triggerOtpVerification();
      return;
    }

    if (paymentPlan === "zero") {
      await executeBooking();
      return;
    }

    setUpiModalError("");
    setShowUpiModal(true);
  };

  if (!bookingConfig) {
    return (
      <main className="bg-slate-50 min-h-screen py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0082fe] flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Loading Selected Vehicle...</h2>
          <p className="text-xs text-slate-500">
            If you came directly, please choose your car first.
          </p>
          <Link
            href="/outstation/select-vehicle"
            className="inline-block py-2.5 px-6 rounded-xl bg-[#0082fe] hover:bg-[#006ed6] text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Select Vehicle
          </Link>
        </div>
      </main>
    );
  }

  const effectivePickupCoords = pickupCoords || findCityCoordinates(pickupCityName || bookingConfig?.trip?.from);
  const effectiveDropCoords = dropCoords || findCityCoordinates(dropAddress || bookingConfig?.trip?.to);
  const rawStopsList = Array.isArray(bookingConfig?.trip?.stops)
    ? bookingConfig.trip.stops
    : (bookingConfig?.trip?.stops ? String(bookingConfig.trip.stops).split("|").map((s) => s.trim()).filter(Boolean) : []);
  const stopsMapList = rawStopsList.map((stop, idx) => {
    const coords = (bookingConfig?.trip?.stopsCoords && bookingConfig.trip.stopsCoords[idx]) || findCityCoordinates(stop);
    if (!coords) return null;
    return {
      lat: coords.lat,
      lng: coords.lng,
      label: `Halt #${idx + 1}: ${stop}`
    };
  }).filter(Boolean);

  return (
    <main className="bg-slate-50 min-h-screen pb-24">
      <SearchSummaryBar
        activeStep={2}
        overrideDistanceKm={distanceKm}
        overrideDuration={duration}
        overrideFrom={pickupCityName || bookingConfig?.trip?.from}
        overrideTo={dropAddress || bookingConfig?.trip?.to}
      />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-8">

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">{t("review_and_pay")}</h1>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePayAndBook} className="flex flex-col lg:flex-row gap-8">

          {/* Left Column: Passenger & Pickup Details + Payment Options */}
          <div className="flex-1 space-y-6">

            {/* 1. Passenger Information */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">1</div>
                  <h2 className="text-lg font-black text-slate-900">{t("passenger_details")}</h2>
                </div>
                {(passengerName || passengerPhone) && (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    Autofilled • Edit anytime
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      {t("full_name")} *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        placeholder="E.g. Rajesh Kumar"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0082fe] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      {t("mobile_number")} *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={passengerPhone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                          setPassengerPhone(digits);
                        }}
                        placeholder="98765 43210"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0082fe] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <p className="col-span-1 md:col-span-2 text-[11px] text-slate-400 font-medium">
                    Autofilled from your profile. You can edit the name or mobile number anytime for this specific trip.
                  </p>
                </div>

                {/* STRUCTURED PICKUP ADDRESS SECTION */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      {t("pickup_address") || "Pickup Address & Doorstep Details"} *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMapTarget("pickup");
                        setIsMapModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0082fe] hover:text-[#006ed6] hover:underline cursor-pointer group"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#0082fe] group-hover:scale-110 transition-transform" />
                      <span>{t("choose_from_location") || "Choose on Map"}</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* ROW 1: Manually entered: Address line & Street name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Address Line (Flat / House / Door / Building No.) *
                        </label>
                        <input
                          type="text"
                          required
                          value={pickupDoorNo}
                          onChange={(e) => setPickupDoorNo(e.target.value)}
                          placeholder="e.g. Flat 402, Green Heights / House #24"
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0082fe] outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Street Name (Road / Cross / Main) *
                        </label>
                        <input
                          type="text"
                          required
                          value={pickupStreet}
                          onChange={(e) => setPickupStreet(e.target.value)}
                          placeholder="e.g. 10th Main Road, 4th Cross"
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0082fe] outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* ROW 2: Area, City, State, Pincode */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Area *
                        </label>
                        <input
                          type="text"
                          required
                          value={pickupArea}
                          onChange={(e) => setPickupArea(e.target.value)}
                          placeholder="e.g. Indiranagar"
                          className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0082fe] outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={pickupCityName}
                          onChange={(e) => setPickupCityName(e.target.value)}
                          placeholder="e.g. Bengaluru"
                          className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0082fe] outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          required
                          value={pickupStateName}
                          onChange={(e) => setPickupStateName(e.target.value)}
                          placeholder="e.g. Karnataka"
                          className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0082fe] outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={pickupPincode}
                          onChange={(e) => setPickupPincode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                          placeholder="e.g. 560038"
                          className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0082fe] outline-none transition-all font-mono"
                        />
                      </div>
                    </div>

                    {/* ROW 3: Landmark (Manually entered) */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Landmark (Nearby prominent place / junction)
                      </label>
                      <input
                        type="text"
                        value={pickupLandmark}
                        onChange={(e) => setPickupLandmark(e.target.value)}
                        placeholder="e.g. Opposite Metro Station, Near Apollo Pharmacy"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0082fe] outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      {t("drop_address")}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMapTarget("drop");
                        setIsMapModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0082fe] hover:text-[#006ed6] hover:underline cursor-pointer group"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#0082fe] group-hover:scale-110 transition-transform" />
                      <span>{t("choose_to_location") || "Choose on Map"}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#0082fe] absolute left-3.5 top-3" />
                    <textarea
                      rows={2}
                      value={dropAddress}
                      onChange={(e) => setDropAddress(e.target.value)}
                      placeholder="Enter destination address or drop landmark..."
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0082fe] outline-none transition-all"
                    ></textarea>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                    {t("special_requests") || "Special Chauffeur Requests (Optional)"}
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder={t("special_requests_placeholder") || "E.g., Carrying excess baggage, baby in car, early departure..."}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#0082fe] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Interactive Route Map Preview */}
            {(effectivePickupCoords || effectiveDropCoords) && (
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#0082fe]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Live Route Map & Trip Telemetry
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMapTarget("pickup");
                        setIsMapModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-[#0082fe] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl cursor-pointer transition-colors shadow-2xs"
                    >
                      Pinpoint Pickup
                    </button>
                    {!isLocal && (
                      <button
                        type="button"
                        onClick={() => {
                          setMapTarget("drop");
                          setIsMapModalOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl cursor-pointer transition-colors shadow-2xs"
                      >
                        Pinpoint Drop
                      </button>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden border border-slate-200">
                  <MapView
                    pickup={effectivePickupCoords ? {
                      lat: effectivePickupCoords.lat,
                      lng: effectivePickupCoords.lng,
                      label: pickupCityName || bookingConfig?.trip?.from?.split(",")[0] || "Pickup"
                    } : null}
                    drop={effectiveDropCoords ? {
                      lat: effectiveDropCoords.lat,
                      lng: effectiveDropCoords.lng,
                      label: bookingConfig?.trip?.to?.split(",")[0] || "Drop"
                    } : null}
                    stops={stopsMapList}
                    overrideDistance={distanceKm}
                    overrideDuration={duration}
                    className="h-60 sm:h-72 w-full"
                  />
                </div>
              </div>
            )}

            {/* 2. Select Payment Plan */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="bg-slate-900 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">2</div>
                <h2 className="text-lg font-black text-slate-900">{t("select_payment_plan") || "Select Payment Plan"}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label
                  onClick={() => setPaymentPlan("zero")}
                  className={`relative border-2 ${paymentPlan === 'zero' ? 'border-[#0082fe] bg-blue-50/40 ring-2 ring-[#0082fe]/10' : 'border-slate-200 bg-white hover:border-slate-300'} p-5 rounded-2xl cursor-pointer flex flex-col items-center text-center transition-all`}
                >
                  <input type="radio" name="payment" checked={paymentPlan === "zero"} onChange={() => setPaymentPlan("zero")} className="absolute top-4 right-4 w-4 h-4 accent-[#0082fe]" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 mb-1">Book at Zero</span>
                  <span className="text-2xl font-black text-slate-900 mb-1">₹0</span>
                  <span className="text-[11px] font-bold text-slate-500">Pay ₹{totalAmount.toLocaleString()} later at trip start</span>
                </label>

                <label
                  onClick={() => setPaymentPlan("advance")}
                  className={`relative border-2 ${paymentPlan === 'advance' ? 'border-[#0082fe] bg-blue-50/40 ring-2 ring-[#0082fe]/10' : 'border-slate-200 bg-white hover:border-slate-300'} p-5 rounded-2xl cursor-pointer flex flex-col items-center text-center transition-all`}
                >
                  <input type="radio" name="payment" checked={paymentPlan === "advance"} onChange={() => setPaymentPlan("advance")} className="absolute top-4 right-4 w-4 h-4 accent-[#0082fe]" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 mb-1">{t("pay_advance") || "Part Pay"}</span>
                  <span className="text-2xl font-black text-[#0082fe] mb-1">₹{advanceAmount.toLocaleString()}</span>
                  <span className="text-[11px] font-bold text-slate-500">Pay rest to chauffeur at trip end</span>
                </label>

                <label
                  onClick={() => setPaymentPlan("full")}
                  className={`relative border-2 ${paymentPlan === 'full' ? 'border-[#0082fe] bg-blue-50/40 ring-2 ring-[#0082fe]/10' : 'border-slate-200 bg-white hover:border-slate-300'} p-5 rounded-2xl cursor-pointer flex flex-col items-center text-center transition-all`}
                >
                  <input type="radio" name="payment" checked={paymentPlan === "full"} onChange={() => setPaymentPlan("full")} className="absolute top-4 right-4 w-4 h-4 accent-[#0082fe]" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 mb-1">{t("pay_full") || "Pay Full"}</span>
                  <span className="text-2xl font-black text-slate-900 mb-1">₹{totalAmount.toLocaleString()}</span>
                  <span className="text-[11px] font-bold text-emerald-600">Zero cash hassle during the ride</span>
                </label>
              </div>
            </div>

            {/* 3. Personalize Your Journey  */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-full bg-[#0082fe]/10 text-[#0082fe] flex items-center justify-center font-bold text-xs">3</div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Enhance your Travel Experience</h3>
                  <p className="text-xs text-slate-500 font-medium">With our premium add-ons</p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {/* Add-on 1: Expressway Toll (Commented out for now - based on routes, not common) */}
                {/*
                <label className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${selectedAddons.expressway ? 'border-[#0082fe] bg-blue-50/20 shadow-2xs' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={selectedAddons.expressway}
                      onChange={(e) => setSelectedAddons(prev => ({ ...prev, expressway: e.target.checked }))}
                      className="w-4 h-4 accent-[#0082fe] rounded cursor-pointer"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {bookingConfig?.trip?.from?.split(",")[0] || "Bangalore"} - {bookingConfig?.trip?.to?.split(",")[0] || "Mysore"} Expressway
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                        Most Popular
                      </span>
                    </div>
                  </div>
                  <span className="font-extrabold text-slate-900 text-sm">₹{expresswayFee}</span>
                </label>
                */}

                {/* Add-on 2: Language Chauffeur */}
                <div className={`p-3.5 sm:p-4 rounded-xl border transition-all ${selectedAddons.languageChauffeur ? 'border-[#0082fe] bg-blue-50/20 shadow-2xs' : 'border-slate-200 hover:border-slate-300'}`}>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAddons.languageChauffeur}
                        onChange={(e) => setSelectedAddons(prev => ({ ...prev, languageChauffeur: e.target.checked }))}
                        className="w-4 h-4 accent-[#0082fe] rounded cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm font-bold text-slate-900">Driver who know your language</span>
                    </div>
                    <span className="font-extrabold text-slate-900 text-sm">₹{languageChauffeurFee}</span>
                  </label>

                  {/* Language Selection: English or Hindi */}
                  {selectedAddons.languageChauffeur && (
                    <div className="mt-3 pt-3 border-t border-blue-200/60 flex flex-wrap items-center justify-between gap-2.5">
                      <span className="text-xs font-bold text-slate-700">Know your Language:</span>
                      <div className="flex items-center gap-2">
                        {["English", "Hindi"].map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setChauffeurLanguage(lang);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${chauffeurLanguage === lang
                                ? "bg-[#0082fe] text-white shadow-2xs"
                                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Add-on 3: Luggage Carrier */}
                <label className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${selectedAddons.luggageCarrier ? 'border-[#0082fe] bg-blue-50/20 shadow-2xs' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedAddons.luggageCarrier}
                      onChange={(e) => setSelectedAddons(prev => ({ ...prev, luggageCarrier: e.target.checked }))}
                      className="w-4 h-4 accent-[#0082fe] rounded cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm font-bold text-slate-900">Cab with Luggage Carrier</span>
                  </div>
                  <span className="font-extrabold text-slate-900 text-sm">₹{luggageCarrierFee}</span>
                </label>

                {/* Add-on 4: Less than 3 years Old Vehicle */}
                <label className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${selectedAddons.lessThan3Years ? 'border-[#0082fe] bg-blue-50/20 shadow-2xs' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedAddons.lessThan3Years}
                      onChange={(e) => setSelectedAddons(prev => ({ ...prev, lessThan3Years: e.target.checked }))}
                      className="w-4 h-4 accent-[#0082fe] rounded cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm font-bold text-slate-900">Less than 3 years Old Vehicle</span>
                  </div>
                  <span className="font-extrabold text-slate-900 text-sm">₹{lessThan3YearsFee}</span>
                </label>
              </div>
            </div>

            {/* 4. Inclusions / Exclusions & Terms */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">4</div>
                <h3 className="text-base font-black text-slate-900">Inclusions / Exclusions</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Inclusions */}
                <div className="space-y-3">
                  <h4 className="text-emerald-700 font-extrabold flex items-center gap-2 uppercase tracking-wider text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Inclusions
                  </h4>
                  <ul className="space-y-2.5 font-semibold text-slate-600">
                    <li className="flex items-center gap-2.5 text-emerald-700">✓ <span className="text-slate-700">Base Fare and Fuel Charges</span></li>
                    {!isNightTrip && (
                      <li className="flex items-center gap-2.5 text-emerald-700">✓ <span className="text-slate-700">{driverAllowanceLabel}</span></li>
                    )}
                    <li className="flex items-center gap-2.5 text-emerald-700">✓ <span className="text-slate-700">{gstLabel}</span></li>
                    {!isRoundTrip && (
                      <li className="flex items-center gap-2.5 text-emerald-700">✓ <span className="text-slate-700">State Tax & Toll</span></li>
                    )}
                    <li className="flex items-center gap-2.5 text-emerald-700">✓ <span className="text-slate-700">{bookingConfig?.car?.seating >= 6 ? "4 bags" : "3 bags"}</span></li>
                    <li className="flex items-center gap-2.5 text-emerald-700">✓ <span className="text-slate-700">AC</span></li>
                  </ul>
                </div>

                {/* Exclusions */}
                <div className="space-y-3">
                  <h4 className="text-rose-700 font-extrabold flex items-center gap-2 uppercase tracking-wider text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Exclusions
                  </h4>
                  <ul className="space-y-2.5 font-semibold text-slate-600">
                    {isRoundTrip && (
                      <li className="flex items-start gap-2.5 text-rose-600">✕ <span className="text-slate-700 font-medium">Tolls, State Entry Tax & Parking (Payable at actuals)</span></li>
                    )}
                    <li className="flex items-start gap-2.5 text-rose-600">
                      ✕ <span className="text-slate-700 font-medium">
                        {isNightTrip
                          ? "Driver Allowance (Night travel 10:00 PM – 6:00 AM: excluded from package, payable directly to driver)"
                          : "Driver Night Allowance (Between 10:00 PM – 6:00 AM)"}
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5 text-rose-600">✕ <span className="text-slate-700">Beyond package km charged at ₹{perKmRate || 25}/km after {distanceKm > 0 ? `${distanceKm} km` : "package limit"}</span></li>
                    <li className="flex items-start gap-2.5 text-rose-600">✕ <span className="text-slate-700">Multiple pickups/drops</span></li>
                  </ul>
                </div>
              </div>

              {/* Collapsible Terms and Conditions */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTermsOpen(!termsOpen)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-[#0082fe] transition-colors cursor-pointer select-none"
                >
                  <span>Read Terms and Conditions</span>
                  <span className="text-[10px]">{termsOpen ? "▲" : "▼"}</span>
                </button>
                {termsOpen && (
                  <ul className="mt-3 space-y-2 text-[11px] text-slate-600 font-medium list-disc pl-5 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <li>Your Trip has a KM limit. If your usage exceeds this limit, you will be charged for the excess KM used.</li>
                    <li>Your trip includes one pick up in Pick-up city and one drop to destination city. It does not include within city travel.</li>
                    <li>Driver Night Allowance is applicable if the vehicle is driven between 10:00 PM and 6:00 AM.</li>
                    <li>If your Trip has Hill climbs, cab AC may be switched off during such climbs.</li>
                  </ul>
                )}
              </div>
            </div>

            {/* 5. Supported Payment Methods */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="bg-slate-900 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">5</div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Supported Payment Methods</h2>
                  <p className="text-xs text-slate-500 font-medium">100% Encrypted & Secure Payments</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className={`border rounded-xl p-3.5 flex items-center justify-between transition-all ${paymentPlan !== "zero" ? "border-[#0082fe] bg-blue-50/30" : "border-slate-200 bg-slate-50/50"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-700 shadow-2xs">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Instant UPI & QR Code</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Google Pay, PhonePe, Paytm, BHIM & all banking apps</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${paymentPlan !== "zero" ? "text-blue-800 bg-blue-100 border-blue-200" : "text-emerald-700 bg-emerald-50 border-emerald-200"}`}>
                    {paymentPlan !== "zero" ? "Selected (QR on Pay)" : "Zero Fee"}
                  </span>
                </div>

                <div className={`border rounded-xl p-3.5 flex items-center justify-between transition-all ${paymentPlan === "zero" ? "border-emerald-500 bg-emerald-50/30" : "border-slate-200 bg-slate-50/50"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-700 shadow-2xs">
                      <Wallet className="w-4 h-4 text-[#0082fe]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Book at Zero / Pay to Chauffeur</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Pay via Cash or UPI directly to driver at pickup/drop</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${paymentPlan === "zero" ? "text-emerald-800 bg-emerald-100 border-emerald-300" : "text-slate-600 bg-slate-100 border-slate-200"}`}>
                    {paymentPlan === "zero" ? "Selected (Pay Later)" : "Available"}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Original GrabRentals Sticky Card with Extra Details */}
          <div className="w-full lg:w-[420px]">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm sticky top-36 overflow-hidden">

              {/* Dark Slate Summary Header */}
              <div className="bg-slate-900 text-white p-5">
                <h3 className="text-base font-black tracking-tight">Final Booking Summary</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {isLocal ? (
                    `${bookingConfig?.trip?.from} • Local Package: ${packageLabel}`
                  ) : (
                    `${bookingConfig?.trip?.from} ${bookingConfig?.trip?.stops ? `→ Via ${String(bookingConfig.trip.stops).replace(/\|/g, ", ")} ` : ""}→ ${bookingConfig?.trip?.to} • ${bookingConfig?.trip?.tripType || "One way"}`
                  )}
                </p>
                {isLocal ? (
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px] font-bold">
                    <span className="text-sky-400">⏱️ {packageLabel}</span>
                    <span className="text-slate-300">📍 Local City Disposal</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px] font-bold">
                    {bookingConfig?.trip?.date && (
                      <span className="text-slate-300">📅 {bookingConfig.trip.date} {bookingConfig.trip.time ? `• ${bookingConfig.trip.time}` : ""}</span>
                    )}
                    {isRoundTrip && (bookingConfig?.trip?.dropDate || bookingConfig?.trip?.returnDate) && (
                      <span className="text-sky-400">🔄 Return: {bookingConfig?.trip?.dropDate || bookingConfig?.trip?.returnDate}</span>
                    )}
                    {distanceKm > 0 && <span className="text-sky-400">📏 {distanceKm} km</span>}
                    {duration && <span className="text-slate-300">⏱️ ~{duration}</span>}
                  </div>
                )}
              </div>

              {/* Free Cancellation Banner */}
              <div className="px-5 py-2.5 bg-blue-50/90 border-b border-blue-100 text-blue-900 text-xs font-bold flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#0082fe] shrink-0" />
                <span>Free cancellation till <strong className="text-blue-950 font-black">1 hr</strong> of departure</span>
              </div>

              {/* Selected Vehicle Overview */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-14 relative bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0">
                    <Image
                      src={resolveCarImage(bookingConfig?.car?.title, bookingConfig?.car?.category, bookingConfig?.car?.image)}
                      alt={bookingConfig?.car?.title || "Car"}
                      fill
                      unoptimized={true}
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{bookingConfig?.car?.title || "Fleet Vehicle"}</h4>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      {bookingConfig?.car?.seating || 4} Seats • {bookingConfig?.car?.fuel || "AC"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Fare Breakdown — All values from backend tariff engine */}
              <div className="p-5 border-b border-slate-100 space-y-3">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{t("fare_summary") || "Fare Summary"}</h4>
                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between items-center">
                    <span>Base Outstation Fare ({distanceKm} km × ₹{Number(perKmRate).toFixed(1)}/km)</span>
                    <span className="flex items-center gap-2">
                      {tariffDiscountAmount > 0 && (
                        <span className="text-slate-400 line-through text-xs font-semibold">
                          ₹{standardBaseFare.toLocaleString()}
                        </span>
                      )}
                      <span className="text-slate-900 font-bold">
                        ₹{(tariffDiscountAmount > 0 ? baseFare : standardBaseFare).toLocaleString()}
                      </span>
                    </span>
                  </div>

                  {tariffDiscountAmount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded border border-emerald-200">
                          {discountPercentage}% OFF
                        </span>
                        <span>Route Special Discount</span>
                      </span>
                      <span>- ₹{tariffDiscountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  {tariffDiscountAmount > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800 bg-slate-50/90 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                      <span className="text-slate-700">Net Base Fare (After Discount)</span>
                      <span className="text-[#0082fe] font-black">₹{baseFare.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span>{driverAllowanceLabel?.replace(/\s*Included/gi, "").trim()}</span>
                    <span className={isNightTrip ? "text-[#0082fe] font-bold" : "text-slate-900 font-bold"}>
                      {isNightTrip ? "Excluded (Pay to driver)" : `₹${driverAllowance.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>{gstLabel}</span>
                    <span className="text-slate-900 font-bold">₹{taxes.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>{isRoundTrip ? "Toll & State Tax" : "FASTag Highway Toll"}</span>
                    <span className={isRoundTrip ? "text-[#0082fe] font-bold" : (tollPrice > 0 ? "text-slate-900 font-bold" : "text-emerald-700 font-extrabold")}>
                      {isRoundTrip ? "Pay at actuals (Excluded)" : (tollPrice > 0 ? `+ ₹${tollPrice.toLocaleString()}` : "Included (₹0)")}
                    </span>
                  </div>

                  {selectedAddons.expressway && (
                    <div className="flex justify-between items-center text-blue-800">
                      <span>Expressway Toll</span>
                      <span className="font-bold">+ ₹{expresswayFee}</span>
                    </div>
                  )}

                  {selectedAddons.languageChauffeur && (
                    <div className="flex justify-between items-center text-blue-800">
                      <span>Language Chauffeur ({chauffeurLanguage})</span>
                      <span className="font-bold">+ ₹{languageChauffeurFee}</span>
                    </div>
                  )}

                  {selectedAddons.luggageCarrier && (
                    <div className="flex justify-between items-center text-blue-800">
                      <span>Luggage Carrier</span>
                      <span className="font-bold">+ ₹{luggageCarrierFee}</span>
                    </div>
                  )}

                  {selectedAddons.lessThan3Years && (
                    <div className="flex justify-between items-center text-blue-800">
                      <span>Vehicle &lt; 3 Years Old</span>
                      <span className="font-bold">+ ₹{lessThan3YearsFee}</span>
                    </div>
                  )}

                  {isPetFriendly && (
                    <div className="flex justify-between items-center text-amber-900 bg-amber-50/90 p-2 rounded-lg border border-amber-200 font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className="text-base">🐾</span>
                        <span>Pet Friendly Allowance ({petType} × {petCount})</span>
                      </span>
                      <span className="text-amber-800 font-black">
                        {petCharge > 0 ? `+ ₹${petCharge.toLocaleString()}` : "FREE (₹0)"}
                      </span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600">
                      <span>Coupon ({appliedCouponData?.code})</span>
                      <span className="font-bold">- ₹{couponDiscount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Coupon Code Input */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    disabled={couponApplied || couponLoading}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError("");
                      setCouponSuccess("");
                    }}
                    placeholder="ENTER A COUPON"
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 uppercase placeholder:text-slate-400 focus:outline-none focus:border-[#0082fe] disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  {couponApplied ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={couponLoading || !couponCode.trim()}
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center min-w-[70px]"
                    >
                      {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                    </button>
                  )}
                </div>

                {couponSuccess && (
                  <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    ✓ {couponSuccess}
                  </p>
                )}

                {couponError && (
                  <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                    ✕ {couponError}
                  </p>
                )}
              </div>

              {/* Total & Action */}
              <div className="p-5 bg-blue-50/40 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide">Total Ride Value</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">₹{totalAmount.toLocaleString()}</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-blue-200/80 flex justify-between items-center text-xs">
                  <span className="font-bold text-blue-900">Paying Now:</span>
                  <span className="font-black text-[#0082fe] text-sm">
                    ₹{paymentPlan === "zero" ? "0" : paymentPlan === "advance" ? advanceAmount.toLocaleString() : totalAmount.toLocaleString()}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#0082fe] hover:bg-[#006ed6] disabled:opacity-50 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-[#0082fe]/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Forwarding to Dispatch Engine...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      {paymentPlan === "zero"
                        ? `${t("confirm_and_book") || "Confirm & Book"} • ₹0`
                        : `Proceed to Pay • ₹${(paymentPlan === "advance" ? advanceAmount : totalAmount).toLocaleString()}`}
                    </>
                  )}
                </button>

                <p className="text-[10px] text-slate-500 font-bold text-center flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Encrypted & Verified Booking
                </p>
              </div>

            </div>
          </div>

        </form>
      </div>

      {/* Instant OTP Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#0082fe]/10 text-[#0082fe] flex items-center justify-center mb-2">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {authStep === "otp" ? "Verify OTP to Confirm Ride" : "Verify Mobile Number"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {authStep === "otp"
                    ? `Enter the 6-digit verification code sent to +91 ${authPhone.slice(-10)}`
                    : "Enter your 10-digit mobile number to verify your booking instantly"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authStep === "phone" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-bold text-slate-400">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                      placeholder="98765 43210"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-[#0082fe] outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={authLoading || authPhone.length < 10}
                  onClick={() => sendOtpForAuth(authPhone)}
                  className="w-full py-3 px-4 bg-[#0082fe] hover:bg-[#006ed6] disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                      Enter 6-Digit OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthStep("phone")}
                      className="text-[11px] font-bold text-[#0082fe] hover:underline"
                    >
                      Change Number
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={authOtp}
                    autoFocus
                    onChange={(e) => setAuthOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.4em] py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-900 focus:bg-white focus:border-[#0082fe] outline-none"
                  />
                </div>

                {authDevOtp && (
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-900">
                      Test OTP: <strong>{authDevOtp}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAuthOtp(authDevOtp)}
                      className="px-2 py-0.5 rounded bg-[#0082fe] text-white font-bold text-[10px] hover:bg-[#006ed6]"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Didn&apos;t receive code?</span>
                  {authCountdown > 0 ? (
                    <span className="font-semibold text-slate-400">Resend in {authCountdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => sendOtpForAuth(authPhone)}
                      className="font-bold text-[#0082fe] hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  disabled={authLoading || authOtp.length !== 6}
                  onClick={verifyOtpAndBook}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {authLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Confirm Ride</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* UPI Payment Popup Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0082fe] text-white flex items-center justify-center font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight">Scan & Pay via UPI</h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {paymentPlan === "advance" ? "Part Pay Advance" : "Full Payment"}: <span className="font-extrabold text-sky-300">₹{(paymentPlan === "advance" ? advanceAmount : totalAmount).toLocaleString()}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUpiModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {upiModalError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{upiModalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                {/* Left: Dynamic QR Code Box */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-3">
                  <div className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200 inline-block">
                    {upiConfig?.upiId ? (
                      <QRCodeSVG
                        value={`upi://pay?pa=${encodeURIComponent(upiConfig.upiId)}&pn=${encodeURIComponent(upiConfig.payeeName || "Grab Rentals")}&am=${paymentPlan === "advance" ? advanceAmount : totalAmount}&cu=INR&tn=${encodeURIComponent("GrabRentals " + (passengerPhone || "Booking"))}`}
                        size={170}
                        level="M"
                        includeMargin
                      />
                    ) : (
                      <div className="w-[170px] h-[170px] bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-2">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-[11px] font-bold">Generating QR...</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 w-full">
                    <div className="text-xs font-bold text-slate-700">
                      Payee: <span className="font-black text-slate-900">{upiConfig?.payeeName || "Grab Rentals India Pvt Ltd"}</span>
                    </div>

                    {/* Copyable UPI ID Box */}
                    <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs max-w-full">
                      <span className="text-xs font-mono font-bold text-slate-800 truncate">{upiConfig?.upiId || "grabrentals@okaxis"}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyUpi(upiConfig?.upiId)}
                        className="text-[#0082fe] hover:text-[#006ed6] transition-colors cursor-pointer shrink-0"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Deep link button for mobile devices */}
                  {upiConfig?.upiId && (
                    <a
                      href={`upi://pay?pa=${encodeURIComponent(upiConfig.upiId)}&pn=${encodeURIComponent(upiConfig.payeeName || "Grab Rentals")}&am=${paymentPlan === "advance" ? advanceAmount : totalAmount}&cu=INR&tn=${encodeURIComponent("GrabRentals " + (passengerPhone || "Booking"))}`}
                      className="w-full inline-flex sm:hidden items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0082fe] text-white font-extrabold text-xs uppercase tracking-wider shadow-sm hover:bg-[#006ed6] transition-all"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Pay via UPI App</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <p className="text-[10px] text-slate-500 font-medium">
                    Works on GPay, PhonePe, Paytm, BHIM & all banking apps
                  </p>

                  {/* Bank Transfer info fallback if available */}
                  {upiConfig?.accountNumber && (
                    <div className="w-full pt-3 border-t border-slate-200 text-left text-[11px] text-slate-600 space-y-1">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> Or Direct Bank Transfer:
                      </div>
                      <div className="text-[10px] font-mono text-slate-700 bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                        <div><strong>Bank:</strong> {upiConfig.bankName || "Commercial Bank"}</div>
                        <div><strong>A/C No:</strong> {upiConfig.accountNumber}</div>
                        <div><strong>IFSC:</strong> {upiConfig.ifscCode}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Upload Proof & Enter UTR */}
                <div className="space-y-4">
                  <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200/80 text-[11px] text-blue-900 leading-relaxed font-medium">
                    <p className="font-bold mb-0.5 text-blue-950">Instructions:</p>
                    <p>{upiConfig?.instructions || "1. Scan the QR code or use the UPI ID in your payment app. 2. Make the payment and capture a screenshot. 3. Upload the receipt below and enter your 12-digit UTR reference."}</p>
                  </div>

                  {/* Step 1: Upload Screenshot */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-slate-900">
                      Step 1: Upload Payment Screenshot / Receipt *
                    </label>

                    {paymentProofUrl ? (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-emerald-300 relative shrink-0 bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={paymentProofUrl}
                              alt="Payment Proof"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-emerald-950 truncate flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Receipt Uploaded</span>
                            </div>
                            <p className="text-[10px] text-emerald-700 truncate font-mono">{proofFileName || "screenshot.png"}</p>
                          </div>
                        </div>

                        <label
                          htmlFor="proof-upload-modal-input"
                          className="px-2.5 py-1 text-[11px] font-bold text-[#0082fe] hover:text-[#006ed6] bg-white rounded-lg border border-blue-200 shadow-2xs cursor-pointer shrink-0"
                        >
                          Change
                        </label>
                      </div>
                    ) : (
                      <label
                        htmlFor="proof-upload-modal-input"
                        className={`w-full border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${uploadingProof
                            ? "border-[#0082fe] bg-blue-50/40"
                            : "border-slate-300 hover:border-[#0082fe] hover:bg-blue-50/20 bg-slate-50/50"
                          }`}
                      >
                        {uploadingProof ? (
                          <div className="flex flex-col items-center gap-2 text-[#0082fe]">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="text-xs font-bold">Uploading receipt to secure cloud...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-2xs">
                              <UploadCloud className="w-5 h-5 text-[#0082fe]" />
                            </div>
                            <span className="text-xs font-black text-slate-800">
                              Click or drag receipt screenshot here
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Supports PNG, JPG, WEBP (Max 10MB)
                            </span>
                          </div>
                        )}
                      </label>
                    )}

                    <input
                      id="proof-upload-modal-input"
                      type="file"
                      accept="image/*"
                      onChange={handleProofFileUpload}
                      disabled={uploadingProof}
                      className="hidden"
                    />
                  </div>

                  {/* Step 2: 12-Digit UTR */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-slate-900">
                      Step 2: Enter 12-Digit UTR / Transaction Reference *
                    </label>
                    <input
                      type="text"
                      value={paymentUtrNumber}
                      onChange={(e) => setPaymentUtrNumber(e.target.value.replace(/[^0-9a-zA-Z]/g, ""))}
                      placeholder="e.g. 412389123456"
                      maxLength={18}
                      className="w-full text-xs font-mono font-bold border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] tracking-wider"
                    />
                    <p className="text-[10px] text-slate-500 font-medium">
                      Found in your payment app under &quot;UPI Transaction ID&quot; or &quot;UTR Number&quot;.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Verification typically within 15 minutes</span>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowUpiModal(false)}
                  disabled={submitting}
                  className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUpiPayment}
                  disabled={submitting || uploadingProof}
                  className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-[#0082fe] hover:bg-[#006ed6] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#0082fe]/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Submit Payment & Book
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Map Location Picker Modal */}
      {isMapModalOpen && (
        <LocationPickerModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          activeTarget={mapTarget}
          tripType={tripType}
          pickupValue={pickupAddress || bookingConfig?.trip?.from || "Bangalore, Karnataka"}
          dropValue={dropAddress || bookingConfig?.trip?.to || "Coimbatore, Tamil Nadu"}
          initialPickupCoords={pickupCoords}
          initialDropCoords={dropCoords}
          onSelect={(selectedLocation, coords, target, allValues, details) => {
            if (target === "drop") {
              setDropAddress(selectedLocation);
              if (coords) setDropCoords(coords);
            } else {
              setPickupAddress(selectedLocation);
              if (coords) setPickupCoords(coords);
              if (details) {
                if (details.area) setPickupArea(details.area);
                if (details.city) setPickupCityName(details.city);
                if (details.state) setPickupStateName(details.state);
                if (details.pincode) setPickupPincode(details.pincode);
              }
            }
            if (allValues?.route?.distanceKm > 0 && !isLocal) {
              setCustomDistanceKm(allValues.route.distanceKm);
              if (allValues.route.tollPrice !== undefined && allValues.route.tollPrice > 0) {
                setLiveToll(allValues.route.tollPrice);
              } else if (allValues.route.distanceKm > 0) {
                setLiveToll(Math.round(allValues.route.distanceKm * 1.35));
              }
              if (allValues.route.durationText) {
                setCustomDuration(allValues.route.durationText);
              }
            }
          }}
          onSelectPickup={(selectedLocation, coords, details) => {
            setPickupAddress(selectedLocation);
            if (coords) setPickupCoords(coords);
            if (details) {
              if (details.area) setPickupArea(details.area);
              if (details.city) setPickupCityName(details.city);
              if (details.state) setPickupStateName(details.state);
              if (details.pincode) setPickupPincode(details.pincode);
            }
          }}
          onSelectDrop={(selectedLocation, coords) => {
            setDropAddress(selectedLocation);
            if (coords) setDropCoords(coords);
          }}
        />
      )}
    </main>
  );
}
