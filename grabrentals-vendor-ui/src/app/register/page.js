"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  User,
  Car,
  Users,
  FileText,
  Calendar,
  AlertCircle,
  Clock,
  Check,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink,
  UploadCloud,
  Mail,
  MapPin,
  Home,
  PhoneCall,
  Camera,
  Image as ImageIcon,
  Fuel,
  Gauge,
  Tv,
  Wind,
  Navigation,
  Star,
  Zap,
  Eye,
  CheckSquare,
  Award,
} from "lucide-react";
import {
  sendOtp,
  verifyVendorOtp,
  getCurrentUser,
  isAuthenticated,
  getOnboardingData,
  saveOnboardingData,
} from "@/lib/auth";
import { vendorApi } from "@/lib/vendorApi";
import { uploadSignedToCloudinary } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";
import InteractiveMapPicker from "@/components/ui/InteractiveMapPicker";
import MultipleVehiclePhotoUploader from "@/components/ui/MultipleVehiclePhotoUploader";
import CitySelectorModal from "@/components/ui/CitySelectorModal";

const VEHICLE_SUB_CATEGORIES = {
  Sedan: ["Dzire", "Etios", "Aura"],
  Hatchback: ["WagonR", "Swift"],
  SUV: ["Xylo", "Ertiga", "Carens", "Marazzo"],
  Innova: ["6+1 Seater", "7+1 Seater"],
  Innovacrysta: ["6+1 Seater", "7+1 Seater"],
  innovahycross: ["6+1 Seater", "7+1 Seater"],
  Tempo: ["12+1 Seater", "13+1 Seater"],
  urbania: ["10+1 Seater", "12+1 Seater", "16+1 Seater"],
  Bus: ["21 Seater", "32 Seater", "40 Seater", "45 Seater"],
  Benz: ["E-Class", "S-Class", "C-Class"],
};

function VendorOnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isResumeMode = searchParams.get("resume") === "true";

  // Flow Step:
  // 0: Phone & OTP Verification (Account creation)
  // 1: Personal & Contact Details (Name, Phone, Alternate Phone, Email, Operating City)
  // 2: Business Profile (Do you own a business? Yes/No + Details)
  // 3: Operating Model (I Drive My Own Fleet vs Multiple Fleet & Vehicles)
  // 4: Vehicle & Driver Setup (Proofs with Expiry Dates)
  const [currentStep, setCurrentStep] = useState(0);

  // Authentication & Phone OTP State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [email, setEmail] = useState("");
  const [userCity, setUserCity] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Step 1: Identity & Address Proofs
  const [idProofDocument, setIdProofDocument] = useState("");
  const [addressProofDocument, setAddressProofDocument] = useState("");

  // Step 1: Business Profile State (Default: Individual Partner)
  const [ownsBusiness, setOwnsBusiness] = useState(false); // false = Individual Partner
  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [businessType, setBusinessType] = useState("Private Limited");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessCity, setBusinessCity] = useState("");
  const [businessState, setBusinessState] = useState("");
  const [businessPincode, setBusinessPincode] = useState("");
  const [businessProofDocument, setBusinessProofDocument] = useState("");
  const [gstDocument, setGstDocument] = useState("");
  const [panDocument, setPanDocument] = useState("");

  // Step 2: Fleet Model Choice State
  // 1: "I Drive My Own Fleet" (Owner-Driver)
  // 2: "I Have Multiple Fleet & Multiple Vehicles" (Fleet Operator)
  const [fleetModel, setFleetModel] = useState(null);

  // Step 3: Single Vehicle & Driver State (for Model 1)
  const [driverLicenseNumber, setDriverLicenseNumber] = useState("");
  const [driverLicenseExpiry, setDriverLicenseExpiry] = useState("");
  const [driverLicenseDocument, setDriverLicenseDocument] = useState("");

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleCategory, setVehicleCategory] = useState("Sedan");
  const [vehicleSubCategory, setVehicleSubCategory] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [seatingCapacity, setSeatingCapacity] = useState("4");
  const [fuelType, setFuelType] = useState("Diesel");
  const [vehicleImage, setVehicleImage] = useState("");
  const [vehiclePhotos, setVehiclePhotos] = useState([]);
  const [vehiclePhotoSlots, setVehiclePhotoSlots] = useState({
    front: "",
    back: "",
    left: "",
    right: "",
    luggage: "",
    frontSeats: "",
    backSeats: "",
    handle: "",
  });

  const [plateCheckWarning, setPlateCheckWarning] = useState("");
  const [checkingPlate, setCheckingPlate] = useState(false);

  // Proofs with Expiry Dates (for Model 1 and Model 2)
  const [rcNumber, setRcNumber] = useState("");
  const [rcExpiry, setRcExpiry] = useState("");
  const [rcDocument, setRcDocument] = useState("");

  const [insuranceNumber, setInsuranceNumber] = useState("");
  const [insuranceExpiry, setInsuranceExpiry] = useState("");
  const [insuranceDocument, setInsuranceDocument] = useState("");

  const [fitnessNumber, setFitnessNumber] = useState("");
  const [fitnessExpiry, setFitnessExpiry] = useState("");
  const [fitnessDocument, setFitnessDocument] = useState("");

  const [permitNumber, setPermitNumber] = useState("");
  const [permitExpiry, setPermitExpiry] = useState("");
  const [permitDocument, setPermitDocument] = useState("");

  const [pucNumber, setPucNumber] = useState("");
  const [pucExpiry, setPucExpiry] = useState("");
  const [pucDocument, setPucDocument] = useState("");

  // Step 3: Multi-vehicle and Driver List (for Model 2)
  const [vehiclesList, setVehiclesList] = useState([]);
  const [driversList, setDriversList] = useState([]);
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(true);
  const [showAddDriverForm, setShowAddDriverForm] = useState(false);
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [savingDriver, setSavingDriver] = useState(false);

  // New Driver Form (for Model 2)
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverPhone, setNewDriverPhone] = useState("");
  const [newDriverLicense, setNewDriverLicense] = useState("");
  const [newDriverLicenseDoc, setNewDriverLicenseDoc] = useState("");
  const [newDriverExpiry, setNewDriverExpiry] = useState("");

  // Additional requested Vehicle Fields
  const [vehicleVariant, setVehicleVariant] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [registrationType, setRegistrationType] = useState("Yellow Board (Commercial)");
  const [alternateFuel, setAlternateFuel] = useState("");
  const [transmission, setTransmission] = useState("");
  const [engineCc, setEngineCc] = useState("");
  const [parkingLocation, setParkingLocation] = useState("");
  const [vehicleFeatures, setVehicleFeatures] = useState([]);

  // Additional requested Chauffeur Fields (Model 1)
  const [driverPhoto, setDriverPhoto] = useState("");
  const [driverEmail, setDriverEmail] = useState("");
  const [driverDob, setDriverDob] = useState("1990-05-15");
  const [driverGender, setDriverGender] = useState("Male");
  const [driverIdProofType, setDriverIdProofType] = useState("Aadhaar Card");
  const [driverIdProofNumber, setDriverIdProofNumber] = useState("");
  const [driverIdProofDocument, setDriverIdProofDocument] = useState("");
  const [driverLicenseClass, setDriverLicenseClass] = useState("LMV-TR (Transport)");
  const [drivingSince, setDrivingSince] = useState("2016-04-10");
  const [driverExperienceYears, setDriverExperienceYears] = useState("8 Years");
  const [driverStatus, setDriverStatus] = useState("Available");
  const [assignedVehicle, setAssignedVehicle] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [chauffeurAddress, setChauffeurAddress] = useState("");
  const [addressProofType, setAddressProofType] = useState("Aadhaar Card");
  const [addressProofNumber, setAddressProofNumber] = useState("");
  const [addressProofDocumentUrl, setAddressProofDocumentUrl] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [languagesSpoken, setLanguagesSpoken] = useState(["English", "Tamil", "Hindi"]);
  const [bgvStatus, setBgvStatus] = useState("Verified");
  const [driverRating, setDriverRating] = useState("5.0");
  const [totalTripsCompleted, setTotalTripsCompleted] = useState("142");
  const [driverNotes, setDriverNotes] = useState("");

  // Additional requested Chauffeur Fields (Model 2)
  const [newDriverPhoto, setNewDriverPhoto] = useState("");
  const [newDriverEmail, setNewDriverEmail] = useState("");
  const [newDriverDob, setNewDriverDob] = useState("1992-08-20");
  const [newDriverGender, setNewDriverGender] = useState("Male");
  const [newDriverIdProofType, setNewDriverIdProofType] = useState("Aadhaar Card");
  const [newDriverIdProofNumber, setNewDriverIdProofNumber] = useState("");
  const [newDriverIdProofDocument, setNewDriverIdProofDocument] = useState("");
  const [newDriverLicenseClass, setNewDriverLicenseClass] = useState("LMV-TR (Transport)");
  const [newDrivingSince, setNewDrivingSince] = useState("2018-05-10");
  const [newDriverExperienceYears, setNewDriverExperienceYears] = useState("6 Years");
  const [newDriverStatus, setNewDriverStatus] = useState("Available");
  const [newDriverAssignedVehicle, setNewDriverAssignedVehicle] = useState("");
  const [newDriverJoiningDate, setNewDriverJoiningDate] = useState("");
  const [newDriverAddress, setNewDriverAddress] = useState("");
  const [newDriverAddressProofType, setNewDriverAddressProofType] = useState("Aadhaar Card");
  const [newDriverAddressProofNumber, setNewDriverAddressProofNumber] = useState("");
  const [newDriverAddressProofDocument, setNewDriverAddressProofDocument] = useState("");
  const [newEmergencyContactName, setNewEmergencyContactName] = useState("");
  const [newEmergencyContactPhone, setNewEmergencyContactPhone] = useState("");
  const [newDriverLanguages, setNewDriverLanguages] = useState(["English", "Tamil"]);
  const [newDriverBgvStatus, setNewDriverBgvStatus] = useState("Verified");
  const [newDriverRating, setNewDriverRating] = useState("5.0");
  const [newDriverTotalTrips, setNewDriverTotalTrips] = useState("85");
  const [newDriverNotes, setNewDriverNotes] = useState("");

  // Automatic experience calculation based on Driving Since date
  const calculateExperience = (sinceDate) => {
    if (!sinceDate) return "0 Years";
    const start = new Date(sinceDate);
    const now = new Date();
    if (isNaN(start.getTime())) return "0 Years";
    const diffYears = Math.max(0, Math.floor((now - start) / (365.25 * 24 * 60 * 60 * 1000)));
    return `${diffYears} Years`;
  };

  const handleDrivingSinceChange = (val, isModel2 = false) => {
    const exp = calculateExperience(val);
    if (isModel2) {
      setNewDrivingSince(val);
      setNewDriverExperienceYears(exp);
    } else {
      setDrivingSince(val);
      setDriverExperienceYears(exp);
    }
  };

  const toggleFeature = (featureName) => {
    setVehicleFeatures((prev) =>
      prev.includes(featureName) ? prev.filter((f) => f !== featureName) : [...prev, featureName]
    );
  };

  // Document Upload States
  const [uploadingDocs, setUploadingDocs] = useState({});
  const [docFileNames, setDocFileNames] = useState({});

  // Existing Account Detection
  const [existingAccountAlert, setExistingAccountAlert] = useState(false);

  // UI status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // Load existing onboarding state from storage or resume
  useEffect(() => {
    const user = getCurrentUser();
    const existing = getOnboardingData();

    // If user already completed onboarding, redirect directly to dashboard
    if (user && existing?.completed) {
      router.replace("/vendor/dashboard");
      return;
    }

    if (user && user.phone) {
      setPhone(user.phone);
      if (user.name) setPartnerName(user.name);
      if (user.alternatePhone) setAlternatePhone(user.alternatePhone);
      if (user.email) setEmail(user.email);
      if (user.city) setUserCity(user.city);
      if (user.businessName) setBusinessName(user.businessName);

      // If user is already authenticated, jump to Step 1 or where they left off
      if (existing) {
        if (existing.partnerName) setPartnerName(existing.partnerName);
        if (existing.alternatePhone) setAlternatePhone(existing.alternatePhone);
        if (existing.email) setEmail(existing.email);
        if (existing.userCity) setUserCity(existing.userCity);
        if (existing.userAddress) setUserAddress(existing.userAddress);
        if (existing.ownsBusiness !== undefined) setOwnsBusiness(existing.ownsBusiness);
        if (existing.businessName) setBusinessName(existing.businessName);
        if (existing.gstNumber) setGstNumber(existing.gstNumber);
        if (existing.panNumber) setPanNumber(existing.panNumber);
        if (existing.businessAddress) setBusinessAddress(existing.businessAddress);
        if (existing.businessCity) setBusinessCity(existing.businessCity);
        if (existing.businessState) setBusinessState(existing.businessState);
        if (existing.businessPincode) setBusinessPincode(existing.businessPincode);
        if (existing.fleetModel) setFleetModel(existing.fleetModel);
        if (existing.idProofDocument) setIdProofDocument(existing.idProofDocument);
        if (existing.addressProofDocument) setAddressProofDocument(existing.addressProofDocument);
        if (existing.businessProofDocument) setBusinessProofDocument(existing.businessProofDocument);
        if (existing.gstDocument) setGstDocument(existing.gstDocument);
        if (existing.panDocument) setPanDocument(existing.panDocument);
        if (existing.vehicleImage) setVehicleImage(existing.vehicleImage);
        if (existing.pucDocument) setPucDocument(existing.pucDocument);
        if (existing.pucExpiry) setPucExpiry(existing.pucExpiry);
        if (existing.vehicleCategory) setVehicleCategory(existing.vehicleCategory);
        if (existing.vehicleSubCategory) setVehicleSubCategory(existing.vehicleSubCategory);
        if (existing.vehiclePhotoSlots) setVehiclePhotoSlots(existing.vehiclePhotoSlots);

        if (existing.step) {
          setCurrentStep(existing.step === 2 ? 3 : existing.step);
        } else {
          setCurrentStep(1);
        }
      } else {
        setCurrentStep(1);
      }

      vendorApi.getProfile().then((prof) => {
        if (prof) {
          if (prof.idProofDocumentUrl) setIdProofDocument((prev) => prev || prof.idProofDocumentUrl);
          if (prof.addressProofDocumentUrl) setAddressProofDocument((prev) => prev || prof.addressProofDocumentUrl);
          if (prof.businessProofDocumentUrl) setBusinessProofDocument((prev) => prev || prof.businessProofDocumentUrl);
          if (prof.gstDocumentUrl) setGstDocument((prev) => prev || prof.gstDocumentUrl);
          if (prof.panDocumentUrl) setPanDocument((prev) => prev || prof.panDocumentUrl);
        }
      }).catch(() => null);
    }


  }, [router]);

  // Step 2 (Business Registration) is bypassed by default for Individual Partners
  useEffect(() => {
    if (currentStep === 2) {
      setCurrentStep(3);
    }
  }, [currentStep]);

  // --- Step 0 Handlers: Phone OTP Verification ---
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccessNotice("");
    setExistingAccountAlert(false);

    const clean = phone.replace(/[^0-9]/g, "");
    if (clean.length < 10) {
      setError("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    setLoading(true);
    const res = await sendOtp(clean, { purpose: "REGISTRATION" });
    setLoading(false);

    if (res.userExists) {
      setExistingAccountAlert(true);
      setError("");
      return;
    }

    if (res.success) {
      setOtpSent(true);
      setOtpCountdown(60);
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
        setOtp(res.devOtp); // convenient auto-fill for development testing
      }
      setSuccessNotice("Verification code sent to " + clean);
    } else {
      setError(res.error || "Failed to send code. Please try again.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccessNotice("");

    if (!otp || otp.trim().length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    const res = await verifyVendorOtp({
      phone,
      otp: otp.trim(),
      purpose: "REGISTRATION",
      name: partnerName.trim() || undefined,
      businessName: businessName.trim() || undefined,
    });
    setLoading(false);

    if (res.success) {
      // If this was an existing account
      if (res.isNewUser === false) {
        const existing = getOnboardingData();
        if (existing?.completed) {
          router.replace("/vendor/dashboard");
          return;
        }
      }

      saveOnboardingData({
        step: 1,
        phone,
        partnerName: partnerName || res.user?.name,
        verified: true,
      });
      setCurrentStep(1);
      setSuccessNotice("Phone verified successfully. Please enter your personal and contact details.");
    } else {
      setError(res.error || "Verification failed. Please check the code.");
    }
  };

  // --- Skip to Dashboard Handler ---
  // Saves all current progress before navigating
  const handleSkipToDashboard = async () => {
    setLoading(true);
    try {
      // Save current onboarding data snapshot
      const snapshot = {
        step: currentStep,
        phone,
        partnerName,
        alternatePhone,
        email,
        userCity,
        userAddress,
        ownsBusiness,
        businessName,
        gstNumber,
        panNumber,
        businessAddress,
        businessCity,
        businessState,
        businessPincode,
        businessProofDocument,
        gstDocument,
        panDocument,
        idProofDocument,
        addressProofDocument,
        fleetModel,
        vehicleNumber,
        vehicleModel,
        vehicleImage,
        vehiclesList,
        driversList,
        lastSkippedAt: new Date().toISOString(),
      };
      saveOnboardingData(snapshot);

      // Persist to partner profile if logged in
      await vendorApi.updateProfile({
        name: partnerName.trim() || undefined,
        ownerName: partnerName.trim() || undefined,
        alternatePhone: alternatePhone.trim() || undefined,
        altPhone: alternatePhone.trim() || undefined,
        city: userCity.trim() || businessCity.trim() || undefined,
        email: email.trim() || undefined,
        businessName: businessName.trim() || undefined,
        gstin: gstNumber.trim() || undefined,
        pan: panNumber.trim() || undefined,
        address: businessAddress ? `${businessAddress}, ${businessCity}` : (userAddress || undefined),
        businessProofDocumentUrl: businessProofDocument || undefined,
        gstDocumentUrl: gstDocument || undefined,
        panDocumentUrl: panDocument || undefined,
        idProofDocumentUrl: idProofDocument || undefined,
        addressProofDocumentUrl: addressProofDocument || undefined,
      }).catch(() => null);
    } catch (err) {
      console.error("Save on skip error:", err);
    } finally {
      setLoading(false);
      router.push("/vendor/dashboard");
    }
  };

  // --- Step 1 Handler: Save Personal & Contact Details ---
  const handleSaveStep1 = async (e) => {
    e?.preventDefault();
    setError("");

    if (!partnerName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (alternatePhone && alternatePhone.trim().length !== 10) {
      setError("Please enter a valid 10-digit alternative phone number.");
      return;
    }

    if (alternatePhone && alternatePhone.trim() === phone.trim()) {
      setError("Alternative phone number must be different from primary phone number.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    if (!userCity.trim()) {
      setError("Please enter your operating city.");
      return;
    }

    if (!idProofDocument) {
      setError("Please upload your Government ID Proof (Aadhaar / Voter ID / Passport / Driving License).");
      return;
    }

    setLoading(true);
    try {
      const step1Data = {
        step: 3,
        partnerName: partnerName.trim(),
        phone: phone.trim(),
        alternatePhone: alternatePhone.trim(),
        email: email.trim(),
        userCity: userCity.trim(),
        userAddress: userAddress.trim(),
        ownsBusiness: false,
        businessName: partnerName.trim() || "Individual Partner",
        businessCity: userCity.trim(),
        idProofDocument: idProofDocument || undefined,
        addressProofDocument: addressProofDocument || undefined,
      };
      saveOnboardingData(step1Data);

      // Update profile
      await vendorApi.updateProfile({
        name: partnerName.trim(),
        ownerName: partnerName.trim(),
        businessName: partnerName.trim() || "Individual Partner",
        alternatePhone: alternatePhone.trim() || undefined,
        altPhone: alternatePhone.trim() || undefined,
        city: userCity.trim(),
        email: email.trim() || undefined,
        address: userAddress.trim() || undefined,
        idProofDocumentUrl: idProofDocument || undefined,
        addressProofDocumentUrl: addressProofDocument || undefined,
      }).catch(() => null);

      setBusinessCity(userCity.trim());

      setCurrentStep(3);
      setSuccessNotice("Personal details saved. Let's select your fleet operating model.");
    } catch (err) {
      console.error(err);
      setError("Failed to save personal details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2 Handler: Save Business Details ---
  const handleSaveStep2 = async (e) => {
    e?.preventDefault();
    setError("");

    if (ownsBusiness === null) {
      setError("Please select whether you operate as a registered business.");
      return;
    }

    if (ownsBusiness === true) {
      if (!businessName.trim()) {
        setError("Please enter your registered business name.");
        return;
      }
      if (!businessProofDocument) {
        setError("Please upload your Business Registration Proof (MSME / Trade License / Incorporation Certificate).");
        return;
      }
    }

    setLoading(true);
    try {
      const step2Data = {
        step: 3,
        ownsBusiness,
        businessName: ownsBusiness ? businessName.trim() : (partnerName || "Fleet Partner"),
        gstNumber: gstNumber.trim(),
        panNumber: panNumber.trim(),
        businessType,
        businessAddress: businessAddress.trim(),
        businessCity: businessCity.trim() || userCity.trim(),
        businessState: businessState.trim(),
        businessPincode: businessPincode.trim(),
        businessProofDocument: businessProofDocument || undefined,
        gstDocument: gstDocument || undefined,
        panDocument: panDocument || undefined,
      };
      saveOnboardingData(step2Data);

      // Sync with profile
      if (step2Data.businessName) {
        await vendorApi.updateProfile({
          businessName: step2Data.businessName,
          gstin: step2Data.gstNumber || undefined,
          pan: step2Data.panNumber || undefined,
          address: step2Data.businessAddress ? `${step2Data.businessAddress}, ${step2Data.businessCity}` : undefined,
          businessProofDocumentUrl: businessProofDocument || undefined,
          gstDocumentUrl: gstDocument || undefined,
          panDocumentUrl: panDocument || undefined,
        }).catch(() => null);
      }

      setCurrentStep(3);
    } catch (err) {
      console.error(err);
      setError("Failed to save business details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 3 Handler: Save Fleet Operating Model ---
  const handleSaveStep3 = (modelChoice) => {
    setFleetModel(modelChoice);
    setError("");

    saveOnboardingData({
      step: 4,
      fleetModel: modelChoice,
    });

    setCurrentStep(4);
  };

  // --- Handle Document Uploads (RC, Insurance, Fitness, Permit, License) ---
  const handleDocumentUpload = async (docType, file) => {
    if (!file) return;

    setDocFileNames((prev) => ({ ...prev, [docType]: file.name }));
    setUploadingDocs((prev) => ({ ...prev, [docType]: true }));
    setError("");

    try {
      const isDriver = docType === "license" || docType === "driverPhoto" || docType === "driverIdProof" || docType === "driverAddressProof" || docType === "newDriverPhoto" || docType === "newDriverLicenseDoc" || docType === "newDriverLicense" || docType === "newDriverIdProof" || docType === "newDriverAddressProof";
      const isCompliance = docType === "idProof" || docType === "addressProof" || docType === "businessProof" || docType === "gst" || docType === "pan";
      const isVehiclePhoto = docType === "vehicleImage";
      const folder = isCompliance
        ? "grabrentals/business"
        : (isDriver ? "grabrentals/drivers/documents" : (isVehiclePhoto ? "grabrentals/vehicles" : "grabrentals/vehicles/documents"));
      const preset = isCompliance ? "grabrentals_business" : (isVehiclePhoto ? "grabrentals_vehicles" : null);

      let uploadedUrl = null;
      try {
        uploadedUrl = await uploadSignedToCloudinary(file, folder, null, preset);
      } catch (uploadErr) {
        console.warn("Storage upload notice (using local file):", uploadErr);
        uploadedUrl = URL.createObjectURL(file);
      }

      if (uploadedUrl) {
        if (docType === "license") setDriverLicenseDocument(uploadedUrl);
        else if (docType === "driverPhoto") setDriverPhoto(uploadedUrl);
        else if (docType === "driverIdProof") setDriverIdProofDocument(uploadedUrl);
        else if (docType === "driverAddressProof") setAddressProofDocumentUrl(uploadedUrl);
        else if (docType === "newDriverPhoto") setNewDriverPhoto(uploadedUrl);
        else if (docType === "newDriverLicenseDoc" || docType === "newDriverLicense") setNewDriverLicenseDoc(uploadedUrl);
        else if (docType === "newDriverIdProof") setNewDriverIdProofDocument(uploadedUrl);
        else if (docType === "newDriverAddressProof") setNewDriverAddressProofDocument(uploadedUrl);
        else if (docType === "vehicleImage") setVehicleImage(uploadedUrl);
        else if (docType === "rc") setRcDocument(uploadedUrl);
        else if (docType === "insurance") setInsuranceDocument(uploadedUrl);
        else if (docType === "fitness") setFitnessDocument(uploadedUrl);
        else if (docType === "permit") setPermitDocument(uploadedUrl);
        else if (docType === "puc") setPucDocument(uploadedUrl);
        else if (docType === "idProof") setIdProofDocument(uploadedUrl);
        else if (docType === "addressProof") setAddressProofDocument(uploadedUrl);
        else if (docType === "businessProof") setBusinessProofDocument(uploadedUrl);
        else if (docType === "gst") setGstDocument(uploadedUrl);
        else if (docType === "pan") setPanDocument(uploadedUrl);
      }
    } catch (err) {
      console.error(`Upload error for ${docType}:`, err);
    } finally {
      setUploadingDocs((prev) => ({ ...prev, [docType]: false }));
    }
  };

  // --- Step 4 Handler: Save Single Vehicle & Assign Self as Driver (Model 1) ---
  const handleSaveSingleFleet = async (e) => {
    e?.preventDefault();
    setError("");

    if (!vehicleNumber.trim()) {
      setError("Please enter the vehicle registration plate number.");
      return;
    }

    // Compulsory photo validation (4 exterior + 3 interior)
    const missingPhotos = [];
    if (!vehiclePhotoSlots.front) missingPhotos.push("Front View");
    if (!vehiclePhotoSlots.back) missingPhotos.push("Back View");
    if (!vehiclePhotoSlots.left) missingPhotos.push("Left Side");
    if (!vehiclePhotoSlots.right) missingPhotos.push("Right Side");
    if (!vehiclePhotoSlots.frontSeats) missingPhotos.push("Front Seats");
    if (!vehiclePhotoSlots.backSeats) missingPhotos.push("Back Seats");
    // Handle & Steering is optional

    if (missingPhotos.length > 0) {
      setError(`Please upload all required vehicle photos (*): ${missingPhotos.join(", ")}.`);
      return;
    }

    if (!insuranceExpiry) {
      setError("Please provide the vehicle insurance expiry date.");
      return;
    }

    setLoading(true);
    try {
      const user = getCurrentUser();
      const cleanPlate = vehicleNumber.trim().toUpperCase();

      // Platform-wide cross-vendor uniqueness verification
      try {
        const plateCheck = await vendorApi.checkPlateAvailability(cleanPlate);
        if (plateCheck && plateCheck.exists) {
          setError(plateCheck.message || `Vehicle with plate number '${cleanPlate}' is already registered on Grab Rentals by another fleet partner. Duplicate vehicle registrations across vendors are strictly prohibited.`);
          setLoading(false);
          return;
        }
      } catch (ignored) {}

      // Ensure address and emergency contact are present
      const driverAddress =
        userAddress?.trim() ||
        (userCity ? `${userCity}, India` : "") ||
        businessAddress?.trim() ||
        "Registered Fleet Partner Address, India";

      const emergencyContactNumber =
        alternatePhone?.trim() ||
        phone?.trim() ||
        "9876543210";

      // 1. Create Driver (Assign user as chauffeur)
      try {
        const expNum = parseInt(driverExperienceYears) || 5;
        await vendorApi.createDriver({
          name: partnerName?.trim() || user?.name || "Fleet Partner Driver",
          phone: phone?.trim() || user?.phone || "9999999999",
          email: driverEmail?.trim() || email?.trim() || user?.email || undefined,
          address: chauffeurAddress?.trim() || driverAddress,
          emergencyContact: emergencyContactPhone?.trim() || emergencyContactNumber,
          emergencyContactName: emergencyContactName?.trim() || partnerName?.trim() || "Emergency Contact",
          emergencyContactPhone: emergencyContactPhone?.trim() || emergencyContactNumber,
          licenseNumber: driverLicenseNumber?.trim() ? driverLicenseNumber.trim().toUpperCase() : ("DL-PENDING-" + (phone?.slice(-6) || Math.floor(100000 + Math.random() * 900000))),
          licenseExpiry: driverLicenseExpiry || "2035-12-31",
          licenseDocumentUrl: driverLicenseDocument || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
          licenseClass: driverLicenseClass || "LMV-TR (Transport)",
          experienceYears: expNum,
          drivingSince: drivingSince || undefined,
          photoUrl: driverPhoto || undefined,
          gender: driverGender,
          dob: driverDob || undefined,
          dateOfBirth: driverDob || undefined,
          idProofType: driverIdProofType,
          idProofNumber: driverIdProofNumber || undefined,
          idProofDocumentUrl: driverIdProofDocument || undefined,
          status: driverStatus || "Available",
          assignedVehicle: cleanPlate,
          joiningDate: joiningDate || undefined,
          addressProofType: addressProofType || undefined,
          addressProofNumber: addressProofNumber || undefined,
          addressProofDocumentUrl: addressProofDocumentUrl || undefined,
          languagesSpoken: Array.isArray(languagesSpoken) ? languagesSpoken.join(", ") : languagesSpoken,
          verificationStatus: bgvStatus || "Verified",
          rating: driverRating ? parseFloat(driverRating) : 5.0,
          totalTrips: totalTripsCompleted ? parseInt(totalTripsCompleted) : 142,
          notes: driverNotes || undefined,
        });
      } catch (dErr) {
        const errMsg = dErr?.response?.data?.message || dErr?.message || "";
        if (errMsg && (errMsg.toLowerCase().includes("already registered") || errMsg.toLowerCase().includes("duplicate") || errMsg.toLowerCase().includes("license") || errMsg.toLowerCase().includes("driver"))) {
          setError(errMsg || "Driver with this license is already registered on Grab Rentals.");
          setLoading(false);
          return;
        }
        console.warn("Chauffeur registration notice:", errMsg);
      }

      // 2. Register Vehicle
      try {
        const photosPayload = (vehiclePhotoSlots && Object.values(vehiclePhotoSlots).some(Boolean))
          ? JSON.stringify({ slots: vehiclePhotoSlots, list: vehiclePhotos })
          : ((vehiclePhotos && vehiclePhotos.length > 0) ? JSON.stringify(vehiclePhotos) : undefined);
        const mainImage = vehiclePhotoSlots?.front || (vehiclePhotos && vehiclePhotos.length > 0 ? vehiclePhotos[0] : (vehicleImage || undefined));
        await vendorApi.createVehicle({
          vehicleNumber: cleanPlate,
          vehicleModel: vehicleModel?.trim() || vehicleSubCategory || "Commercial Vehicle",
          vehicleType: vehicleCategory || "SUV",
          variant: vehicleVariant || undefined,
          color: vehicleColor || undefined,
          registrationType: registrationType || undefined,
          alternateFuel: alternateFuel || undefined,
          transmission: transmission || undefined,
          engineCc: engineCc ? parseInt(engineCc) : undefined,
          parkingLocation: parkingLocation || undefined,
          features: Array.isArray(vehicleFeatures) && vehicleFeatures.length > 0 ? vehicleFeatures.join(", ") : undefined,
          year: vehicleYear ? parseInt(vehicleYear) : undefined,
          seatingCapacity: seatingCapacity ? Math.max(1, parseInt(seatingCapacity) || 5) : 5,
          fuelType: fuelType || "Diesel",
          dailyRate: 2500,
          perKmRate: 14,
          imageUrl: mainImage,
          photos: photosPayload,
          insuranceExpiry: insuranceExpiry || undefined,
          fitnessExpiry: fitnessExpiry || undefined,
          permitExpiry: permitExpiry || undefined,
          rcDocumentUrl: rcDocument || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
          insuranceDocumentUrl: insuranceDocument || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
          permitDocumentUrl: permitDocument || undefined,
          fitnessDocumentUrl: fitnessDocument || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
        });
      } catch (vErr) {
        const errMsg = vErr?.response?.data?.message || vErr?.message || "";
        if (errMsg && (errMsg.toLowerCase().includes("already registered") || errMsg.toLowerCase().includes("duplicate") || errMsg.toLowerCase().includes("plate") || errMsg.toLowerCase().includes("vehicle"))) {
          setError(errMsg || `Vehicle with plate number '${cleanPlate}' is already registered on Grab Rentals. Duplicate vehicles are not allowed.`);
          setLoading(false);
          return;
        }
        console.warn("Vehicle registration notice:", errMsg);
      }

      // Mark complete
      saveOnboardingData({
        step: 4,
        completed: true,
        fleetModel: 1,
        vehicleNumber: cleanPlate,
        vehicleCategory,
        vehicleSubCategory,
        vehicleImage,
        vehiclePhotos,
        vehiclePhotoSlots,
        driverAssigned: true,
        rcDocument,
        insuranceDocument,
        permitDocument,
        fitnessDocument,
        pucDocument,
        pucExpiry,
        driverLicenseDocument,
      });

      router.push("/vendor/dashboard?onboarding=complete");
    } catch (err) {
      console.error(err);
      setError("Error saving vehicle. You can skip to dashboard and complete later.");
    } finally {
      setLoading(false);
    }
  };

  const verifyPlateLive = async (plate) => {
    const clean = (plate || "").trim().toUpperCase();
    if (!clean || clean.length < 3) {
      setPlateCheckWarning("");
      return;
    }
    const compact = clean.replace(/[\s-]+/g, "");
    const localDup = vehiclesList.some(
      (v) => (v.vehicleNumber || "").replace(/[\s-]+/g, "").toUpperCase() === compact
    );
    if (localDup) {
      setPlateCheckWarning(`Vehicle with plate '${clean}' is already in your fleet roster.`);
      return;
    }
    setCheckingPlate(true);
    try {
      const res = await vendorApi.checkPlateAvailability(clean);
      if (res && res.exists) {
        setPlateCheckWarning(res.message || `Vehicle '${clean}' is already registered on Grab Rentals by another fleet partner.`);
      } else {
        setPlateCheckWarning("");
      }
    } catch {
      setPlateCheckWarning("");
    } finally {
      setCheckingPlate(false);
    }
  };

  const resetVehicleForm = () => {
    setPlateCheckWarning("");
    setCheckingPlate(false);
    setVehicleNumber("");
    setVehicleModel("");
    setVehicleImage("");
    setVehiclePhotos([]);
    setVehiclePhotoSlots({
      front: "",
      back: "",
      left: "",
      right: "",
      luggage: "",
      frontSeats: "",
      backSeats: "",
      handle: "",
    });
    setInsuranceExpiry("");
    setRcExpiry("");
    setFitnessExpiry("");
    setPermitExpiry("");
    setPucExpiry("");
    setRcDocument("");
    setInsuranceDocument("");
    setPermitDocument("");
    setFitnessDocument("");
    setPucDocument("");
    setDocFileNames((prev) => ({
      ...prev,
      vehicleImage: null,
      rc: null,
      insurance: null,
      permit: null,
      fitness: null,
      puc: null,
    }));
  };

  const resetDriverForm = () => {
    setNewDriverName("");
    setNewDriverPhone("");
    setNewDriverEmail("");
    setNewDriverLicense("");
    setNewDriverLicenseDoc("");
    setNewDriverExpiry("");
    setNewDriverPhoto("");
    setNewDriverDob("1992-08-20");
    setNewDriverGender("Male");
    setNewDriverStatus("Available");
    setNewDriverLicenseClass("LMV-TR (Transport)");
    setNewDrivingSince("2018-05-10");
    setNewDriverExperienceYears("6 Years");
    setNewDriverIdProofType("Aadhaar Card");
    setNewDriverIdProofNumber("");
    setNewDriverIdProofDocument("");
    setNewDriverAddress("");
    setNewDriverAddressProofType("Aadhaar Card");
    setNewDriverAddressProofNumber("");
    setNewDriverAddressProofDocument("");
    setNewEmergencyContactName("");
    setNewEmergencyContactPhone("");
    setNewDriverLanguages(["English", "Tamil"]);
    setNewDriverNotes("");
    setDriverLicenseDocument("");
    setDocFileNames((prev) => ({
      ...prev,
      newDriverPhoto: null,
      newDriverLicenseDoc: null,
      license: null,
      newDriverIdProof: null,
      newDriverAddressProof: null,
      driverPhoto: null,
      driverIdProof: null,
    }));
  };

  const handleAddVehicleToList = async (e) => {
    e?.preventDefault();
    const cleanPlate = vehicleNumber.trim().toUpperCase();
    if (!cleanPlate) {
      setError("Please enter vehicle plate number.");
      return;
    }

    const isDuplicate = vehiclesList.some(
      (v) => (v.vehicleNumber || "").replace(/[\s-]+/g, "").toUpperCase() === cleanPlate.replace(/[\s-]+/g, "")
    );
    if (isDuplicate) {
      setError(`Vehicle with plate number '${cleanPlate}' is already in your fleet roster. Duplicate vehicle plates are not permitted.`);
      return;
    }

    // Platform-wide cross-vendor uniqueness verification
    try {
      const plateCheck = await vendorApi.checkPlateAvailability(cleanPlate);
      if (plateCheck && plateCheck.exists) {
        setError(plateCheck.message || `Vehicle with plate number '${cleanPlate}' is already registered on Grab Rentals by another fleet partner. Duplicate vehicle registrations across vendors are strictly prohibited.`);
        return;
      }
    } catch (ignored) {}

    // Compulsory photo validation (4 exterior + 3 interior)
    const missingPhotos = [];
    if (!vehiclePhotoSlots.front) missingPhotos.push("Front View");
    if (!vehiclePhotoSlots.back) missingPhotos.push("Back View");
    if (!vehiclePhotoSlots.left) missingPhotos.push("Left Side");
    if (!vehiclePhotoSlots.right) missingPhotos.push("Right Side");
    if (!vehiclePhotoSlots.frontSeats) missingPhotos.push("Front Seats");
    if (!vehiclePhotoSlots.backSeats) missingPhotos.push("Back Seats");
    // Handle & Steering is optional

    if (missingPhotos.length > 0) {
      setError(`Please upload all required vehicle photos (*): ${missingPhotos.join(", ")}.`);
      return;
    }

    if (!insuranceExpiry) {
      setError("Please provide the vehicle insurance expiry date.");
      return;
    }

    setSavingVehicle(true);
    try {
      const newVeh = {
        id: "v-" + Date.now(),
        vehicleNumber: cleanPlate,
        vehicleModel: vehicleModel?.trim() || vehicleSubCategory || "Commercial Vehicle",
        vehicleType: vehicleCategory,
        subCategory: vehicleSubCategory || undefined,
        variant: vehicleVariant,
        color: vehicleColor,
        registrationType,
        alternateFuel,
        transmission,
        engineCc: engineCc ? parseInt(engineCc) : 1498,
        parkingLocation,
        features: Array.isArray(vehicleFeatures) ? vehicleFeatures.join(", ") : vehicleFeatures,
        year: vehicleYear,
        seatingCapacity,
        fuelType,
        imageUrl: vehicleImage || undefined,
        insuranceExpiry,
        rcExpiry,
        fitnessExpiry,
        permitExpiry,
        pucExpiry,
        rcDocumentUrl: rcDocument || undefined,
        insuranceDocumentUrl: insuranceDocument || undefined,
        permitDocumentUrl: permitDocument || undefined,
        fitnessDocumentUrl: fitnessDocument || undefined,
        pucDocumentUrl: pucDocument || undefined,
      };

      // Save to direct records
      try {
        const photosPayload = (vehiclePhotoSlots && Object.values(vehiclePhotoSlots).some(Boolean))
          ? JSON.stringify({ slots: vehiclePhotoSlots, list: vehiclePhotos })
          : ((vehiclePhotos && vehiclePhotos.length > 0) ? JSON.stringify(vehiclePhotos) : undefined);
        const mainImage = vehiclePhotoSlots?.front || (vehiclePhotos && vehiclePhotos.length > 0 ? vehiclePhotos[0] : (newVeh.imageUrl || undefined));
        await vendorApi.createVehicle({
          vehicleNumber: newVeh.vehicleNumber,
          vehicleModel: newVeh.vehicleModel,
          vehicleType: newVeh.vehicleType || "SUV",
          variant: newVeh.variant || undefined,
          color: newVeh.color || undefined,
          registrationType: newVeh.registrationType || undefined,
          alternateFuel: newVeh.alternateFuel || undefined,
          transmission: newVeh.transmission || undefined,
          engineCc: newVeh.engineCc ? parseInt(newVeh.engineCc) : undefined,
          parkingLocation: newVeh.parkingLocation || undefined,
          features: newVeh.features || undefined,
          year: newVeh.year ? parseInt(newVeh.year) : 2024,
          seatingCapacity: newVeh.seatingCapacity ? Math.max(1, parseInt(newVeh.seatingCapacity) || 5) : 5,
          fuelType: newVeh.fuelType || "Diesel",
          dailyRate: 2500,
          perKmRate: 14,
          imageUrl: mainImage,
          photos: photosPayload,
          insuranceExpiry: newVeh.insuranceExpiry || undefined,
          fitnessExpiry: newVeh.fitnessExpiry || undefined,
          permitExpiry: newVeh.permitExpiry || undefined,
          rcDocumentUrl: rcDocument || undefined,
          insuranceDocumentUrl: insuranceDocument || undefined,
          permitDocumentUrl: permitDocument || undefined,
          fitnessDocumentUrl: fitnessDocument || undefined,
        });
        newVeh.savedToBackend = true;
      } catch (apiErr) {
        const errMsg = apiErr?.response?.data?.message || apiErr?.message || "";
        if (errMsg && (errMsg.toLowerCase().includes("already registered") || errMsg.toLowerCase().includes("duplicate") || errMsg.toLowerCase().includes("plate"))) {
          setError(errMsg || `Vehicle with plate number '${cleanPlate}' is already registered on Grab Rentals. Duplicate vehicles are not allowed.`);
          setSavingVehicle(false);
          return;
        }
        console.warn("Vehicle registration notice:", errMsg);
      }

      const updated = [...vehiclesList, newVeh];
      setVehiclesList(updated);
      saveOnboardingData({ vehiclesList: updated });

      // Reset vehicle fields
      setVehicleNumber("");
      setVehicleModel("");
      setVehicleSubCategory("");
      resetVehicleForm();
      setShowAddVehicleForm(false);
      setError("");
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleAddDriverToList = async (e) => {
    e?.preventDefault();
    if (!newDriverName.trim()) {
      setError("Please enter driver name.");
      return;
    }

    const cleanLicense = newDriverLicense?.trim().toUpperCase();
    if (cleanLicense && driversList.some((d) => (d.licenseNumber || "").replace(/\s+/g, "").toUpperCase() === cleanLicense.replace(/\s+/g, ""))) {
      setError(`Chauffeur with license '${cleanLicense}' is already in your chauffeur roster. Duplicate drivers are not allowed.`);
      return;
    }

    setSavingDriver(true);
    try {
      const driverAddress =
        userAddress?.trim() ||
        (userCity ? `${userCity}, India` : "") ||
        businessAddress?.trim() ||
        "Registered Fleet Partner Address, India";

      const emergencyContactNumber =
        alternatePhone?.trim() ||
        phone?.trim() ||
        "9876543210";

      const expYears = parseInt(newDriverExperienceYears) || 6;
      const newDrv = {
        id: "d-" + Date.now(),
        name: newDriverName.trim(),
        phone: newDriverPhone.trim() || phone || "9999999999",
        email: newDriverEmail.trim() || undefined,
        licenseNumber: cleanLicense || ("DL-PENDING-" + Date.now().toString().slice(-6)),
        licenseExpiry: newDriverExpiry || "2035-12-31",
        licenseClass: newDriverLicenseClass || "LMV-TR (Transport)",
        drivingSince: newDrivingSince || undefined,
        experienceYears: expYears,
        photoUrl: newDriverPhoto || undefined,
        gender: newDriverGender,
        dateOfBirth: newDriverDob || undefined,
        idProofType: newDriverIdProofType,
        idProofNumber: newDriverIdProofNumber || undefined,
        idProofDocumentUrl: newDriverIdProofDocument || undefined,
        status: newDriverStatus || "Available",
        assignedVehicle: newDriverAssignedVehicle || undefined,
        joiningDate: newDriverJoiningDate || undefined,
        address: newDriverAddress.trim() || driverAddress,
        addressProofType: newDriverAddressProofType || undefined,
        addressProofNumber: newDriverAddressProofNumber || undefined,
        addressProofDocumentUrl: newDriverAddressProofDocument || undefined,
        emergencyContact: newEmergencyContactPhone.trim() || emergencyContactNumber,
        emergencyContactName: newEmergencyContactName.trim() || undefined,
        languagesSpoken: Array.isArray(newDriverLanguages) ? newDriverLanguages.join(", ") : newDriverLanguages,
        verificationStatus: newDriverBgvStatus || "Verified",
        rating: newDriverRating ? parseFloat(newDriverRating) : 5.0,
        totalTrips: newDriverTotalTrips ? parseInt(newDriverTotalTrips) : 85,
        notes: newDriverNotes || undefined,
      };

      // Save to direct records
      try {
        await vendorApi.createDriver({
          name: newDrv.name,
          phone: newDrv.phone,
          email: newDrv.email,
          address: newDrv.address,
          emergencyContact: newDrv.emergencyContact,
          emergencyContactName: newDrv.emergencyContactName,
          emergencyContactPhone: newDrv.emergencyContact,
          licenseNumber: newDrv.licenseNumber,
          licenseExpiry: newDrv.licenseExpiry,
          licenseClass: newDrv.licenseClass,
          experienceYears: newDrv.experienceYears,
          drivingSince: newDrv.drivingSince,
          photoUrl: newDrv.photoUrl,
          gender: newDrv.gender,
          dob: newDrv.dateOfBirth,
          dateOfBirth: newDrv.dateOfBirth,
          idProofType: newDrv.idProofType,
          idProofNumber: newDrv.idProofNumber,
          idProofDocumentUrl: newDrv.idProofDocumentUrl,
          status: newDrv.status,
          assignedVehicle: newDrv.assignedVehicle,
          joiningDate: newDrv.joiningDate,
          addressProofType: newDrv.addressProofType,
          addressProofNumber: newDrv.addressProofNumber,
          addressProofDocumentUrl: newDrv.addressProofDocumentUrl,
          languagesSpoken: newDrv.languagesSpoken,
          verificationStatus: newDrv.verificationStatus,
          rating: newDrv.rating,
          totalTrips: newDrv.totalTrips,
          notes: newDrv.notes,
          licenseDocumentUrl: newDriverLicenseDoc || driverLicenseDocument || undefined,
        });
        newDrv.savedToBackend = true;
      } catch (err) {
        const errMsg = err?.response?.data?.message || err?.message || "";
        if (errMsg && (errMsg.toLowerCase().includes("already registered") || errMsg.toLowerCase().includes("duplicate") || errMsg.toLowerCase().includes("license"))) {
          setError(errMsg || `Chauffeur with license '${cleanLicense}' is already registered. Duplicate drivers are not allowed.`);
          setSavingDriver(false);
          return;
        }
        console.warn("Chauffeur registration notice:", errMsg);
      }

      const updated = [...driversList, newDrv];
      setDriversList(updated);
      saveOnboardingData({ driversList: updated });

      resetDriverForm();
      setShowAddDriverForm(false);
      setError("");
    } catch (err) {
      console.error("Error saving driver:", err);
      setError("Failed to save chauffeur details. Please try again.");
    } finally {
      setSavingDriver(false);
    }
  };

  // Finish Multi-Fleet Setup
  const handleFinishMultiFleet = async () => {
    setLoading(true);
    for (const v of vehiclesList) {
      if (v.savedToBackend) continue;
      try {
        await vendorApi.createVehicle({
          vehicleNumber: v.vehicleNumber,
          vehicleModel: v.vehicleModel || "Commercial Fleet Asset",
          vehicleType: v.vehicleType || "SUV",
          variant: v.variant || undefined,
          color: v.color || undefined,
          registrationType: v.registrationType || undefined,
          alternateFuel: v.alternateFuel || undefined,
          transmission: v.transmission || undefined,
          engineCc: v.engineCc ? parseInt(v.engineCc) : undefined,
          parkingLocation: v.parkingLocation || undefined,
          features: v.features || undefined,
          year: v.year ? parseInt(v.year) : 2024,
          seatingCapacity: v.seatingCapacity ? Math.max(1, parseInt(v.seatingCapacity) || 5) : 5,
          fuelType: v.fuelType || "Diesel",
          dailyRate: 2500,
          perKmRate: 14,
          imageUrl: v.imageUrl || (v.photos && v.photos[0]) || undefined,
          photos: Array.isArray(v.photos) ? JSON.stringify(v.photos) : (typeof v.photos === "object" ? JSON.stringify(v.photos) : v.photos),
          insuranceExpiry: v.insuranceExpiry || undefined,
          fitnessExpiry: v.fitnessExpiry || undefined,
          permitExpiry: v.permitExpiry || undefined,
          rcDocumentUrl: v.rcDocumentUrl || undefined,
          insuranceDocumentUrl: v.insuranceDocumentUrl || undefined,
          permitDocumentUrl: v.permitDocumentUrl || undefined,
          fitnessDocumentUrl: v.fitnessDocumentUrl || undefined,
        });
        v.savedToBackend = true;
      } catch (err) {
        console.warn("Finish multi-fleet vehicle sync notice:", err?.response?.data || err?.message);
      }
    }

    for (const d of driversList) {
      if (d.savedToBackend) continue;
      try {
        await vendorApi.createDriver({
          name: d.name,
          phone: d.phone,
          email: d.email,
          address: d.address,
          emergencyContact: d.emergencyContact,
          emergencyContactName: d.emergencyContactName,
          emergencyContactPhone: d.emergencyContact,
          licenseNumber: d.licenseNumber,
          licenseExpiry: d.licenseExpiry,
          licenseClass: d.licenseClass,
          experienceYears: d.experienceYears,
          drivingSince: d.drivingSince,
          photoUrl: d.photoUrl,
          gender: d.gender,
          dob: d.dateOfBirth,
          dateOfBirth: d.dateOfBirth,
          idProofType: d.idProofType,
          idProofNumber: d.idProofNumber,
          idProofDocumentUrl: d.idProofDocumentUrl,
          status: d.status || "Available",
          assignedVehicle: d.assignedVehicle,
          joiningDate: d.joiningDate,
          addressProofType: d.addressProofType,
          addressProofNumber: d.addressProofNumber,
          addressProofDocumentUrl: d.addressProofDocumentUrl,
          languagesSpoken: d.languagesSpoken,
          verificationStatus: d.verificationStatus,
          rating: d.rating,
          totalTrips: d.totalTrips,
          notes: d.notes,
          licenseDocumentUrl: d.licenseDocumentUrl || undefined,
        });
        d.savedToBackend = true;
      } catch (err) {
        console.warn("Finish multi-fleet driver sync notice:", err?.response?.data || err?.message);
      }
    }

    saveOnboardingData({
      step: 4,
      completed: true,
      fleetModel: 2,
      vehiclesList,
      driversList,
    });
    setLoading(false);
    router.push("/vendor/dashboard?onboarding=complete");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF4E5] via-[#F6EED8] to-[#FAF4E5] text-slate-900 flex flex-col justify-between relative">
      {/* Top Navigation Bar with Skip to Dashboard */}
      <header className="border-b border-amber-200/70 bg-white/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/images/grab-rentals-logo.jpg"
                alt="Grab Rentals"
                className="h-10 sm:h-11 w-auto object-contain rounded-lg shadow-2xs"
              />
              <span className="font-extrabold text-base tracking-tight text-slate-900 hidden sm:inline-flex items-center">
                Grab Rentals <span className="text-amber-600 font-semibold text-xs ml-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200">Fleet Partner</span>
              </span>
            </Link>
          </div>

          {/* Right section: Enquiries Contact + Skip to Dashboard / Sign In */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* For enquiries: WhatsApp + Phone */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 px-2 sm:px-3 py-1.5 rounded-full transition-all shadow-2xs shrink-0">
              <span className="text-slate-500 text-xs font-semibold hidden md:inline">For enquiries</span>
              <div className="flex items-center gap-1.5">
                <a
                  href="https://wa.me/919071100200?text=Hi,%20I%20have%20an%20enquiry%20regarding%20Grab%20Rentals%20Fleet%20Partner%20onboarding."
                  target="_blank"
                  rel="noreferrer"
                  title="Chat on WhatsApp (9071100200)"
                  className="w-6 h-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-all shadow-2xs hover:scale-105"
                >
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
                <a
                  href="tel:9071100200"
                  title="Call 9071100200"
                  className="w-6 h-6 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center transition-all shadow-2xs hover:scale-105"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
              <a
                href="tel:9071100200"
                className="font-black text-xs text-slate-900 hover:text-amber-600 transition-colors tracking-tight hidden sm:inline"
              >
                9071100200
              </a>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleSkipToDashboard}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 hover:text-amber-800 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-amber-200 transition-all cursor-pointer whitespace-nowrap shrink-0"
                title="Save your current progress and head to the dashboard"
              >
                <span>Skip<span className="hidden sm:inline"> to Dashboard</span></span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 0 && (
              <Link
                href="/login"
                className="text-xs font-bold text-slate-700 hover:text-slate-950 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Form Content Area */}
      <main className="max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 flex-1">
        {/* Progress Stepper (Visible once account is verified) */}
        {currentStep > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Step {currentStep === 1 ? 1 : currentStep === 3 ? 2 : 3} of 3
              </span>
              <span className="text-xs font-semibold text-amber-600">
                {currentStep === 1 && "Personal Details"}
                {currentStep === 3 && "Fleet Operating Model"}
                {currentStep === 4 && "Vehicle & Driver Assets"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  currentStep >= 1 ? "bg-amber-500" : "bg-amber-200/70"
                )}
              />
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  currentStep >= 3 ? "bg-amber-500" : "bg-amber-200/70"
                )}
              />
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  currentStep >= 4 ? "bg-amber-500" : "bg-amber-200/70"
                )}
              />
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && !existingAccountAlert && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Global Success Banner */}
        {successNotice && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successNotice}</div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 0: PHONE NUMBER & ONE-TIME PASSWORD (OTP) CREATION  */}
        {/* ======================================================== */}
        {currentStep === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
            <div className="max-w-md mx-auto space-y-6">
              {/* Step 0 Photo Banner */}
              <div className="relative h-44 rounded-2xl overflow-hidden mb-6 border border-slate-200 shadow-xs">
                <img
                  src="/images/login-hero.jpg"
                  alt="Fleet Partner Registration"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex flex-col justify-end p-4 text-white">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black w-fit mb-1 shadow-xs">
                    <Sparkles className="w-3 h-3" /> OFFICIAL PARTNER ONBOARDING
                  </div>
                  <h3 className="text-base font-bold text-white">100% Business Guaranteed</h3>
                  <p className="text-[11px] text-slate-200">Earn Upto 1 Lakh on Each Vehicle</p>
                </div>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <Phone className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950">
                  Join as a Fleet Partner
                </h1>
                <p className="text-xs text-slate-500">
                  Enter your mobile phone number to verify your partner account with a one-time code.
                </p>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Partner Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Mobile Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/[^0-9]/g, ""));
                          if (existingAccountAlert) setExistingAccountAlert(false);
                        }}
                        placeholder="98765 43210"
                        className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold tracking-wider focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {existingAccountAlert ? (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-slate-900 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertCircle className="w-5 h-5 text-amber-800" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-950 uppercase tracking-wide">
                            Account Already Registered
                          </h4>
                          <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                            An account with mobile number <strong className="text-slate-950 font-bold">+91 {phone}</strong> already exists. Please log in to continue.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row gap-2">
                        <Link
                          href="/login"
                          className="flex-1 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-400 font-black text-xs text-center uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          <span>Go to Login</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setExistingAccountAlert(false);
                            setError("");
                            setPhone("");
                          }}
                          className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-white text-slate-700 font-bold text-xs transition-all cursor-pointer"
                        >
                          Use Different Number
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || phone.length < 10}
                      className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Send Verification Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-600">Code sent to: </span>
                      <strong className="text-slate-900">+91 {phone}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-amber-700 font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        6-Digit One-Time Code
                      </label>
                      {devOtpHint && (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Code: {devOtpHint}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="• • • • • •"
                      className="w-full text-center text-xl tracking-widest font-black py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Didn&apos;t receive the code?</span>
                    {otpCountdown > 0 ? (
                      <span className="font-semibold text-slate-400">Resend in {otpCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="font-bold text-amber-600 hover:underline"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Verify & Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 1: PERSONAL & CONTACT DETAILS                       */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
            {/* Step 1 Photo Banner */}
            <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
              <img
                src="/images/cars/innova.jpg"
                alt="Personal & Contact Details"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Step 1 of 3</span>
                <h3 className="text-base font-bold text-white">Partner Identity & Verification</h3>
                <p className="text-[11px] text-slate-200">Verified identity credentials ensure fast fleet onboarding & immediate trip assignment</p>
              </div>
            </div>

            <div className="border-b border-slate-100 pb-5">
              <h2 className="text-xl font-black text-slate-950">
                Step 1: Personal & Contact Details
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide your primary contact and personal information for fleet management and trip coordination.
              </p>
            </div>

            <form onSubmit={handleSaveStep1} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Primary Phone (Verified) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Primary Phone Number
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Check className="w-3 h-3 stroke-[3]" /> Verified
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      readOnly
                      className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold tracking-wider text-slate-700 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Verified with one-time code.</p>
                </div>

                {/* Alternate Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Alternative Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={alternatePhone}
                      onChange={(e) => setAlternatePhone(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="98765 12340"
                      className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold tracking-wider focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Secondary contact for emergency and operations.</p>
                </div>

                {/* Email Address */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    {email.trim() && (
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                          /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
                            ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                            : "text-rose-700 bg-rose-50 border border-rose-200"
                        )}
                      >
                        {/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) ? (
                          <>
                            <Check className="w-2.5 h-2.5 stroke-[3]" /> Valid Email
                          </>
                        ) : (
                          "Invalid Format"
                        )}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ramesh.kumar@gmail.com"
                      className={cn(
                        "w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none transition-all",
                        email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
                          ? "border-rose-300 focus:ring-2 focus:ring-rose-500 bg-rose-50/20"
                          : "border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white"
                      )}
                      required
                    />
                  </div>
                  {email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) ? (
                    <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                      Please enter a valid email address (e.g. name@example.com)
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1">For trip invoices and monthly statements.</p>
                  )}
                </div>

                {/* Operating City */}
                {/* Operating City */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Operating City <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCityModalOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200 transition-all cursor-pointer shadow-2xs"
                    >
                      <MapPin className="w-3 h-3 text-amber-600" />
                      <span>Choose Cities</span>
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={userCity}
                      onChange={(e) => {
                        setUserCity(e.target.value);
                        setBusinessCity(e.target.value);
                      }}
                      placeholder="e.g. Bangalore, Coimbatore, Chennai"
                      className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setIsCityModalOpen(true)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Select</span>
                    </button>
                  </div>

                  {/* Active Selected City Badges */}
                  {userCity && userCity.includes(",") && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {userCity.split(",").map((c) => c.trim()).filter(Boolean).map((city) => (
                        <span
                          key={city}
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80"
                        >
                          <span>{city}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const remaining = userCity
                                .split(",")
                                .map((x) => x.trim())
                                .filter((x) => x && x.toLowerCase() !== city.toLowerCase())
                                .join(", ");
                              setUserCity(remaining);
                              setBusinessCity(remaining);
                            }}
                            className="text-amber-600 hover:text-rose-600 transition"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 mt-1">
                    Choose multiple operating cities across Karnataka and Tamil Nadu.
                  </p>
                </div>

                {/* Current / Residential Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Residential / Communication Address
                  </label>
                  <div className="relative">
                    <Home className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <textarea
                      rows={2}
                      value={userAddress}
                      onChange={(e) => setUserAddress(e.target.value)}
                      placeholder="Flat/House No., Street, Area, Landmark"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Identity & Address Proofs */}
                <div className="sm:col-span-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        Verification Proofs (ID & Address)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Attach clear photos or PDF copies for quick account verification and compliance approval.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* ID Proof Card */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            Government ID Proof <span className="text-rose-500">*</span>
                          </p>
                          <p className="text-[11px] text-slate-500">Aadhaar, Voter ID, Passport, or Driving License</p>
                        </div>
                        {idProofDocument && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" /> Attached
                          </span>
                        )}
                      </div>

                      <input
                        type="file"
                        id="step1-id-proof"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleDocumentUpload("idProof", f);
                        }}
                      />

                      {idProofDocument ? (
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                            <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="text-[11px] font-semibold text-slate-800 truncate">
                              {docFileNames?.idProof || "ID Proof Attached"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={idProofDocument}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-colors shadow-2xs"
                            >
                              <ExternalLink className="w-3 h-3 text-amber-500" />
                              <span>View</span>
                            </a>
                            <label
                              htmlFor="step1-id-proof"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-amber-50 hover:text-amber-800 text-slate-600 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              {uploadingDocs?.idProof ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                                  <span>...</span>
                                </>
                              ) : (
                                <span>Change</span>
                              )}
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="step1-id-proof"
                          className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/30 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {uploadingDocs?.idProof ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                              <span>Uploading ID Proof...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-4 h-4 text-amber-500" />
                              <span>Upload ID Proof (PDF / Image)</span>
                            </>
                          )}
                        </label>
                      )}
                    </div>

                    {/* Address Proof Card */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            Residential / Address Proof <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                          </p>
                          <p className="text-[11px] text-slate-500">Electricity Bill, Rental Agreement, or Gas Bill</p>
                        </div>
                        {addressProofDocument && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" /> Attached
                          </span>
                        )}
                      </div>

                      <input
                        type="file"
                        id="step1-address-proof"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleDocumentUpload("addressProof", f);
                        }}
                      />

                      {addressProofDocument ? (
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                            <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="text-[11px] font-semibold text-slate-800 truncate">
                              {docFileNames?.addressProof || "Address Proof Attached"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={addressProofDocument}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-colors shadow-2xs"
                            >
                              <ExternalLink className="w-3 h-3 text-amber-500" />
                              <span>View</span>
                            </a>
                            <label
                              htmlFor="step1-address-proof"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-amber-50 hover:text-amber-800 text-slate-600 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              {uploadingDocs?.addressProof ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                                  <span>...</span>
                                </>
                              ) : (
                                <span>Change</span>
                              )}
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="step1-address-proof"
                          className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/30 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {uploadingDocs?.addressProof ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                              <span>Uploading Address Proof...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-4 h-4 text-amber-500" />
                              <span>Upload Address Proof (PDF / Image)</span>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>


              {/* Step 1 Actions */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !partnerName.trim() ||
                    !userCity.trim() ||
                    !email.trim() ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) ||
                    !idProofDocument
                  }
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Save & Continue to Step 2</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: BUSINESS PROFILE & REGISTRATION (BYPASSED / DEFAULT INDIVIDUAL PARTNER) */}
        {/* ======================================================== */}
        {/* Individual Partner is set as default; bypassing this step */}
        {false && currentStep === 2 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
            {/* Step 2 Photo Banner */}
            <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
              <img
                src="/images/fleet/bus.jpg"
                alt="Business Profile & Registration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Step 2 of 4</span>
                <h3 className="text-base font-bold text-white">Commercial & Enterprise Fleet Setup</h3>
                <p className="text-[11px] text-slate-200">GST, MSME, or individual business profiles tailored for rental operations</p>
              </div>
            </div>

            <div className="border-b border-slate-100 pb-5">
              <h2 className="text-xl font-black text-slate-950">
                Step 2: Business Profile & Registration
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Do you operate your fleet under a registered business or company?
              </p>
            </div>

            {/* Question: Owns Business? (Yes / No cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setOwnsBusiness(true)}
                className={cn(
                  "p-5 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer",
                  ownsBusiness === true
                    ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    ownsBusiness === true
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      Yes, I have a Registered Business
                    </span>
                    {ownsBusiness === true && <Check className="w-4 h-4 text-amber-600 stroke-[3]" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    GST-registered firm, Private Limited, LLP, or registered travel agency.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOwnsBusiness(false)}
                className={cn(
                  "p-5 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer",
                  ownsBusiness === false
                    ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    ownsBusiness === false
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      No, I am an Individual Partner
                    </span>
                    {ownsBusiness === false && <Check className="w-4 h-4 text-amber-600 stroke-[3]" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Independent vehicle owner, private car partner, or sole chauffeur.
                  </p>
                </div>
              </button>
            </div>

            {/* If YES: Collect Business Details (GST, Business Name, PAN, Address) */}
            {ownsBusiness === true && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Company & Tax Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Legal Business / Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Apex Fleet Logistics Private Limited"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      GST Identification Number (GSTIN)
                    </label>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="29AAAAA0000A1Z5"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Business PAN / Tax ID
                    </label>
                    <input
                      type="text"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      placeholder="AAAAA0000A"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Business Structure
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Private Limited">Private Limited Company</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership Firm">Partnership Firm</option>
                      <option value="LLP">Limited Liability Partnership (LLP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Operating City
                    </label>
                    <input
                      type="text"
                      value={businessCity}
                      onChange={(e) => setBusinessCity(e.target.value)}
                      placeholder="e.g. Mumbai, Bengaluru"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Registered Office Address
                    </label>
                    <input
                      type="text"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      placeholder="Shop/Office No., Street, Area"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Business Verification Proofs */}
                  <div className="sm:col-span-2 pt-4 border-t border-slate-200 space-y-3">
                    <div>
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        Business & Statutory Proofs
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Upload official business registration certificate and statutory documents.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Business Registration Proof Card */}
                      <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                              Business Registration Proof <span className="text-rose-500">*</span>
                            </p>
                            <p className="text-[11px] text-slate-500">MSME Udyam, Trade License, or Incorporation Certificate</p>
                          </div>
                          {businessProofDocument && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                              <Check className="w-2.5 h-2.5 stroke-[3]" /> Attached
                            </span>
                          )}
                        </div>

                        <input
                          type="file"
                          id="step2-business-proof"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleDocumentUpload("businessProof", f);
                          }}
                        />

                        {businessProofDocument ? (
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                              <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="text-[11px] font-semibold text-slate-800 truncate">
                                {docFileNames?.businessProof || "Business Proof Attached"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <a
                                href={businessProofDocument}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-colors shadow-2xs"
                              >
                                <ExternalLink className="w-3 h-3 text-amber-500" />
                                <span>View</span>
                              </a>
                              <label
                                htmlFor="step2-business-proof"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-amber-50 hover:text-amber-800 text-slate-600 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                {uploadingDocs?.businessProof ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                                    <span>...</span>
                                  </>
                                ) : (
                                  <span>Change</span>
                                )}
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="step2-business-proof"
                            className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/30 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {uploadingDocs?.businessProof ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                                <span>Uploading Business Proof...</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="w-4 h-4 text-amber-500" />
                                <span>Upload Business Proof (PDF / Image)</span>
                              </>
                            )}
                          </label>
                        )}
                      </div>

                      {/* GST Certificate Proof Card */}
                      <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                              GST Registration Certificate
                            </p>
                            <p className="text-[11px] text-slate-500">Government REG-06 certificate copy (Optional)</p>
                          </div>
                          {gstDocument ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                              <Check className="w-2.5 h-2.5 stroke-[3]" /> Attached
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 shrink-0">
                              Optional
                            </span>
                          )}
                        </div>

                        <input
                          type="file"
                          id="step2-gst-proof"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleDocumentUpload("gst", f);
                          }}
                        />

                        {gstDocument ? (
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                              <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="text-[11px] font-semibold text-slate-800 truncate">
                                {docFileNames?.gst || "GST Document Attached"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <a
                                href={gstDocument}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-colors shadow-2xs"
                              >
                                <ExternalLink className="w-3 h-3 text-amber-500" />
                                <span>View</span>
                              </a>
                              <label
                                htmlFor="step2-gst-proof"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-amber-50 hover:text-amber-800 text-slate-600 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                {uploadingDocs?.gst ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                                    <span>...</span>
                                  </>
                                ) : (
                                  <span>Change</span>
                                )}
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="step2-gst-proof"
                            className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/30 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {uploadingDocs?.gst ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                                <span>Uploading GST Proof...</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="w-4 h-4 text-amber-500" />
                                <span>Upload GST Certificate (PDF / Image)</span>
                              </>
                            )}
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* If NO: Confirmation for Individual Partner */}
            {ownsBusiness === false && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>Individual Partner Information</span>
                </div>
                <p className="text-xs text-slate-600">
                  You will be registered as an individual partner. You can add commercial vehicles and start receiving trip assignments under your personal name.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Operating City
                  </label>
                  <input
                    type="text"
                    value={businessCity}
                    onChange={(e) => setBusinessCity(e.target.value)}
                    placeholder="e.g. Pune, Delhi NCR"
                    className="w-full sm:w-1/2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Step 1
              </button>

              <button
                type="button"
                onClick={handleSaveStep2}
                disabled={
                  loading ||
                  ownsBusiness === null ||
                  (ownsBusiness === true && (!businessName.trim() || !businessProofDocument))
                }
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Save & Continue to Step 3</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: FLEET OPERATING MODEL (CHOICE 1 VS CHOICE 2)      */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
            {/* Step 3 Photo Banner */}
            <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
              <img
                src="/images/hero-bg.jpg"
                alt="Fleet Operating Structure"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Step 2 of 3</span>
                <h3 className="text-base font-bold text-white">Select Fleet Operating Model</h3>
                <p className="text-[11px] text-slate-200">Tailored dispatch configurations for owner-operators and commercial multi-fleet companies</p>
              </div>
            </div>

            <div className="border-b border-slate-100 pb-5">
              <h2 className="text-xl font-black text-slate-950">
                Step 2: Fleet Operating Structure
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose how your fleet operates with Grab Rentals.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Option 1: I Drive My Own Fleet */}
              <div
                onClick={() => handleSaveStep3(1)}
                className={cn(
                  "p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between group",
                  fleetModel === 1
                    ? "border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-500/20"
                    : "border-slate-200 hover:border-amber-400 bg-white hover:shadow-xs"
                )}
              >
                <div className="space-y-4">
                  <div className="h-32 rounded-2xl overflow-hidden border border-slate-200 relative shadow-2xs">
                    <img
                      src="/images/cars/dzire.jpg"
                      alt="Owner-Driver Sedan"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-400/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
                        Single Vehicle
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Owner-Driver
                      </span>
                      <h3 className="text-base font-black text-slate-950 mt-0.5">
                        1. I Drive my own Fleet
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    You own a vehicle and will be driving it yourself. We will register your vehicle and automatically set you as the designated chauffeur.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Select Option 1 &rarr;
                  </span>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    fleetModel === 1 ? "border-amber-500 bg-amber-500 text-slate-950" : "border-slate-300"
                  )}>
                    {fleetModel === 1 && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>

              {/* Option 2: I Have Multiple Fleet and Multiple Vehicles */}
              <div
                onClick={() => handleSaveStep3(2)}
                className={cn(
                  "p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between group",
                  fleetModel === 2
                    ? "border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-500/20"
                    : "border-slate-200 hover:border-amber-400 bg-white hover:shadow-xs"
                )}
              >
                <div className="space-y-4">
                  <div className="h-32 rounded-2xl overflow-hidden border border-slate-200 relative shadow-2xs">
                    <img
                      src="/images/fleet/tempo.jpg"
                      alt="Multi-Fleet Operator"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 bg-purple-300/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
                        Multiple Fleets
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 shadow-xs">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        Fleet Operator
                      </span>
                      <h3 className="text-base font-black text-slate-950 mt-0.5">
                        2. Multiple Fleet & Vehicles
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    You operate a commercial fleet with multiple cars and hire/assign individual chauffeurs across your fleet.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Select Option 2 &rarr;
                  </span>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    fleetModel === 2 ? "border-amber-500 bg-amber-500 text-slate-950" : "border-slate-300"
                  )}>
                    {fleetModel === 2 && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 Back Control */}
            <div className="flex items-center justify-start pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Step 1
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4A: VEHICLE & DRIVER PROOFS (FOR CHOICE 1: OWNER)    */}
        {/* ======================================================== */}
        {currentStep === 4 && fleetModel === 1 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
            {/* Step 4A Photo Banner */}
            <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
              <img
                src="/images/fleet/suv.jpg"
                alt="Owner-Driver Vehicle Setup"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Step 3 of 3</span>
                <h3 className="text-base font-bold text-white">Owner-Driver Vehicle & Chauffeur Profile</h3>
                <p className="text-[11px] text-slate-200">Register your primary vehicle, luxury amenities, and commercial chauffeur qualifications</p>
              </div>
            </div>

            <div className="border-b border-slate-100 pb-5">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full mb-1">
                <Car className="w-3 h-3" /> Owner-Driver Setup
              </div>
              <h2 className="text-xl font-black text-slate-950">
                Step 3: Vehicle Details & Chauffeur Profile
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add your vehicle specifications, luxury features, chauffeur credentials, and verify compliance proofs.
              </p>
            </div>

            <form onSubmit={handleSaveSingleFleet} className="space-y-8">
              {/* Section 1: Assigned Driver (Self) */}
              <div className="p-6 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Chauffeur Information (Assigned to You)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                    Primary Driver
                  </span>
                </div>

                {/* Driver Photo Upload & Preview */}
                <div className="p-3.5 rounded-2xl bg-white border border-amber-200/60 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative shrink-0 shadow-2xs">
                    {driverPhoto ? (
                      <img src={driverPhoto} alt="Driver Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 text-[10px] gap-1">
                        <Camera className="w-5 h-5 text-slate-300" />
                        <span>Driver Photo</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800">
                        Chauffeur Profile Photo <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">Displayed to passengers</span>
                    </div>
                    <label className={cn(
                      "flex items-center justify-between p-2 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                      driverPhoto ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/20"
                    )}>
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp"
                        className="hidden"
                        onChange={(e) => handleDocumentUpload("driverPhoto", e.target.files?.[0])}
                      />
                      {uploadingDocs.driverPhoto ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading photo...</span>
                        </div>
                      ) : driverPhoto ? (
                        <div className="flex items-center justify-between w-full text-left gap-2">
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {docFileNames.driverPhoto || "Chauffeur photo attached"}
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 shrink-0">Change Photo</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full text-slate-600 text-xs">
                          <div className="flex items-center gap-1.5">
                            <UploadCloud className="w-4 h-4 text-amber-600" />
                            <span>Upload Professional Chauffeur Photo</span>
                          </div>
                          <span className="text-[10px] text-slate-400">JPG, PNG</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Chauffeur Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        placeholder="Chauffeur Name"
                        className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Chauffeur Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone ? `+91 ${phone}` : ""}
                        readOnly
                        className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold tracking-wider bg-slate-50 text-slate-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Email (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={driverEmail || email}
                        onChange={(e) => setDriverEmail(e.target.value)}
                        placeholder="driver@example.com"
                        className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date of Birth <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={driverDob}
                      onChange={(e) => setDriverDob(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gender <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={driverGender}
                      onChange={(e) => setDriverGender(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* COMMENTED OUT: ID Proof Type, ID Proof Number, Upload ID Proof Copy, Driving License Number */}
                  {false && (
                    <>
                      {/* ID Proof Type */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ID Proof Type <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={driverIdProofType}
                          onChange={(e) => setDriverIdProofType(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        >
                          <option value="Aadhaar Card">Aadhaar Card</option>
                          <option value="Voter ID">Voter ID</option>
                          <option value="Passport">Passport</option>
                          <option value="PAN Card">PAN Card</option>
                        </select>
                      </div>

                      {/* ID Proof Number */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ID Proof Number
                        </label>
                        <input
                          type="text"
                          value={driverIdProofNumber}
                          onChange={(e) => setDriverIdProofNumber(e.target.value.toUpperCase())}
                          placeholder="e.g. 1234 5678 9012"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      {/* Upload ID Proof */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Upload ID Proof Copy
                        </label>
                        <label className={cn(
                          "flex items-center justify-between p-2 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                          docFileNames.driverIdProof ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 hover:border-amber-400 bg-white"
                        )}>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="hidden"
                            onChange={(e) => handleDocumentUpload("driverIdProof", e.target.files?.[0])}
                          />
                          <span className="text-[11px] text-slate-700 truncate">
                            {docFileNames.driverIdProof || "Upload ID Proof"}
                          </span>
                          <UploadCloud className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        </label>
                      </div>

                      {/* Commercial Driving License Number */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Driving License Number
                        </label>
                        <input
                          type="text"
                          value={driverLicenseNumber}
                          onChange={(e) => setDriverLicenseNumber(e.target.value.toUpperCase())}
                          placeholder="DL-1420110012345"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </>
                  )}

                  {/* License Class */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Licence Type / Class
                    </label>
                    <select
                      value={driverLicenseClass}
                      onChange={(e) => setDriverLicenseClass(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="LMV-TR (Transport)">LMV-TR (Commercial Transport)</option>
                      <option value="LMV (Light Motor Vehicle)">LMV (Light Motor Vehicle)</option>
                      <option value="HMV / HGMV">HMV / Heavy Transport</option>
                      <option value="Commercial PSV Badge">Commercial PSV Badge</option>
                    </select>
                  </div>

                  {/* COMMENTED OUT: License Expiry Date, Driving Since (Date), Experience */}
                  {false && (
                    <>
                      {/* License Expiry Date */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          License Expiry Date
                        </label>
                        <input
                          type="date"
                          value={driverLicenseExpiry}
                          onChange={(e) => setDriverLicenseExpiry(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      {/* Driving Since (date) */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span>Driving Since (Date)</span>
                        </label>
                        <input
                          type="date"
                          value={drivingSince}
                          onChange={(e) => handleDrivingSinceChange(e.target.value, false)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      {/* Automatically Experience field should display the experience number */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span>Experience</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Auto-Calculated
                          </span>
                        </label>
                        <div className="relative">
                          <Clock className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={driverExperienceYears}
                            readOnly
                            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50/80 text-amber-950 font-bold text-xs cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* COMMENTED OUT: Chauffeur Status */}
                  {false && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Chauffeur Status
                      </label>
                      <select
                        value={driverStatus}
                        onChange={(e) => setDriverStatus(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold text-emerald-700"
                      >
                        <option value="Available">Available (Default)</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Off-duty">Off-duty</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  )}

                  {/* Emergency Contact Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Emergency Contact Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      placeholder="e.g. Spouse / Sibling"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Emergency Contact Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Emergency Contact Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* COMMENTED OUT: Joining Date (Optional) */}
                  {false && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Joining Date <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="date"
                        value={joiningDate}
                        onChange={(e) => setJoiningDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Upload Driver License Copy */}
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Upload Driving License Proof <span className="text-rose-500">*</span>
                    </label>
                    <label className={cn(
                      "flex items-center justify-between p-2.5 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                      docFileNames.license ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/20"
                    )}>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="hidden"
                        onChange={(e) => handleDocumentUpload("license", e.target.files?.[0])}
                      />
                      {uploadingDocs.license ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading license document...</span>
                        </div>
                      ) : docFileNames.license ? (
                        <div className="flex items-center justify-between w-full text-left gap-2">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {docFileNames.license}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-700 hover:underline shrink-0">
                            Change
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full text-slate-600">
                          <div className="flex items-center gap-2">
                            <UploadCloud className="w-4 h-4 text-amber-600" />
                            <span className="text-xs font-semibold">Upload Driving License Copy</span>
                          </div>
                          <span className="text-[10px] text-slate-400">PDF, JPG, PNG</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Languages Spoken */}
                  <div className="sm:col-span-2 md:col-span-3 pt-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Languages Spoken
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["English", "Tamil", "Hindi", "Telugu", "Kannada", "Malayalam"].map((lang) => {
                        const isSel = languagesSpoken.includes(lang);
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => {
                              setLanguagesSpoken((prev) =>
                                isSel ? prev.filter((l) => l !== lang) : [...prev, lang]
                              );
                            }}
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                              isSel ? "bg-amber-500 text-slate-950 shadow-xs" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                            )}
                          >
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Vehicle Specs */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Vehicle Details
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Commercial Fleet Asset
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Plate Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Vehicle Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => {
                        setVehicleNumber(e.target.value.toUpperCase());
                        if (plateCheckWarning) setPlateCheckWarning("");
                      }}
                      onBlur={(e) => verifyPlateLive(e.target.value)}
                      placeholder="MH 02 AB 1234"
                      className={cn(
                        "w-full px-3.5 py-2 rounded-xl border text-xs font-mono font-bold bg-white focus:ring-2 focus:outline-none transition-all",
                        plateCheckWarning
                          ? "border-rose-400 focus:ring-rose-400 bg-rose-50/30"
                          : "border-slate-200 focus:ring-amber-500"
                      )}
                      required
                    />
                    {checkingPlate && (
                      <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                        <Loader2 className="w-3 h-3 animate-spin text-amber-500" /> Checking plate availability...
                      </p>
                    )}
                    {plateCheckWarning && (
                      <p className="text-[10px] text-rose-600 mt-1 flex items-start gap-1 font-semibold bg-rose-50 p-1.5 rounded-lg border border-rose-200">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500 mt-0.5" />
                        <span>{plateCheckWarning}</span>
                      </p>
                    )}
                  </div>

                  {/* COMMENTED OUT: Model, Vehicle Variant, Vehicle Color */}
                  {false && (
                    <>
                      {/* Make & Model */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Model
                        </label>
                        <input
                          type="text"
                          value={vehicleModel}
                          onChange={(e) => setVehicleModel(e.target.value)}
                          placeholder="e.g. Maruti Suzuki Dzire"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      {/* Vehicle Variant Field */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Vehicle Variant
                        </label>
                        <input
                          type="text"
                          value={vehicleVariant}
                          onChange={(e) => setVehicleVariant(e.target.value)}
                          placeholder="e.g. VXI / Titanium / ZX"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      {/* Vehicle Color Field */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Vehicle Color
                        </label>
                        <input
                          type="text"
                          value={vehicleColor}
                          onChange={(e) => setVehicleColor(e.target.value)}
                          placeholder="e.g. Pearl White / Arctic Silver"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </>
                  )}

                  {/* COMMENTED OUT: Registration Type */}
                  {false && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Registration Type
                      </label>
                      <select
                        value={registrationType}
                        onChange={(e) => setRegistrationType(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold text-amber-800"
                      >
                        <option value="Yellow Board (Commercial)">Yellow Board (Commercial)</option>
                        <option value="White Board (Self Drive)">White Board (Self Drive / Private)</option>
                        <option value="All India Tourist Permit (AITP)">All India Tourist Permit (AITP)</option>
                        <option value="Stage Carriage Permit">Stage Carriage Permit</option>
                      </select>
                    </div>
                  )}

                  {/* Vehicle Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Vehicle Category
                    </label>
                    <select
                      value={vehicleCategory}
                      onChange={(e) => {
                        setVehicleCategory(e.target.value);
                        setVehicleSubCategory("");
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Sedan">Sedan (Dzire, Etios, Aura)</option>
                      <option value="Hatchback">Hatchback (WagonR, Swift)</option>
                      <option value="SUV">SUV (Xylo, Ertiga, Carens, marazzo)</option>
                      <option value="Innova">Innova (6+1 Seater, 7+1 Seater) </option>
                      <option value="Innovacrysta">Innova Crysta</option>
                      <option value="innovahycross">Innova Hycross</option>
                      {/*<option value="Premium">Premium Executive (Camry, Fortuner)</option>*/}
                      <option value="Tempo">Tempo Traveller (12+1 Seater, 13+1 Seater)</option>
                      <option value="urbania">Force Urbania (10+1 Seater, 12+1 Seater, 16+1 Seater)</option>
                      <option value="Bus">Bus</option>
                      <option value="Benz">Benz - Executive Class</option>
                    </select>
                  </div>

                  {/* COMMENTED OUT: Sub Category */}
                  {false && VEHICLE_SUB_CATEGORIES[vehicleCategory] && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Sub Category
                      </label>
                      <select
                        value={vehicleSubCategory}
                        onChange={(e) => setVehicleSubCategory(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium text-slate-800"
                      >
                        <option value="">Select Sub Category</option>
                        {VEHICLE_SUB_CATEGORIES[vehicleCategory].map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* COMMENTED OUT: Year of Manufacture */}
                  {false && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Year of Manufacture
                      </label>
                      <input
                        type="number"
                        value={vehicleYear}
                        onChange={(e) => setVehicleYear(e.target.value)}
                        placeholder="2023"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Fuel Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Fuel Type
                    </label>
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Petrol + CNG">Petrol + CNG</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  {/* COMMENTED OUT: Vehicle Transmission */}
                  {false && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Vehicle Transmission
                      </label>
                      <select
                        value={transmission}
                        onChange={(e) => setTransmission(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                  )}

                  {/* Seating Capacity */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Seating Capacity
                    </label>
                    <select
                      value={seatingCapacity}
                      onChange={(e) => setSeatingCapacity(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="4">4 Seater + Driver</option>
                      <option value="6">6 Seater + Driver</option>
                      <option value="7">7 Seater + Driver</option>
                      <option value="8">8 Seater</option>
                      <option value="12">12 Seater (Tempo)</option>
                      <option value="18">18 Seater (Tempo)</option>
                      <option value="26">26 Seater (Mini Bus)</option>
                      <option value="35">35 Seater (Coach)</option>
                    </select>
                  </div>

                  {/* COMMENTED OUT: Engine Displacement (CC), Parking Location with map */}
                  {false && (
                    <>
                      {/* Engine CC */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Engine Displacement (CC)
                        </label>
                        <div className="relative">
                          <Gauge className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="number"
                            value={engineCc}
                            onChange={(e) => setEngineCc(e.target.value)}
                            placeholder="e.g. 1498"
                            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Parking Location (interactive map pin) */}
                      <div className="sm:col-span-2 md:col-span-3">
                        <InteractiveMapPicker
                          value={parkingLocation}
                          onChange={(loc) => setParkingLocation(loc)}
                          placeholder="Pin parking hub or street address (e.g. Airport Bay 4B, Chennai)"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* COMMENTED OUT: Vehicle Features & Luxury Amenities */}
                {false && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        Vehicle Features & Luxury Amenities
                      </label>
                      <span className="text-[10px] font-semibold text-slate-500">
                        Select all installed options
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { name: "Sunroof", icon: Sparkles },
                        { name: "360 Camera", icon: Eye },
                        { name: "ADAS Level 2", icon: Zap },
                        { name: "Luggage Carrier", icon: Car },
                        { name: "Smart TV / Screen", icon: Tv },
                        { name: "Dual-Zone AC", icon: Wind },
                        { name: "Ventilated Seats", icon: Award },
                        { name: "Recliner Seats", icon: Star },
                      ].map(({ name, icon: IconComp }) => {
                        const isChecked = vehicleFeatures.includes(name);
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => toggleFeature(name)}
                            className={cn(
                              "flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                              isChecked
                                ? "bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:border-amber-300"
                            )}
                          >
                            <div className={cn(
                              "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                              isChecked ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-500"
                            )}>
                              <IconComp className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs truncate">{name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Multiple Vehicle Photos Upload (Exterior & Interior) */}
                <div className="pt-2">
                  <MultipleVehiclePhotoUploader
                    photos={vehiclePhotos}
                    photoSlots={vehiclePhotoSlots}
                    onChange={(newPhotos, newSlots) => {
                      setVehiclePhotos(newPhotos);
                      if (newSlots) setVehiclePhotoSlots(newSlots);
                      setVehicleImage(newSlots?.front || newPhotos[0] || "");
                    }}
                  />
                </div>
              </div>

              {/* Section 3: Compliance Proofs with Expiry Dates */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Vehicle Compliance Proofs with Expiry Dates
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">
                    Mandatory for trip insurance & dispatch
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Registration Certificate (RC) */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        1. Registration Certificate (RC)
                      </span>
                      {docFileNames.rc && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" /> Uploaded
                        </span>
                      )}
                    </div>

                    {/* COMMENTED OUT: RC Expiry Date */}
                    {false && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          RC Expiry Date
                        </label>
                        <input
                          type="date"
                          value={rcExpiry}
                          onChange={(e) => setRcExpiry(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Upload RC Proof Document
                      </label>
                      <label className={cn(
                        "flex items-center justify-between p-2.5 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                        docFileNames.rc
                          ? "border-emerald-300 bg-emerald-50/40"
                          : "border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/20"
                      )}>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => handleDocumentUpload("rc", e.target.files?.[0])}
                        />
                        {uploadingDocs.rc ? (
                          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading document...</span>
                          </div>
                        ) : docFileNames.rc ? (
                          <div className="flex items-center justify-between w-full text-left gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="text-xs font-semibold text-slate-900 truncate">
                                {docFileNames.rc}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-amber-700 hover:underline shrink-0">
                              Change
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <UploadCloud className="w-4 h-4 text-amber-600" />
                              <span className="text-xs font-semibold">Upload RC File</span>
                            </div>
                            <span className="text-[10px] text-slate-400">PDF, JPG, PNG</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* 2. Commercial Insurance */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        2. Insurance Policy
                      </span>
                      {docFileNames.insurance && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" /> Uploaded
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Insurance Expiry Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={insuranceExpiry}
                        onChange={(e) => setInsuranceExpiry(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Upload Insurance Policy Proof
                      </label>
                      <label className={cn(
                        "flex items-center justify-between p-2.5 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                        docFileNames.insurance
                          ? "border-emerald-300 bg-emerald-50/40"
                          : "border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/20"
                      )}>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => handleDocumentUpload("insurance", e.target.files?.[0])}
                        />
                        {uploadingDocs.insurance ? (
                          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading document...</span>
                          </div>
                        ) : docFileNames.insurance ? (
                          <div className="flex items-center justify-between w-full text-left gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="text-xs font-semibold text-slate-900 truncate">
                                {docFileNames.insurance}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-amber-700 hover:underline shrink-0">
                              Change
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <UploadCloud className="w-4 h-4 text-amber-600" />
                              <span className="text-xs font-semibold">Upload Policy File</span>
                            </div>
                            <span className="text-[10px] text-slate-400">PDF, JPG, PNG</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* 3. Fitness Certificate */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        3. Vehicle Fitness Certificate
                      </span>
                      {docFileNames.fitness && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" /> Uploaded
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Fitness Expiry Date
                      </label>
                      <input
                        type="date"
                        value={fitnessExpiry}
                        onChange={(e) => setFitnessExpiry(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Upload Fitness Certificate Proof
                      </label>
                      <label className={cn(
                        "flex items-center justify-between p-2.5 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                        docFileNames.fitness
                          ? "border-emerald-300 bg-emerald-50/40"
                          : "border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/20"
                      )}>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => handleDocumentUpload("fitness", e.target.files?.[0])}
                        />
                        {uploadingDocs.fitness ? (
                          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading document...</span>
                          </div>
                        ) : docFileNames.fitness ? (
                          <div className="flex items-center justify-between w-full text-left gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="text-xs font-semibold text-slate-900 truncate">
                                {docFileNames.fitness}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-amber-700 hover:underline shrink-0">
                              Change
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <UploadCloud className="w-4 h-4 text-amber-600" />
                              <span className="text-xs font-semibold">Upload Fitness File</span>
                            </div>
                            <span className="text-[10px] text-slate-400">PDF, JPG, PNG</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* COMMENTED OUT: 4. Commercial Tourist Permit */}
                  {false && (
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          4. Commercial Tourist Permit
                        </span>
                        {docFileNames.permit && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" /> Uploaded
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Permit Expiry Date
                        </label>
                        <input
                          type="date"
                          value={permitExpiry}
                          onChange={(e) => setPermitExpiry(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Upload Permit Proof Document
                        </label>
                        <label className={cn(
                          "flex items-center justify-between p-2.5 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                          docFileNames.permit
                            ? "border-emerald-300 bg-emerald-50/40"
                            : "border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/20"
                        )}>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="hidden"
                            onChange={(e) => handleDocumentUpload("permit", e.target.files?.[0])}
                          />
                          {uploadingDocs.permit ? (
                            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Uploading document...</span>
                            </div>
                          ) : docFileNames.permit ? (
                            <div className="flex items-center justify-between w-full text-left gap-2">
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="text-xs font-semibold text-slate-900 truncate">
                                  {docFileNames.permit}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-amber-700 hover:underline shrink-0">
                                Change
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <UploadCloud className="w-4 h-4 text-amber-600" />
                                <span className="text-xs font-semibold">Upload Permit File</span>
                              </div>
                              <span className="text-[10px] text-slate-400">PDF, JPG, PNG</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  )}

                  {/* COMMENTED OUT: 5. Pollution Under Control (PUC) Certificate */}
                  {false && (
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3 shadow-xs sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-teal-600" />
                          5. Pollution Under Control (PUC) Certificate
                        </span>
                        {docFileNames.puc && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" /> Uploaded
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            PUC Expiry Date
                          </label>
                          <input
                            type="date"
                            value={pucExpiry}
                            onChange={(e) => setPucExpiry(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Upload PUC Proof Document
                          </label>
                          <label className={cn(
                            "flex items-center justify-between p-2.5 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                            docFileNames.puc
                              ? "border-emerald-300 bg-emerald-50/40"
                              : "border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/20"
                          )}>
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              className="hidden"
                              onChange={(e) => handleDocumentUpload("puc", e.target.files?.[0])}
                            />
                            {uploadingDocs.puc ? (
                              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Uploading document...</span>
                              </div>
                            ) : docFileNames.puc ? (
                              <div className="flex items-center justify-between w-full text-left gap-2">
                                <div className="flex items-center gap-2 truncate">
                                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span className="text-xs font-semibold text-slate-900 truncate">
                                    {docFileNames.puc}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold text-amber-700 hover:underline shrink-0">
                                  Change
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between w-full text-slate-600">
                                <div className="flex items-center gap-1.5">
                                  <UploadCloud className="w-4 h-4 text-amber-600" />
                                  <span className="text-xs font-semibold">Upload PUC File</span>
                                </div>
                                <span className="text-[10px] text-slate-400">PDF, JPG, PNG</span>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3 Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Change Operating Model
                </button>

                <div className="flex items-center justify-end w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Finish & Go to Dashboard</span>
                        <Check className="w-4 h-4 stroke-[3]" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4B: MULTI FLEET & MULTIPLE DRIVERS (FOR CHOICE 2)   */}
        {/* ======================================================== */}
        {currentStep === 4 && fleetModel === 2 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
            {/* Step 4B Photo Banner */}
            <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
              <img
                src="/images/fleet/tempo.jpg"
                alt="Commercial Multi-Fleet Setup"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">Step 3 of 3</span>
                <h3 className="text-base font-bold text-white">Multi-Fleet & Driver Roster Management</h3>
                <p className="text-[11px] text-slate-200">Scale your commercial rental operations with multiple vehicles and verified chauffeurs</p>
              </div>
            </div>

            <div className="border-b border-slate-100 pb-5">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full mb-1">
                <Users className="w-3 h-3" /> Multi-Vehicle Fleet Setup
              </div>
              <h2 className="text-xl font-black text-slate-950">
                Step 3: Register Fleet Vehicles & Drivers
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add commercial vehicles with proofs and expiry dates, along with your chauffeur roster.
              </p>
            </div>

            {/* List of Added Vehicles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-amber-600" />
                  <span>Fleet Vehicles ({vehiclesList.length})</span>
                </span>
                {!showAddVehicleForm && (
                  <button
                    type="button"
                    onClick={() => {
                      resetVehicleForm();
                      setShowAddVehicleForm(true);
                    }}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Another Vehicle
                  </button>
                )}
              </div>

              {vehiclesList.length > 0 && (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                  {vehiclesList.map((v) => (
                    <div key={v.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        {v.imageUrl && (
                          <img
                            src={v.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        )}
                        <div>
                          <span className="font-mono font-bold text-slate-900">{v.vehicleNumber}</span>
                          <span className="text-slate-500 ml-2">· {v.vehicleModel} ({v.vehicleType})</span>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2">
                            <span>Insurance: {v.insuranceExpiry}</span>
                            {v.rcExpiry && <span>· RC: {v.rcExpiry}</span>}
                            {v.permitExpiry && <span>· Permit: {v.permitExpiry}</span>}
                            {v.fitnessExpiry && <span>· Fitness: {v.fitnessExpiry}</span>}
                            {v.pucExpiry && <span>· PUC: {v.pucExpiry}</span>}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Ready
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Vehicle Inline Form */}
              {showAddVehicleForm && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-amber-600" />
                      <span>Add Commercial Vehicle & Compliance Proofs</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">All 5 compliance proofs</span>
                  </div>

                  {/* Section A: Vehicle Basic Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Plate Number *
                      </label>
                      <input
                        type="text"
                        value={vehicleNumber}
                        onChange={(e) => {
                          setVehicleNumber(e.target.value.toUpperCase());
                          if (plateCheckWarning) setPlateCheckWarning("");
                        }}
                        onBlur={(e) => verifyPlateLive(e.target.value)}
                        placeholder="MH 02 CD 1234"
                        className={cn(
                          "w-full px-3 py-1.5 rounded-xl border text-xs font-mono font-bold bg-white focus:ring-2 focus:outline-none transition-all",
                          plateCheckWarning
                            ? "border-rose-400 focus:ring-rose-400 bg-rose-50/30"
                            : "border-slate-200 focus:ring-amber-500"
                        )}
                      />
                      {checkingPlate && (
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                          <Loader2 className="w-3 h-3 animate-spin text-amber-500" /> Checking plate availability...
                        </p>
                      )}
                      {plateCheckWarning && (
                        <p className="text-[10px] text-rose-600 mt-1 flex items-start gap-1 font-semibold bg-rose-50 p-1.5 rounded-lg border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500 mt-0.5" />
                          <span>{plateCheckWarning}</span>
                        </p>
                      )}
                    </div>
                    {/* COMMENTED OUT: Model, Vehicle Variant, Vehicle Color */}
                    {false && (
                      <>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Model
                          </label>
                          <input
                            type="text"
                            value={vehicleModel}
                            onChange={(e) => setVehicleModel(e.target.value)}
                            placeholder="e.g. Toyota Innova Crysta"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Vehicle Variant
                          </label>
                          <input
                            type="text"
                            value={vehicleVariant}
                            onChange={(e) => setVehicleVariant(e.target.value)}
                            placeholder="e.g. ZX 2.4 / Titanium"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Vehicle Color
                          </label>
                          <input
                            type="text"
                            value={vehicleColor}
                            onChange={(e) => setVehicleColor(e.target.value)}
                            placeholder="e.g. Garnet Red / Pearl White"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                      </>
                    )}
                    {/* COMMENTED OUT: Registration Type */}
                    {false && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Registration Type
                        </label>
                        <select
                          value={registrationType}
                          onChange={(e) => setRegistrationType(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold text-amber-800"
                        >
                          <option value="Yellow Board (Commercial)">Yellow Board (Commercial)</option>
                          <option value="White Board (Self Drive)">White Board (Self Drive)</option>
                          <option value="All India Tourist Permit (AITP)">All India Tourist Permit (AITP)</option>
                          <option value="Stage Carriage Permit">Stage Carriage Permit</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Category
                      </label>
                      <select
                        value={vehicleCategory}
                        onChange={(e) => {
                          setVehicleCategory(e.target.value);
                          setVehicleSubCategory("");
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="Sedan">Sedan (Dzire, Etios, Aura)</option>
                        <option value="Hatchback">Hatchback (WagonR, Swift)</option>
                        <option value="SUV">SUV (Xylo, Ertiga, Carens, marazzo)</option>
                        <option value="Innova">Innova (6+1 Seater, 7+1 Seater)</option>
                        <option value="Innovacrysta">Innova Crysta</option>
                        <option value="innovahycross">Innova Hycross</option>
                        <option value="Tempo">Tempo Traveller (12+1 Seater, 13+1 Seater)</option>
                        <option value="urbania">Force Urbania (10+1 Seater, 12+1 Seater, 16+1 Seater)</option>
                        <option value="Bus">Bus</option>
                        <option value="Benz">Benz - Executive Class</option>
                      </select>
                    </div>

                    {/* COMMENTED OUT: Sub Category */}
                    {false && VEHICLE_SUB_CATEGORIES[vehicleCategory] && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Sub Category
                        </label>
                        <select
                          value={vehicleSubCategory}
                          onChange={(e) => setVehicleSubCategory(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium text-slate-800"
                        >
                          <option value="">Select Sub Category</option>
                          {VEHICLE_SUB_CATEGORIES[vehicleCategory].map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* COMMENTED OUT: Year of Manufacture */}
                    {false && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Year of Manufacture
                        </label>
                        <input
                          type="number"
                          value={vehicleYear}
                          onChange={(e) => setVehicleYear(e.target.value)}
                          placeholder="2023"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Seating Capacity
                      </label>
                      <select
                        value={seatingCapacity}
                        onChange={(e) => setSeatingCapacity(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="4">4 Seater + Driver</option>
                        <option value="6">6 Seater + Driver</option>
                        <option value="7">7 Seater + Driver</option>
                        <option value="8">8 Seater</option>
                        <option value="12">12 Seater (Tempo)</option>
                        <option value="18">18 Seater (Tempo)</option>
                        <option value="26">26 Seater (Mini Bus)</option>
                        <option value="35">35 Seater (Coach)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Fuel Type
                      </label>
                      <select
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Petrol + CNG">Petrol + CNG</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    {/* COMMENTED OUT: Vehicle Transmission, Engine Displacement (CC), Parking Location with map, Vehicle Features & Luxury Amenities */}
                    {false && (
                      <>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Transmission
                          </label>
                          <select
                            value={transmission}
                            onChange={(e) => setTransmission(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          >
                            <option value="Automatic">Automatic</option>
                            <option value="Manual">Manual</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Engine CC
                          </label>
                          <input
                            type="number"
                            value={engineCc}
                            onChange={(e) => setEngineCc(e.target.value)}
                            placeholder="e.g. 1998"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2 md:col-span-3">
                          <InteractiveMapPicker
                            value={parkingLocation}
                            onChange={(loc) => setParkingLocation(loc)}
                            placeholder="Pin parking hub or depot address"
                          />
                        </div>

                        {/* Features options for Model 2 */}
                        <div className="sm:col-span-2 md:col-span-3 pt-2">
                          <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            Vehicle Features & Amenities
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { name: "Sunroof", icon: Sparkles },
                              { name: "360 Camera", icon: Eye },
                              { name: "ADAS Level 2", icon: Zap },
                              { name: "Luggage Carrier", icon: Car },
                              { name: "Smart TV / Screen", icon: Tv },
                              { name: "Dual-Zone AC", icon: Wind },
                              { name: "Ventilated Seats", icon: Award },
                              { name: "Recliner Seats", icon: Star },
                            ].map(({ name, icon: IconComp }) => {
                              const isChecked = vehicleFeatures.includes(name);
                              return (
                                <button
                                  key={name}
                                  type="button"
                                  onClick={() => toggleFeature(name)}
                                  className={cn(
                                    "flex items-center gap-1.5 p-2 rounded-lg border text-left transition-all cursor-pointer text-xs",
                                    isChecked
                                      ? "bg-amber-500 text-slate-950 font-bold border-amber-600"
                                      : "bg-white text-slate-700 border-slate-200 hover:border-amber-300"
                                  )}
                                >
                                  <IconComp className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Section B: Multiple Vehicle Photos (Exterior & Interior) */}
                  <div className="pt-2 border-t border-slate-200/80">
                    <MultipleVehiclePhotoUploader
                      photos={vehiclePhotos}
                      photoSlots={vehiclePhotoSlots}
                      onChange={(newPhotos, newSlots) => {
                        setVehiclePhotos(newPhotos);
                        if (newSlots) setVehiclePhotoSlots(newSlots);
                        setVehicleImage(newSlots?.front || newPhotos[0] || "");
                      }}
                    />
                  </div>

                  {/* Section C: All 5 Compliance Proofs with Expiry Dates */}
                  <div className="pt-2 border-t border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-700" />
                        <span>Vehicle Compliance Proofs & Expiry Dates</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        RC & Insurance mandatory
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* 1. Registration Certificate (RC) */}
                      <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            1. Registration Certificate (RC)
                          </span>
                          {docFileNames.rc && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <Check className="w-2.5 h-2.5 stroke-[3]" /> Uploaded
                            </span>
                          )}
                        </div>
                        {/* COMMENTED OUT: RC Expiry Date */}
                        {false && (
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">
                              RC Expiry Date
                            </label>
                            <input
                              type="date"
                              value={rcExpiry}
                              onChange={(e) => setRcExpiry(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            Upload RC Proof Document
                          </label>
                          <label className={cn(
                            "flex items-center justify-between p-2 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                            docFileNames.rc
                              ? "border-emerald-300 bg-emerald-50/40"
                              : "border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/20"
                          )}>
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              className="hidden"
                              onChange={(e) => handleDocumentUpload("rc", e.target.files?.[0])}
                            />
                            {uploadingDocs.rc ? (
                              <div className="flex items-center gap-1.5 text-xs text-amber-700">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Uploading...</span>
                              </div>
                            ) : docFileNames.rc ? (
                              <div className="flex items-center justify-between w-full text-left gap-1.5 truncate">
                                <span className="text-xs text-slate-900 truncate font-medium">
                                  {docFileNames.rc}
                                </span>
                                <span className="text-[10px] font-bold text-amber-700 shrink-0">Change</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between w-full text-slate-500 text-xs">
                                <div className="flex items-center gap-1">
                                  <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Upload RC Copy</span>
                                </div>
                                <span className="text-[10px] text-slate-400">PDF, JPG, PNG</span>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* 2. Commercial Insurance */}
                      <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            2. Insurance Policy
                          </span>
                          {docFileNames.insurance && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <Check className="w-2.5 h-2.5 stroke-[3]" /> Uploaded
                            </span>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            Insurance Expiry Date <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={insuranceExpiry}
                            onChange={(e) => setInsuranceExpiry(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            Upload Insurance Policy Proof
                          </label>
                          <label className={cn(
                            "flex items-center justify-between p-2 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                            docFileNames.insurance
                              ? "border-emerald-300 bg-emerald-50/40"
                              : "border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/20"
                          )}>
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              className="hidden"
                              onChange={(e) => handleDocumentUpload("insurance", e.target.files?.[0])}
                            />
                            {uploadingDocs.insurance ? (
                              <div className="flex items-center gap-1.5 text-xs text-amber-700">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Uploading...</span>
                              </div>
                            ) : docFileNames.insurance ? (
                              <div className="flex items-center justify-between w-full text-left gap-1.5 truncate">
                                <span className="text-xs text-slate-900 truncate font-medium">
                                  {docFileNames.insurance}
                                </span>
                                <span className="text-[10px] font-bold text-amber-700 shrink-0">Change</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between w-full text-slate-500 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Upload Policy Copy</span>
                                </div>
                                <span className="text-[10px] text-slate-400">PDF, JPG, PNG</span>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* COMMENTED OUT: 3. Commercial Permit */}
                      {false && (
                        <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                              3. Commercial Permit
                            </span>
                            {docFileNames.permit && (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                <Check className="w-2.5 h-2.5 stroke-[3]" /> Uploaded
                              </span>
                            )}
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">
                              Permit Expiry Date
                            </label>
                            <input
                              type="date"
                              value={permitExpiry}
                              onChange={(e) => setPermitExpiry(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">
                              Upload Commercial Permit Proof
                            </label>
                            <label className={cn(
                              "flex items-center justify-between p-2 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                              docFileNames.permit
                                ? "border-emerald-300 bg-emerald-50/40"
                                : "border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/20"
                            )}>
                              <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                className="hidden"
                                onChange={(e) => handleDocumentUpload("permit", e.target.files?.[0])}
                              />
                              {uploadingDocs.permit ? (
                                <div className="flex items-center gap-1.5 text-xs text-amber-700">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Uploading...</span>
                                </div>
                              ) : docFileNames.permit ? (
                                <div className="flex items-center justify-between w-full text-left gap-1.5 truncate">
                                  <span className="text-xs text-slate-900 truncate font-medium">
                                    {docFileNames.permit}
                                  </span>
                                  <span className="text-[10px] font-bold text-amber-700 shrink-0">Change</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between w-full text-slate-500 text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Upload Permit Copy</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400">PDF, JPG, PNG</span>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      )}

                      {/* 4. Vehicle Fitness Certificate */}
                      <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                            4. Fitness Certificate
                          </span>
                          {docFileNames.fitness && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <Check className="w-2.5 h-2.5 stroke-[3]" /> Uploaded
                            </span>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            Fitness Expiry Date
                          </label>
                          <input
                            type="date"
                            value={fitnessExpiry}
                            onChange={(e) => setFitnessExpiry(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            Upload Fitness Certificate Proof
                          </label>
                          <label className={cn(
                            "flex items-center justify-between p-2 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                            docFileNames.fitness
                              ? "border-emerald-300 bg-emerald-50/40"
                              : "border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/20"
                          )}>
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              className="hidden"
                              onChange={(e) => handleDocumentUpload("fitness", e.target.files?.[0])}
                            />
                            {uploadingDocs.fitness ? (
                              <div className="flex items-center gap-1.5 text-xs text-amber-700">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Uploading...</span>
                              </div>
                            ) : docFileNames.fitness ? (
                              <div className="flex items-center justify-between w-full text-left gap-1.5 truncate">
                                <span className="text-xs text-slate-900 truncate font-medium">
                                  {docFileNames.fitness}
                                </span>
                                <span className="text-[10px] font-bold text-amber-700 shrink-0">Change</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between w-full text-slate-500 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Upload Fitness Copy</span>
                                </div>
                                <span className="text-[10px] text-slate-400">PDF, JPG, PNG</span>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* COMMENTED OUT: 5. Pollution Under Control (PUC) Certificate */}
                      {false && (
                        <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs sm:col-span-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                              5. Pollution Under Control (PUC) Certificate
                            </span>
                            {docFileNames.puc && (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                <Check className="w-2.5 h-2.5 stroke-[3]" /> Uploaded
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                PUC Expiry Date
                              </label>
                              <input
                                type="date"
                                value={pucExpiry}
                                onChange={(e) => setPucExpiry(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                Upload PUC Certificate Proof
                              </label>
                              <label className={cn(
                                "flex items-center justify-between p-2 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                                docFileNames.puc
                                  ? "border-emerald-300 bg-emerald-50/40"
                                  : "border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/20"
                              )}>
                                <input
                                  type="file"
                                  accept=".pdf,.png,.jpg,.jpeg"
                                  className="hidden"
                                  onChange={(e) => handleDocumentUpload("puc", e.target.files?.[0])}
                                />
                                {uploadingDocs.puc ? (
                                  <div className="flex items-center gap-1.5 text-xs text-amber-700">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Uploading...</span>
                                  </div>
                                ) : docFileNames.puc ? (
                                  <div className="flex items-center justify-between w-full text-left gap-1.5 truncate">
                                    <span className="text-xs text-slate-900 truncate font-medium">
                                      {docFileNames.puc}
                                    </span>
                                    <span className="text-[10px] font-bold text-amber-700 shrink-0">Change</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between w-full text-slate-500 text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Upload PUC Copy</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">PDF, JPG, PNG</span>
                                  </div>
                                )}
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    {vehiclesList.length > 0 && (
                      <button
                        type="button"
                        disabled={savingVehicle}
                        onClick={() => {
                          resetVehicleForm();
                          setShowAddVehicleForm(false);
                        }}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={savingVehicle}
                      onClick={handleAddVehicleToList}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-xs"
                    >
                      {savingVehicle ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                          <span>Adding Vehicle...</span>
                        </>
                      ) : (
                        <span>Add Vehicle</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* List of Added Drivers */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Fleet Chauffeurs ({driversList.length})</span>
                </span>
                {!showAddDriverForm && (
                  <button
                    type="button"
                    onClick={() => {
                      resetDriverForm();
                      setShowAddDriverForm(true);
                    }}
                    className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Drivers
                  </button>
                )}
              </div>

              {driversList.length > 0 && (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                  {driversList.map((d) => (
                    <div key={d.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{d.name}</span>
                        <span className="text-slate-500 ml-2">· {d.phone}</span>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          License: {d.licenseNumber} · Expiry: {d.licenseExpiry}
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        Chauffeur
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Driver Inline Form */}
              {showAddDriverForm && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span>Add Driver Profile & Credentials</span>
                    </div>
                    <span className="text-[10px] text-purple-700 bg-purple-50 font-bold px-2 py-0.5 rounded-full border border-purple-200">
                      Roster Member
                    </span>
                  </div>

                  {/* Driver Photo Upload & Preview */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative shrink-0">
                      {newDriverPhoto ? (
                        <img src={newDriverPhoto} alt="Driver Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 text-[9px] gap-0.5">
                          <Camera className="w-4 h-4 text-slate-300" />
                          <span>Photo</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 w-full space-y-1">
                      <label className="block text-[11px] font-bold text-slate-800">
                        Chauffeur Photo <span className="text-rose-500">*</span>
                      </label>
                      <label className={cn(
                        "flex items-center justify-between p-2 border-2 border-dashed rounded-lg cursor-pointer transition-all text-xs",
                        newDriverPhoto ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 hover:border-purple-400 bg-slate-50"
                      )}>
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp"
                          className="hidden"
                          onChange={(e) => handleDocumentUpload("newDriverPhoto", e.target.files?.[0])}
                        />
                        <span className="text-[11px] text-slate-700 truncate">
                          {docFileNames.newDriverPhoto || "Upload Professional Photo"}
                        </span>
                        <UploadCloud className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Driver Full Name *
                      </label>
                      <input
                        type="text"
                        value={newDriverName}
                        onChange={(e) => setNewDriverName(e.target.value)}
                        placeholder="e.g. Suresh Patil"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Driver Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={newDriverPhone}
                        onChange={(e) => setNewDriverPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={newDriverEmail}
                        onChange={(e) => setNewDriverEmail(e.target.value)}
                        placeholder="chauffeur@fleet.com"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        value={newDriverDob}
                        onChange={(e) => setNewDriverDob(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Gender *
                      </label>
                      <select
                        value={newDriverGender}
                        onChange={(e) => setNewDriverGender(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* COMMENTED OUT: ID Proof Type, ID Proof Number, Upload ID Proof, Driving License Number */}
                    {false && (
                      <>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            ID Proof Type *
                          </label>
                          <select
                            value={newDriverIdProofType}
                            onChange={(e) => setNewDriverIdProofType(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                          >
                            <option value="Aadhaar Card">Aadhaar Card</option>
                            <option value="Voter ID">Voter ID</option>
                            <option value="Passport">Passport</option>
                            <option value="PAN Card">PAN Card</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            ID Proof Number *
                          </label>
                          <input
                            type="text"
                            value={newDriverIdProofNumber}
                            onChange={(e) => setNewDriverIdProofNumber(e.target.value.toUpperCase())}
                            placeholder="e.g. 5678 9012 3456"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Upload ID Proof
                          </label>
                          <label className="flex items-center justify-between p-2 border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-xl cursor-pointer bg-white text-xs">
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              className="hidden"
                              onChange={(e) => handleDocumentUpload("newDriverIdProof", e.target.files?.[0])}
                            />
                            <span className="truncate text-[11px] text-slate-600">
                              {docFileNames.newDriverIdProof || "Upload ID Document"}
                            </span>
                            <UploadCloud className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          </label>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Driving License Number
                          </label>
                          <input
                            type="text"
                            value={newDriverLicense}
                            onChange={(e) => setNewDriverLicense(e.target.value.toUpperCase())}
                            placeholder="DL-0420190012345"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Licence Type / Class
                      </label>
                      <select
                        value={newDriverLicenseClass}
                        onChange={(e) => setNewDriverLicenseClass(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                      >
                        <option value="LMV-TR (Transport)">LMV-TR (Commercial Transport)</option>
                        <option value="LMV (Light Motor Vehicle)">LMV (Light Motor Vehicle)</option>
                        <option value="HMV / HGMV">HMV / Heavy Transport</option>
                        <option value="Commercial PSV Badge">Commercial PSV Badge</option>
                      </select>
                    </div>

                    {/* COMMENTED OUT: License Expiry Date, Driving Since (Date), Experience */}
                    {false && (
                      <>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            License Expiry Date
                          </label>
                          <input
                            type="date"
                            value={newDriverExpiry}
                            onChange={(e) => setNewDriverExpiry(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                            <span>Driving Since (Date)</span>
                          </label>
                          <input
                            type="date"
                            value={newDrivingSince}
                            onChange={(e) => handleDrivingSinceChange(e.target.value, true)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                          />
                        </div>

                        {/* Automatically Experience field should display the experience number */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                            <span>Experience</span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              Auto
                            </span>
                          </label>
                          <div className="relative">
                            <Clock className="w-3.5 h-3.5 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={newDriverExperienceYears}
                              readOnly
                              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-950 font-bold text-xs cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* COMMENTED OUT: Chauffeur Status */}
                    {false && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Chauffeur Status
                        </label>
                        <select
                          value={newDriverStatus}
                          onChange={(e) => setNewDriverStatus(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-semibold text-emerald-700"
                        >
                          <option value="Available">Available (Default)</option>
                          <option value="Assigned">Assigned</option>
                          <option value="Off-duty">Off-duty</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Emergency Contact Name *
                      </label>
                      <input
                        type="text"
                        value={newEmergencyContactName}
                        onChange={(e) => setNewEmergencyContactName(e.target.value)}
                        placeholder="e.g. Ramesh Patil"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Emergency Contact Phone *
                      </label>
                      <input
                        type="tel"
                        value={newEmergencyContactPhone}
                        onChange={(e) => setNewEmergencyContactPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>

                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Upload Driver License Copy
                      </label>
                      <label className="flex items-center justify-between p-2 border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-xl cursor-pointer bg-white text-xs">
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => handleDocumentUpload("newDriverLicenseDoc", e.target.files?.[0])}
                        />
                        <span className="truncate text-[11px] text-slate-600">
                          {docFileNames.newDriverLicenseDoc || docFileNames.license || "Upload License Document"}
                        </span>
                        <UploadCloud className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      </label>
                    </div>

                    <div className="sm:col-span-2 md:col-span-3 pt-1">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Languages Spoken
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["English", "Tamil", "Hindi", "Telugu", "Kannada", "Malayalam"].map((lang) => {
                          const isSel = newDriverLanguages.includes(lang);
                          return (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => {
                                setNewDriverLanguages((prev) =>
                                  isSel ? prev.filter((l) => l !== lang) : [...prev, lang]
                                );
                              }}
                              className={cn(
                                "px-2.5 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                                isSel ? "bg-purple-600 text-white shadow-xs" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                              )}
                            >
                              {lang}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      disabled={savingDriver}
                      onClick={() => {
                        resetDriverForm();
                        setShowAddDriverForm(false);
                      }}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={savingDriver}
                      onClick={handleAddDriverToList}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-xs"
                    >
                      {savingDriver ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          <span>Saving Chauffeur...</span>
                        </>
                      ) : (
                        <span>Save Chauffeur</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 4B Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Change Operating Model
              </button>

              <div className="flex items-center justify-end w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleFinishMultiFleet}
                  disabled={loading}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Finish & Go to Dashboard</span>
                      <Check className="w-4 h-4 stroke-[3]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Operating City Selector Modal */}
      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        initialCities={userCity}
        onApply={(cities) => {
          const joined = cities.join(", ");
          setUserCity(joined);
          setBusinessCity(joined);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-amber-200/70 py-6 text-center text-xs text-slate-500">
        Grab Rentals Partner Network &copy; {new Date().getFullYear()} · All rights reserved
      </footer>
    </div>
  );
}

export default function VendorRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF4E5]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <VendorOnboardingFlow />
    </Suspense>
  );
}
