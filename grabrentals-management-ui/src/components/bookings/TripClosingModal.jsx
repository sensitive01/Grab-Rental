"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  X,
  CheckCircle2,
  Receipt,
  Car,
  ShieldCheck,
  Printer,
  AlertCircle,
  Loader2,
  Navigation,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Camera,
  Banknote,
  QrCode,
  Plus,
  Trash2,
  FileText,
  Building2,
  User,
  KeyRound
} from "lucide-react";
import { formatINR, printDocumentPdf } from "@/lib/utils";
import { operationsApi } from "@/lib/operationsApi";
import { adminApi } from "@/lib/adminApi";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

const EXTRA_CHARGE_CONFIG = [
  { id: "TOLL", label: "FASTag Tolls", icon: "🛣️", placeholder: "e.g. 350" },
  { id: "PERMIT", label: "State Permit / Entry Tax", icon: "📋", placeholder: "e.g. 500" },
  { id: "PARKING", label: "Parking Charges", icon: "🅿️", placeholder: "e.g. 100" },
  { id: "ALLOWANCE", label: "Driver Allowance", icon: "👨‍✈️", placeholder: "e.g. 400" },
  { id: "OTHER", label: "Other Extras", icon: "➕", placeholder: "e.g. 250", hasNotes: true }
];


function extractBookingAddons(booking) {
  if (!booking) return [];
  if (Array.isArray(booking.addons) && booking.addons.length > 0) {
    return booking.addons;
  }
  const list = [];
  const spec = `${booking.specialInstructions || ""} ${booking.notes || ""}`;

  // 1. Language Chauffeur
  if (/language chauffeur|language/i.test(spec)) {
    const m = spec.match(/Language Chauffeur\s*\(([^)]+)\)(?:\s*\([?₹](\d+)\))?/i);
    let lang = "English";
    let fee = 199;
    if (m) {
      if (m[1]) lang = m[1].trim();
      if (m[2]) fee = Number(m[2]);
    }
    list.push({
      id: "language_chauffeur",
      name: `Language Chauffeur (${lang})`,
      description: `Dedicated ${lang}-fluent professional chauffeur`,
      sacCode: "9966",
      packageQty: "1 Duty",
      price: fee,
      emoji: "🗣️",
    });
  }

  // 2. Luggage / Rooftop Carrier
  if (/luggage carrier|roof top carrier|carrier added/i.test(spec)) {
    const m = spec.match(/(?:Luggage Carrier Added|Roof top Carrier)\s*(?:\([?₹](\d+)\))?/i);
    let fee = 249;
    if (m && m[1]) fee = Number(m[1]);
    list.push({
      id: "luggage_carrier",
      name: "Luggage / Roof Top Carrier",
      description: "Secure rooftop luggage rack & weatherproof tarpaulin",
      sacCode: "9966",
      packageQty: "1 Vehicle",
      price: fee,
      emoji: "🧳",
    });
  }

  // 3. Guaranteed Car < 3 Years
  if (/car < 3 years|vehicle < 3 years|new car guarantee|less than 3 years/i.test(spec)) {
    const m = spec.match(/(?:Car < 3 Years|Less than 3 years Old Vehicle)\s*(?:\([?₹](\d+)\))?/i);
    let fee = 299;
    if (m && m[1]) fee = Number(m[1]);
    list.push({
      id: "new_car_guarantee",
      name: "Guaranteed Car < 3 Years Old",
      description: "Pristine, late-model vehicle",
      sacCode: "9966",
      packageQty: "1 Vehicle",
      price: fee,
      emoji: "✨",
    });
  }

  // 4. Expressway FASTag Pass
  if (/fastag pass|expressway fastag/i.test(spec)) {
    const m = spec.match(/Expressway FASTag (?:Pass|Included)\s*(?:\([?₹](\d+)\))?/i);
    let fee = 350;
    if (m && m[1]) fee = Number(m[1]);
    list.push({
      id: "fastag_pass",
      name: "Expressway FASTag Included",
      description: "Prepaid electronic highway toll plaza pass",
      sacCode: "9966",
      packageQty: "Unlimited",
      price: fee,
      emoji: "🛣️",
    });
  }

  // 5. Pet Friendly Accommodation
  const isPet = Boolean(booking.isPetFriendly) || /pet friendly cab|pet fee/i.test(spec);
  if (isPet) {
    const petFee = Number(booking.petCharge) || 500;
    list.push({
      id: "pet_friendly",
      name: `Pet Friendly Cab (${booking.petType || "Pet"})`,
      description: "Special vehicle sanitation & pet-safe cabin protection",
      sacCode: "9966",
      packageQty: "1 Vehicle",
      price: petFee,
      emoji: "🐾",
    });
  }

  return list;
}

