"use client";

import { useState, useEffect, useMemo } from "react";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { formatINR } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  SortableHeader,
  Pagination,
} from "@/components/ui/Table";
import AirportTariffSection from "@/components/pricing/AirportTariffSection";
import {
  IndianRupee,
  Calendar,
  Sun,
  Moon,
  PlusCircle,
  Sparkles,
  Search,
  Trash2,
  Edit3,
  CheckCircle2,
  Calculator,
  Flame,
  Check,
  Plane,
  ShieldCheck,
  TrendingUp,
  Car,
  MapPin,
  Fuel,
  Navigation,
  ArrowLeftRight,
  Clock,
  RotateCcw,
  Filter,
} from "lucide-react";

const CATEGORIES = [
  "Sedan",
  "Hatchback",
  "SUV",
  "Innova",
  "Innovacrysta",
  "innovahycross",
  "Tempo",
  "urbania",
  "Bus",
  "Benz",
];

const FUEL_TYPES = [
  "Diesel",
  "Petrol",
  "CNG",
  "Petrol + CNG",
  "Electric",
  "Hybrid",
];

const SEATING_OPTIONS = [
  { value: "4", label: "4 Seater + Driver" },
  { value: "6", label: "6 Seater + Driver" },
  { value: "7", label: "7 Seater + Driver" },
  { value: "8", label: "8 Seater" },
  { value: "12", label: "12 Seater" },
  { value: "18", label: "18 Seater" },
  { value: "26", label: "26 Seater (Mini Bus)" },
  { value: "35", label: "35 Seater (Coach)" },
];

const SERVICE_TYPES = [
  { id: "OUTSTATION", label: "Outstation", icon: Car, desc: "Inter-city Per-KM Pricing" },
  { id: "LOCAL", label: "Local", icon: MapPin, desc: "City Limits Per-KM Pricing" },
  { id: "AIRPORT", label: "Airport Transfer", icon: Plane, desc: "Airport Route Per-KM Pricing" },
];

const AIRPORTS_LIST = [
  "Kempegowda International Airport (BLR), Bengaluru",
  "Chennai International Airport (MAA), Chennai",
  "Coimbatore International Airport (CJB), Coimbatore",
  "Madurai Airport (IXM), Madurai",
  "Tiruchirappalli International Airport (TRZ), Trichy",
  "Salem Airport (SXV), Salem",
  "Tuticorin Airport (TCR), Thoothukudi",
  "Cochin International Airport (COK), Kochi",
  "Calicut International Airport (CCJ), Kozhikode",
  "Trivandrum International Airport (TRV), Thiruvananthapuram",
  "Rajiv Gandhi International Airport (HYD), Hyderabad",
  "Mangalore International Airport (IXE), Mangaluru",
  "Goa International Airport (GOI / GOX), Goa",
  "Chhatrapati Shivaji Maharaj Airport (BOM), Mumbai",
  "Indira Gandhi International Airport (DEL), New Delhi",
  "ALL",
];

const AIRPORT_DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const STATES_AND_CITIES = {
  "Andaman and Nicobar Islands": [
    "Port Blair",
    "Havelock Island",
    "Neil Island",
    "Diglipur"
  ],
  "Andhra Pradesh": [
    "Visakhapatnam",
    "Vijayawada",
    "Guntur",
    "Nellore",
    "Kurnool",
    "Rajahmundry",
    "Tirupati",
    "Kakinada",
    "Anantapur",
    "Kadapa",
    "Eluru",
    "Ongole"
  ],
  "Arunachal Pradesh": [
    "Itanagar",
    "Naharlagun",
    "Tawang",
    "Pasighat",
    "Ziro",
    "Bomdila"
  ],
  "Assam": [
    "Guwahati",
    "Silchar",
    "Dibrugarh",
    "Jorhat",
    "Nagaon",
    "Tinsukia",
    "Tezpur"
  ],
  "Bihar": [
    "Patna",
    "Gaya",
    "Bhagalpur",
    "Muzaffarpur",
    "Purnia",
    "Darbhanga",
    "Bihar Sharif",
    "Arrah"
  ],
  "Chandigarh": [
    "Chandigarh"
  ],
  "Chhattisgarh": [
    "Raipur",
    "Bhilai",
    "Bilaspur",
    "Korba",
    "Durg",
    "Rajnandgaon",
    "Jagdalpur"
  ],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Daman",
    "Diu",
    "Silvassa"
  ],
  "Delhi NCR": [
    "New Delhi",
    "Noida",
    "Gurgaon",
    "Ghaziabad",
    "Faridabad",
    "Greater Noida"
  ],
  "Goa": [
    "Panaji",
    "Margao",
    "Vasco da Gama",
    "Mapusa",
    "Ponda",
    "Calangute"
  ],
  "Gujarat": [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Bhavnagar",
    "Jamnagar",
    "Gandhinagar",
    "Junagadh",
    "Anand",
    "Bharuch",
    "Bhuj",
    "Vapi"
  ],
  "Haryana": [
    "Gurgaon",
    "Faridabad",
    "Panipat",
    "Ambala",
    "Yamunanagar",
    "Rohtak",
    "Hisar",
    "Karnal",
    "Sonipat",
    "Panchkula"
  ],
  "Himachal Pradesh": [
    "Shimla",
    "Manali",
    "Dharamshala",
    "Solan",
    "Mandi",
    "Kullu",
    "Kalka",
    "Baddi"
  ],
  "Jammu and Kashmir": [
    "Srinagar",
    "Jammu",
    "Katra",
    "Anantnag",
    "Baramulla",
    "Gulmarg",
    "Pahalgam"
  ],
  "Jharkhand": [
    "Ranchi",
    "Jamshedpur",
    "Dhanbad",
    "Bokaro",
    "Deoghar",
    "Hazaribagh"
  ],
  "Karnataka": [
    "Bangalore",
    "Mysore",
    "Mangalore",
    "Hubli",
    "Belgaum",
    "Gulbarga",
    "Davanagere",
    "Bellary",
    "Shimoga",
    "Tumkur",
    "Udupi",
    "Hassan",
    "Hospet",
    "Bidar"
  ],
  "Kerala": [
    "Kochi",
    "Thiruvananthapuram",
    "Kozhikode",
    "Thrissur",
    "Kollam",
    "Palakkad",
    "Alappuzha",
    "Kannur",
    "Kottayam",
    "Wayanad",
    "Munnar",
    "Malappuram"
  ],
  "Ladakh": [
    "Leh",
    "Kargil",
    "Nubra Valley"
  ],
  "Lakshadweep": [
    "Kavaratti",
    "Agatti"
  ],
  "Madhya Pradesh": [
    "Indore",
    "Bhopal",
    "Jabalpur",
    "Gwalior",
    "Ujjain",
    "Sagar",
    "Dewas",
    "Satna",
    "Ratlam"
  ],
  "Maharashtra": [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Nashik",
    "Aurangabad",
    "Solapur",
    "Kolhapur",
    "Thane",
    "Navi Mumbai",
    "Shirdi",
    "Mahabaleshwar",
    "Nanded",
    "Jalgaon",
    "Amravati"
  ],
  "Manipur": [
    "Imphal",
    "Churachandpur",
    "Thoubal",
    "Ukhrul"
  ],
  "Meghalaya": [
    "Shillong",
    "Tura",
    "Cherrapunji",
    "Jowai"
  ],
  "Mizoram": [
    "Aizawl",
    "Lunglei",
    "Champhai"
  ],
  "Nagaland": [
    "Kohima",
    "Dimapur",
    "Mokokchung"
  ],
  "Odisha": [
    "Bhubaneswar",
    "Cuttack",
    "Rourkela",
    "Puri",
    "Berhampur",
    "Sambalpur",
    "Balasore"
  ],
  "Puducherry": [
    "Puducherry",
    "Karaikal",
    "Mahe",
    "Yanam"
  ],
  "Punjab": [
    "Ludhiana",
    "Amritsar",
    "Jalandhar",
    "Patiala",
    "Bathinda",
    "Mohali",
    "Pathankot",
    "Hoshiarpur"
  ],
  "Rajasthan": [
    "Jaipur",
    "Jodhpur",
    "Udaipur",
    "Kota",
    "Bikaner",
    "Ajmer",
    "Bhilwara",
    "Alwar",
    "Jaisalmer",
    "Mount Abu",
    "Pushkar"
  ],
  "Sikkim": [
    "Gangtok",
    "Namchi",
    "Pelling",
    "Ravangla"
  ],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Theni",
    "Salem",
    "Tiruchirappalli",
    "Tirunelveli",
    "Erode",
    "Vellore",
    "Dindigul",
    "Thanjavur",
    "Kanchipuram",
    "Tiruppur",
    "Karur",
    "Ooty",
    "Kodaikanal",
    "Hosur",
    "Nagercoil",
    "Kumbakonam",
    "Cuddalore",
    "Rameswaram"
  ],
  "Telangana": [
    "Hyderabad",
    "Warangal",
    "Nizamabad",
    "Karimnagar",
    "Khammam",
    "Ramagundam",
    "Mahbubnagar"
  ],
  "Tripura": [
    "Agartala",
    "Udaipur",
    "Dharmanagar"
  ],
  "Uttar Pradesh": [
    "Lucknow",
    "Kanpur",
    "Varanasi",
    "Agra",
    "Prayagraj (Allahabad)",
    "Meerut",
    "Bareilly",
    "Aligarh",
    "Moradabad",
    "Gorakhpur",
    "Noida",
    "Greater Noida",
    "Ghaziabad",
    "Ayodhya",
    "Mathura"
  ],
  "Uttarakhand": [
    "Dehradun",
    "Haridwar",
    "Rishikesh",
    "Roorkee",
    "Haldwani",
    "Nainital",
    "Mussoorie",
    "Rudrapur"
  ],
  "West Bengal": [
    "Kolkata",
    "Howrah",
    "Siliguri",
    "Durgapur",
    "Asansol",
    "Darjeeling",
    "Bardhaman",
    "Malda",
    "Kharagpur"
  ]
};

const DEFAULT_RATES_BY_CATEGORY = {
  Hatchback: {
    outstation: { custWdDay: "11.00", custWdNight: "12.50", custWeDay: "12.50", custWeNight: "14.00", vendWdDay: "8.80", vendWdNight: "10.00", vendWeDay: "10.00", vendWeNight: "11.20", custBase: "2800.00", vendBase: "2240.00", minKm: "250" },
    local: { custWdDay: "13.00", custWdNight: "14.50", custWeDay: "14.50", custWeNight: "16.00", vendWdDay: "10.40", vendWdNight: "11.60", vendWeDay: "11.60", vendWeNight: "12.80", custBase: "1500.00", vendBase: "1200.00", minKm: "80" },
    airport: { custWdDay: "11.00", custWdNight: "12.50", custWeDay: "12.50", custWeNight: "14.00", vendWdDay: "8.80", vendWdNight: "10.00", vendWeDay: "10.00", vendWeNight: "11.20", custBase: "1200.00", vendBase: "960.00", minKm: "40" }
  },
  Sedan: {
    outstation: { custWdDay: "12.50", custWdNight: "14.00", custWeDay: "14.00", custWeNight: "15.50", vendWdDay: "10.00", vendWdNight: "11.20", vendWeDay: "11.20", vendWeNight: "12.40", custBase: "3200.00", vendBase: "2560.00", minKm: "250" },
    local: { custWdDay: "14.50", custWdNight: "16.00", custWeDay: "16.00", custWeNight: "17.50", vendWdDay: "11.60", vendWdNight: "12.80", vendWeDay: "12.80", vendWeNight: "14.00", custBase: "1800.00", vendBase: "1440.00", minKm: "80" },
    airport: { custWdDay: "12.50", custWdNight: "14.00", custWeDay: "14.00", custWeNight: "15.50", vendWdDay: "10.00", vendWdNight: "11.20", vendWeDay: "11.20", vendWeNight: "12.40", custBase: "1400.00", vendBase: "1120.00", minKm: "40" }
  },
  SUV: {
    outstation: { custWdDay: "16.00", custWdNight: "18.00", custWeDay: "18.00", custWeNight: "20.00", vendWdDay: "12.80", vendWdNight: "14.40", vendWeDay: "14.40", vendWeNight: "16.00", custBase: "4500.00", vendBase: "3600.00", minKm: "250" },
    local: { custWdDay: "18.00", custWdNight: "20.00", custWeDay: "20.00", custWeNight: "22.00", vendWdDay: "14.40", vendWdNight: "16.00", vendWeDay: "16.00", vendWeNight: "17.60", custBase: "2400.00", vendBase: "1920.00", minKm: "80" },
    airport: { custWdDay: "16.00", custWdNight: "18.00", custWeDay: "18.00", custWeNight: "20.00", vendWdDay: "12.80", vendWdNight: "14.40", vendWeDay: "14.40", vendWeNight: "16.00", custBase: "1800.00", vendBase: "1440.00", minKm: "40" }
  },
  Innovacrysta: {
    outstation: { custWdDay: "20.00", custWdNight: "22.00", custWeDay: "22.00", custWeNight: "24.00", vendWdDay: "16.00", vendWdNight: "17.60", vendWeDay: "17.60", vendWeNight: "19.20", custBase: "5500.00", vendBase: "4400.00", minKm: "250" },
    local: { custWdDay: "22.00", custWdNight: "24.50", custWeDay: "24.50", custWeNight: "27.00", vendWdDay: "17.60", vendWdNight: "19.60", vendWeDay: "19.60", vendWeNight: "21.60", custBase: "3000.00", vendBase: "2400.00", minKm: "80" },
    airport: { custWdDay: "20.00", custWdNight: "22.00", custWeDay: "22.00", custWeNight: "24.00", vendWdDay: "16.00", vendWdNight: "17.60", vendWeDay: "17.60", vendWeNight: "19.20", custBase: "2200.00", vendBase: "1760.00", minKm: "40" }
  }
};

