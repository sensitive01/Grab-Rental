"use client";

import { useState, useEffect, useMemo } from "react";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { formatINR } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/Table";
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
    outstation: { custWdDay: "11.00", custWdNight: "12.50", custWeDay: "12.50", custWeNight: "14.00", vendWdDay: "8.50", vendWdNight: "9.50", vendWeDay: "9.50", vendWeNight: "10.50", custBase: "2800.00", vendBase: "2000.00", minKm: "250" },
    local: { custWdDay: "13.00", custWdNight: "14.50", custWeDay: "14.50", custWeNight: "16.00", vendWdDay: "9.50", vendWdNight: "10.50", vendWeDay: "10.50", vendWeNight: "11.50", custBase: "1500.00", vendBase: "1100.00", minKm: "80" },
    airport: { custWdDay: "11.00", custWdNight: "12.50", custWeDay: "12.50", custWeNight: "14.00", vendWdDay: "8.50", vendWdNight: "9.50", vendWeDay: "9.50", vendWeNight: "10.50", custBase: "1200.00", vendBase: "850.00", minKm: "40" }
  },
  Sedan: {
    outstation: { custWdDay: "12.50", custWdNight: "14.00", custWeDay: "14.00", custWeNight: "15.50", vendWdDay: "9.50", vendWdNight: "10.50", vendWeDay: "10.50", vendWeNight: "11.50", custBase: "3200.00", vendBase: "2300.00", minKm: "250" },
    local: { custWdDay: "14.50", custWdNight: "16.00", custWeDay: "16.00", custWeNight: "17.50", vendWdDay: "10.50", vendWdNight: "11.50", vendWeDay: "11.50", vendWeNight: "12.50", custBase: "1800.00", vendBase: "1300.00", minKm: "80" },
    airport: { custWdDay: "12.50", custWdNight: "14.00", custWeDay: "14.00", custWeNight: "15.50", vendWdDay: "9.50", vendWdNight: "10.50", vendWeDay: "10.50", vendWeNight: "11.50", custBase: "1400.00", vendBase: "1000.00", minKm: "40" }
  },
  SUV: {
    outstation: { custWdDay: "16.00", custWdNight: "18.00", custWeDay: "18.00", custWeNight: "20.00", vendWdDay: "12.00", vendWdNight: "13.50", vendWeDay: "13.50", vendWeNight: "15.00", custBase: "4500.00", vendBase: "3200.00", minKm: "250" },
    local: { custWdDay: "18.00", custWdNight: "20.00", custWeDay: "20.00", custWeNight: "22.00", vendWdDay: "13.50", vendWdNight: "15.00", vendWeDay: "15.00", vendWeNight: "16.50", custBase: "2400.00", vendBase: "1700.00", minKm: "80" },
    airport: { custWdDay: "16.00", custWdNight: "18.00", custWeDay: "18.00", custWeNight: "20.00", vendWdDay: "12.00", vendWdNight: "13.50", vendWeDay: "13.50", vendWeNight: "15.00", custBase: "1800.00", vendBase: "1300.00", minKm: "40" }
  },
  Innovacrysta: {
    outstation: { custWdDay: "20.00", custWdNight: "22.00", custWeDay: "22.00", custWeNight: "24.00", vendWdDay: "15.00", vendWdNight: "16.50", vendWeDay: "16.50", vendWeNight: "18.00", custBase: "5500.00", vendBase: "3900.00", minKm: "250" },
    local: { custWdDay: "22.00", custWdNight: "24.50", custWeDay: "24.50", custWeNight: "27.00", vendWdDay: "16.50", vendWdNight: "18.00", vendWeDay: "18.00", vendWeNight: "19.50", custBase: "3000.00", vendBase: "2200.00", minKm: "80" },
    airport: { custWdDay: "20.00", custWdNight: "22.00", custWeDay: "22.00", custWeNight: "24.00", vendWdDay: "15.00", vendWdNight: "16.50", vendWeDay: "16.50", vendWeNight: "18.00", custBase: "2200.00", vendBase: "1600.00", minKm: "40" }
  }
};