export function TripClosingModal({ isOpen, onClose, trip, onTripCompleted, onSuccess }) {
  // Step State: 1 = Fleet & Odometer, 2 = Extra Charges, 3 = Payment & Invoice
  const [step, setStep] = useState(1);

  // Base Booked Details
  const initialBaseFare = Number(trip?.totalFare || trip?.fare || trip?.estimatedAmount || 0);
  const advancePaid = Number(trip?.advancePaid || 0);
  const customerRouteKm = Number(trip?.customerRouteKm || trip?.distanceKm || trip?.actualKmShownInCustomer || 0);
  const includedKm = Number(trip?.packageKm || trip?.distanceKm || (customerRouteKm > 0 ? customerRouteKm : 250));
  const defaultRate = Number(trip?.extraKmRate || trip?.perKmRate || 14);

  // Customer Pre-Booked Addons
  const customerAddons = useMemo(() => extractBookingAddons(trip), [trip]);
  const customerAddonsTotal = useMemo(
    () => customerAddons.reduce((sum, a) => sum + Number(a.price || a.fee || 0), 0),
    [customerAddons]
  );

  // Initial Fleet State Detection
  const hasAssignedFleet = Boolean(trip?.vehicleNumber || trip?.assignedVehicleNumber || trip?.assignedVehicle);

  // Progressive Fallback: Fleet & Chauffeur
  const [showFleetEdit, setShowFleetEdit] = useState(!hasAssignedFleet);
  const [fleetMode, setFleetMode] = useState("MANUAL"); // "MANUAL" or "SYSTEM"

  const [manualVehicleNumber, setManualVehicleNumber] = useState(
    trip?.vehicleNumber || trip?.manualVehicleNumber || ""
  );
  const [manualVehicleModel, setManualVehicleModel] = useState(
    trip?.vehicleModel || trip?.manualVehicleModel || trip?.vehicleCategory || ""
  );
  const [manualDriverName, setManualDriverName] = useState(
    trip?.driverName || trip?.manualDriverName || ""
  );
  const [manualDriverPhone, setManualDriverPhone] = useState(
    trip?.driverPhone || trip?.manualDriverPhone || ""
  );
  const [manualVendorName, setManualVendorName] = useState(
    trip?.vendorName || trip?.vendorBusinessName || trip?.manualVendorName || "In-House Fleet"
  );

  // System Fleet Inventory Selection
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [availableVendors, setAvailableVendors] = useState([]);
  const [selectedSystemVehicleId, setSelectedSystemVehicleId] = useState("");
  const [selectedSystemDriverId, setSelectedSystemDriverId] = useState("");
  const [selectedSystemVendorId, setSelectedSystemVendorId] = useState("");
  const [loadingFleetList, setLoadingFleetList] = useState(false);

  // Step 1: Odometer & Proof
  const [startKm, setStartKm] = useState(trip?.startKm != null ? String(trip.startKm) : "");
  const [endKm, setEndKm] = useState(trip?.endKm != null ? String(trip.endKm) : "");
  const [endOdometerPreview, setEndOdometerPreview] = useState(null);
  const [uploadingEndProof, setUploadingEndProof] = useState(false);

  // Step 2: Extra Charges
  const [extraKmOverride, setExtraKmOverride] = useState(trip?.extraKm ? String(trip.extraKm) : "");
  const [extraKmRate, setExtraKmRate] = useState(String(defaultRate));

  // Dynamic Extra Charges State
  const [activeExtraKeys, setActiveExtraKeys] = useState(() => {
    const keys = [];
    if (trip?.tollCharges && Number(trip.tollCharges) > 0) keys.push("TOLL");
    if (trip?.permitCharges && Number(trip.permitCharges) > 0) keys.push("PERMIT");
    if (trip?.parkingCharges && Number(trip.parkingCharges) > 0) keys.push("PARKING");
    if (trip?.driverAllowanceCharges && Number(trip.driverAllowanceCharges) > 0) keys.push("ALLOWANCE");
    if (trip?.otherCharges && Number(trip.otherCharges) > 0) keys.push("OTHER");
    return keys;
  });

  const [tollCharges, setTollCharges] = useState(trip?.tollCharges ? String(trip.tollCharges) : "");
  const [permitCharges, setPermitCharges] = useState(trip?.permitCharges ? String(trip.permitCharges) : "");
  const [parkingCharges, setParkingCharges] = useState(trip?.parkingCharges ? String(trip.parkingCharges) : "");
  const [driverAllowance, setDriverAllowance] = useState(trip?.driverAllowanceCharges ? String(trip.driverAllowanceCharges) : "");
  const [otherCharges, setOtherCharges] = useState(trip?.otherCharges ? String(trip.otherCharges) : "");
  const [otherChargesNotes, setOtherChargesNotes] = useState(trip?.otherChargesNotes || "");

  // Dropdown Add Bar State
  const [selectedChargeType, setSelectedChargeType] = useState("");
  const [chargeAmountInput, setChargeAmountInput] = useState("");
  const [chargeNotesInput, setChargeNotesInput] = useState("");

  const handleAddExtraCharge = () => {
    if (!selectedChargeType) return;
    const amount = chargeAmountInput.trim();

    if (!activeExtraKeys.includes(selectedChargeType)) {
      setActiveExtraKeys((prev) => [...prev, selectedChargeType]);
    }

    if (selectedChargeType === "TOLL") {
      if (amount) setTollCharges(amount);
    } else if (selectedChargeType === "PERMIT") {
      if (amount) setPermitCharges(amount);
    } else if (selectedChargeType === "PARKING") {
      if (amount) setParkingCharges(amount);
    } else if (selectedChargeType === "ALLOWANCE") {
      if (amount) setDriverAllowance(amount);
    } else if (selectedChargeType === "OTHER") {
      if (amount) setOtherCharges(amount);
      if (chargeNotesInput.trim()) setOtherChargesNotes(chargeNotesInput.trim());
    }

    setSelectedChargeType("");
    setChargeAmountInput("");
    setChargeNotesInput("");
  };

  const handleRemoveExtraCharge = (key) => {
    setActiveExtraKeys((prev) => prev.filter((k) => k !== key));
    if (key === "TOLL") setTollCharges("");
    if (key === "PERMIT") setPermitCharges("");
    if (key === "PARKING") setParkingCharges("");
    if (key === "ALLOWANCE") setDriverAllowance("");
    if (key === "OTHER") {
      setOtherCharges("");
      setOtherChargesNotes("");
    }
  };

  const availableChargeOptions = useMemo(() => {
    return EXTRA_CHARGE_CONFIG.filter((cfg) => !activeExtraKeys.includes(cfg.id));
  }, [activeExtraKeys]);

  // Step 3: Payment, Vendor Payout & Notes
  const [vendorPayout, setVendorPayout] = useState(trip?.vendorPayout != null ? String(trip.vendorPayout) : "");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [upiProofFile, setUpiProofFile] = useState(null);
  const [upiProofPreview, setUpiProofPreview] = useState(null);
  const [uploadingUpiProof, setUploadingUpiProof] = useState(false);
  const [closingNotes, setClosingNotes] = useState(trip?.tripClosingNotes || "");
  const [billingOtp, setBillingOtp] = useState("");
  const [billingOtpSent, setBillingOtpSent] = useState(false);
  const [sendingBillingOtp, setSendingBillingOtp] = useState(false);
  const [billingOtpSuccessMsg, setBillingOtpSuccessMsg] = useState("");
  const [billingOtpVerified, setBillingOtpVerified] = useState(false);
  const [verifyingBillingOtp, setVerifyingBillingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  const canSendBillingOtp = useMemo(() => {
    const e = Number(endKm);
    const s = Number(startKm);
    if (!endKm || isNaN(e) || e <= 0) return false;
    if (!isNaN(s) && e < s) return false;
    return true;
  }, [endKm, startKm]);

  const canProceedToStep2 = useMemo(() => {
    return Boolean(
      canSendBillingOtp &&
      billingOtp &&
      billingOtp.trim().length === 6 &&
      !verifyingBillingOtp
    );
  }, [canSendBillingOtp, billingOtp, verifyingBillingOtp]);

  const isOtpPhase = useMemo(() => {
    return !billingOtpSent && (!billingOtp || billingOtp.trim().length !== 6);
  }, [billingOtpSent, billingOtp]);

  const handleSendBillingOtp = async () => {
    const kmNum = Number(endKm);
    if (!endKm || isNaN(kmNum) || kmNum <= 0) {
      setErrorMessage("Please enter a valid closing odometer reading (KM) before requesting Billing OTP.");
      return;
    }
    setSendingBillingOtp(true);
    setErrorMessage("");
    setBillingOtpSuccessMsg("");
    try {
      await operationsApi.sendBillingOtp(bookingIdentifier, kmNum);
      setBillingOtpSent(true);
      setBillingOtpSuccessMsg("Billing OTP sent to guest mobile number via SMS!");
    } catch (err) {
      console.warn("Failed to dispatch billing OTP:", err);
      setErrorMessage(err?.response?.data?.message || err?.message || "Could not dispatch Billing OTP SMS. Please try again.");
    } finally {
      setSendingBillingOtp(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [printingDoc, setPrintingDoc] = useState(false);

  const endFileInputRef = useRef(null);
  const upiFileInputRef = useRef(null);

  // Load System Inventory when switching to SYSTEM mode
  const handleSwitchToSystemFleet = async () => {
    setFleetMode("SYSTEM");
    if (trip?.vendorId && !selectedSystemVendorId) {
      setSelectedSystemVendorId(String(trip.vendorId));
    }
    if (availableVehicles.length === 0) {
      setLoadingFleetList(true);
      try {
        const [vRes, dRes, vendRes] = await Promise.all([
          operationsApi.getVehicles("AVAILABLE").catch(() => ({ data: [] })),
          operationsApi.getDrivers("AVAILABLE").catch(() => ({ data: [] })),
          adminApi.getVendors().catch(() => ({ data: [] }))
        ]);
        setAvailableVehicles(vRes?.data || []);
        setAvailableDrivers(dRes?.data || []);
        setAvailableVendors(vendRes?.data || []);
      } finally {
        setLoadingFleetList(false);
      }
    }
  };

  // Live counts of available vehicles & drivers per vendor
  const vendorStatsMap = useMemo(() => {
    const stats = {};
    availableVehicles.forEach((v) => {
      const vid = String(v.vendorId || v.user?.id || "");
      if (vid) {
        if (!stats[vid]) stats[vid] = { cars: 0, drivers: 0 };
        stats[vid].cars += 1;
      }
    });
    availableDrivers.forEach((d) => {
      const vid = String(d.vendorId || d.user?.id || "");
      if (vid) {
        if (!stats[vid]) stats[vid] = { cars: 0, drivers: 0 };
        stats[vid].drivers += 1;
      }
    });
    return stats;
  }, [availableVehicles, availableDrivers]);

  // Filtered available vehicles based on chosen vendor
  const filteredVehicles = useMemo(() => {
    if (!selectedSystemVendorId) return availableVehicles;
    return availableVehicles.filter(
      (v) => String(v.vendorId || v.user?.id || "") === String(selectedSystemVendorId)
    );
  }, [availableVehicles, selectedSystemVendorId]);

  // Filtered available drivers based on chosen vendor
  const filteredDrivers = useMemo(() => {
    if (!selectedSystemVendorId) return availableDrivers;
    return availableDrivers.filter(
      (d) => String(d.vendorId || d.user?.id || "") === String(selectedSystemVendorId)
    );
  }, [availableDrivers, selectedSystemVendorId]);

  // Options for Searchable Vendor Select Combobox
  const vendorSelectOptions = useMemo(() => {
    return availableVendors.map((vend) => {
      const stats = vendorStatsMap[String(vend.id)] || { cars: 0, drivers: 0 };
      const carLabel = stats.cars === 1 ? "1 car" : `${stats.cars} cars`;
      const driverLabel = stats.drivers === 1 ? "1 driver" : `${stats.drivers} drivers`;
      return {
        value: vend.id,
        label: vend.businessName || vend.name,
        sublabel: vend.phone ? (vend.name ? `${vend.name} • ${vend.phone}` : vend.phone) : (vend.email || ""),
        badge: `${carLabel} • ${driverLabel} avail`,
        badgeColor: stats.cars > 0 ? "emerald" : "slate"
      };
    });
  }, [availableVendors, vendorStatsMap]);

  // Options for Searchable Vehicle Select Combobox
  const vehicleSelectOptions = useMemo(() => {
    return filteredVehicles.map((v) => {
      const reg = v.registrationNumber || v.vehicleNumber || "";
      const model = v.model || "Commercial Vehicle";
      const cat = v.category || v.vehicleType || "Cab";
      return {
        value: v.id || v.rawId,
        label: `${model} (${reg})`,
        sublabel: `${cat}${v.fuelType ? ` • ${v.fuelType}` : ""}${v.seatingCapacity ? ` • ${v.seatingCapacity} Seater` : ""}`,
        badge: reg,
        badgeColor: "blue"
      };
    });
  }, [filteredVehicles]);

  // Options for Searchable Driver Select Combobox
  const driverSelectOptions = useMemo(() => {
    return filteredDrivers.map((d) => {
      const name = d.name || "Chauffeur";
      const phone = d.phone || "";
      return {
        value: d.id || d.rawId,
        label: name,
        sublabel: phone ? `Phone: ${phone}` : "No phone registered",
        badge: phone ? phone : "Chauffeur",
        badgeColor: "emerald"
      };
    });
  }, [filteredDrivers]);

  // Handler for Vendor Selection
  const handleVendorSelect = (newVendorId) => {
    setSelectedSystemVendorId(newVendorId);
    // If the currently selected vehicle does not belong to this vendor, clear it
    if (newVendorId && selectedSystemVehicleId) {
      const veh = availableVehicles.find((v) => String(v.id || v.rawId) === String(selectedSystemVehicleId));
      if (veh && String(veh.vendorId || veh.user?.id || "") !== String(newVendorId)) {
        setSelectedSystemVehicleId("");
      }
    }
    // If the currently selected driver does not belong to this vendor, clear it
    if (newVendorId && selectedSystemDriverId) {
      const drv = availableDrivers.find((d) => String(d.id || d.rawId) === String(selectedSystemDriverId));
      if (drv && String(drv.vendorId || drv.user?.id || "") !== String(newVendorId)) {
        setSelectedSystemDriverId("");
      }
    }
  };

  // Handler for Vehicle Selection
  const handleVehicleSelect = (vehId) => {
    setSelectedSystemVehicleId(vehId);
    if (vehId) {
      const veh = availableVehicles.find((v) => String(v.id || v.rawId) === String(vehId));
      if (veh && (veh.vendorId || veh.user?.id)) {
        const vVendorId = String(veh.vendorId || veh.user?.id);
        if (selectedSystemVendorId !== vVendorId) {
          setSelectedSystemVendorId(vVendorId);
          // If current driver is from a different vendor, reset driver
          if (selectedSystemDriverId) {
            const drv = availableDrivers.find((d) => String(d.id || d.rawId) === String(selectedSystemDriverId));
            if (drv && String(drv.vendorId || drv.user?.id || "") !== vVendorId) {
              setSelectedSystemDriverId("");
            }
          }
        }
      }
    }
  };

  // Handler for Driver Selection
  const handleDriverSelect = (driverId) => {
    setSelectedSystemDriverId(driverId);
    if (driverId && !selectedSystemVendorId) {
      const drv = availableDrivers.find((d) => String(d.id || d.rawId) === String(driverId));
      if (drv && (drv.vendorId || drv.user?.id)) {
        setSelectedSystemVendorId(String(drv.vendorId || drv.user?.id));
      }
    }
  };

  // Odometer and Extra KM math
  const calculatedExtraKm = useMemo(() => {
    if (extraKmOverride !== "" && !isNaN(Number(extraKmOverride))) {
      return Math.max(0, Number(extraKmOverride));
    }
    const s = Number(startKm);
    const e = Number(endKm);
    if (!isNaN(s) && !isNaN(e) && e > s) {
      const actualDistance = e - s;
      return Math.max(0, actualDistance - includedKm);
    }
    return 0;
  }, [startKm, endKm, extraKmOverride, includedKm]);

  const actualTraveledKm = useMemo(() => {
    const s = Number(startKm);
    const e = Number(endKm);
    if (!isNaN(s) && !isNaN(e) && e >= s) {
      return e - s;
    }
    return null;
  }, [startKm, endKm]);

  // Live Financial Computations
  const calculations = useMemo(() => {
    const rate = Number(extraKmRate) || defaultRate;
    const extraKmCost = Math.round(calculatedExtraKm * rate);

    const toll = activeExtraKeys.includes("TOLL") ? Math.max(0, Number(tollCharges) || 0) : 0;
    const permit = activeExtraKeys.includes("PERMIT") ? Math.max(0, Number(permitCharges) || 0) : 0;
    const parking = activeExtraKeys.includes("PARKING") ? Math.max(0, Number(parkingCharges) || 0) : 0;
    const allowance = activeExtraKeys.includes("ALLOWANCE") ? Math.max(0, Number(driverAllowance) || 0) : 0;
    const other = activeExtraKeys.includes("OTHER") ? Math.max(0, Number(otherCharges) || 0) : 0;

    const totalExtrasBeforeGst = extraKmCost + toll + permit + parking + allowance + other;

    // 5% GST on extra items
    const extrasGst = Math.round(totalExtrasBeforeGst * 0.05);

    // Initial base fare already had 5% GST built in:
    const baseGstPortion = Math.round((initialBaseFare * 0.05) / 1.05);
    const totalGst = baseGstPortion + extrasGst;

    const grandTotalFare = initialBaseFare + totalExtrasBeforeGst + extrasGst;
    const balanceDue = Math.max(0, grandTotalFare - advancePaid);

    return {
      extraKmCost,
      toll,
      permit,
      parking,
      allowance,
      other,
      totalExtrasBeforeGst,
      extrasGst,
      totalGst,
      grandTotalFare,
      balanceDue
    };
  }, [
    calculatedExtraKm,
    extraKmRate,
    defaultRate,
    activeExtraKeys,
    tollCharges,
    permitCharges,
    parkingCharges,
    driverAllowance,
    otherCharges,
    initialBaseFare,
    advancePaid
  ]);

  const handleEndFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingEndProof(true);
      setErrorMessage("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setTimeout(() => {
          setEndOdometerPreview(reader.result);
          setUploadingEndProof(false);
        }, 300);
      };
      reader.onerror = () => {
        setUploadingEndProof(false);
        setErrorMessage("Failed to read image file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpiFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingUpiProof(true);
      setErrorMessage("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setTimeout(() => {
          setUpiProofFile(file);
          setUpiProofPreview(reader.result);
          setUploadingUpiProof(false);
        }, 300);
      };
      reader.onerror = () => {
        setUploadingUpiProof(false);
        setErrorMessage("Failed to read image file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleProceedToStep2 = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage("");
    setOtpError("");

    // Validate Fleet if unallocated or editing fleet
    if (!hasAssignedFleet || showFleetEdit) {
      if (fleetMode === "MANUAL") {
        if (!manualVehicleNumber.trim()) {
          setErrorMessage("Please enter the vehicle registration number (e.g. TN-09-CD-1234).");
          return;
        }
        if (!manualDriverName.trim()) {
          setErrorMessage("Please enter the chauffeur / driver name.");
          return;
        }
      } else if (fleetMode === "SYSTEM") {
        if (!selectedSystemVehicleId) {
          setErrorMessage("Please select an available vehicle from system inventory.");
          return;
        }
      }
    }

    const s = Number(startKm);
    const eKm = Number(endKm);

    if (!endKm || isNaN(eKm) || eKm <= 0) {
      setErrorMessage("Please enter a valid ending odometer reading (KM), or click 'Complete as Contracted Package'.");
      return;
    }

    if (!isNaN(s) && s > 0 && eKm < s) {
      setErrorMessage(`End odometer (${eKm} KM) cannot be less than start odometer (${s} KM).`);
      return;
    }

    const cleanOtp = billingOtp ? billingOtp.trim() : "";
    if (!cleanOtp || cleanOtp.length !== 6) {
      setOtpError("Please enter the 6-digit Customer Billing OTP shared by the guest.");
      setErrorMessage("");
      return;
    }

    if (billingOtpVerified) {
      setStep(2);
      return;
    }

    setVerifyingBillingOtp(true);
    try {
      await operationsApi.verifyBillingOtp(bookingIdentifier, cleanOtp);
      setBillingOtpVerified(true);
      setErrorMessage("");
      setOtpError("");
      setStep(2);
    } catch (err) {
      console.warn("Billing OTP verification failed via operations API:", err);
      const msg = err?.response?.data?.message || err?.message || "Invalid Billing OTP. Please check the closing KM in the vehicle odometer and confirm the OTP with the guest.";
      setOtpError(msg);
      setErrorMessage("");
      setBillingOtpVerified(false);
    } finally {
      setVerifyingBillingOtp(false);
    }
  };

  // Step 2 -> Proceed to Step 3
  const handleProceedToStep3 = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage("");
    setStep(3);
  };

  // Main Form Submit Router
  const handleFormSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (step === 1) {
      if (isOtpPhase) {
        if (canSendBillingOtp) {
          handleSendBillingOtp();
        }
      } else {
        handleProceedToStep2(e);
      }
    } else if (step === 2) {
      handleProceedToStep3(e);
    } else if (step === 3) {
      handleSubmitFinal(e);
    }
  };

  // Final Step 3 Submit -> Finalize Bill & Complete Trip
  const handleSubmitFinal = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage("");

    if (paymentMethod === "UPI" && calculations.balanceDue > 0 && !upiProofFile && !upiProofPreview) {
      setErrorMessage("Please capture or upload the UPI payment screenshot/proof before finalizing.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        // Fleet & Vendor Allocations / Overrides
        assignedVehicleId: fleetMode === "SYSTEM" && selectedSystemVehicleId ? selectedSystemVehicleId : null,
        assignedDriverId: fleetMode === "SYSTEM" && selectedSystemDriverId ? selectedSystemDriverId : null,
        vendorId: fleetMode === "SYSTEM" && selectedSystemVendorId ? selectedSystemVendorId : null,
        manualVehicleNumber: fleetMode === "MANUAL" && manualVehicleNumber.trim() ? manualVehicleNumber.trim().toUpperCase() : null,
        manualVehicleModel: fleetMode === "MANUAL" && manualVehicleModel.trim() ? manualVehicleModel.trim() : null,
        manualDriverName: fleetMode === "MANUAL" && manualDriverName.trim() ? manualDriverName.trim() : null,
        manualDriverPhone: fleetMode === "MANUAL" && manualDriverPhone.trim() ? manualDriverPhone.trim() : null,
        manualVendorName: fleetMode === "MANUAL" && manualVendorName.trim() ? manualVendorName.trim() : null,
        vendorPayout: vendorPayout !== "" && !isNaN(Number(vendorPayout)) ? Number(vendorPayout) : null,

        // Telemetry & Extras
        startKm: startKm ? Number(startKm) : 0,
        endKm: endKm ? Number(endKm) : (includedKm || 0),
        actualKm: actualTraveledKm != null ? actualTraveledKm : (includedKm || 0),
        extraKm: calculatedExtraKm,
        extraKmRate: Number(extraKmRate) || defaultRate,
        tollCharges: calculations.toll,
        permitCharges: calculations.permit,
        parkingCharges: calculations.parking,
        driverAllowance: calculations.allowance,
        otherCharges: calculations.other,
        otherChargesNotes: otherChargesNotes.trim() || null,
        closingNotes: closingNotes.trim() || null,
        paymentMethod: paymentMethod || "CASH",
        paymentProofUrl: upiProofPreview || null,
        startOdometerProofUrl: trip?.startOdometerProofUrl || trip?.startOdometerProof || null,
        endOdometerProofUrl: endOdometerPreview || null,
        billingOtp: billingOtp.trim() || null
      };

      const bookingIdentifier = trip?.rawId || trip?.bookingReference || trip?.id;
      const res = await operationsApi.completeTrip(bookingIdentifier, payload);
      const updated = res?.data || res;

      setCompletedSuccess(updated || { ...trip, ...payload, ...calculations });
      if (onTripCompleted) {
        onTripCompleted(updated);
      }
      if (onSuccess) {
        onSuccess(updated);
      }
    } catch (err) {
      console.error("Failed to complete trip via operations:", err);
      setErrorMessage(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to finalize trip fare. Please verify input numbers and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !trip) return null;

  const pickupDisplay = trip.pickupAddress || trip.pickupCity || trip.pickup || "Origin";
  const dropDisplay = trip.dropAddress || trip.dropCity || trip.drop || "Destination";
  const bookingRef = trip.bookingReference || trip.id;

  const paymentOptions = [
    { id: "CASH", label: "Cash", icon: Banknote, desc: "Collected in cash by driver / counter", shortDesc: "Cash" },
    { id: "UPI", label: "UPI / QR", icon: QrCode, desc: "Google Pay, PhonePe, Paytm QR", shortDesc: "UPI / QR" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base tracking-tight text-white">
                  Trip Closing &amp; Settlement
                </h3>
                <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                  Admin Fallback
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">
                Booking Ref: <strong className="text-white">#{bookingRef}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Step Wizard Navigation */}
        {!completedSuccess && (
          <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200/80 text-[11px] shrink-0">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`py-2 px-1 font-black flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                step === 1
                  ? "text-amber-900 bg-amber-500/15 border-b-2 border-amber-500"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[9px] sm:text-[10px] flex items-center justify-center ${
                step === 1 ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-200 text-slate-600"
              }`}>
                1
              </span>
              <span className="hidden sm:inline">Vehicle &amp; Odometer</span>
              <span className="sm:hidden font-bold">1. Vehicle/KM</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                if (step === 1) handleProceedToStep2(e);
                else setStep(2);
              }}
              className={`py-2 px-1 font-black flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                step === 2
                  ? "text-amber-900 bg-amber-500/15 border-b-2 border-amber-500"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[9px] sm:text-[10px] flex items-center justify-center ${
                step === 2 ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-200 text-slate-600"
              }`}>
                2
              </span>
              <span className="hidden sm:inline">Extra Charges</span>
              <span className="sm:hidden font-bold">2. Extras</span>
            </button>

            <div
              className={`py-2 px-1 font-black flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${
                step === 3
                  ? "text-amber-900 bg-amber-500/15 border-b-2 border-amber-500"
                  : "text-slate-400"
              }`}
            >
              <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[9px] sm:text-[10px] flex items-center justify-center ${
                step === 3 ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-200 text-slate-600"
              }`}>
                3
              </span>
              <span className="hidden sm:inline">Payment &amp; Bill</span>
              <span className="sm:hidden font-bold">3. Payment</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        {completedSuccess ? (
          /* Celebratory Success Screen */
          <div className="p-6 sm:p-10 text-center space-y-5 overflow-y-auto flex-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-50 animate-bounce">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Trip Completed &amp; Billed!</h3>
              <p className="text-xs text-slate-600">
                Official Tax Invoice generated for Booking <strong>#{bookingRef}</strong>.
              </p>
            </div>

            {/* Quick Financial Summary */}
            <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Final Billed Fare:</span>
                <strong className="text-slate-900 font-black">{formatINR(completedSuccess.finalTotalFare || calculations.grandTotalFare)}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Mode:</span>
                <strong className="text-slate-900 font-bold uppercase">{paymentMethod}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Balance Collected:</span>
                <strong className="text-emerald-700 font-black">{formatINR(calculations.balanceDue)}</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={printingDoc}
                onClick={async () => {
                  setPrintingDoc(true);
                  try {
                    await printDocumentPdf(bookingRef, 3);
                  } finally {
                    setPrintingDoc(false);
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                {printingDoc ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Printer className="w-4 h-4 text-white" />}
                Print Tax Invoice
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onTripCompleted) onTripCompleted(completedSuccess);
                  if (onSuccess) onSuccess(completedSuccess);
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Close &amp; Return
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5">
              {/* Quick Trip Route Banner */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5 text-xs">
                <div>
                  <span className="text-[9px] font-black uppercase text-amber-800 tracking-wider block">
                    Trip Route
                  </span>
                  <p className="font-black text-slate-900 text-xs sm:text-sm break-words leading-snug mt-0.5">
                    {pickupDisplay} → {dropDisplay}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-[10px] sm:text-[11px] flex-wrap pt-0.5 border-t border-amber-500/15">
                  {customerRouteKm > 0 && (
                    <span className="inline-flex items-center gap-1 text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                      <Navigation className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                      {customerRouteKm} KM Booked
                    </span>
                  )}
                  <span>Pkg: <strong>{includedKm} KM</strong></span>
                  <span>•</span>
                  <span>Rate: <strong>₹{defaultRate}/KM</strong></span>
                </div>
                {customerAddons.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-amber-500/15">
                    <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider">
                      Booked Addons:
                    </span>
                    {customerAddons.map((addon, aIdx) => (
                      <span
                        key={aIdx}
                        className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/90 border border-amber-200/80 text-amber-950 px-2 py-0.5 rounded-md shadow-2xs"
                      >
                        <span>{addon.emoji || "🎁"}</span>
                        <span>{addon.name || addon.label}</span>
                        {(addon.price || addon.fee) > 0 && (
                          <span className="text-amber-700 font-black">({formatINR(addon.price || addon.fee)})</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ============================================================ */}
              {/* STEP 1: FLEET & CHAUFFEUR CHECK + ODOMETER TELEMETRY */}
              {/* ============================================================ */}
              {step === 1 && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  {/* Fleet & Chauffeur Assignment / Override */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-blue-600" />
                        Vehicle &amp; Chauffeur Details
                      </h4>
                      {hasAssignedFleet && (
                        <button
                          type="button"
                          onClick={() => setShowFleetEdit((prev) => !prev)}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                        >
                          {showFleetEdit ? "Keep Assigned" : "Change / Override"}
                        </button>
                      )}
                    </div>

                    {!showFleetEdit && hasAssignedFleet ? (
                      /* Verified Fleet Card */
                      <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="text-xs">
                            <span className="font-bold text-slate-900">
                              {trip.vehicleModel || trip.vehicleCategory || "Commercial AC Cab"} ({trip.vehicleNumber})
                            </span>
                            <span className="text-slate-500 block text-[11px]">
                              Chauffeur: <strong>{trip.driverName || "Assigned Driver"}</strong> {trip.driverPhone ? `(${trip.driverPhone})` : ""}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Assigned
                        </span>
                      </div>
                    ) : (
                      /* Fleet Input / Selection */
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-amber-800 font-medium bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60 w-full flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            {!hasAssignedFleet ? "No vehicle assigned yet. Enter details below to finalize tax invoice:" : "Edit vehicle details for this trip closing:"}
                          </p>
                        </div>

                        {/* Mode Selector Tabs */}
                        <div className="grid grid-cols-2 p-0.5 rounded-xl bg-slate-200/70 text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => setFleetMode("MANUAL")}
                            className={`py-1.5 text-center rounded-lg transition-all cursor-pointer ${
                              fleetMode === "MANUAL"
                                ? "bg-white text-slate-900 shadow-2xs"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            <span className="sm:hidden">✍️ Manual Entry</span>
                            <span className="hidden sm:inline">✍️ Manual Entry (Type Details)</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleSwitchToSystemFleet}
                            className={`py-1.5 text-center rounded-lg transition-all cursor-pointer ${
                              fleetMode === "SYSTEM"
                                ? "bg-white text-slate-900 shadow-2xs"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            <span className="sm:hidden">🏢 Saved Vehicles</span>
                            <span className="hidden sm:inline">🏢 Select from Saved Vehicles</span>
                          </button>
                        </div>

                        {fleetMode === "MANUAL" ? (
                          /* Manual Text Fields */
                          <div className="space-y-2 pt-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold uppercase text-slate-700 block mb-0.5">
                                  Vehicle Reg No. <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. TN-09-CD-1234"
                                  value={manualVehicleNumber}
                                  onChange={(e) => setManualVehicleNumber(e.target.value.toUpperCase())}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold uppercase text-slate-700 block mb-0.5">
                                  Vehicle Model
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Toyota Innova Crysta"
                                  value={manualVehicleModel}
                                  onChange={(e) => setManualVehicleModel(e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold uppercase text-slate-700 block mb-0.5">
                                  Chauffeur Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Murugan S"
                                  value={manualDriverName}
                                  onChange={(e) => setManualDriverName(e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold uppercase text-slate-700 block mb-0.5">
                                  Chauffeur Phone
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. +91 9876543210"
                                  value={manualDriverPhone}
                                  onChange={(e) => setManualDriverPhone(e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold uppercase text-slate-700 block mb-0.5">
                                Vendor / Cab Operator Name
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. In-House Fleet / Sri Travels"
                                value={manualVendorName}
                                onChange={(e) => setManualVendorName(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        ) : (
                          /* System Inventory Dropdowns */
                          <div className="space-y-2 pt-1">
                            {loadingFleetList ? (
                              <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                                Loading available vehicles & drivers...
                              </div>
                            ) : (
                              <>
                                {/* 1. Primary Filter: Searchable Vendor Partner */}
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-700 flex items-center gap-1">
                                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                      <span>1. Select Vendor Partner</span>
                                    </label>
                                    {selectedSystemVendorId && (
                                      <button
                                        type="button"
                                        onClick={() => handleVendorSelect("")}
                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                      >
                                        Show All Vendors
                                      </button>
                                    )}
                                  </div>
                                  <SearchableSelect
                                    value={selectedSystemVendorId}
                                    onChange={handleVendorSelect}
                                    options={vendorSelectOptions}
                                    placeholder="-- Choose or Search Vendor Partner --"
                                    searchPlaceholder="Search vendor name, contact, or phone..."
                                    allOptionLabel="-- All Vendors / In-House Vehicles --"
                                    allOptionBadge={`${availableVehicles.length} cars • ${availableDrivers.length} drivers`}
                                    onClear={() => handleVendorSelect("")}
                                    icon={Building2}
                                  />
                                </div>

                                {/* 2. Two-Column Grid: Vehicle & Chauffeur */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                  {/* Select Vehicle */}
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="text-[10px] font-bold uppercase text-slate-700 block">
                                        2. Select Vehicle <span className="text-rose-500">*</span>
                                      </label>
                                      <span className="text-[10px] text-slate-500 font-bold">
                                        {filteredVehicles.length} available
                                      </span>
                                    </div>
                                    <SearchableSelect
                                      value={selectedSystemVehicleId}
                                      onChange={handleVehicleSelect}
                                      options={vehicleSelectOptions}
                                      placeholder={filteredVehicles.length > 0 ? "-- Choose or Search Vehicle --" : "-- No Cars Available --"}
                                      searchPlaceholder="Search reg number, model, category..."
                                      onClear={() => setSelectedSystemVehicleId("")}
                                      disabled={filteredVehicles.length === 0}
                                      icon={Car}
                                    />
                                    {filteredVehicles.length === 0 && selectedSystemVendorId && (
                                      <p className="text-[10px] text-amber-700 font-medium mt-1">
                                        ⚠️ This vendor has no available cars. Switch vendor or use Manual Entry.
                                      </p>
                                    )}
                                  </div>

                                  {/* Select Chauffeur */}
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="text-[10px] font-bold uppercase text-slate-700 block">
                                        3. Select Chauffeur
                                      </label>
                                      <span className="text-[10px] text-slate-500 font-bold">
                                        {filteredDrivers.length} available
                                      </span>
                                    </div>
                                    <SearchableSelect
                                      value={selectedSystemDriverId}
                                      onChange={handleDriverSelect}
                                      options={driverSelectOptions}
                                      placeholder={filteredDrivers.length > 0 ? "-- Choose or Search Chauffeur --" : "-- No Chauffeurs Available --"}
                                      searchPlaceholder="Search driver name or phone..."
                                      onClear={() => setSelectedSystemDriverId("")}
                                      disabled={filteredDrivers.length === 0}
                                      icon={User}
                                    />
                                    {filteredDrivers.length === 0 && selectedSystemVendorId && (
                                      <p className="text-[10px] text-amber-700 font-medium mt-1">
                                        ⚠️ This vendor has no available chauffeurs.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Odometer Telemetry Card */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-amber-500" />
                        Odometer Telemetry &amp; Distance Audit
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium">Step 1 of 3</span>
                    </div>

                    {/* 1-Click Fast Package Shortcut Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setStartKm("0");
                        setEndKm(String(includedKm || 250));
                        setExtraKmOverride("0");
                        setErrorMessage("");
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>⚡ Complete as Contracted Package ({includedKm} KM — Extra KM: 0)</span>
                    </button>

                    {/* Start & End Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Start Odometer */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-600">
                            Start Odometer (KM)
                          </label>
                          {trip.startKm != null && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Recorded
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={startKm}
                            onChange={(e) => setStartKm(e.target.value)}
                            placeholder="e.g. 10000"
                            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-black text-slate-800 focus:outline-none focus:border-amber-500"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            KM
                          </span>
                        </div>
                      </div>

                      {/* End Odometer */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-800">
                            End Odometer (KM) <span className="text-rose-500">*</span>
                          </label>
                          {startKm && !endKm && customerRouteKm > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setEndKm(String(Number(startKm) + customerRouteKm));
                                setErrorMessage("");
                              }}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                            >
                              +{customerRouteKm} KM (Route)
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            placeholder="e.g. 10520"
                            value={endKm}
                            onChange={(e) => {
                              setEndKm(e.target.value);
                              setErrorMessage("");
                            }}
                            className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-300 text-sm font-black text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            KM
                          </span>
                        </div>
                        {/* Customer Billing OTP Input in Step 1 (Revealed once OTP is requested or exists) */}
                        {(billingOtpSent || (billingOtp && billingOtp.length > 0)) && (
                          <div className="mt-2.5 pt-2 border-t border-amber-200/70 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] sm:text-[11px] font-bold text-slate-800 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                                <span>Guest Billing OTP</span>
                              </label>
                              <button
                                type="button"
                                onClick={handleSendBillingOtp}
                                disabled={sendingBillingOtp || !canSendBillingOtp}
                                className="text-[10px] font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer disabled:opacity-50"
                              >
                                {sendingBillingOtp ? "Sending..." : "Resend SMS"}
                              </button>
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                autoFocus
                                value={billingOtp}
                                onChange={(e) => {
                                  setBillingOtp(e.target.value.replace(/\D/g, ""));
                                  setBillingOtpVerified(false);
                                  setOtpError("");
                                  setErrorMessage("");
                                }}
                                placeholder="Enter 6-digit OTP"
                                className={`w-full px-3 py-2 text-sm font-mono tracking-widest text-slate-900 rounded-xl focus:outline-none focus:ring-2 font-bold placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400 transition-colors ${
                                  otpError
                                    ? "bg-rose-50/50 border border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                                    : billingOtpVerified
                                    ? "bg-emerald-50/50 border border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                                    : "bg-amber-50/40 border border-amber-300 focus:border-amber-500 focus:ring-amber-500/20"
                                }`}
                              />
                              {verifyingBillingOtp && (
                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                  <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                                </div>
                              )}
                              {!verifyingBillingOtp && billingOtpVerified && (
                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                </div>
                              )}
                              {!verifyingBillingOtp && otpError && (
                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                  <AlertCircle className="w-4 h-4 text-rose-500" />
                                </div>
                              )}
                            </div>
                            {otpError && (
                              <p className="mt-1 text-[10px] font-bold text-rose-600 flex items-center gap-1 animate-in fade-in">
                                <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                <span>{otpError}</span>
                              </p>
                            )}
                            {billingOtpSuccessMsg && !otpError && (
                              <p className="mt-1 text-[10px] font-medium text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{billingOtpSuccessMsg}</span>
                              </p>
                            )}
                            <p className="mt-1 text-[10px] text-slate-500 leading-tight">
                              Ask the guest to check the closing odometer ({endKm || 0} KM) on their SMS and share this OTP.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* End Photo Proof */}
                    <div className="pt-2 border-t border-slate-200/80">
                      <label className="text-[10px] sm:text-[11px] font-bold text-slate-700 block mb-1">
                        End Odometer Photo Proof (Optional / Recommended)
                      </label>
                      <input
                        ref={endFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleEndFileChange}
                      />

                      {endOdometerPreview ? (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group max-h-40 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={endOdometerPreview}
                            alt="End Odometer Proof"
                            className="max-h-40 w-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setEndOdometerPreview(null);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => endFileInputRef.current?.click()}
                          disabled={uploadingEndProof}
                          className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-white hover:bg-amber-50/30 text-slate-600 hover:text-amber-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          {uploadingEndProof ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                              <span>Reading photo...</span>
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4 text-amber-500" />
                              <span>Upload End Odometer Dashboard Photo</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Distance Preview Pill */}
                    {actualTraveledKm !== null && (
                      <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/60 text-xs flex items-center justify-between">
                        <span className="text-slate-600">Calculated Distance:</span>
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <span>{actualTraveledKm} KM Actual</span>
                          {calculatedExtraKm > 0 ? (
                            <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md font-black">
                              +{calculatedExtraKm} KM Extra
                            </span>
                          ) : (
                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md text-[10px]">
                              Within Package
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* STEP 2: EXTRA CHARGES & ON-ROAD EXPENSES */}
              {/* ============================================================ */}
              {step === 2 && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  {/* Extra KM Rate & Distance Adjustment */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-amber-500" />
                        Extra Kilometers &amp; Per-KM Rate
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium">Step 2 of 3</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">
                          Extra KM
                        </label>
                        <input
                          type="number"
                          value={extraKmOverride !== "" ? extraKmOverride : calculatedExtraKm}
                          onChange={(e) => setExtraKmOverride(e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm font-black text-slate-900 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">
                          Rate / Extra KM (₹)
                        </label>
                        <input
                          type="number"
                          value={extraKmRate}
                          onChange={(e) => setExtraKmRate(e.target.value)}
                          placeholder="14"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm font-black text-slate-900 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {calculatedExtraKm > 0 && (
                      <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/80">
                        <span className="text-slate-600">Extra KM Cost:</span>
                        <strong className="text-slate-900">{formatINR(calculations.extraKmCost)}</strong>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Extra Charges Builder */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-amber-500" />
                        In-Trip Expenses &amp; On-Road Extras
                      </h4>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                        5% GST Auto-Calculated
                      </span>
                    </div>

                    {/* Active Extra Charge Rows */}
                    {activeExtraKeys.length === 0 ? (
                      <div className="py-4 text-center rounded-xl border border-dashed border-slate-300 bg-white/60 text-xs text-slate-500">
                        No extra charges added. Use the selector below if tolls, parking, or permits were incurred.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activeExtraKeys.map((key) => {
                          const config = EXTRA_CHARGE_CONFIG.find((c) => c.id === key);
                          let val = "";
                          let setVal = () => {};
                          if (key === "TOLL") { val = tollCharges; setVal = setTollCharges; }
                          else if (key === "PERMIT") { val = permitCharges; setVal = setPermitCharges; }
                          else if (key === "PARKING") { val = parkingCharges; setVal = setParkingCharges; }
                          else if (key === "ALLOWANCE") { val = driverAllowance; setVal = setDriverAllowance; }
                          else if (key === "OTHER") { val = otherCharges; setVal = setOtherCharges; }

                          return (
                            <div
                              key={key}
                              className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 animate-in fade-in"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-base">{config?.icon}</span>
                                  <span className="text-xs font-bold text-slate-800 truncate">
                                    {config?.label}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="relative w-28">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                      ₹
                                    </span>
                                    <input
                                      type="number"
                                      placeholder={config?.placeholder}
                                      value={val}
                                      onChange={(e) => setVal(e.target.value)}
                                      className="w-full pl-6 pr-2 py-1.5 text-xs font-black text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                                    />
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveExtraCharge(key)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {key === "TOLL" && customerAddons.some((a) => a.id === "fastag_pass" || /fastag/i.test(a.name || a.label || "")) && (
                                <p className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200/60 rounded px-2 py-1">
                                  ℹ️ Customer pre-paid Expressway FASTag Pass. Enter additional tolls only if exceeding covered plazas.
                                </p>
                              )}
                              {config?.hasNotes && (
                                <input
                                  type="text"
                                  placeholder="Describe extra expense (e.g. state entry permit)"
                                  value={otherChargesNotes}
                                  onChange={(e) => setOtherChargesNotes(e.target.value)}
                                  className="w-full px-2.5 py-1 text-[11px] text-slate-700 border border-slate-200 rounded-md focus:outline-none focus:border-amber-500 bg-slate-50/50"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Extra Charge Dropdown Bar */}
                    {availableChargeOptions.length > 0 && (
                      <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                        <select
                          value={selectedChargeType}
                          onChange={(e) => setSelectedChargeType(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="">+ Add an Extra Charge Category...</option>
                          {availableChargeOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.icon} {opt.label}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          disabled={!selectedChargeType}
                          onClick={handleAddExtraCharge}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 text-xs font-black transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </button>
                      </div>
                    )}

                    {/* Live Extras Subtotal & GST */}
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                      <div className="flex justify-between text-slate-700">
                        <span>Extras Subtotal:</span>
                        <strong>{formatINR(calculations.totalExtrasBeforeGst)}</strong>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>5% GST on Extras:</span>
                        <strong>{formatINR(calculations.extrasGst)}</strong>
                      </div>
                      <div className="flex justify-between text-amber-900 font-black pt-1 border-t border-amber-500/20">
                        <span>Total Extra Payable:</span>
                        <span>{formatINR(calculations.totalExtrasBeforeGst + calculations.extrasGst)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* STEP 3: PAYMENT COLLECTION, VENDOR PAYOUT & INVOICE */}
              {/* ============================================================ */}
              {step === 3 && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  {/* Comprehensive Financial Summary */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2 text-xs">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 mb-2">
                      <FileText className="w-3.5 h-3.5 text-amber-500" />
                      Final Trip Billing Ledger (SAC 9966)
                    </h4>

                    <div className="flex justify-between text-slate-600">
                      <span>Contracted Base Fare (Includes Package GST):</span>
                      <strong className="text-slate-900">{formatINR(initialBaseFare)}</strong>
                    </div>

                    {customerAddons.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 space-y-1.5 my-1.5">
                        <div className="flex items-center justify-between text-[11px] font-black text-amber-900 border-b border-amber-200/50 pb-1">
                          <span className="flex items-center gap-1">
                            <span>🎁</span>
                            <span>Included Customer Addons:</span>
                          </span>
                          <span className="font-extrabold">{formatINR(customerAddonsTotal)}</span>
                        </div>
                        <div className="space-y-1">
                          {customerAddons.map((add, aIdx) => (
                            <div key={aIdx} className="flex justify-between items-center text-[11px] text-slate-700">
                              <span className="flex items-center gap-1.5 truncate">
                                <span>{add.emoji || "•"}</span>
                                <span className="font-medium truncate">{add.name || add.label}</span>
                              </span>
                              <span className="font-bold text-slate-900 shrink-0">
                                {formatINR(add.price || add.fee || 0)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-amber-800/80 italic pt-0.5 border-t border-amber-200/40">
                          * Addons are pre-paid and included within the Contracted Base Fare.
                        </p>
                      </div>
                    )}

                    {calculations.totalExtrasBeforeGst > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>In-Trip Extras (KM + Tolls + Parking + Allowance):</span>
                        <strong className="text-slate-900">+{formatINR(calculations.totalExtrasBeforeGst)}</strong>
                      </div>
                    )}

                    {calculations.extrasGst > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Applicable GST on Extras (5%):</span>
                        <strong className="text-slate-900">+{formatINR(calculations.extrasGst)}</strong>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-900 font-bold pt-1.5 border-t border-slate-200">
                      <span>Gross Final Fare:</span>
                      <strong className="text-sm font-black">{formatINR(calculations.grandTotalFare)}</strong>
                    </div>

                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Advance Collected Online:</span>
                      <span>-{formatINR(advancePaid)}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/10 border border-amber-500/30 font-black text-slate-900 text-sm">
                      <span className="text-amber-900">Balance Due to Collect:</span>
                      <span className="text-base text-amber-950">{formatINR(calculations.balanceDue)}</span>
                    </div>
                  </div>

                  {/* Vendor Net Payout Input */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-700 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        Vendor Net Payout (Payable to Vendor)
                      </label>
                      <span className="text-[10px] text-slate-400">Recorded on Ledger</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        placeholder="e.g. 3200"
                        value={vendorPayout}
                        onChange={(e) => setVendorPayout(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Payment Collection Method */}
                  {calculations.balanceDue > 0 ? (
                    <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <label className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-800 block">
                        Collection Mode for Balance ({formatINR(calculations.balanceDue)})
                      </label>

                      <div className="grid grid-cols-2 gap-2.5">
                        {paymentOptions.map((opt) => {
                          const Icon = opt.icon;
                          const isSelected = paymentMethod === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setPaymentMethod(opt.id)}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? "border-amber-500 bg-amber-500/10 shadow-2xs"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className={`w-4 h-4 ${isSelected ? "text-amber-600" : "text-slate-500"}`} />
                                <strong className="text-xs text-slate-900">{opt.label}</strong>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-snug">{opt.desc}</p>
                            </button>
                          );
                        })}
                      </div>

                      {/* UPI Screenshot Proof */}
                      {paymentMethod === "UPI" && (
                        <div className="pt-2 border-t border-slate-200/80 animate-in fade-in space-y-2">
                          <label className="text-[10px] sm:text-[11px] font-bold text-slate-800 block">
                            UPI Screenshot Proof <span className="text-rose-500">*</span>
                          </label>
                          <input
                            ref={upiFileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleUpiFileChange}
                          />

                          {upiProofPreview ? (
                            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group max-h-40 flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={upiProofPreview}
                                alt="UPI Payment Proof"
                                className="max-h-40 w-full object-contain"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setUpiProofFile(null);
                                  setUpiProofPreview(null);
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => upiFileInputRef.current?.click()}
                              disabled={uploadingUpiProof}
                              className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-white hover:bg-amber-50/30 text-slate-600 hover:text-amber-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                              {uploadingUpiProof ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                                  <span>Reading receipt...</span>
                                </>
                              ) : (
                                <>
                                  <QrCode className="w-4 h-4 text-amber-500" />
                                  <span>Upload / Capture UPI Payment Screenshot</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/60 text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>This trip is already fully paid by online advance. Zero balance due from guest.</span>
                    </div>
                  )}

                  {/* Closing Notes */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                    <label className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-600 block">
                      Admin Settlement Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={closingNotes}
                      onChange={(e) => setClosingNotes(e.target.value)}
                      placeholder="e.g. Completed via Admin Fallback. Guest paid cash on drop-off. Vehicle released."
                      className="w-full px-3 py-2 text-xs text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 bg-white resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}

              {step === 1 ? (
                <div className="flex items-center gap-2">
                  {isOtpPhase ? (
                    <>
                      {!canSendBillingOtp && (
                        <span className="text-[10px] text-slate-400 font-medium hidden sm:inline-block">
                          Enter closing KM to send OTP
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleSendBillingOtp}
                        disabled={sendingBillingOtp || !canSendBillingOtp}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                          canSendBillingOtp && !sendingBillingOtp
                            ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer"
                            : "bg-slate-200 text-slate-400 border border-slate-300/60 cursor-not-allowed opacity-75 shadow-none"
                        }`}
                      >
                        {sendingBillingOtp ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                            <span>Sending Billing OTP SMS...</span>
                          </>
                        ) : (
                          <>
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Send Billing OTP SMS</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      {!canProceedToStep2 && (
                        <span className="text-[10px] text-slate-400 font-medium hidden sm:inline-block">
                          Enter 6-digit OTP to proceed
                        </span>
                      )}
                      <button
                        type="button"
                        disabled={verifyingBillingOtp || !canProceedToStep2}
                        onClick={handleProceedToStep2}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                          canProceedToStep2 && !verifyingBillingOtp
                            ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer"
                            : "bg-slate-200 text-slate-400 border border-slate-300/60 cursor-not-allowed opacity-75 shadow-none"
                        }`}
                      >
                        {verifyingBillingOtp ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                            <span>Verifying OTP...</span>
                          </>
                        ) : (
                          <>
                            <span>Proceed to Expenses</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              ) : step === 2 ? (
                <button
                  type="button"
                  onClick={handleProceedToStep3}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <span>Proceed to Settlement</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Finalizing Settlement...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Finalize Bill &amp; Complete Trip</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