export default function AdminPricingPage() {
  const [tariffs, setTariffs] = useState([]);
  const [models, setModels] = useState([]);
  const [airportTariffsCount, setAirportTariffsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [serviceFilter, setServiceFilter] = useState("ALL"); // ALL, OUTSTATION, LOCAL, AIRPORT
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, STANDARD, SEASONAL
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortConfig, setSortConfig] = useState({ key: "city", direction: "asc" });
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Active form state
  const [formData, setFormData] = useState({
    id: null,
    category: "Sedan",
    modelName: "Dzire",
    seatingCapacity: "4",
    fuelType: "Diesel",
    serviceType: "ONE_WAY", // ONE_WAY | ROUND_TRIP | LOCAL | AIRPORT
    state: "Tamil Nadu",
    city: "Theni",
    customCity: "",
    tariffType: "STANDARD",   // STANDARD | SEASONAL
    seasonal: false,
    seasonName: "",
    startDate: "",
    endDate: "",

    // Customer Per-KM Rates (Used for One Way, Round Trip, Local)
    weekdayDayRate: "",
    weekdayNightRate: "",
    weekendDayRate: "",
    weekendNightRate: "",
    baseFare: "",
    baseIncludedKm: "",
    packageHours: "", // Minimum / Included Hours for Local (e.g. 8)
    driverBattaDay: "",
    driverBattaNight: "",

    // Vendor Per-KM Rates (Used for One Way, Round Trip, Local)
    vendorWeekdayDayRate: "",
    vendorWeekdayNightRate: "",
    vendorWeekendDayRate: "",
    vendorWeekendNightRate: "",
    vendorBaseFare: "",
    vendorDriverBattaDay: "",
    vendorDriverBattaNight: "",

    // Hourly Rates for Local (₹/hr)
    hourlyCustomerFare: "",
    hourlyVendorFare: "",
    hourlyCustomerWeekendFare: "",
    hourlyVendorWeekendFare: "",
    hourlyWeekdayDayRate: "",
    hourlyVendorWeekdayDayRate: "",
    hourlyWeekdayNightRate: "",
    hourlyVendorWeekdayNightRate: "",
    hourlyWeekendDayRate: "",
    hourlyVendorWeekendDayRate: "",
    hourlyWeekendNightRate: "",
    hourlyVendorWeekendNightRate: "",

    // Airport Specific Fares & Distance Slabs
    airportCustomerFare: "",
    airportVendorFare: "",
    airportCustomerWeekendFare: "",
    airportVendorWeekendFare: "",
    airportIncludedKm: "",
    airportExtraKmRate: "",
    airportVendorExtraKmRate: "",
    tripDirection: "BOTH", // CITY_TO_AIRPORT, AIRPORT_TO_CITY, BOTH
    airportName: "ALL",
    minKm: "0",
    maxKm: "35",
    daysOfWeek: "ALL",
    timeSlotType: "ALL_DAY",
    timeRangeStart: "",
    timeRangeEnd: "",
    expiryType: "NEVER",
    status: "ACTIVE",
    tollIncluded: false,
    discountPercentage: "",
    petCharge: "",
    vendorPetCharge: "",
  });

  // Simulator State
  const [simService, setSimService] = useState("ONE_WAY");
  const [simCategory, setSimCategory] = useState("Sedan");
  const [simModel, setSimModel] = useState("Dzire");
  const [simDate, setSimDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [simTime, setSimTime] = useState("10:00 AM");
  const [simFuel, setSimFuel] = useState("Diesel");
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [tariffRes, modelRes, airportTariffRes] = await Promise.all([
          adminApi.getTariffs(),
          adminApi.getModelConfigs(),
          adminApi.getAirportTariffs().catch(() => []),
        ]);
        if (isMounted) {
          if (tariffRes.data) setTariffs(tariffRes.data);
          if (modelRes.data) setModels(modelRes.data);
          if (Array.isArray(airportTariffRes)) setAirportTariffsCount(airportTariffRes.length);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshData() {
    try {
      const [tariffRes, modelRes] = await Promise.all([
        adminApi.getTariffs(),
        adminApi.getModelConfigs(),
      ]);
      if (tariffRes.data) setTariffs(tariffRes.data);
      if (modelRes.data) setModels(modelRes.data);
    } catch (err) {
      console.error(err);
    }
  }

  // Dynamic categories derived from database models
  const dynamicCategories = useMemo(() => {
    const list = Array.from(new Set(models.map((m) => m.category).filter(Boolean)));
    return list.length > 0 ? list : CATEGORIES;
  }, [models]);

  // Filter available model names based on selected category in form
  const availableModelsForForm = useMemo(() => {
    const matched = models.filter(
      (m) => m.category?.toLowerCase() === formData.category?.toLowerCase()
    );
    if (matched.length > 0) return Array.from(new Set(matched.map((m) => m.modelName).filter(Boolean)));
    return ["Standard Fleet"];
  }, [models, formData.category]);

  const simAvailableModels = useMemo(() => {
    const priced = tariffs
      .filter((t) => t.category?.toLowerCase() === simCategory?.toLowerCase())
      .map((t) => t.modelName)
      .filter(Boolean);
    return [...new Set(priced)];
  }, [tariffs, simCategory]);

  function handleOpenCreate(type = "STANDARD", targetService = "OUTSTATION") {
    setEditingItem(null);
    const isSeasonal = type === "SEASONAL";
    const initialCategory = models[0]?.category || "Sedan";
    const initialModel = models[0]?.modelName || "Dzire";
    const initialSeats = models[0]?.seatingCapacity || "4";
    const initialFuel = models[0]?.fuelType || "Diesel";
    const sType = targetService === "OUTSTATION" ? "ONE_WAY" : (targetService || "ONE_WAY");

    setFormData({
      id: null,
      category: initialCategory,
      modelName: initialModel,
      seatingCapacity: initialSeats,
      fuelType: initialFuel,
      serviceType: sType,
      state: "Tamil Nadu",
      city: "Chennai",
      customCity: "",
      tariffType: isSeasonal ? "SEASONAL" : "STANDARD",
      seasonal: isSeasonal,
      seasonName: isSeasonal ? "Festival Surge" : "",
      startDate: isSeasonal ? new Date().toISOString().split("T")[0] : "",
      endDate: isSeasonal ? new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0] : "",

      weekdayDayRate: "",
      weekdayNightRate: "",
      weekendDayRate: "",
      weekendNightRate: "",
      baseFare: "",
      baseIncludedKm: "",
      packageHours: "",
      driverBattaDay: "",
      driverBattaNight: "",

      vendorWeekdayDayRate: "",
      vendorWeekdayNightRate: "",
      vendorWeekendDayRate: "",
      vendorWeekendNightRate: "",
      vendorBaseFare: "",
      vendorDriverBattaDay: "",
      vendorDriverBattaNight: "",

      hourlyCustomerFare: "",
      hourlyVendorFare: "",
      hourlyCustomerWeekendFare: "",
      hourlyVendorWeekendFare: "",
      hourlyWeekdayDayRate: "",
      hourlyVendorWeekdayDayRate: "",
      hourlyWeekdayNightRate: "",
      hourlyVendorWeekdayNightRate: "",
      hourlyWeekendDayRate: "",
      hourlyVendorWeekendDayRate: "",
      hourlyWeekendNightRate: "",
      hourlyVendorWeekendNightRate: "",

      airportCustomerFare: "",
      airportVendorFare: "",
      airportCustomerWeekendFare: "",
      airportVendorWeekendFare: "",
      airportIncludedKm: "",
      airportExtraKmRate: "",
      airportVendorExtraKmRate: "",
      tripDirection: "BOTH",
      airportName: "ALL",
      minKm: "0",
      maxKm: "35",
      daysOfWeek: "ALL",
      timeSlotType: "ALL_DAY",
      timeRangeStart: "",
      timeRangeEnd: "",
      expiryType: "NEVER",
      status: "ACTIVE",
      tollIncluded: false,
      discountPercentage: "",
      petCharge: "",
      vendorPetCharge: "",
    });
    setIsModalOpen(true);
  }

  function handleSwitchServiceInForm(newService) {
    let resolved = newService;
    if (newService === "OUTSTATION") {
      resolved = formData.serviceType === "ROUND_TRIP" ? "ROUND_TRIP" : "ONE_WAY";
    }
    setFormData((prev) => ({
      ...prev,
      serviceType: resolved,
    }));
  }

  function handleStartEdit(item) {
    setEditingItem(item);
    const isSeasonal = Boolean(item.seasonal || item.tariffType === "SEASONAL");
    const rawService = item.serviceType || "ONE_WAY";
    const sType = rawService === "OUTSTATION" ? "ONE_WAY" : rawService;

    const custWdDay = parseFloat(item.weekdayDayRate || 0);
    const custWdNight = parseFloat(item.weekdayNightRate || item.weekdayDayRate || 0);
    const custWeDay = parseFloat(item.weekendDayRate || item.weekdayDayRate || 0);
    const custWeNight = parseFloat(item.weekendNightRate || item.weekdayNightRate || item.weekdayDayRate || 0);

    const minKm = item.baseIncludedKm != null && Number(item.baseIncludedKm) > 0
      ? Number(item.baseIncludedKm)
      : (sType === "LOCAL" ? 80 : sType === "AIRPORT" ? 40 : 250);

    const rawBaseFare = item.baseFare != null && Number(item.baseFare) > 0
      ? Number(item.baseFare)
      : (custWdDay > 0 ? Math.round(custWdDay * minKm) : 0);

    const rawVendorBaseFare = item.vendorBaseFare != null && Number(item.vendorBaseFare) > 0
      ? Number(item.vendorBaseFare)
      : Math.round(rawBaseFare * 0.80);

    const vendWdDay = item.vendorWeekdayDayRate != null && Number(item.vendorWeekdayDayRate) > 0
      ? String(item.vendorWeekdayDayRate)
      : (custWdDay > 0 ? (custWdDay * 0.80).toFixed(2) : "");

    const vendWdNight = item.vendorWeekdayNightRate != null && Number(item.vendorWeekdayNightRate) > 0
      ? String(item.vendorWeekdayNightRate)
      : (custWdNight > 0 ? (custWdNight * 0.80).toFixed(2) : "");

    const vendWeDay = item.vendorWeekendDayRate != null && Number(item.vendorWeekendDayRate) > 0
      ? String(item.vendorWeekendDayRate)
      : (custWeDay > 0 ? (custWeDay * 0.80).toFixed(2) : "");

    const vendWeNight = item.vendorWeekendNightRate != null && Number(item.vendorWeekendNightRate) > 0
      ? String(item.vendorWeekendNightRate)
      : (custWeNight > 0 ? (custWeNight * 0.80).toFixed(2) : "");

    setFormData({
      id: item.id,
      category: item.category || "Sedan",
      modelName: item.modelName || "",
      seatingCapacity: item.seatingCapacity || "4",
      fuelType: item.fuelType || "Diesel",
      serviceType: sType,
      state: item.state || "Tamil Nadu",
      city: item.city || "",
      customCity: "",
      tariffType: isSeasonal ? "SEASONAL" : "STANDARD",
      seasonal: isSeasonal,
      seasonName: item.seasonName || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",

      weekdayDayRate: item.weekdayDayRate != null ? String(item.weekdayDayRate) : "",
      weekdayNightRate: item.weekdayNightRate != null ? String(item.weekdayNightRate) : (item.weekdayDayRate != null ? String(item.weekdayDayRate) : ""),
      weekendDayRate: item.weekendDayRate != null ? String(item.weekendDayRate) : (item.weekdayDayRate != null ? String(item.weekdayDayRate) : ""),
      weekendNightRate: item.weekendNightRate != null ? String(item.weekendNightRate) : (item.weekdayDayRate != null ? String(item.weekdayDayRate) : ""),
      baseFare: rawBaseFare > 0 ? String(rawBaseFare) : (item.baseFare != null ? String(item.baseFare) : "0"),
      baseIncludedKm: String(minKm),
      packageHours: item.packageHours != null ? String(item.packageHours) : (sType === "LOCAL" ? "8" : ""),
      driverBattaDay: item.driverBattaDay != null ? String(item.driverBattaDay) : "400",
      driverBattaNight: item.driverBattaNight != null ? String(item.driverBattaNight) : "300",

      vendorWeekdayDayRate: vendWdDay,
      vendorWeekdayNightRate: vendWdNight,
      vendorWeekendDayRate: vendWeDay,
      vendorWeekendNightRate: vendWeNight,
      vendorBaseFare: rawVendorBaseFare > 0 ? String(rawVendorBaseFare) : "",
      vendorDriverBattaDay: item.vendorDriverBattaDay != null ? String(item.vendorDriverBattaDay) : "300",
      vendorDriverBattaNight: item.vendorDriverBattaNight != null ? String(item.vendorDriverBattaNight) : "250",

      hourlyCustomerFare: item.hourlyCustomerFare != null ? String(item.hourlyCustomerFare) : (sType === "LOCAL" ? String(item.baseFare || "") : ""),
      hourlyVendorFare: item.hourlyVendorFare != null ? String(item.hourlyVendorFare) : (sType === "LOCAL" ? String(item.vendorBaseFare || "") : ""),
      hourlyCustomerWeekendFare: item.hourlyCustomerWeekendFare != null ? String(item.hourlyCustomerWeekendFare) : "",
      hourlyVendorWeekendFare: item.hourlyVendorWeekendFare != null ? String(item.hourlyVendorWeekendFare) : "",
      hourlyWeekdayDayRate: item.hourlyWeekdayDayRate != null ? String(item.hourlyWeekdayDayRate) : "",
      hourlyVendorWeekdayDayRate: item.hourlyVendorWeekdayDayRate != null ? String(item.hourlyVendorWeekdayDayRate) : "",
      hourlyWeekdayNightRate: item.hourlyWeekdayNightRate != null ? String(item.hourlyWeekdayNightRate) : "",
      hourlyVendorWeekdayNightRate: item.hourlyVendorWeekdayNightRate != null ? String(item.hourlyVendorWeekdayNightRate) : "",
      hourlyWeekendDayRate: item.hourlyWeekendDayRate != null ? String(item.hourlyWeekendDayRate) : "",
      hourlyVendorWeekendDayRate: item.hourlyVendorWeekendDayRate != null ? String(item.hourlyVendorWeekendDayRate) : "",
      hourlyWeekendNightRate: item.hourlyWeekendNightRate != null ? String(item.hourlyWeekendNightRate) : "",
      hourlyVendorWeekendNightRate: item.hourlyVendorWeekendNightRate != null ? String(item.hourlyVendorWeekendNightRate) : "",

      airportCustomerFare: item.airportCustomerFare != null ? String(item.airportCustomerFare) : "",
      airportVendorFare: item.airportVendorFare != null ? String(item.airportVendorFare) : "",
      airportCustomerWeekendFare: item.airportCustomerWeekendFare != null ? String(item.airportCustomerWeekendFare) : "",
      airportVendorWeekendFare: item.airportVendorWeekendFare != null ? String(item.airportVendorWeekendFare) : "",
      airportIncludedKm: item.airportIncludedKm != null ? String(item.airportIncludedKm) : "",
      airportExtraKmRate: item.airportExtraKmRate != null ? String(item.airportExtraKmRate) : "",
      airportVendorExtraKmRate: item.airportVendorExtraKmRate != null ? String(item.airportVendorExtraKmRate) : "",
      tollIncluded: Boolean(item.tollIncluded),
      discountPercentage: item.discountPercentage != null ? String(item.discountPercentage) : "",
      petCharge: item.petCharge != null ? String(item.petCharge) : "",
      vendorPetCharge: item.vendorPetCharge != null ? String(item.vendorPetCharge) : "",
    });
    setIsModalOpen(true);
  }

  function handleOpenEditAirport(item) {
    setEditingItem(item);
    setFormData({
      id: item.id,
      category: item.category || "Sedan",
      modelName: item.modelName || "ALL",
      seatingCapacity: item.seatingCapacity || "4",
      fuelType: item.fuelType || "ALL",
      serviceType: "AIRPORT",
      state: item.state || "Tamil Nadu",
      city: item.city || "Chennai",
      customCity: "",
      tariffType: (item.pricingType || "REGULAR").toUpperCase() === "SEASONAL" ? "SEASONAL" : "STANDARD",
      seasonal: (item.pricingType || "REGULAR").toUpperCase() === "SEASONAL",
      seasonName: item.title || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      tripDirection: item.tripDirection || "BOTH",
      airportName: item.airportName || "ALL",
      minKm: item.minKm ?? 0,
      maxKm: item.maxKm ?? 35,
      customerFare: item.customerFare != null ? String(item.customerFare) : "",
      baseFare: item.customerFare != null ? String(item.customerFare) : "",
      airportCustomerFare: item.customerFare != null ? String(item.customerFare) : "",
      vendorFare: item.vendorFare != null ? String(item.vendorFare) : "",
      vendorBaseFare: item.vendorFare != null ? String(item.vendorFare) : "",
      extraKmRate: item.extraKmRate != null ? String(item.extraKmRate) : "14",
      weekdayDayRate: item.extraKmRate != null ? String(item.extraKmRate) : "14",
      vendorExtraKmRate: item.vendorExtraKmRate != null ? String(item.vendorExtraKmRate) : "11",
      daysOfWeek: item.daysOfWeek || "ALL",
      timeSlotType: item.timeSlotType || "ALL_DAY",
      timeRangeStart: item.timeRangeStart || "",
      timeRangeEnd: item.timeRangeEnd || "",
      expiryType: item.expiryType || "NEVER",
      status: item.status || "ACTIVE",
      tollIncluded: Boolean(item.tollIncluded),
      discountPercentage: item.discountPercentage != null ? String(item.discountPercentage) : "0",
      petCharge: item.petCharge != null ? String(item.petCharge) : "",
      vendorPetCharge: item.vendorPetCharge != null ? String(item.vendorPetCharge) : "",
    });
    setIsModalOpen(true);
  }

  async function handleSaveTariff(e) {
    e.preventDefault();
    const discountNum = parseFloat(formData.discountPercentage);
    if (!isNaN(discountNum) && discountNum > 100) {
      setToast({ type: "error", message: "Discount percentage cannot be greater than 100%" });
      return;
    }
    if (!isNaN(discountNum) && discountNum < 0) {
      setToast({ type: "error", message: "Discount percentage cannot be negative" });
      return;
    }
    if (!formData.category || !formData.modelName || !formData.seatingCapacity) {
      setToast({ type: "error", message: "Please choose Category, Model, and Seater" });
      return;
    }

    if (formData.serviceType === "AIRPORT") {
      const custFare = parseFloat(formData.customerFare || formData.baseFare || formData.airportCustomerFare || 0);
      if (isNaN(custFare) || custFare <= 0) {
        setToast({ type: "error", message: "Please enter a valid Customer Fare (₹)" });
        return;
      }

      try {
        setSubmitting(true);
        const resolvedCity = formData.city === "__custom__"
          ? (formData.customCity || "").trim()
          : (formData.city || "Chennai").trim();

        const minDistance = parseInt(formData.minKm || 0, 10);
        const maxDistance = parseInt(formData.maxKm || formData.baseIncludedKm || formData.airportIncludedKm || 35, 10);
        const vendFare = (formData.vendorFare || formData.vendorBaseFare || formData.airportVendorFare)
          ? parseFloat(formData.vendorFare || formData.vendorBaseFare || formData.airportVendorFare)
          : custFare * 0.80;

        await adminApi.saveAirportTariff({
          ...(editingItem ? { id: editingItem.id } : {}),
          tripDirection: formData.tripDirection || "BOTH",
          pricingType: formData.tariffType === "SEASONAL" ? "SEASONAL" : "REGULAR",
          title: `${resolvedCity} ${formData.category} Airport Transfer (${minDistance}-${maxDistance} km)`,
          state: formData.state || "Tamil Nadu",
          city: resolvedCity,
          airportName: formData.airportName || "ALL",
          minKm: minDistance,
          maxKm: maxDistance,
          category: formData.category,
          modelName: formData.modelName || "ALL",
          seatingCapacity: formData.seatingCapacity || "4",
          fuelType: formData.fuelType || "ALL",
          customerFare: custFare,
          vendorFare: vendFare,
          extraKmRate: parseFloat(formData.extraKmRate || formData.weekdayDayRate || 14),
          vendorExtraKmRate: parseFloat(formData.vendorExtraKmRate || formData.vendorWeekdayDayRate || 11),
          daysOfWeek: formData.daysOfWeek || "ALL",
          timeSlotType: formData.timeSlotType || "ALL_DAY",
          timeRangeStart: formData.timeRangeStart || null,
          timeRangeEnd: formData.timeRangeEnd || null,
          expiryType: formData.tariffType === "SEASONAL" ? "FIXED_DAYS" : (formData.expiryType || "NEVER"),
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          status: formData.status || "ACTIVE",
          tollIncluded: Boolean(formData.tollIncluded),
          discountPercentage: parseFloat(formData.discountPercentage || 0),
          petCharge: parseFloat(formData.petCharge || 0),
          vendorPetCharge: parseFloat(formData.vendorPetCharge || 0),
        });

        const allAirports = await adminApi.getAirportTariffs().catch(() => []);
        if (Array.isArray(allAirports)) setAirportTariffsCount(allAirports.length);

        setToast({
          type: "success",
          message: `Airport charge for ${formData.category} (${minDistance}-${maxDistance} km) saved successfully`,
        });
        setIsModalOpen(false);
        refreshData();
        return;
      } catch (err) {
        setToast({ type: "error", message: err.response?.data?.message || "Failed to save airport charge rule" });
        return;
      } finally {
        setSubmitting(false);
      }
    }

    if (formData.tariffType === "SEASONAL" && (!formData.startDate || !formData.endDate)) {
      setToast({ type: "error", message: "Please specify From Date and To Date for seasonal pricing" });
      return;
    }

    try {
      setSubmitting(true);
      const resolvedCity = formData.city === "__custom__"
        ? (formData.customCity || "").trim()
        : (formData.city || "Theni").trim();

      const custWd = parseFloat(formData.weekdayDayRate || 0);
      const custWn = parseFloat(formData.weekdayNightRate || custWd);
      const custWeD = parseFloat(formData.weekendDayRate || custWd);
      const custWeN = parseFloat(formData.weekendNightRate || custWd);
      const minKm = parseInt(formData.baseIncludedKm || (formData.serviceType === "LOCAL" ? 80 : formData.serviceType === "AIRPORT" ? 40 : 250), 10);
      const custBase = parseFloat(formData.baseFare || (custWd > 0 ? custWd * minKm : 0));
      const vendBase = parseFloat(formData.vendorBaseFare || (custBase * 0.80));

      const vendWd = parseFloat(formData.vendorWeekdayDayRate || (custWd * 0.80));
      const vendWn = parseFloat(formData.vendorWeekdayNightRate || (custWn * 0.80));
      const vendWeD = parseFloat(formData.vendorWeekendDayRate || (custWeD * 0.80));
      const vendWeN = parseFloat(formData.vendorWeekendNightRate || (custWeN * 0.80));

      await adminApi.saveTariff({
        ...formData,
        fuelType: formData.fuelType || "Diesel",
        state: formData.state || "Tamil Nadu",
        city: resolvedCity || "Theni",
        serviceType: formData.serviceType || "ONE_WAY",
        weekdayDayRate: custWd,
        weekdayNightRate: custWn,
        weekendDayRate: custWeD,
        weekendNightRate: custWeN,
        baseFare: custBase,
        baseIncludedKm: minKm,
        packageHours: formData.packageHours ? parseInt(formData.packageHours, 10) : (formData.serviceType === "LOCAL" ? 8 : null),
        packageKm: minKm,
        driverBattaDay: parseFloat(formData.driverBattaDay || 400),
        driverBattaNight: parseFloat(formData.driverBattaNight || 300),

        vendorWeekdayDayRate: vendWd,
        vendorWeekdayNightRate: vendWn,
        vendorWeekendDayRate: vendWeD,
        vendorWeekendNightRate: vendWeN,
        vendorBaseFare: vendBase,
        vendorDriverBattaDay: parseFloat(formData.vendorDriverBattaDay || 300),
        vendorDriverBattaNight: parseFloat(formData.vendorDriverBattaNight || 250),

        hourlyWeekdayDayRate: parseFloat(formData.hourlyWeekdayDayRate || 0),
        hourlyVendorWeekdayDayRate: parseFloat(formData.hourlyVendorWeekdayDayRate || 0),
        hourlyWeekdayNightRate: parseFloat(formData.hourlyWeekdayNightRate || 0),
        hourlyVendorWeekdayNightRate: parseFloat(formData.hourlyVendorWeekdayNightRate || 0),
        hourlyWeekendDayRate: parseFloat(formData.hourlyWeekendDayRate || 0),
        hourlyVendorWeekendDayRate: parseFloat(formData.hourlyVendorWeekendDayRate || 0),
        hourlyWeekendNightRate: parseFloat(formData.hourlyWeekendNightRate || 0),
        hourlyVendorWeekendNightRate: parseFloat(formData.hourlyVendorWeekendNightRate || 0),

        hourlyCustomerFare: parseFloat(formData.hourlyCustomerFare || formData.baseFare || 0),
        hourlyVendorFare: parseFloat(formData.hourlyVendorFare || formData.vendorBaseFare || 0),
        hourlyCustomerWeekendFare: parseFloat(formData.hourlyCustomerWeekendFare || formData.hourlyCustomerFare || formData.baseFare || 0),
        hourlyVendorWeekendFare: parseFloat(formData.hourlyVendorWeekendFare || formData.hourlyVendorFare || formData.vendorBaseFare || 0),
        extraHourRate: parseFloat(formData.hourlyWeekdayDayRate || 0),
        vendorExtraHourRate: parseFloat(formData.hourlyVendorWeekdayDayRate || 0),
        extraKmRate: parseFloat(formData.weekdayDayRate || 0),
        vendorExtraKmRate: parseFloat(formData.vendorWeekdayDayRate || 0),

        airportCustomerFare: parseFloat(formData.baseFare || formData.airportCustomerFare || 0),
        airportVendorFare: parseFloat(formData.vendorBaseFare || formData.airportVendorFare || 0),
        airportCustomerWeekendFare: parseFloat(formData.baseFare || formData.airportCustomerWeekendFare || 0),
        airportVendorWeekendFare: parseFloat(formData.vendorBaseFare || formData.airportVendorWeekendFare || 0),
        airportIncludedKm: parseInt(formData.baseIncludedKm || 40, 10),
        airportExtraKmRate: parseFloat(formData.weekdayDayRate || 0),
        airportVendorExtraKmRate: parseFloat(formData.vendorWeekdayDayRate || 0),
        tollIncluded: Boolean(formData.tollIncluded),
        discountPercentage: parseFloat(formData.discountPercentage || 0),
        petCharge: parseFloat(formData.petCharge || 0),
        vendorPetCharge: parseFloat(formData.vendorPetCharge || 0),
      });

      setToast({
        type: "success",
        message: editingItem
          ? `Tariff for ${formData.modelName} • ${formData.fuelType || "Diesel"} (${formData.serviceType}) updated successfully`
          : `Tariff rules for ${formData.modelName} • ${formData.fuelType || "Diesel"} (${formData.serviceType}) saved successfully`,
      });
      setIsModalOpen(false);
      refreshData();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Failed to save tariff rule" });
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(item) {
    setConfirmDialog({
      title: `Delete Tariff: ${item.modelName}`,
      message: `Are you sure you want to delete the tariff for ${item.modelName} (${item.serviceType === 'OUTSTATION' ? 'ONE_WAY' : (item.serviceType || 'ONE_WAY')} - ${item.city || 'Standard'})?`,
      confirmText: "Delete Tariff",
      variant: "danger",
      onConfirm: async () => {
        try {
          await adminApi.deleteTariff(item.id);
          setToast({ type: "success", message: "Tariff deleted successfully" });
          refreshData();
        } catch (err) {
          setToast({ type: "error", message: "Failed to delete tariff" });
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  }

  async function runSimulation() {
    setSimLoading(true);
    try {
      const res = await adminApi.calculateRate({
        category: simCategory,
        model: simModel,
        seatingCapacity: "4",
        fuelType: simFuel,
        date: simDate,
        time: simTime,
        serviceType: simService,
      });
      if (res.data) {
        setSimResult(res.data);
      }
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Simulator check failed" });
    } finally {
      setSimLoading(false);
    }
  }

  // Available cities dynamically derived from tariffs matching the selected state (or all if ALL)
  const availableCities = useMemo(() => {
    const set = new Set();
    tariffs.forEach((t) => {
      if (t.city && t.city !== "ALL") {
        if (stateFilter === "ALL" || (t.state && t.state.toLowerCase() === stateFilter.toLowerCase())) {
          set.add(t.city);
        }
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [tariffs, stateFilter]);

  // Unique categories derived from tariffs
  const availableCategories = useMemo(() => {
    const set = new Set();
    tariffs.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [tariffs]);

  // Filtered & Sorted Tariffs for DataTable
  const filteredAndSortedTariffs = useMemo(() => {
    const filtered = tariffs.filter((t) => {
      const sType = (t.serviceType || "OUTSTATION").toUpperCase();
      const isOutstation = sType === "OUTSTATION" || sType === "ONE_WAY" || sType === "ROUND_TRIP";
      const matchService =
        serviceFilter === "ALL" ||
        (serviceFilter === "OUTSTATION" && isOutstation) ||
        sType === serviceFilter.toUpperCase();

      const isSeasonal = Boolean(t.seasonal || t.tariffType === "SEASONAL");
      const matchType =
        activeTab === "ALL" ||
        (activeTab === "STANDARD" && !isSeasonal) ||
        (activeTab === "SEASONAL" && isSeasonal);

      const matchState = stateFilter === "ALL" || (t.state && t.state.toLowerCase() === stateFilter.toLowerCase());

      const matchCity = cityFilter === "ALL" || (t.city && t.city.toLowerCase() === cityFilter.toLowerCase());

      const matchCategory = categoryFilter === "ALL" || (t.category && t.category.toLowerCase() === categoryFilter.toLowerCase());

      const matchSearch =
        !search.trim() ||
        t.category?.toLowerCase().includes(search.toLowerCase()) ||
        t.modelName?.toLowerCase().includes(search.toLowerCase()) ||
        t.fuelType?.toLowerCase().includes(search.toLowerCase()) ||
        t.seasonName?.toLowerCase().includes(search.toLowerCase()) ||
        t.city?.toLowerCase().includes(search.toLowerCase()) ||
        t.state?.toLowerCase().includes(search.toLowerCase()) ||
        t.serviceType?.toLowerCase().includes(search.toLowerCase());

      return matchService && matchType && matchState && matchCity && matchCategory && matchSearch;
    });

    if (!sortConfig?.key) return filtered;

    return [...filtered].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (
        sortConfig.key === "weekdayDayRate" ||
        sortConfig.key === "weekendDayRate" ||
        sortConfig.key === "baseFare" ||
        sortConfig.key === "discountPercentage"
      ) {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      } else if (sortConfig.key === "margin") {
        const cA = parseFloat(a.weekdayDayRate || 1);
        const vA = parseFloat(a.vendorWeekdayDayRate || (a.weekdayDayRate * 0.80) || 0.80);
        valA = cA > 0 ? ((cA - vA) / cA) * 100 : 0;

        const cB = parseFloat(b.weekdayDayRate || 1);
        const vB = parseFloat(b.vendorWeekdayDayRate || (b.weekdayDayRate * 0.80) || 0.80);
        valB = cB > 0 ? ((cB - vB) / cB) * 100 : 0;
      } else if (sortConfig.key === "tariffType") {
        valA = a.seasonal ? "Seasonal" : "Standard";
        valB = b.seasonal ? "Seasonal" : "Standard";
      } else if (typeof valA === "string") {
        valA = (valA || "").toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [tariffs, serviceFilter, activeTab, stateFilter, cityFilter, categoryFilter, search, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedTariffs.length / pageSize) || 1;
  const paginatedTariffs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedTariffs.slice(start, start + pageSize);
  }, [filteredAndSortedTariffs, currentPage, pageSize]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setStateFilter("ALL");
    setCityFilter("ALL");
    setCategoryFilter("ALL");
    setServiceFilter("ALL");
    setActiveTab("ALL");
    setCurrentPage(1);
  };

  // Live modal margin computation helper
  const modalMarginInfo = useMemo(() => {
    const isLocal = formData.serviceType === "LOCAL";
    const isAirport = formData.serviceType === "AIRPORT";

    if (isAirport) {
      const custRate = parseFloat(formData.customerFare || formData.baseFare || formData.airportCustomerFare || 0);
      const vendRate = parseFloat(formData.vendorFare || formData.vendorBaseFare || formData.airportVendorFare || (custRate * 0.80));
      const margin = custRate > 0 ? ((custRate - vendRate) / custRate) * 100 : 0;
      return {
        unit: "/ Trip",
        customer: custRate.toFixed(2),
        vendor: vendRate.toFixed(2),
        marginPercent: margin.toFixed(1),
        sampleCust: custRate.toFixed(0),
        sampleVend: vendRate.toFixed(0),
        sampleMargin: (custRate - vendRate).toFixed(0),
      };
    }

    const custRate = parseFloat((isLocal && formData.hourlyWeekdayDayRate ? formData.hourlyWeekdayDayRate : formData.weekdayDayRate) || 0);
    const vendRate = parseFloat((isLocal && formData.hourlyVendorWeekdayDayRate ? formData.hourlyVendorWeekdayDayRate : (formData.vendorWeekdayDayRate || (custRate * 0.80))) || 0);
    const margin = custRate > 0 ? ((custRate - vendRate) / custRate) * 100 : 0;
    const minUnits = isLocal ? 8 : parseInt(formData.baseIncludedKm || 250, 10);
    const custSample = custRate * minUnits;
    const vendSample = vendRate * minUnits;
    return {
      unit: isLocal && formData.hourlyWeekdayDayRate ? "/ Hr" : "/ KM",
      customer: custRate.toFixed(2),
      vendor: vendRate.toFixed(2),
      marginPercent: margin.toFixed(1),
      sampleCust: custSample.toFixed(0),
      sampleVend: vendSample.toFixed(0),
      sampleMargin: (custSample - vendSample).toFixed(0),
    };
  }, [formData]);

  return (
    <div className="space-y-6">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Vehicle Tariff & Pricing Matrix"
          subtitle="Configure rates individually for One Way, Round Trip, Local, and Airport with separate Customer selling fares and Vendor payouts"
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Pricing Matrix" },
          ]}
        />
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenCreate("STANDARD", serviceFilter !== "ALL" ? serviceFilter : "OUTSTATION")}
            variant="outline"
            className="text-xs gap-1.5 shadow-xs border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
            + Standard Tariff
          </Button>
          <Button
            onClick={() => handleOpenCreate("SEASONAL", serviceFilter !== "ALL" ? serviceFilter : "OUTSTATION")}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            + Seasonal Surge
          </Button>
        </div>
      </div>

      {/* SERVICE TYPE HIGH-LEVEL TABS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[
          { id: "ALL", label: "All Services", icon: ShieldCheck, count: tariffs.length, desc: "Combined Overview" },
          {
            id: "OUTSTATION",
            label: "Outstation",
            icon: Car,
            count: tariffs.filter(t => {
              const st = (t.serviceType || "OUTSTATION").toUpperCase();
              return st === "OUTSTATION" || st === "ONE_WAY" || st === "ROUND_TRIP";
            }).length,
            desc: "One Way & Round Trip Rates"
          },
          { id: "LOCAL", label: "Local", icon: MapPin, count: tariffs.filter(t => t.serviceType?.toUpperCase() === "LOCAL").length, desc: "City Limits Per-KM Pricing" },
          { id: "AIRPORT", label: "Airport Transfer", icon: Plane, count: airportTariffsCount, desc: "Distance Slabs & Transfer Rates" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = serviceFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setServiceFilter(tab.id)}
              className={`text-left p-3.5 rounded-2xl border transition-all ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/30"
                  : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className={`p-2 rounded-xl ${isActive ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"}`}>
                  {tab.count} Rules
                </span>
              </div>
              <div className="text-sm font-black">{tab.label}</div>
              <div className={`text-[11px] mt-0.5 ${isActive ? "text-blue-100" : "text-slate-500"}`}>{tab.desc}</div>
            </button>
          );
        })}
      </div>

      {serviceFilter === "AIRPORT" ? (
        <AirportTariffSection
          onUpdateCount={(count) => setAirportTariffsCount(count)}
          onEditItem={handleOpenEditAirport}
        />
      ) : (
        <>
          {/* LIVE SIMULATOR: CUSTOMER VS VENDOR PAYOUT PREVIEW */}
      <Card className="p-4 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white border-0 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold tracking-wide text-white">Live Customer & Vendor Payout Simulator</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Customer vs Vendor Check
              </span>
            </div>
            <p className="text-xs text-blue-200">
              Test fare calculation across One Way, Round Trip, Local, and Airport. Verifies Customer selling price and Vendor payout.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full lg:w-auto">
            {/* Service Type */}
            <select
              value={simService}
              onChange={(e) => setSimService(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-blue-950/70 border border-blue-800 text-white focus:outline-none"
            >
              <option value="ONE_WAY" className="bg-slate-900">🧭 One Way</option>
              <option value="ROUND_TRIP" className="bg-slate-900">🔄 Round Trip</option>
              <option value="LOCAL" className="bg-slate-900">📍 Local</option>
              <option value="AIRPORT" className="bg-slate-900">✈️ Airport</option>
            </select>

            {/* Category */}
            <select
              value={simCategory}
              onChange={(e) => {
                const cat = e.target.value;
                setSimCategory(cat);
                const firstPriced = tariffs
                  .find((t) => t.category?.toLowerCase() === cat.toLowerCase())
                  ?.modelName;
                setSimModel(firstPriced || "");
              }}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-blue-950/70 border border-blue-800 text-white focus:outline-none"
            >
              {dynamicCategories.map((c) => (
                <option key={c} value={c} className="bg-slate-900">{c}</option>
              ))}
            </select>

            <select
              value={simModel}
              onChange={(e) => setSimModel(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-blue-950/70 border border-blue-800 text-white focus:outline-none"
            >
              {simAvailableModels.length === 0 ? (
                <option value="" className="bg-slate-900">Dzire / Fleet</option>
              ) : (
                simAvailableModels.map((m) => (
                  <option key={m} value={m} className="bg-slate-900">{m}</option>
                ))
              )}
            </select>

            {/* Fuel Type */}
            <select
              value={simFuel}
              onChange={(e) => setSimFuel(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-blue-950/70 border border-blue-800 text-white focus:outline-none"
            >
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f} className="bg-slate-900">⛽ {f}</option>
              ))}
            </select>

            <input
              type="date"
              value={simDate}
              onChange={(e) => setSimDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-blue-950/70 border border-blue-800 text-white focus:outline-none"
            />

            <select
              value={simTime}
              onChange={(e) => setSimTime(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-blue-950/70 border border-blue-800 text-white focus:outline-none"
            >
              <option value="10:00 AM" className="bg-slate-900">☀️ Day (10:00 AM)</option>
              <option value="11:30 PM" className="bg-slate-900">🌙 Night (11:30 PM)</option>
            </select>
          </div>

          <Button
            size="sm"
            onClick={runSimulation}
            disabled={simLoading}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs whitespace-nowrap"
          >
            {simLoading ? "Calculating..." : "Run Test"}
          </Button>
        </div>

        {/* Simulator Results banner if active */}
        {simResult && (
          <div className="mt-4 pt-3 border-t border-blue-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-blue-300">
                Service: <strong className="text-white uppercase">{simResult.serviceType}</strong>
              </span>
              <span>•</span>
              <span className="text-blue-300">
                Rule:{" "}
                <strong className={simResult.isSeasonal ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                  {simResult.isSeasonal ? `★ ${simResult.seasonName || "Seasonal Surge"}` : "Standard Tariff"}
                </strong>
              </span>
              <span>•</span>
              <span className="text-blue-200">
                Slot: <strong>{simResult.dayType}</strong> ({simResult.timeSlot})
              </span>
              <span>•</span>
              <span className="text-blue-300 flex items-center gap-1">
                <Fuel className="w-3 h-3 text-emerald-400" />
                Fuel: <strong className="text-emerald-300">{simResult.fuelType || simFuel}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-blue-900/60 border border-blue-700/60 px-3 py-1.5 rounded-xl">
                <span className="text-blue-300 text-[10px] uppercase font-bold block">Customer Sees (Price)</span>
                <span className="text-base font-black text-amber-400">
                  ₹{parseFloat(simResult.ratePerKm || 0).toFixed(2)}/km
                </span>
              </div>

              <div className="bg-emerald-950/70 border border-emerald-700/60 px-3 py-1.5 rounded-xl">
                <span className="text-emerald-300 text-[10px] uppercase font-bold block">Vendor Sees (Payout)</span>
                <span className="text-base font-black text-emerald-400">
                  ₹{parseFloat(simResult.vendorRatePerKm || 0).toFixed(2)}/km
                </span>
              </div>

              <div className="bg-indigo-900/60 border border-indigo-700/60 px-3 py-1.5 rounded-xl">
                <span className="text-indigo-300 text-[10px] uppercase font-bold block">Platform Margin</span>
                <span className="text-sm font-black text-white">
                  {(() => {
                    const cust = parseFloat(simResult.ratePerKm || 0);
                    const vend = parseFloat(simResult.vendorRatePerKm || 0);
                    const margin = cust > 0 ? (((cust - vend) / cust) * 100).toFixed(1) : 0;
                    return `+${margin}% Profit`;
                  })()}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* DATATABLE CONTROLS & FILTER TOOLBAR */}
      <div className="space-y-3">
        {/* Row 1: Rule Type Tabs, Result Counter & Reset Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar">
            {[
              { id: "ALL", label: `All Rules (${tariffs.length.toLocaleString()})` },
              { id: "STANDARD", label: `Standard (${tariffs.filter((t) => !t.seasonal).length.toLocaleString()})` },
              { id: "SEASONAL", label: `✨ Seasonal (${tariffs.filter((t) => t.seasonal).length.toLocaleString()})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {(search || stateFilter !== "ALL" || cityFilter !== "ALL" || categoryFilter !== "ALL" || serviceFilter !== "ALL" || activeTab !== "ALL") && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}

            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
              <span>Showing</span>
              <strong className="text-slate-900 font-bold">{filteredAndSortedTariffs.length.toLocaleString()}</strong>
              <span>of {tariffs.length.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Deep Filters (Service, Category, State, City, Search, PageSize) */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-wrap items-center gap-2.5">
          {/* Service Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Service:</span>
            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Services</option>
              <option value="OUTSTATION">One Way / Outstation</option>
              <option value="ROUND_TRIP">Round Trip</option>
              <option value="LOCAL">Local Rental</option>
              <option value="AIRPORT">Airport Transfer</option>
            </select>
          </div>

          {/* Vehicle Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">State:</span>
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setCityFilter("ALL");
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All States</option>
              {Object.keys(STATES_AND_CITIES).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic City Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">City:</span>
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[180px] truncate cursor-pointer"
            >
              <option value="ALL">All Cities ({availableCities.length})</option>
              {availableCities.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Model, City, State, Fuel..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white"
            />
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Per Page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
              <option value={250}>250 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* TARIFF DATATABLE */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingAnimation message="Loading pricing matrix..." />
        </div>
      ) : filteredAndSortedTariffs.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 border border-dashed border-slate-300">
          <IndianRupee className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No tariff rules found for current filter</p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search or filters, or reset filters to view all pricing rules.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
            <Button
              onClick={() => handleOpenCreate("STANDARD", "OUTSTATION")}
              size="sm"
              variant="primary"
            >
              + Standard Tariff
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden border border-slate-200 shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader
                  columnKey="modelName"
                  label="Vehicle & Model"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  columnKey="city"
                  label="Territory (State / City)"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  columnKey="serviceType"
                  label="Service"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  columnKey="tariffType"
                  label="Tariff Type"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  columnKey="weekdayDayRate"
                  label="Weekday Rates (Cust / Vend)"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  align="center"
                />
                <SortableHeader
                  columnKey="weekendDayRate"
                  label="Weekend Rates (Cust / Vend)"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  align="center"
                />
                <SortableHeader
                  columnKey="baseFare"
                  label="Base Min Fare"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  align="center"
                />
                <SortableHeader
                  columnKey="discountPercentage"
                  label="Discount %"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  align="center"
                />
                <SortableHeader
                  columnKey="margin"
                  label="Platform Margin"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  align="center"
                />
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTariffs.map((t) => {
                const sType = (t.serviceType || "ONE_WAY").toUpperCase();
                
                let custWd = sType === "LOCAL" && (t.hourlyWeekdayDayRate || t.hourlyCustomerFare)
                  ? `₹${parseFloat(t.hourlyWeekdayDayRate || t.hourlyCustomerFare).toFixed(0)}/hr • ₹${parseFloat(t.weekdayDayRate || 0).toFixed(1)}/km`
                  : `₹${parseFloat(t.weekdayDayRate || 0).toFixed(1)}/km`;
                let vendWd = sType === "LOCAL" && (t.hourlyVendorWeekdayDayRate || t.hourlyVendorFare)
                  ? `₹${parseFloat(t.hourlyVendorWeekdayDayRate || t.hourlyVendorFare).toFixed(0)}/hr • ₹${parseFloat(t.vendorWeekdayDayRate || (t.weekdayDayRate * 0.80) || 0).toFixed(1)}/km`
                  : `₹${parseFloat(t.vendorWeekdayDayRate || (t.weekdayDayRate * 0.80) || 0).toFixed(1)}/km`;
                let custWe = sType === "LOCAL" && (t.hourlyWeekendDayRate || t.hourlyCustomerWeekendFare)
                  ? `₹${parseFloat(t.hourlyWeekendDayRate || t.hourlyCustomerWeekendFare).toFixed(0)}/hr • ₹${parseFloat(t.weekendDayRate || 0).toFixed(1)}/km`
                  : `₹${parseFloat(t.weekendDayRate || 0).toFixed(1)}/km`;
                let vendWe = sType === "LOCAL" && (t.hourlyVendorWeekendDayRate || t.hourlyVendorWeekendFare)
                  ? `₹${parseFloat(t.hourlyVendorWeekendDayRate || t.hourlyVendorWeekendFare).toFixed(0)}/hr • ₹${parseFloat(t.vendorWeekendDayRate || (t.weekendDayRate * 0.80) || 0).toFixed(1)}/km`
                  : `₹${parseFloat(t.vendorWeekendDayRate || (t.weekendDayRate * 0.80) || 0).toFixed(1)}/km`;
                let defaultKm = sType === "LOCAL" ? 80 : sType === "AIRPORT" ? 40 : 250;
                let defaultHrs = sType === "LOCAL" ? (t.packageHours || 8) : null;
                let baseDisplay = sType === "LOCAL" && defaultHrs
                  ? `₹${parseFloat(t.baseFare || 0).toLocaleString("en-IN")} (${defaultHrs}h / ${t.baseIncludedKm || defaultKm}km)`
                  : `₹${parseFloat(t.baseFare || 0).toLocaleString("en-IN")}`;
                let vendBaseDisplay = sType === "LOCAL" && defaultHrs
                  ? `₹${parseFloat(t.vendorBaseFare || (t.baseFare * 0.80) || 0).toLocaleString("en-IN")} (${defaultHrs}h / ${t.baseIncludedKm || defaultKm}km)`
                  : `₹${parseFloat(t.vendorBaseFare || (t.baseFare * 0.80) || 0).toLocaleString("en-IN")} (${t.baseIncludedKm || defaultKm}km)`;
                const c = sType === "LOCAL" && t.hourlyWeekdayDayRate ? parseFloat(t.hourlyWeekdayDayRate) : parseFloat(t.weekdayDayRate || 1);
                const v = sType === "LOCAL" && t.hourlyVendorWeekdayDayRate ? parseFloat(t.hourlyVendorWeekdayDayRate) : parseFloat(t.vendorWeekdayDayRate || (t.weekdayDayRate * 0.80) || 0.80);
                let marginPct = c > 0 ? ((c - v) / c) * 100 : 0;

                return (
                  <TableRow key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Category / Model */}
                    <TableCell>
                      <div className="font-bold text-slate-900 text-sm">{t.modelName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <Badge variant="primary" size="sm">
                          {t.category}
                        </Badge>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {t.seatingCapacity} Seater
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 inline-flex items-center gap-1">
                          <Fuel className="w-2.5 h-2.5 text-emerald-600" />
                          {t.fuelType || "Diesel"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Territory (State / City) */}
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 font-bold text-slate-800 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{t.city && t.city !== "ALL" ? t.city : "All Cities"}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium pl-4.5">
                          {t.state || "Tamil Nadu"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Service */}
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        sType === "ONE_WAY" || sType === "OUTSTATION"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : sType === "ROUND_TRIP"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : sType === "LOCAL"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}>
                        {(sType === "ONE_WAY" || sType === "OUTSTATION") && <Navigation className="w-3 h-3" />}
                        {sType === "ROUND_TRIP" && <ArrowLeftRight className="w-3 h-3" />}
                        {sType === "LOCAL" && <MapPin className="w-3 h-3" />}
                        {sType === "AIRPORT" && <Plane className="w-3 h-3" />}
                        {sType === "ROUND_TRIP" ? "Round Trip" : (sType === "ONE_WAY" || sType === "OUTSTATION") ? "One Way" : sType === "LOCAL" ? "Local" : "Airport"}
                      </span>
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      {t.seasonal ? (
                        <div className="text-[11px]">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                            <Flame className="w-3 h-3 text-amber-600" />
                            {t.seasonName || "Seasonal Surge"}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-1">
                            {t.startDate} → {t.endDate}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Standard
                        </span>
                      )}
                    </TableCell>

                    {/* Weekday Rates */}
                    <TableCell className="text-center">
                      <div className="text-xs">
                        <span className="font-bold text-slate-900">{custWd}</span>
                        <span className="text-[10px] text-slate-400 block">
                          Vendor: <strong className="text-emerald-700">{vendWd}</strong>
                        </span>
                      </div>
                    </TableCell>

                    {/* Weekend Rates */}
                    <TableCell className="text-center">
                      <div className="text-xs">
                        <span className="font-bold text-slate-900">{custWe}</span>
                        <span className="text-[10px] text-slate-400 block">
                          Vendor: <strong className="text-emerald-700">{vendWe}</strong>
                        </span>
                      </div>
                    </TableCell>

                    {/* Base Fare */}
                    <TableCell className="text-center">
                      <div className="text-xs">
                        <span className="font-bold text-slate-900">{baseDisplay}</span>
                        <span className="text-[10px] text-slate-400 block">{vendBaseDisplay}</span>
                        {parseFloat(t.petCharge || 0) > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 mt-1">
                            🐾 Pet: ₹{parseFloat(t.petCharge)} (Vend: ₹{parseFloat(t.vendorPetCharge || 0)})
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Discount % */}
                    <TableCell className="text-center">
                      {parseFloat(t.discountPercentage || 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {parseFloat(t.discountPercentage)}% OFF
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-semibold">—</span>
                      )}
                    </TableCell>

                    {/* Margin */}
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        {Math.max(0, marginPct).toFixed(0)}%
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStartEdit(t)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Tariff"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Tariff"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredAndSortedTariffs.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
              totalItems={filteredAndSortedTariffs.length}
              pageSize={pageSize}
            />
          )}
        </Card>
      )}
        </>
      )}

      {/* CREATE / EDIT TARIFF MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingItem
            ? `Edit Tariff: ${formData.modelName} (${formData.serviceType === "LOCAL" ? "Local" : formData.serviceType === "AIRPORT" ? "Airport" : formData.serviceType === "ROUND_TRIP" ? "Round Trip" : "One Way"})`
            : "Set Vehicle Tariff & Pricing Rules"
        }
        size="lg"
      >
        <form onSubmit={handleSaveTariff} className="space-y-4">
          
          {/* STEP 1: TARIFF DURATION */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Step 1: Tariff Duration
            </h4>
            <div className="flex items-center gap-2">
              {[
                { value: "STANDARD", label: "🏢 Standard Tariff", desc: "Year-Round Weekday & Weekend Pricing" },
                { value: "SEASONAL", label: "✨ Seasonal Peak Tariff", desc: "Festival / Holiday Surge Date Range" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      tariffType: opt.value,
                      seasonal: opt.value === "SEASONAL",
                    }))
                  }
                  className={`flex-1 py-1.5 px-3 rounded-lg border text-center transition-all ${
                    formData.tariffType === opt.value
                      ? "border-blue-500 bg-white text-blue-700 font-bold shadow-xs"
                      : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-white"
                  }`}
                >
                  <span className="text-xs block">{opt.label}</span>
                </button>
              ))}
            </div>

            {formData.tariffType === "SEASONAL" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Season Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Diwali Peak"
                    value={formData.seasonName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, seasonName: e.target.value }))}
                    className="w-full px-2.5 py-1 text-xs border border-amber-300 rounded-md bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    From Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-2.5 py-1 text-xs border border-amber-300 rounded-md bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    To Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-2.5 py-1 text-xs border border-amber-300 rounded-md bg-white"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: CHOOSE VEHICLE */}
          <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-600" />
              Step 2: Choose Vehicle
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Vehicle Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const cat = e.target.value;
                    const matchedModel = models.find((m) => m.category === cat);
                    const firstModel = matchedModel?.modelName || (cat === "SUV" ? "Ertiga" : cat === "Hatchback" ? "WagonR" : "Dzire");
                    const seat = matchedModel?.seatingCapacity || (cat === "SUV" ? "6" : "4");
                    const fuel = matchedModel?.fuelType || "Diesel";
                    setFormData((prev) => ({
                      ...prev,
                      category: cat,
                      modelName: firstModel,
                      seatingCapacity: seat,
                      fuelType: fuel,
                    }));
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer text-slate-900"
                >
                  {dynamicCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Car Model <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.modelName}
                  onChange={(e) => {
                    const mod = e.target.value;
                    const matched = models.find((m) => m.modelName === mod);
                    setFormData((prev) => ({
                      ...prev,
                      modelName: mod,
                      ...(matched?.seatingCapacity ? { seatingCapacity: matched.seatingCapacity } : {}),
                      ...(matched?.fuelType ? { fuelType: matched.fuelType } : {}),
                    }));
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer text-slate-900"
                  required
                >
                  <option value="">-- Choose Car Model --</option>
                  {availableModelsForForm.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Seating Capacity <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.seatingCapacity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, seatingCapacity: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer text-slate-900"
                >
                  {SEATING_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Fuel className="w-3 h-3 text-amber-500" />
                  Fuel Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.fuelType || "Diesel"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fuelType: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer text-slate-900"
                >
                  {FUEL_TYPES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* STEP 3: OPERATIONAL TERRITORY (STATE & CITY) */}
          {formData.serviceType !== "AIRPORT" && (
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                Step 3: Operational Territory (State & City)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.state || "Tamil Nadu"}
                    onChange={(e) => {
                      const newState = e.target.value;
                      const defaultCity = STATES_AND_CITIES[newState]?.[0] || "ALL";
                      setFormData((prev) => ({
                        ...prev,
                        state: newState,
                        city: defaultCity,
                        customCity: "",
                      }));
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold cursor-pointer text-slate-900"
                    required
                  >
                    {Object.keys(STATES_AND_CITIES).map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    City / Hub <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.city || "ALL"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold cursor-pointer text-slate-900"
                    required
                  >
                    <option value="ALL">All Cities in {formData.state || "State"}</option>
                    {(STATES_AND_CITIES[formData.state] || []).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Add Other City...</option>
                  </select>
                </div>
              </div>

              {formData.city === "CUSTOM" && (
                <div className="pt-2 border-t border-amber-200/60">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Custom City Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter specific city name (e.g. Kumbakonam)"
                    value={formData.customCity || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, customCity: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 text-xs border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SERVICE TYPE */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Step 4: Service Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* 1. OUTSTATION BOX (WITH ONE WAY & ROUND TRIP RADIO BUTTONS INSIDE) */}
              {(() => {
                const isSelected = formData.serviceType === "ONE_WAY" || formData.serviceType === "ROUND_TRIP" || formData.serviceType === "OUTSTATION";
                return (
                  <div
                    onClick={() => handleSwitchServiceInForm("OUTSTATION")}
                    className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-center gap-1.5">
                        <Car className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-black">Outstation</span>
                      </div>
                      <span className="text-[10px] opacity-75 block mt-0.5">Inter-city Per-KM Pricing</span>
                    </div>

                    {/* Radio buttons inside the Outstation box */}
                    <div className="mt-2.5 pt-2 border-t border-blue-200/60 flex items-center justify-center gap-3">
                      <label
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwitchServiceInForm("ONE_WAY");
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold cursor-pointer transition-all ${
                          isSelected && (formData.serviceType === "ONE_WAY" || formData.serviceType === "OUTSTATION")
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="outstationTripTypeBox"
                          value="ONE_WAY"
                          checked={isSelected && (formData.serviceType === "ONE_WAY" || formData.serviceType === "OUTSTATION")}
                          onChange={() => handleSwitchServiceInForm("ONE_WAY")}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>One Way</span>
                      </label>

                      <label
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwitchServiceInForm("ROUND_TRIP");
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold cursor-pointer transition-all ${
                          isSelected && formData.serviceType === "ROUND_TRIP"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="outstationTripTypeBox"
                          value="ROUND_TRIP"
                          checked={isSelected && formData.serviceType === "ROUND_TRIP"}
                          onChange={() => handleSwitchServiceInForm("ROUND_TRIP")}
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>Round Trip</span>
                      </label>
                    </div>
                  </div>
                );
              })()}

              {/* 2. LOCAL BOX */}
              {(() => {
                const isSelected = formData.serviceType === "LOCAL";
                return (
                  <button
                    type="button"
                    onClick={() => handleSwitchServiceInForm("LOCAL")}
                    className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-center gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-black">Local</span>
                      </div>
                      <span className="text-[10px] opacity-75 block mt-0.5">City Limits Per-KM Pricing</span>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-transparent text-[11px] text-slate-400 font-medium">
                      Intra-city Hourly / KM
                    </div>
                  </button>
                );
              })()}

              {/* 3. AIRPORT TRANSFER BOX */}
              {(() => {
                const isSelected = formData.serviceType === "AIRPORT";
                return (
                  <button
                    type="button"
                    onClick={() => handleSwitchServiceInForm("AIRPORT")}
                    className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-center gap-1.5">
                        <Plane className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-black">Airport Transfer</span>
                      </div>
                      <span className="text-[10px] opacity-75 block mt-0.5">Distance Slabs & Flat Fares</span>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-transparent text-[11px] text-slate-400 font-medium">
                      Pickup & Drop Slabs
                    </div>
                  </button>
                );
              })()}
            </div>
          </div>

          {/* STEP 5+: DYNAMIC FOR AIRPORT VS OUTSTATION/LOCAL */}
          {formData.serviceType === "AIRPORT" ? (
            <div className="space-y-3">
              {/* 1. Trip Direction */}
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-blue-950 uppercase tracking-wide flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-blue-600" />
                    Step 5: Trip Direction & Operational Territory (State & City)
                  </label>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full border border-blue-300">
                    Airport Route
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "CITY_TO_AIRPORT", label: "City ➔ Airport", desc: "Airport Drop" },
                    { value: "AIRPORT_TO_CITY", label: "Airport ➔ City", desc: "Airport Pickup" },
                    { value: "BOTH", label: "Both Directions", desc: "Uniform Drop & Pickup" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, tripDirection: opt.value }))}
                      className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                        formData.tripDirection === opt.value
                          ? "border-blue-600 bg-white text-blue-900 font-bold shadow-xs ring-2 ring-blue-500/20"
                          : "border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
                      }`}
                    >
                      <div className="text-xs">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-blue-200/60">
                  <div>
                    <label className="block text-[10px] font-bold text-blue-950 mb-1">
                      State <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.state || "Tamil Nadu"}
                      onChange={(e) => {
                        const newState = e.target.value;
                        const defaultCity = STATES_AND_CITIES[newState]?.[0] || "ALL";
                        setFormData((prev) => ({
                          ...prev,
                          state: newState,
                          city: defaultCity,
                          customCity: "",
                        }));
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-blue-300 bg-white font-semibold cursor-pointer text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                      required
                    >
                      {Object.keys(STATES_AND_CITIES).map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-blue-950 mb-1">
                      City / Hub <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.city || "Chennai"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      className="w-full text-xs p-2 rounded-lg border border-blue-300 bg-white font-semibold cursor-pointer text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                      required
                    >
                      <option value="ALL">All Cities in {formData.state || "State"}</option>
                      {(STATES_AND_CITIES[formData.state] || []).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="CUSTOM">+ Add Other City...</option>
                    </select>
                  </div>
                </div>

                {formData.city === "CUSTOM" && (
                  <div className="pt-2 border-t border-blue-200/60">
                    <label className="block text-[10px] font-bold text-blue-950 mb-1">
                      Custom City Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter specific city name (e.g. Kumbakonam)"
                      value={formData.customCity || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, customCity: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 text-xs border border-blue-300 rounded-lg bg-white"
                      required
                    />
                  </div>
                )}
              </div>

              {/* 2. KM Range (Distance Slabs) */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    Step 6: Distance Slab (KM Range)
                  </label>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-300">
                    Distance Range
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      Minimum KM
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minKm ?? "0"}
                      onChange={(e) => setFormData((prev) => ({ ...prev, minKm: e.target.value }))}
                      placeholder="e.g. 0"
                      className="w-full text-xs p-2 rounded-lg border border-emerald-300 bg-white font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      Maximum KM <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.maxKm ?? "35"}
                      onChange={(e) => setFormData((prev) => ({ ...prev, maxKm: e.target.value, baseIncludedKm: e.target.value }))}
                      placeholder="e.g. 35"
                      className="w-full text-xs p-2 rounded-lg border border-emerald-300 bg-white font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Pricing: Customer Fare, Vendor Payout, Extra KM Rate */}
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
                    Step 7: Fares & Extra KM Rates
                  </label>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full border border-amber-300">
                    Flat Slab Fares
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-950 mb-1">
                      👤 Customer Fare (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 1299"
                      value={formData.customerFare || formData.baseFare || formData.airportCustomerFare || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          customerFare: val,
                          baseFare: val,
                          airportCustomerFare: val,
                          vendorFare: prev.vendorFare || (val ? String(Math.round(parseFloat(val) * 0.80)) : ""),
                        }));
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-emerald-400 bg-white font-black text-emerald-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      🤝 Vendor Payout (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 950"
                      value={formData.vendorFare || formData.vendorBaseFare || formData.airportVendorFare || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, vendorFare: e.target.value, vendorBaseFare: e.target.value }))}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      Extra KM Rate (₹/KM)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 14"
                      value={formData.extraKmRate || formData.weekdayDayRate || "14"}
                      onChange={(e) => setFormData((prev) => ({ ...prev, extraKmRate: e.target.value, weekdayDayRate: e.target.value }))}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      Vendor Extra KM (₹/KM)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 11"
                      value={formData.vendorExtraKmRate || formData.vendorWeekdayDayRate || "11"}
                      onChange={(e) => setFormData((prev) => ({ ...prev, vendorExtraKmRate: e.target.value, vendorWeekdayDayRate: e.target.value }))}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-amber-200/60">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      🏷️ Discount %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 5"
                      value={formData.discountPercentage ?? "0"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setFormData((prev) => ({ ...prev, discountPercentage: "" }));
                          return;
                        }
                        const num = parseFloat(val);
                        if (num > 100) {
                          setFormData((prev) => ({ ...prev, discountPercentage: "100" }));
                        } else if (num < 0) {
                          setFormData((prev) => ({ ...prev, discountPercentage: "0" }));
                        } else {
                          setFormData((prev) => ({ ...prev, discountPercentage: val }));
                        }
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div className="flex items-center pt-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={Boolean(formData.tollIncluded)}
                        onChange={(e) => setFormData((prev) => ({ ...prev, tollIncluded: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                      />
                      <span>Toll Included in Fare</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* STEP 8: PET TRAVEL CHARGES (SEPARATE SECTION) */}
              <div className="p-3.5 bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-amber-50/80 border border-amber-200/90 rounded-xl space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-300 text-amber-700 flex items-center justify-center text-xs font-bold shadow-2xs">
                      🐾
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                        Step 8: Pet Travel Charges (Customer Fare & Vendor Payout)
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Applied automatically when customer books via Pet-Friendly Cabs
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300 uppercase tracking-wide">
                    Pet Add-on Surcharge
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                  <div className="p-2.5 bg-white border border-amber-200 rounded-lg shadow-2xs">
                    <label className="block text-[11px] font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <span className="text-amber-600 font-extrabold">🐾</span>
                      <span>Customer Pet Charge (₹)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={formData.petCharge}
                      onChange={(e) => setFormData((prev) => ({ ...prev, petCharge: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs font-black border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Added to trip fare when booked from Pet-Friendly Cabs tab
                    </span>
                  </div>

                  <div className="p-2.5 bg-white border border-amber-200 rounded-lg shadow-2xs">
                    <label className="block text-[11px] font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <span className="text-amber-600 font-extrabold">🤝</span>
                      <span>Vendor Pet Payout (₹)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 350"
                      value={formData.vendorPetCharge}
                      onChange={(e) => setFormData((prev) => ({ ...prev, vendorPetCharge: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs font-black border border-amber-300 rounded-md bg-amber-50/50 text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Additional surcharge disbursed to vendor/driver for pet rides
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. Schedule: Days of Week, Time Window & Expiry */}
              <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-purple-950 uppercase tracking-wide flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    Step 9: Days, Time Range & Expiry
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, daysOfWeek: "ALL" }))}
                      className="text-[10px] text-purple-700 font-bold hover:underline"
                    >
                      All Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, daysOfWeek: "MON,TUE,WED,THU,FRI" }))}
                      className="text-[10px] text-purple-700 font-bold hover:underline"
                    >
                      Weekdays
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, daysOfWeek: "SAT,SUN" }))}
                      className="text-[10px] text-purple-700 font-bold hover:underline"
                    >
                      Weekends
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  {AIRPORT_DAYS_OF_WEEK.map((d) => {
                    const isAll = (formData.daysOfWeek || "ALL") === "ALL";
                    const isSelected = isAll || (formData.daysOfWeek || "").split(",").includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          if (isAll) {
                            setFormData((prev) => ({ ...prev, daysOfWeek: d }));
                          } else {
                            const current = formData.daysOfWeek ? formData.daysOfWeek.split(",") : [];
                            const updated = current.includes(d) ? current.filter((x) => x !== d) : [...current, d];
                            setFormData((prev) => ({
                              ...prev,
                              daysOfWeek: updated.length === 7 || updated.length === 0 ? "ALL" : updated.join(","),
                            }));
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                          isSelected
                            ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-purple-200/60">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Time Slot</label>
                    <select
                      value={formData.timeSlotType || "ALL_DAY"}
                      onChange={(e) => setFormData((prev) => ({ ...prev, timeSlotType: e.target.value }))}
                      className="w-full text-xs p-2 rounded-lg border border-purple-200 bg-white"
                    >
                      <option value="ALL_DAY">All Day (24 Hours)</option>
                      <option value="DAY">Day Hours (06:00 to 22:00)</option>
                      <option value="NIGHT">Night Hours (22:00 to 06:00)</option>
                      <option value="CUSTOM">Custom Time Range</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Expiry</label>
                    <select
                      value={formData.expiryType || "NEVER"}
                      onChange={(e) => setFormData((prev) => ({ ...prev, expiryType: e.target.value }))}
                      className="w-full text-xs p-2 rounded-lg border border-purple-200 bg-white font-medium"
                    >
                      <option value="NEVER">Never Expires</option>
                      <option value="FIXED_DAYS">Fixed Days (Date Window)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Status</label>
                    <select
                      value={formData.status || "ACTIVE"}
                      onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                      className="w-full text-xs p-2 rounded-lg border border-purple-200 bg-white font-bold"
                    >
                      <option value="ACTIVE">ACTIVE (Live)</option>
                      <option value="INACTIVE">INACTIVE (Disabled)</option>
                    </select>
                  </div>
                </div>

                {formData.expiryType === "FIXED_DAYS" && (
                  <div className="grid grid-cols-2 gap-2 pt-1 bg-purple-100/40 p-2 rounded-lg border border-purple-200/60">
                    <div>
                      <label className="block text-[10px] font-bold text-purple-900 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                        className="w-full text-xs p-1.5 rounded-lg border border-purple-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-purple-900 mb-1">End Date</label>
                      <input
                        type="date"
                        value={formData.endDate || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                        className="w-full text-xs p-1.5 rounded-lg border border-purple-200 bg-white"
                      />
                    </div>
                  </div>
                )}

                {formData.timeSlotType === "CUSTOM" && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={formData.timeRangeStart || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, timeRangeStart: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg border border-purple-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={formData.timeRangeEnd || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, timeRangeEnd: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg border border-purple-200 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* STEP 5: BASE FARES & MINIMUM THRESHOLDS */}
              {formData.serviceType === "LOCAL" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Step 5: Base Fares & Minimum Thresholds (KM & Hours)
                    </h4>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-full border border-emerald-200">
                  Minimum Package Thresholds
                </span>
              </div>

              {/* CARD 1: DISTANCE / MINIMUM KM */}
              <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    Distance Base & Minimum KM
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold uppercase">
                    Per-KM Base
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      🚗 Included Min KM
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 80"
                      value={formData.baseIncludedKm}
                      onChange={(e) => setFormData((prev) => ({ ...prev, baseIncludedKm: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-900 mb-1">
                      👤 Customer Base (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1800"
                      value={formData.baseFare}
                      onChange={(e) => setFormData((prev) => ({ ...prev, baseFare: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-950 mb-1">
                      🤝 Vendor Base (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1350"
                      value={formData.vendorBaseFare}
                      onChange={(e) => setFormData((prev) => ({ ...prev, vendorBaseFare: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs border border-emerald-300 rounded-md bg-emerald-50/60 font-bold text-emerald-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-amber-900 mb-1">
                      🏷️ Discount %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 9"
                      value={formData.discountPercentage ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setFormData((prev) => ({ ...prev, discountPercentage: "" }));
                          return;
                        }
                        const num = parseFloat(val);
                        if (num > 100) {
                          setFormData((prev) => ({ ...prev, discountPercentage: "100" }));
                        } else if (num < 0) {
                          setFormData((prev) => ({ ...prev, discountPercentage: "0" }));
                        } else {
                          setFormData((prev) => ({ ...prev, discountPercentage: val }));
                        }
                      }}
                      className="w-full px-2.5 py-1.5 text-xs border border-amber-300 rounded-md bg-amber-50/60 font-bold text-amber-900"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: TIME / MINIMUM HOURS */}
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between border-b border-blue-200/60 pb-1">
                  <span className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Hourly Base & Minimum Hours
                  </span>
                  <span className="text-[10px] text-blue-700 font-bold uppercase">
                    Hourly Base
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-blue-950 mb-1">
                      ⏰ Included Min Hours
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 8"
                      value={formData.packageHours}
                      onChange={(e) => setFormData((prev) => ({ ...prev, packageHours: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs border border-blue-300 rounded-md bg-white font-bold text-blue-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-blue-950 mb-1">
                      👤 Customer Base (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1800"
                      value={formData.hourlyCustomerFare}
                      onChange={(e) => setFormData((prev) => ({ ...prev, hourlyCustomerFare: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs border border-blue-300 rounded-md bg-white font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-950 mb-1">
                      🤝 Vendor Base (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1350"
                      value={formData.hourlyVendorFare}
                      onChange={(e) => setFormData((prev) => ({ ...prev, hourlyVendorFare: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs border border-emerald-300 rounded-md bg-emerald-50/60 font-bold text-emerald-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Step 5: Base Fares & Minimum KM
                </h4>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-full border border-emerald-200">
                  Minimum Package Threshold
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    🚗 Included Min KM
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 250"
                    value={formData.baseIncludedKm}
                    onChange={(e) => setFormData((prev) => ({ ...prev, baseIncludedKm: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    👤 Customer Base (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2800"
                    value={formData.baseFare}
                    onChange={(e) => setFormData((prev) => ({ ...prev, baseFare: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-950 mb-1">
                    🤝 Vendor Base (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2100"
                    value={formData.vendorBaseFare}
                    onChange={(e) => setFormData((prev) => ({ ...prev, vendorBaseFare: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs border border-emerald-300 rounded-md bg-emerald-50/60 font-bold text-emerald-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-900 mb-1">
                    🏷️ Discount %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 9"
                    value={formData.discountPercentage ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setFormData((prev) => ({ ...prev, discountPercentage: "" }));
                        return;
                      }
                      const num = parseFloat(val);
                      if (num > 100) {
                        setFormData((prev) => ({ ...prev, discountPercentage: "100" }));
                      } else if (num < 0) {
                        setFormData((prev) => ({ ...prev, discountPercentage: "0" }));
                      } else {
                        setFormData((prev) => ({ ...prev, discountPercentage: val }));
                      }
                    }}
                    className="w-full px-2.5 py-1.5 text-xs border border-amber-300 rounded-md bg-amber-50/60 font-bold text-amber-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: PET FRIENDLY SURCHARGES (SEPARATE SECTION) */}
          <div className="p-3.5 bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-amber-50/80 border border-amber-200/90 rounded-xl space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-300 text-amber-700 flex items-center justify-center text-xs font-bold shadow-2xs">
                  🐾
                </span>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    Step 6: Pet Travel Charges (Customer Fare & Vendor Payout)
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Applied automatically when customer books via Pet-Friendly Cabs
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300 uppercase tracking-wide">
                Pet Add-on Surcharge
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
              <div className="p-2.5 bg-white border border-amber-200 rounded-lg shadow-2xs">
                <label className="block text-[11px] font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <span className="text-amber-600 font-extrabold">🐾</span>
                  <span>Customer Pet Charge (₹)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={formData.petCharge}
                  onChange={(e) => setFormData((prev) => ({ ...prev, petCharge: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs font-black border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Added to trip fare when booked from Pet-Friendly Cabs tab
                </span>
              </div>
              <div className="p-2.5 bg-white border border-purple-200 rounded-lg shadow-2xs">
                <label className="block text-[11px] font-bold text-purple-950 mb-1 flex items-center gap-1.5">
                  <span className="text-purple-600 font-extrabold">🤝</span>
                  <span>Vendor Pet Payout (₹)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 350"
                  value={formData.vendorPetCharge}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vendorPetCharge: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs font-black border border-purple-300 rounded-md bg-purple-50/40 text-purple-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Additional surcharge disbursed to vendor/driver for pet rides
                </span>
              </div>
            </div>
          </div>

          {/* STEP 7: SET PRICE FOR CUSTOMER & VENDOR */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                Step 7: Set Price for Customer & Vendor ({formData.serviceType === "LOCAL" ? "Local" : formData.serviceType === "AIRPORT" ? "Airport" : formData.serviceType === "ROUND_TRIP" ? "Round Trip" : "One Way"})
              </h4>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Customer (Selling) vs Vendor (Payout)
              </span>
            </div>

            {/* RATE FORM (WEEKDAY & WEEKEND STRUCTURE) */}
            <div className="space-y-3">
              {formData.serviceType === "LOCAL" ? (
                <>
                  {/* LOCAL DISTANCE / EXTRA KM RATES (FIRST) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                        Distance / Extra KM Rates (₹/KM) — Beyond Included Limit
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Per-KM Rates
                      </span>
                    </div>

                    {/* Weekday KM Rates */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                        <span className="text-xs font-black text-slate-800">
                          🏢 Weekday Rates (Mon – Fri)
                        </span>
                        <span className="text-[10px] text-slate-600 font-bold uppercase">
                          Local City Rate
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-900 mb-1">
                            👤 Customer Day (₹/KM)
                          </label>
                          <input
                            type="number" step="0.10" min="0"
                            value={formData.weekdayDayRate}
                            onChange={(e) => setFormData((prev) => ({ ...prev, weekdayDayRate: e.target.value }))}
                            className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded-md bg-white text-slate-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-950 mb-1">
                            🤝 Vendor Day (₹/KM)
                          </label>
                          <input
                            type="number" step="0.10" min="0"
                            value={formData.vendorWeekdayDayRate}
                            onChange={(e) => setFormData((prev) => ({ ...prev, vendorWeekdayDayRate: e.target.value }))}
                            className="w-full px-2 py-1 text-xs font-bold border border-emerald-300 rounded-md bg-emerald-50/60 text-emerald-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-900 mb-1">
                            👤 Customer Night (₹/KM)
                          </label>
                          <input
                            type="number" step="0.10" min="0"
                            value={formData.weekdayNightRate}
                            onChange={(e) => setFormData((prev) => ({ ...prev, weekdayNightRate: e.target.value }))}
                            className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded-md bg-white text-slate-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-950 mb-1">
                            🤝 Vendor Night (₹/KM)
                          </label>
                          <input
                            type="number" step="0.10" min="0"
                            value={formData.vendorWeekdayNightRate}
                            onChange={(e) => setFormData((prev) => ({ ...prev, vendorWeekdayNightRate: e.target.value }))}
                            className="w-full px-2 py-1 text-xs font-bold border border-emerald-300 rounded-md bg-emerald-50/60 text-emerald-900"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Weekend KM Rates */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                        <span className="text-xs font-black text-slate-800">
                          🌴 Weekend Rates (Sat – Sun)
                        </span>
                        <span className="text-[10px] text-slate-600 font-bold uppercase">
                          Local Weekend
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-900 mb-1">
                            👤 Customer Day (₹/KM)
                          </label>
                          <input
                            type="number" step="0.10" min="0"
                            value={formData.weekendDayRate}
                            onChange={(e) => setFormData((prev) => ({ ...prev, weekendDayRate: e.target.value }))}
                            className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded-md bg-white text-slate-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-950 mb-1">
                            🤝 Vendor Day (₹/KM)
                          </label>
                          <input
                            type="number" step="0.10" min="0"
                            value={formData.vendorWeekendDayRate}
                            onChange={(e) => setFormData((prev) => ({ ...prev, vendorWeekendDayRate: e.target.value }))}
                            className="w-full px-2 py-1 text-xs font-bold border border-emerald-300 rounded-md bg-emerald-50/60 text-emerald-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-900 mb-1">
                            👤 Customer Night (₹/KM)
                          </label>
                          <input
                            type="number" step="0.10" min="0"
                            value={formData.weekendNightRate}
                            onChange={(e) => setFormData((prev) => ({ ...prev, weekendNightRate: e.target.value }))}
                            className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded-md bg-white text-slate-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-950 mb-1">
                            🤝 Vendor Night (₹/KM)
                          </label>
                          <input
                            type="number" step="0.10" min="0"
                            value={formData.vendorWeekendNightRate}
                            onChange={(e) => setFormData((prev) => ({ ...prev, vendorWeekendNightRate: e.target.value }))}
                            className="w-full px-2 py-1 text-xs font-bold border border-emerald-300 rounded-md bg-emerald-50/60 text-emerald-900"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LOCAL HOURLY RATES (DOWN) */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-blue-950 uppercase tracking-wide flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        Hourly Rates (₹/Hr) — Local City Packages
                      </span>
                      <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Day & Night Hourly Rates
                      </span>
                    </div>

                    {/* Weekday Hourly Rates */}
                    <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between border-b border-blue-200/60 pb-1">
                        <span className="text-xs font-black text-blue-900">
                          🏢 Weekday Rates (Mon – Fri)
                        </span>
                        <span className="text-[10px] text-blue-700 font-bold uppercase">
                          Local Hourly Rate
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-blue-950 mb-1">
                            👤 Customer Day (₹/hr)
                          </label>
                          <input
                            type="number" step="1" min="0"
                            placeholder="e.g. 200"
                            value={formData.hourlyWeekdayDayRate}
                            onChange={(e) => setFormData((prev) => ({ ...prev, hourlyWeekdayDayRate: e.target.value }))}
                            className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded-md bg-white text-slate-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-950 mb-1">
                            🤝 Vendor Day (₹/hr)
                          </label>
                          <input
                            type="number" step="1" min="0"
                            placeholder="e.g. 150"
                            value={formData.hourlyVendorWeekdayDayRate}
                            onChange={(e) => setFormData((prev) => ({ ...prev, hourlyVendorWeekdayDayRate: e.target.value }))}
                            className="w-full px-2 py-1 text-xs font-bold border border-emerald-300 rounded-md bg-emerald-50/60 text-emerald-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-blue-950 mb-1">
                            👤 Customer Night (₹/hr)
                          </label>
                          <input
                            type="number" step="1" min="0"
                            placeholder="e.g. 250"
                            value={formData.hourlyWeekdayNightRate}
                            onChange={(e) => setFormData((prev) => ({ ...prev, hourlyWeekdayNightRate: e.target.value }))}
                            className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded-md bg-white text-slate-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-950 mb-1">
                            🤝 Vendor Night (₹/hr)
                          </label>
                          <input
                            type="number" step="1" min="0"
                            placeholder="e.g. 190"
                            value={formData.hourlyVendorWeekdayNightRate}
                            onChange={(e) => setFormData((prev) => ({ ...prev, hourlyVendorWeekdayNightRate: e.target.value }))}
                            className="w-full px-2 py-1 text-xs font-bold border border-emerald-300 rounded-md bg-emerald-50/60 text-emerald-900"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Weekend Hourly Rates */}
                    <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between border-b border-indigo-200/60 pb-1">
                        <span className="text-xs font-black text-indigo-900">
                          🌴 Weekend Rates (Sat – Sun)
                        </span>
                        <span className="text-[10px] text-indigo-700 font-bold uppercase">
                          Local Weekend Hourly
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-indigo-950 mb-1">
                            👤 Customer Day (₹/hr)
                          </label>
                          <input
                            type="number" step="1" min="0"
                            placeholder="e.g. 230"
                            value={formData.hourlyWeekendDayRate}
                            onChange={(e) => setFormData((prev) => ({ ...prev, hourlyWeekendDayRate: e.target.value }))}
                            className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded-md bg-white text-slate-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-950 mb-1">
                            🤝 Vendor Day (₹/hr)
                          </label>
                          <input
                            type="number" step="1" min="0"
                            placeholder="e.g. 170"
                            value={formData.hourlyVendorWeekendDayRate}
                            onChange={(e) => setFormData((prev) => ({ ...prev, hourlyVendorWeekendDayRate: e.target.value }))}
                            className="w-full px-2 py-1 text-xs font-bold border border-emerald-300 rounded-md bg-emerald-50/60 text-emerald-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-indigo-950 mb-1">
                            👤 Customer Night (₹/hr)
                          </label>
                          <input
                            type="number" step="1" min="0"
                            placeholder="e.g. 280"
                            value={formData.hourlyWeekendNightRate}
                            onChange={(e) => setFormData((prev) => ({ ...prev, hourlyWeekendNightRate: e.target.value }))}
                            className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded-md bg-white text-slate-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-950 mb-1">
                            🤝 Vendor Night (₹/hr)
                          </label>
                          <input
                            type="number" step="1" min="0"
                            placeholder="e.g. 210"
                            value={formData.hourlyVendorWeekendNightRate}
                            onChange={(e) => setFormData((prev) => ({ ...prev, hourlyVendorWeekendNightRate: e.target.value }))}
                            className="w-full px-2 py-1 text-xs font-bold border border-emerald-300 rounded-md bg-emerald-50/60 text-emerald-900"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Weekday Rates */}
                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between border-b border-blue-200/60 pb-1">
                      <span className="text-xs font-black text-blue-900">
                        🏢 Weekday Rates (Mon – Fri)
                      </span>
                      <span className="text-[10px] text-blue-700 font-bold uppercase">
                        {formData.serviceType === "AIRPORT" ? "Airport Transfer Rate" : formData.serviceType === "ROUND_TRIP" ? "Round Trip Rate" : "One Way Rate"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-blue-950 mb-1">
                          👤 Customer Day (₹/KM)
                        </label>
                        <input
                          type="number" step="0.10" min="0"
                          value={formData.weekdayDayRate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, weekdayDayRate: e.target.value }))}
                          className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded-md bg-white text-slate-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-950 mb-1">
                          🤝 Vendor Day (₹/KM)
                        </label>
                        <input
                          type="number" step="0.10" min="0"
                          value={formData.vendorWeekdayDayRate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, vendorWeekdayDayRate: e.target.value }))}
                          className="w-full px-2 py-1 text-xs font-bold border border-emerald-300 rounded-md bg-emerald-50/60 text-emerald-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-blue-950 mb-1">
                          👤 Customer Night (₹/KM)
                        </label>
                        <input
                          type="number" step="0.10" min="0"
                          value={formData.weekdayNightRate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, weekdayNightRate: e.target.value }))}
                          className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded-md bg-white text-slate-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-950 mb-1">
                          🤝 Vendor Night (₹/KM)
                        </label>
                        <input
                          type="number" step="0.10" min="0"
                          value={formData.vendorWeekdayNightRate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, vendorWeekdayNightRate: e.target.value }))}
                          className="w-full px-2 py-1 text-xs font-bold border border-emerald-300 rounded-md bg-emerald-50/60 text-emerald-900"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Weekend Rates */}
                  <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between border-b border-indigo-200/60 pb-1">
                      <span className="text-xs font-black text-indigo-900">
                        🌴 Weekend Rates (Sat – Sun)
                      </span>
                      <span className="text-[10px] text-indigo-700 font-bold uppercase">
                        {formData.serviceType === "AIRPORT" ? "Airport Weekend" : formData.serviceType === "ROUND_TRIP" ? "Round Trip Weekend" : "One Way Weekend"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-indigo-950 mb-1">
                          👤 Customer Day (₹/KM)
                        </label>
                        <input
                          type="number" step="0.10" min="0"
                          value={formData.weekendDayRate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, weekendDayRate: e.target.value }))}
                          className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded-md bg-white text-slate-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-950 mb-1">
                          🤝 Vendor Day (₹/KM)
                        </label>
                        <input
                          type="number" step="0.10" min="0"
                          value={formData.vendorWeekendDayRate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, vendorWeekendDayRate: e.target.value }))}
                          className="w-full px-2 py-1 text-xs font-bold border border-emerald-300 rounded-md bg-emerald-50/60 text-emerald-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-indigo-950 mb-1">
                          👤 Customer Night (₹/KM)
                        </label>
                        <input
                          type="number" step="0.10" min="0"
                          value={formData.weekendNightRate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, weekendNightRate: e.target.value }))}
                          className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded-md bg-white text-slate-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-950 mb-1">
                          🤝 Vendor Night (₹/KM)
                        </label>
                        <input
                          type="number" step="0.10" min="0"
                          value={formData.vendorWeekendNightRate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, vendorWeekendNightRate: e.target.value }))}
                          className="w-full px-2 py-1 text-xs font-bold border border-emerald-300 rounded-md bg-emerald-50/60 text-emerald-900"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
            </>
          )}

            {/* LIVE MARGIN OVERVIEW BANNER IN MODAL */}
            <div className="p-3 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-blue-300 font-bold uppercase block">
                  Trip Fare & Profit Preview
                </span>
                <div className="flex items-center gap-3 mt-0.5 text-xs">
                  <span>Customer: <strong className="text-amber-400">₹{modalMarginInfo.customer} {modalMarginInfo.unit}</strong></span>
                  <span>•</span>
                  <span>Vendor Payout: <strong className="text-emerald-400">₹{modalMarginInfo.vendor} {modalMarginInfo.unit}</strong></span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-blue-300 font-bold uppercase block">Platform Margin</span>
                <span className="text-sm font-black text-white bg-blue-800/80 px-2 py-0.5 rounded-md border border-blue-600">
                  +{modalMarginInfo.marginPercent}% Profit
                </span>
              </div>
            </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? "Saving Tariff..." : editingItem ? "Update Tariff Rules" : "Save Tariff Rules"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRMATION POPUP DIALOG */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={Boolean(confirmDialog)}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText || "Cancel"}
          variant={confirmDialog.variant || "danger"}
          loading={confirmDialog.loading}
          onConfirm={confirmDialog.onConfirm}
          onClose={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}