export default function AdminPricingPage() {
  const [tariffs, setTariffs] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceFilter, setServiceFilter] = useState("ALL"); // ALL, OUTSTATION, LOCAL, AIRPORT
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, STANDARD, SEASONAL
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [toast, setToast] = useState(null);

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
    serviceType: "OUTSTATION", // OUTSTATION | LOCAL | AIRPORT
    state: "Tamil Nadu",
    city: "Theni",
    customCity: "",
    tariffType: "STANDARD",   // STANDARD | SEASONAL
    seasonal: false,
    seasonName: "",
    startDate: "",
    endDate: "",

    // Customer Per-KM Rates (Used for both Outstation and Local)
    weekdayDayRate: "",
    weekdayNightRate: "",
    weekendDayRate: "",
    weekendNightRate: "",
    baseFare: "",
    baseIncludedKm: "",
    driverBattaDay: "",
    driverBattaNight: "",

    // Vendor Per-KM Rates (Used for both Outstation and Local)
    vendorWeekdayDayRate: "",
    vendorWeekdayNightRate: "",
    vendorWeekendDayRate: "",
    vendorWeekendNightRate: "",
    vendorBaseFare: "",
    vendorDriverBattaDay: "",
    vendorDriverBattaNight: "",

    // Airport Specific Fares
    airportCustomerFare: "",
    airportVendorFare: "",
    airportCustomerWeekendFare: "",
    airportVendorWeekendFare: "",
    airportIncludedKm: "",
    airportExtraKmRate: "",
    airportVendorExtraKmRate: "",
    tollIncluded: false,
  });

  // Simulator State
  const [simService, setSimService] = useState("OUTSTATION");
  const [simCategory, setSimCategory] = useState("Sedan");
  const [simModel, setSimModel] = useState("Dzire");
  const [simDate, setSimDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [simTime, setSimTime] = useState("10:00 AM");
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [tariffRes, modelRes] = await Promise.all([
          adminApi.getTariffs(),
          adminApi.getModelConfigs(),
        ]);
        if (isMounted) {
          if (tariffRes.data) setTariffs(tariffRes.data);
          if (modelRes.data) setModels(modelRes.data);
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

  // Filter available model names based on selected category in form
  const availableModelsForForm = useMemo(() => {
    const matched = models.filter(
      (m) => m.category?.toLowerCase() === formData.category?.toLowerCase()
    );
    if (matched.length > 0) return matched.map((m) => m.modelName);
    if (formData.category === "Sedan") return ["Dzire", "Etios", "Aura"];
    if (formData.category === "Hatchback") return ["WagonR", "Swift"];
    if (formData.category === "SUV") return ["Ertiga", "Carens", "Xylo"];
    if (formData.category === "Innovacrysta") return ["Innova Crysta"];
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
    const sType = targetService || "OUTSTATION";

    setFormData({
      id: null,
      category: initialCategory,
      modelName: initialModel,
      seatingCapacity: initialSeats,
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
      driverBattaDay: "",
      driverBattaNight: "",

      vendorWeekdayDayRate: "",
      vendorWeekdayNightRate: "",
      vendorWeekendDayRate: "",
      vendorWeekendNightRate: "",
      vendorBaseFare: "",
      vendorDriverBattaDay: "",
      vendorDriverBattaNight: "",

      airportCustomerFare: "",
      airportVendorFare: "",
      airportCustomerWeekendFare: "",
      airportVendorWeekendFare: "",
      airportIncludedKm: "",
      airportExtraKmRate: "",
      airportVendorExtraKmRate: "",
      tollIncluded: false,
    });
    setIsModalOpen(true);
  }

  function handleSwitchServiceInForm(newService) {
    setFormData((prev) => ({
      ...prev,
      serviceType: newService,
    }));
  }

  function handleStartEdit(item) {
    setEditingItem(item);
    const isSeasonal = Boolean(item.seasonal || item.tariffType === "SEASONAL");
    const sType = item.serviceType || "OUTSTATION";

    setFormData({
      id: item.id,
      category: item.category || "Sedan",
      modelName: item.modelName || "",
      seatingCapacity: item.seatingCapacity || "4",
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
      weekdayNightRate: item.weekdayNightRate != null ? String(item.weekdayNightRate) : "",
      weekendDayRate: item.weekendDayRate != null ? String(item.weekendDayRate) : "",
      weekendNightRate: item.weekendNightRate != null ? String(item.weekendNightRate) : "",
      baseFare: item.baseFare != null ? String(item.baseFare) : "",
      baseIncludedKm: item.baseIncludedKm != null ? String(item.baseIncludedKm) : "",
      driverBattaDay: item.driverBattaDay != null ? String(item.driverBattaDay) : "",
      driverBattaNight: item.driverBattaNight != null ? String(item.driverBattaNight) : "",

      vendorWeekdayDayRate: item.vendorWeekdayDayRate != null ? String(item.vendorWeekdayDayRate) : "",
      vendorWeekdayNightRate: item.vendorWeekdayNightRate != null ? String(item.vendorWeekdayNightRate) : "",
      vendorWeekendDayRate: item.vendorWeekendDayRate != null ? String(item.vendorWeekendDayRate) : "",
      vendorWeekendNightRate: item.vendorWeekendNightRate != null ? String(item.vendorWeekendNightRate) : "",
      vendorBaseFare: item.vendorBaseFare != null ? String(item.vendorBaseFare) : "",
      vendorDriverBattaDay: item.vendorDriverBattaDay != null ? String(item.vendorDriverBattaDay) : "",
      vendorDriverBattaNight: item.vendorDriverBattaNight != null ? String(item.vendorDriverBattaNight) : "",

      airportCustomerFare: item.airportCustomerFare != null ? String(item.airportCustomerFare) : "",
      airportVendorFare: item.airportVendorFare != null ? String(item.airportVendorFare) : "",
      airportCustomerWeekendFare: item.airportCustomerWeekendFare != null ? String(item.airportCustomerWeekendFare) : "",
      airportVendorWeekendFare: item.airportVendorWeekendFare != null ? String(item.airportVendorWeekendFare) : "",
      airportIncludedKm: item.airportIncludedKm != null ? String(item.airportIncludedKm) : "",
      airportExtraKmRate: item.airportExtraKmRate != null ? String(item.airportExtraKmRate) : "",
      airportVendorExtraKmRate: item.airportVendorExtraKmRate != null ? String(item.airportVendorExtraKmRate) : "",
      tollIncluded: Boolean(item.tollIncluded),
    });
    setIsModalOpen(true);
  }

  async function handleSaveTariff(e) {
    e.preventDefault();
    if (!formData.category || !formData.modelName || !formData.seatingCapacity) {
      setToast({ type: "error", message: "Please choose Category, Model, and Seater" });
      return;
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

      await adminApi.saveTariff({
        ...formData,
        state: formData.state || "Tamil Nadu",
        city: resolvedCity || "Theni",
        serviceType: formData.serviceType || "OUTSTATION",
        weekdayDayRate: parseFloat(formData.weekdayDayRate || 0),
        weekdayNightRate: parseFloat(formData.weekdayNightRate || 0),
        weekendDayRate: parseFloat(formData.weekendDayRate || 0),
        weekendNightRate: parseFloat(formData.weekendNightRate || 0),
        baseFare: parseFloat(formData.baseFare || 0),
        baseIncludedKm: parseInt(formData.baseIncludedKm || (formData.serviceType === "LOCAL" ? 80 : formData.serviceType === "AIRPORT" ? 40 : 250), 10),
        driverBattaDay: parseFloat(formData.driverBattaDay || 0),
        driverBattaNight: parseFloat(formData.driverBattaNight || 0),

        vendorWeekdayDayRate: parseFloat(formData.vendorWeekdayDayRate || 0),
        vendorWeekdayNightRate: parseFloat(formData.vendorWeekdayNightRate || 0),
        vendorWeekendDayRate: parseFloat(formData.vendorWeekendDayRate || 0),
        vendorWeekendNightRate: parseFloat(formData.vendorWeekendNightRate || 0),
        vendorBaseFare: parseFloat(formData.vendorBaseFare || 0),
        vendorDriverBattaDay: parseFloat(formData.vendorDriverBattaDay || 0),
        vendorDriverBattaNight: parseFloat(formData.vendorDriverBattaNight || 0),

        airportCustomerFare: parseFloat(formData.baseFare || formData.airportCustomerFare || 0),
        airportVendorFare: parseFloat(formData.vendorBaseFare || formData.airportVendorFare || 0),
        airportCustomerWeekendFare: parseFloat(formData.baseFare || formData.airportCustomerWeekendFare || 0),
        airportVendorWeekendFare: parseFloat(formData.vendorBaseFare || formData.airportVendorWeekendFare || 0),
        airportIncludedKm: parseInt(formData.baseIncludedKm || 40, 10),
        airportExtraKmRate: parseFloat(formData.weekdayDayRate || 0),
        airportVendorExtraKmRate: parseFloat(formData.vendorWeekdayDayRate || 0),
        tollIncluded: Boolean(formData.tollIncluded),
      });

      setToast({
        type: "success",
        message: editingItem
          ? `Tariff for ${formData.modelName} (${formData.serviceType}) updated successfully`
          : `Tariff rules for ${formData.modelName} (${formData.serviceType}) saved successfully`,
      });
      setIsModalOpen(false);
      refreshData();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Failed to save tariff rule" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Are you sure you want to delete tariff for ${item.modelName} (${item.serviceType || 'OUTSTATION'})?`)) {
      return;
    }
    try {
      await adminApi.deleteTariff(item.id);
      setToast({ type: "success", message: "Tariff deleted successfully" });
      refreshData();
    } catch (err) {
      setToast({ type: "error", message: "Failed to delete tariff" });
    }
  }

  async function runSimulation() {
    setSimLoading(true);
    try {
      const res = await adminApi.calculateRate({
        category: simCategory,
        model: simModel,
        seatingCapacity: "4",
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

  // Filtered Tariffs
  const filteredTariffs = useMemo(() => {
    return tariffs.filter((t) => {
      const sType = t.serviceType || "OUTSTATION";
      const matchService = serviceFilter === "ALL" || sType.toUpperCase() === serviceFilter.toUpperCase();

      const isSeasonal = Boolean(t.seasonal || t.tariffType === "SEASONAL");
      const matchType =
        activeTab === "ALL" ||
        (activeTab === "STANDARD" && !isSeasonal) ||
        (activeTab === "SEASONAL" && isSeasonal);

      const matchState = stateFilter === "ALL" || (t.state && t.state.toLowerCase() === stateFilter.toLowerCase());

      const matchSearch =
        !search.trim() ||
        t.category?.toLowerCase().includes(search.toLowerCase()) ||
        t.modelName?.toLowerCase().includes(search.toLowerCase()) ||
        t.seasonName?.toLowerCase().includes(search.toLowerCase()) ||
        t.city?.toLowerCase().includes(search.toLowerCase()) ||
        t.state?.toLowerCase().includes(search.toLowerCase());

      return matchService && matchType && matchState && matchSearch;
    });
  }, [tariffs, serviceFilter, activeTab, stateFilter, search]);

  // Live modal margin computation helper
  const modalMarginInfo = useMemo(() => {
    const custRate = parseFloat(formData.weekdayDayRate || 0);
    const vendRate = parseFloat(formData.vendorWeekdayDayRate || 0);
    const margin = custRate > 0 ? ((custRate - vendRate) / custRate) * 100 : 0;
    const minKm = parseInt(formData.baseIncludedKm || (formData.serviceType === "LOCAL" ? 80 : formData.serviceType === "AIRPORT" ? 40 : 250), 10);
    const custSample = custRate * minKm;
    const vendSample = vendRate * minKm;
    return {
      unit: "/ KM",
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
          subtitle="Configure rates individually for Outstation, Local, and Airport with separate Customer selling fares and Vendor payouts"
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
          { id: "OUTSTATION", label: "Outstation", icon: Car, count: tariffs.filter(t => (t.serviceType || "OUTSTATION").toUpperCase() === "OUTSTATION").length, desc: "Inter-city Per-KM Pricing" },
          { id: "LOCAL", label: "Local", icon: MapPin, count: tariffs.filter(t => t.serviceType?.toUpperCase() === "LOCAL").length, desc: "City Limits Per-KM Pricing" },
          { id: "AIRPORT", label: "Airport Transfer", icon: Plane, count: tariffs.filter(t => t.serviceType?.toUpperCase() === "AIRPORT").length, desc: "Pickup & Drop Flat Transfers" },
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
              Test fare calculation across Outstation, Local, and Airport. Verifies Customer selling price and Vendor payout.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full lg:w-auto">
            {/* Service Type */}
            <select
              value={simService}
              onChange={(e) => setSimService(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-blue-950/70 border border-blue-800 text-white focus:outline-none"
            >
              <option value="OUTSTATION" className="bg-slate-900">🚗 Outstation</option>
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
              {CATEGORIES.map((c) => (
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
            <div className="flex items-center gap-3">
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

      {/* FILTER TABS & SEARCH */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 w-full md:w-auto">
          {[
            { id: "ALL", label: `All Rules (${tariffs.length})` },
            { id: "STANDARD", label: `Standard (${tariffs.filter((t) => !t.seasonal).length})` },
            { id: "SEASONAL", label: `✨ Seasonal (${tariffs.filter((t) => t.seasonal).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* State Filter */}
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="ALL">All States</option>
            {Object.keys(STATES_AND_CITIES).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Model, City, State..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* TARIFF TABLE */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingAnimation message="Loading pricing matrix..." />
        </div>
      ) : filteredTariffs.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 border border-dashed border-slate-300">
          <IndianRupee className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No tariff rules found for current filter</p>
          <p className="text-xs text-slate-400 mt-1">
            Click &quot;+ Standard Tariff&quot; to configure pricing for Outstation, Local, or Airport.
          </p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden border border-slate-200 shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle & Model</TableHead>
                <TableHead>Territory (State / City)</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Tariff Type</TableHead>
                <TableHead className="text-center">Weekday Rates (Cust / Vend)</TableHead>
                <TableHead className="text-center">Weekend Rates (Cust / Vend)</TableHead>
                <TableHead className="text-center">Base Min Fare</TableHead>
                <TableHead className="text-center">Platform Margin</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTariffs.map((t) => {
                const sType = (t.serviceType || "OUTSTATION").toUpperCase();
                
                let custWd = `₹${parseFloat(t.weekdayDayRate || 0).toFixed(1)}/km`;
                let vendWd = `₹${parseFloat(t.vendorWeekdayDayRate || (t.weekdayDayRate * 0.75) || 0).toFixed(1)}/km`;
                let custWe = `₹${parseFloat(t.weekendDayRate || 0).toFixed(1)}/km`;
                let vendWe = `₹${parseFloat(t.vendorWeekendDayRate || (t.weekendDayRate * 0.75) || 0).toFixed(1)}/km`;
                let baseDisplay = `₹${parseFloat(t.baseFare || 0).toLocaleString("en-IN")}`;
                let defaultKm = sType === "LOCAL" ? 80 : sType === "AIRPORT" ? 40 : 250;
                let vendBaseDisplay = `₹${parseFloat(t.vendorBaseFare || (t.baseFare * 0.75) || 0).toLocaleString("en-IN")} (${t.baseIncludedKm || defaultKm}km)`;
                const c = parseFloat(t.weekdayDayRate || 1);
                const v = parseFloat(t.vendorWeekdayDayRate || (t.weekdayDayRate * 0.75) || 0.75);
                let marginPct = c > 0 ? ((c - v) / c) * 100 : 0;

                return (
                  <TableRow key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Category / Model */}
                    <TableCell>
                      <div className="font-bold text-slate-900 text-sm">{t.modelName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="primary" size="sm">
                          {t.category}
                        </Badge>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {t.seatingCapacity} Seater
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
                        sType === "OUTSTATION"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : sType === "LOCAL"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}>
                        {sType === "OUTSTATION" && <Car className="w-3 h-3" />}
                        {sType === "LOCAL" && <MapPin className="w-3 h-3" />}
                        {sType === "AIRPORT" && <Plane className="w-3 h-3" />}
                        {sType === "OUTSTATION" ? "Outstation" : sType === "LOCAL" ? "Local" : "Airport"}
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
                      </div>
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
        </Card>
      )}

      {/* CREATE / EDIT TARIFF MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingItem
            ? `Edit Tariff: ${formData.modelName} (${formData.serviceType === "LOCAL" ? "Local" : formData.serviceType === "AIRPORT" ? "Airport" : "Outstation"})`
            : "Set Vehicle Tariff & Pricing Rules"
        }
        size="lg"
      >
        <form onSubmit={handleSaveTariff} className="space-y-4">
          
          {/* STEP 1: CHOOSE VEHICLE */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-600" />
              Step 1: Choose Vehicle
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                    setFormData((prev) => ({
                      ...prev,
                      category: cat,
                      modelName: firstModel,
                      seatingCapacity: seat,
                    }));
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map((c) => (
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, modelName: e.target.value }))}
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
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SEATING_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* STEP 2: OPERATIONAL TERRITORY (STATE & CITY) */}
          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              Step 2: Operational Territory (State & City)
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

          {/* STEP 3: CHOOSE SERVICE TYPE */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Step 3: Choose Service Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SERVICE_TYPES.map((st) => {
                const Icon = st.icon;
                const isSelected = formData.serviceType === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSwitchServiceInForm(st.id)}
                    className={`py-2 px-3 rounded-xl border-2 text-center transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-xs font-black">{st.label}</span>
                    </div>
                    <span className="text-[10px] opacity-75 block mt-0.5">{st.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 4: TARIFF TYPE (STANDARD vs SEASONAL) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Step 4: Tariff Duration
            </label>
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

          {/* STEP 5: RATE INPUTS (CUSTOMER VS VENDOR) */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                Step 5: Set Price for Customer & Vendor ({formData.serviceType === "LOCAL" ? "Local" : formData.serviceType === "AIRPORT" ? "Airport" : "Outstation"})
              </h4>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Customer (Selling) vs Vendor (Payout)
              </span>
            </div>

            {/* RATE FORM (OUTSTATION, LOCAL & AIRPORT ALL USE PER-KM STRUCTURE) */}
            {(formData.serviceType === "OUTSTATION" || formData.serviceType === "LOCAL" || formData.serviceType === "AIRPORT") && (
              <div className="space-y-3">
                {/* Weekday Rates */}
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between border-b border-blue-200/60 pb-1">
                    <span className="text-xs font-black text-blue-900">
                      🏢 Weekday Rates (Mon – Fri)
                    </span>
                    <span className="text-[10px] text-blue-700 font-bold uppercase">
                      {formData.serviceType === "LOCAL" ? "Local City Rate" : formData.serviceType === "AIRPORT" ? "Airport Transfer Rate" : "Outstation Rate"}
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
                      {formData.serviceType === "LOCAL" ? "Local Weekend" : formData.serviceType === "AIRPORT" ? "Airport Weekend" : "Outstation Weekend"}
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

                {/* Base Fares & Allowance */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      Customer Base (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.baseFare}
                      onChange={(e) => setFormData((prev) => ({ ...prev, baseFare: e.target.value }))}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      Vendor Base (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.vendorBaseFare}
                      onChange={(e) => setFormData((prev) => ({ ...prev, vendorBaseFare: e.target.value }))}
                      className="w-full px-2 py-1 text-xs border border-emerald-200 rounded-md bg-emerald-50/40 font-bold text-emerald-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      Included Min KM
                    </label>
                    <input
                      type="number"
                      value={formData.baseIncludedKm}
                      onChange={(e) => setFormData((prev) => ({ ...prev, baseIncludedKm: e.target.value }))}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white"
                    />
                  </div>
                  {/* Driver Batta commented out for now
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      Driver Batta (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.driverBattaDay}
                      onChange={(e) => setFormData((prev) => ({ ...prev, driverBattaDay: e.target.value }))}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white"
                    />
                  </div>
                  */}
                </div>
              </div>
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
    </div>
  );
}
