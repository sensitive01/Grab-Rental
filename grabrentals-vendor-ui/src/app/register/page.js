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
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Step 1: Identity & Address Proofs
  const [idProofDocument, setIdProofDocument] = useState("");
  const [addressProofDocument, setAddressProofDocument] = useState("");

  // Step 1: Business Profile State
  const [ownsBusiness, setOwnsBusiness] = useState(null); // true | false
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
  const [vehicleYear, setVehicleYear] = useState("2023");
  const [seatingCapacity, setSeatingCapacity] = useState("4");
  const [fuelType, setFuelType] = useState("Diesel");
  const [vehicleImage, setVehicleImage] = useState("");

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

  // New Driver Form (for Model 2)
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverPhone, setNewDriverPhone] = useState("");
  const [newDriverLicense, setNewDriverLicense] = useState("");
  const [newDriverExpiry, setNewDriverExpiry] = useState("");

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

        if (existing.step) {
          setCurrentStep(existing.step);
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

    if (!addressProofDocument) {
      setError("Please upload your Residential / Address Proof (Electricity Bill / Rental Agreement / Gas Bill).");
      return;
    }

    setLoading(true);
    try {
      const step1Data = {
        step: 2,
        partnerName: partnerName.trim(),
        phone: phone.trim(),
        alternatePhone: alternatePhone.trim(),
        email: email.trim(),
        userCity: userCity.trim(),
        userAddress: userAddress.trim(),
        idProofDocument: idProofDocument || undefined,
        addressProofDocument: addressProofDocument || undefined,
      };
      saveOnboardingData(step1Data);

      // Update profile
      await vendorApi.updateProfile({
        name: partnerName.trim(),
        ownerName: partnerName.trim(),
        alternatePhone: alternatePhone.trim() || undefined,
        altPhone: alternatePhone.trim() || undefined,
        city: userCity.trim(),
        email: email.trim() || undefined,
        address: userAddress.trim() || undefined,
        idProofDocumentUrl: idProofDocument || undefined,
        addressProofDocumentUrl: addressProofDocument || undefined,
      }).catch(() => null);

      if (!businessCity) {
        setBusinessCity(userCity.trim());
      }

      setCurrentStep(2);
      setSuccessNotice("Personal details saved. Let's configure your business profile.");
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
      const isDriver = docType === "license";
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
    if (!vehicleModel.trim()) {
      setError("Please enter the vehicle make and model.");
      return;
    }
    if (!driverLicenseNumber.trim()) {
      setError("Please enter your commercial driver license number.");
      return;
    }
    if (!driverLicenseExpiry) {
      setError("Please select your driver license expiry date.");
      return;
    }
    if (!insuranceExpiry) {
      setError("Please provide the vehicle insurance expiry date.");
      return;
    }
    if (!rcExpiry) {
      setError("Please provide the registration certificate (RC) expiry date.");
      return;
    }

    setLoading(true);
    try {
      const user = getCurrentUser();
      const cleanPlate = vehicleNumber.trim().toUpperCase();

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
        await vendorApi.createDriver({
          name: partnerName?.trim() || user?.name || "Fleet Partner Driver",
          phone: phone?.trim() || user?.phone || "9999999999",
          email: email?.trim() || user?.email || undefined,
          address: driverAddress,
          emergencyContact: emergencyContactNumber,
          licenseNumber: driverLicenseNumber.trim().toUpperCase(),
          licenseExpiry: driverLicenseExpiry,
          licenseDocumentUrl: driverLicenseDocument || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
          experienceYears: 5,
        });
      } catch (dErr) {
        console.warn("Chauffeur registration notice:", dErr?.response?.data || dErr?.message);
      }

      // 2. Register Vehicle
      try {
        await vendorApi.createVehicle({
          vehicleNumber: cleanPlate,
          vehicleModel: vehicleModel.trim(),
          vehicleType: vehicleCategory || "SUV",
          year: Math.max(2000, parseInt(vehicleYear) || 2023),
          seatingCapacity: Math.max(1, parseInt(seatingCapacity) || 4),
          fuelType: fuelType || "Diesel",
          dailyRate: 2500,
          perKmRate: 14,
          imageUrl: vehicleImage || undefined,
          insuranceExpiry: insuranceExpiry || undefined,
          fitnessExpiry: fitnessExpiry || undefined,
          permitExpiry: permitExpiry || undefined,
          rcDocumentUrl: rcDocument || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
          insuranceDocumentUrl: insuranceDocument || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
          permitDocumentUrl: permitDocument || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
          fitnessDocumentUrl: fitnessDocument || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
        });
      } catch (vErr) {
        console.warn("Vehicle registration notice:", vErr?.response?.data || vErr?.message);
      }

      // Mark complete
      saveOnboardingData({
        step: 4,
        completed: true,
        fleetModel: 1,
        vehicleNumber: cleanPlate,
        vehicleImage,
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

  // --- Step 3 Handler: Add Vehicle to Multiple Fleet List (Model 2) ---
  const handleAddVehicleToList = async (e) => {
    e?.preventDefault();
    if (!vehicleNumber.trim() || !vehicleModel.trim()) {
      setError("Please enter vehicle plate number and model.");
      return;
    }
    if (!insuranceExpiry || !rcExpiry) {
      setError("Please provide insurance and RC expiry dates.");
      return;
    }

    const newVeh = {
      id: "v-" + Date.now(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleModel: vehicleModel.trim(),
      vehicleType: vehicleCategory,
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
      await vendorApi.createVehicle({
        vehicleNumber: newVeh.vehicleNumber,
        vehicleModel: newVeh.vehicleModel,
        vehicleType: newVeh.vehicleType || "SUV",
        year: Math.max(2000, parseInt(newVeh.year) || 2023),
        seatingCapacity: Math.max(1, parseInt(newVeh.seatingCapacity) || 4),
        fuelType: newVeh.fuelType || "Diesel",
        dailyRate: 2500,
        perKmRate: 14,
        imageUrl: newVeh.imageUrl,
        insuranceExpiry: newVeh.insuranceExpiry || undefined,
        fitnessExpiry: newVeh.fitnessExpiry || undefined,
        permitExpiry: newVeh.permitExpiry || undefined,
        rcDocumentUrl: rcDocument || undefined,
        insuranceDocumentUrl: insuranceDocument || undefined,
        permitDocumentUrl: permitDocument || undefined,
        fitnessDocumentUrl: fitnessDocument || undefined,
      }).catch((err) => {
        console.warn("Vehicle registration notice:", err?.response?.data || err?.message);
      });
    } catch (ignored) {}

    const updated = [...vehiclesList, newVeh];
    setVehiclesList(updated);
    saveOnboardingData({ vehiclesList: updated });

    // Reset vehicle fields
    setVehicleNumber("");
    setVehicleModel("");
    setVehicleImage("");
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
    setShowAddVehicleForm(false);
    setError("");
  };

  // --- Step 3 Handler: Add Driver to Multiple Fleet List (Model 2) ---
  const handleAddDriverToList = async (e) => {
    e?.preventDefault();
    if (!newDriverName.trim() || !newDriverLicense.trim()) {
      setError("Please enter driver name and license number.");
      return;
    }
    if (!newDriverExpiry) {
      setError("Please enter driver license expiry date.");
      return;
    }

    const driverAddress =
      userAddress?.trim() ||
      (userCity ? `${userCity}, India` : "") ||
      businessAddress?.trim() ||
      "Registered Fleet Partner Address, India";

    const emergencyContactNumber =
      alternatePhone?.trim() ||
      phone?.trim() ||
      "9876543210";

    const newDrv = {
      id: "d-" + Date.now(),
      name: newDriverName.trim(),
      phone: newDriverPhone.trim() || phone || "9999999999",
      licenseNumber: newDriverLicense.trim().toUpperCase(),
      licenseExpiry: newDriverExpiry,
      address: driverAddress,
      emergencyContact: emergencyContactNumber,
    };

    // Save to direct records
    try {
      await vendorApi.createDriver({
        name: newDrv.name,
        phone: newDrv.phone,
        address: driverAddress,
        emergencyContact: emergencyContactNumber,
        licenseNumber: newDrv.licenseNumber,
        licenseExpiry: newDrv.licenseExpiry,
        experienceYears: 4,
        licenseDocumentUrl: driverLicenseDocument || undefined,
      }).catch((err) => {
        console.warn("Chauffeur registration notice:", err?.response?.data || err?.message);
      });
    } catch (ignored) {}

    const updated = [...driversList, newDrv];
    setDriversList(updated);
    saveOnboardingData({ driversList: updated });

    // Reset driver fields
    setNewDriverName("");
    setNewDriverPhone("");
    setNewDriverLicense("");
    setNewDriverExpiry("");
    setShowAddDriverForm(false);
    setError("");
  };

  // Finish Multi-Fleet Setup
  const handleFinishMultiFleet = () => {
    saveOnboardingData({
      step: 4,
      completed: true,
      fleetModel: 2,
      vehiclesList,
      driversList,
    });
    router.push("/vendor/dashboard?onboarding=complete");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Navigation Bar with Skip to Dashboard */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center font-black text-slate-950 text-sm shadow-xs">
                GR
              </span>
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                Grab Rentals <span className="text-amber-600 font-semibold text-xs ml-1">Fleet Partner</span>
              </span>
            </Link>
          </div>

          {/* Hyperlink: Skip to Dashboard (Always visible on every step) */}
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleSkipToDashboard}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 hover:text-amber-800 px-3.5 py-1.5 rounded-full border border-amber-200 transition-all cursor-pointer"
                title="Save your current progress and head to the dashboard"
              >
                <span>Skip to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 0 && (
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Already registered? Sign In
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
                Step {currentStep} of 4
              </span>
              <span className="text-xs font-semibold text-amber-600">
                {currentStep === 1 && "Personal Details"}
                {currentStep === 2 && "Business Profile"}
                {currentStep === 3 && "Fleet Operating Model"}
                {currentStep === 4 && "Vehicle & Driver Assets"}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  currentStep >= 1 ? "bg-amber-500" : "bg-slate-200"
                )}
              />
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  currentStep >= 2 ? "bg-amber-500" : "bg-slate-200"
                )}
              />
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  currentStep >= 3 ? "bg-amber-500" : "bg-slate-200"
                )}
              />
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  currentStep >= 4 ? "bg-amber-500" : "bg-slate-200"
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
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Operating City <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userCity}
                      onChange={(e) => {
                        setUserCity(e.target.value);
                        if (!businessCity) setBusinessCity(e.target.value);
                      }}
                      placeholder="e.g. Bangalore, Mumbai, Pune"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">City where your vehicles primarily operate.</p>
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
                            Residential / Address Proof <span className="text-rose-500">*</span>
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
                    !idProofDocument ||
                    !addressProofDocument
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
        {/* STEP 2: BUSINESS PROFILE & REGISTRATION (YES / NO)       */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
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
            <div className="border-b border-slate-100 pb-5">
              <h2 className="text-xl font-black text-slate-950">
                Step 3: Fleet Operating Structure
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
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      Owner-Driver
                    </span>
                    <h3 className="text-base font-black text-slate-950 mt-1.5">
                      1. I Drive my own Fleet
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      You own a vehicle and will be driving it yourself. We will register your vehicle and automatically set you as the designated chauffeur.
                    </p>
                  </div>
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
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shadow-xs">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      Fleet Operator
                    </span>
                    <h3 className="text-base font-black text-slate-950 mt-1.5">
                      2. I Have Multiple Fleet & Multiple Vehicles
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      You operate a commercial fleet with multiple cars and hire/assign individual chauffeurs across your fleet.
                    </p>
                  </div>
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
                onClick={() => setCurrentStep(2)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Step 2
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4A: VEHICLE & DRIVER PROOFS (FOR CHOICE 1: OWNER)    */}
        {/* ======================================================== */}
        {currentStep === 4 && fleetModel === 1 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
            <div className="border-b border-slate-100 pb-5">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full mb-1">
                <Car className="w-3 h-3" /> Owner-Driver Setup
              </div>
              <h2 className="text-xl font-black text-slate-950">
                Step 4: Vehicle Details & Chauffeur License
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add your vehicle specifications and verify all compliance proofs with expiry dates.
              </p>
            </div>

            <form onSubmit={handleSaveSingleFleet} className="space-y-8">
              {/* Section 1: Assigned Driver (Self) */}
              <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Chauffeur Information (Assigned to You)
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  As the owner-driver, you will be registered as the primary chauffeur for this vehicle.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Chauffeur Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chauffeur Full Name <span className="text-rose-500">*</span>
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

                  {/* Chauffeur Phone Number */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Chauffeur Phone Number
                      </label>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                        Verified
                      </span>
                    </div>
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

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Commercial Driving License Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={driverLicenseNumber}
                      onChange={(e) => setDriverLicenseNumber(e.target.value.toUpperCase())}
                      placeholder="DL-1420110012345"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      License Expiry Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={driverLicenseExpiry}
                      onChange={(e) => setDriverLicenseExpiry(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Upload Driver License Copy */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Upload Driving License Proof
                    </label>
                    <label className={cn(
                      "flex items-center justify-between p-2.5 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                      docFileNames.license
                        ? "border-emerald-300 bg-emerald-50/40"
                        : "border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/20"
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
                </div>
              </div>

              {/* Section 2: Vehicle Specs */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Vehicle Specifications
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Plate Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                      placeholder="MH 02 AB 1234"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Make & Model <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g. Maruti Suzuki Dzire"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Vehicle Category
                    </label>
                    <select
                      value={vehicleCategory}
                      onChange={(e) => setVehicleCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Sedan">Sedan (Dzire, Etios, Aura)</option>
                      <option value="SUV">SUV (Innova, Ertiga, Carens)</option>
                      <option value="Hatchback">Hatchback (WagonR, Swift)</option>
                      <option value="Premium">Premium Executive (Camry, Fortuner)</option>
                    </select>
                  </div>

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
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Fuel Type
                    </label>
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Diesel">Diesel</option>
                      <option value="Petrol">Petrol</option>
                      <option value="CNG">CNG</option>
                      <option value="Electric">Electric (EV)</option>
                    </select>
                  </div>
                </div>

                {/* Vehicle Exterior Photo Upload */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-amber-600" />
                      Vehicle Exterior Photo
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">Recommended for trip dispatch</span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70">
                    {/* Preview Thumbnail or Placeholder Box */}
                    <div className="w-24 h-20 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center relative shrink-0 shadow-2xs">
                      {vehicleImage ? (
                        <img
                          src={vehicleImage}
                          alt="Vehicle Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 text-[10px] gap-1">
                          <ImageIcon className="w-6 h-6 text-slate-300" />
                          <span>No Photo</span>
                        </div>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 w-full flex flex-col justify-center">
                      <label
                        className={cn(
                          "flex items-center justify-between p-2.5 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                          vehicleImage
                            ? "border-emerald-300 bg-emerald-50/40"
                            : "border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/20"
                        )}
                      >
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp"
                          className="hidden"
                          onChange={(e) => handleDocumentUpload("vehicleImage", e.target.files?.[0])}
                        />
                        {uploadingDocs.vehicleImage ? (
                          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading vehicle image...</span>
                          </div>
                        ) : vehicleImage ? (
                          <div className="flex items-center justify-between w-full text-left gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="text-xs font-semibold text-slate-900 truncate">
                                {docFileNames.vehicleImage || "Vehicle photo attached"}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-amber-700 hover:underline shrink-0">
                              Change Photo
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <UploadCloud className="w-4 h-4 text-amber-600" />
                              <span className="text-xs font-semibold">Upload Vehicle Exterior Photo</span>
                            </div>
                            <span className="text-[10px] text-slate-400">JPG, PNG, WEBP</span>
                          </div>
                        )}
                      </label>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Clear front or angle photo of your car helps passengers and corporate clients quickly identify your cab.
                      </p>
                    </div>
                  </div>
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

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        RC Expiry Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={rcExpiry}
                        onChange={(e) => setRcExpiry(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                    </div>

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
                        2. Commercial Insurance Policy
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

                  {/* 4. Commercial Tourist Permit */}
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

                  {/* 5. Pollution Under Control (PUC) */}
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
            <div className="border-b border-slate-100 pb-5">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full mb-1">
                <Users className="w-3 h-3" /> Multi-Vehicle Fleet Setup
              </div>
              <h2 className="text-xl font-black text-slate-950">
                Step 4: Register Fleet Vehicles & Drivers
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
                    onClick={() => setShowAddVehicleForm(true)}
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
                            <span>· RC: {v.rcExpiry}</span>
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Plate Number *
                      </label>
                      <input
                        type="text"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                        placeholder="MH 02 CD 1234"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Make & Model *
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
                        Category
                      </label>
                      <select
                        value={vehicleCategory}
                        onChange={(e) => setVehicleCategory(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="SUV">SUV (Innova, Ertiga, Carens)</option>
                        <option value="Sedan">Sedan (Dzire, Etios, Aura)</option>
                        <option value="Hatchback">Hatchback (WagonR, Swift)</option>
                        <option value="Premium">Premium Executive (Fortuner, Camry)</option>
                      </select>
                    </div>

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
                        <option value="Diesel">Diesel</option>
                        <option value="Petrol">Petrol</option>
                        <option value="CNG">CNG</option>
                        <option value="Electric">Electric (EV)</option>
                      </select>
                    </div>
                  </div>

                  {/* Section B: Vehicle Exterior Photo */}
                  <div className="pt-2 border-t border-slate-200/80">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-amber-600" />
                        Vehicle Exterior Photo
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">Optional</span>
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white">
                      <div className="w-20 h-16 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center relative shrink-0">
                        {vehicleImage ? (
                          <img
                            src={vehicleImage}
                            alt="Vehicle Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 text-[9px] gap-0.5">
                            <ImageIcon className="w-5 h-5 text-slate-300" />
                            <span>No Photo</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 w-full">
                        <label
                          className={cn(
                            "flex items-center justify-between p-2 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                            vehicleImage
                              ? "border-emerald-300 bg-emerald-50/40"
                              : "border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/20"
                          )}
                        >
                          <input
                            type="file"
                            accept=".png,.jpg,.jpeg,.webp"
                            className="hidden"
                            onChange={(e) => handleDocumentUpload("vehicleImage", e.target.files?.[0])}
                          />
                          {uploadingDocs.vehicleImage ? (
                            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Uploading vehicle photo...</span>
                            </div>
                          ) : vehicleImage ? (
                            <div className="flex items-center justify-between w-full text-left gap-2">
                              <div className="flex items-center gap-2 truncate">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="text-xs font-semibold text-slate-900 truncate">
                                  {docFileNames.vehicleImage || "Vehicle photo selected"}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-amber-700 hover:underline shrink-0">
                                Change Photo
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
                                <span className="text-xs font-semibold">Upload Vehicle Exterior Photo</span>
                              </div>
                              <span className="text-[10px] text-slate-400">JPG, PNG, WEBP</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
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
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            RC Expiry Date <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={rcExpiry}
                            onChange={(e) => setRcExpiry(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            required
                          />
                        </div>
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
                            2. Commercial Insurance Policy
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

                      {/* 3. Commercial Permit */}
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

                      {/* 5. Pollution Under Control (PUC) */}
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
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    {vehiclesList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAddVehicleForm(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleAddVehicleToList}
                      className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                    >
                      Save Vehicle
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
                    onClick={() => setShowAddDriverForm(true)}
                    className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Chauffeur
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
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="font-bold text-xs text-slate-800">
                    Add Chauffeur Details & License Expiry
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Driver Phone Number
                      </label>
                      <input
                        type="tel"
                        value={newDriverPhone}
                        onChange={(e) => setNewDriverPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Driving License Number *
                      </label>
                      <input
                        type="text"
                        value={newDriverLicense}
                        onChange={(e) => setNewDriverLicense(e.target.value.toUpperCase())}
                        placeholder="DL-0420190012345"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        License Expiry Date *
                      </label>
                      <input
                        type="date"
                        value={newDriverExpiry}
                        onChange={(e) => setNewDriverExpiry(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Upload Driver License Copy
                      </label>
                      <label className="flex items-center justify-between p-2 border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl cursor-pointer bg-white text-xs">
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => handleDocumentUpload("license", e.target.files?.[0])}
                        />
                        <span className="truncate text-[11px] text-slate-600">
                          {docFileNames.license || "Upload License Document"}
                        </span>
                        <UploadCloud className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddDriverForm(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddDriverToList}
                      className="px-4 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs cursor-pointer"
                    >
                      Save Chauffeur
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

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        Grab Rentals Partner Network &copy; {new Date().getFullYear()} · All rights reserved
      </footer>
    </div>
  );
}

export default function VendorRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <VendorOnboardingFlow />
    </Suspense>
  );
}
