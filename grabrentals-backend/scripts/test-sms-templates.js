/**
 * Grab Rentals - WeFormSolution DLT SMS Templates Test Script
 *
 * Usage:
 *   node test-sms-templates.js [phone] [template_number 1-5 or all]
 *
 * Examples:
 *   node test-sms-templates.js 917760693359 all
 *   node test-sms-templates.js 917760693359 1   (Billing OTP)
 *   node test-sms-templates.js 917760693359 2   (Login OTP)
 *   node test-sms-templates.js 917760693359 3   (Trip Start OTP)
 *   node test-sms-templates.js 917760693359 4   (Booking Completion)
 *   node test-sms-templates.js 917760693359 5   (Booking Confirmation)
 */

const https = require("https");
const path = require("path");
const fs = require("fs");

// Attempt to load .env.local or .env from backend root if dotenv is available or manual parse
function loadEnv() {
  const envFiles = [
    path.join(__dirname, "..", ".env.local"),
    path.join(__dirname, "..", ".env")
  ];
  for (const f of envFiles) {
    if (fs.existsSync(f)) {
      const content = fs.readFileSync(f, "utf8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const idx = trimmed.indexOf("=");
          const k = trimmed.substring(0, idx).trim();
          const v = trimmed.substring(idx + 1).trim();
          if (!process.env[k]) process.env[k] = v;
        }
      });
    }
  }
}
loadEnv();

const API_KEY = process.env.SMS_API_KEY || "sYAcUA9UFjzDFnm1qgEiD6uamY3XJf3mSSIzdPuU3_s";
const SENDER_ID = process.env.SMS_SENDER_ID || "GRABRE";
const BASE_URL = process.env.SMS_API_URL || "https://portal.weformsolution.com/sms/api/send-campaign";

const inputPhone = process.argv[2] || "7760693359";
const targetSelection = (process.argv[3] || "all").toLowerCase();

const cleanDigits = inputPhone.replace(/[^0-9]/g, "");
const tenDigit = cleanDigits.slice(-10);
const targetNumber = `91${tenDigit}`;

if (tenDigit.length !== 10) {
  console.error("❌ Invalid 10-digit mobile number:", inputPhone);
  process.exit(1);
}

const templates = [
  {
    num: 1,
    name: "Billing OTP",
    templateId: process.env.SMS_TEMPLATE_BILLING_OTP_ID || "1777179499541921245",
    campaign: process.env.SMS_CAMPAIGN_BILLING_OTP || "Billing OTP",
    message: (name = "Dilip", km = 25825, otp = 582548) =>
      `Dear ${name}, Kindly check the closing km ${km} in the vehicle odometer before sharing this Billing OTP. Your OTP to complete the trip is ${otp} Thank you for your business, Team Grab Rentals India.`
  },
  {
    num: 2,
    name: "Login OTP (API TEST)",
    templateId: process.env.SMS_TEMPLATE_ID || "1777179377548103665",
    campaign: process.env.SMS_CAMPAIGN_NAME || "API TEST",
    message: (otp = Math.floor(100000 + Math.random() * 900000)) =>
      `Hi, Welcome to GranRentals, The best cab rental service platform in India. Your One Time Password for Login is ${otp} For more details, log onto www.grabrentals.in`
  },
  {
    num: 3,
    name: "Trip Start OTP",
    templateId: process.env.SMS_TEMPLATE_TRIP_START_ID || "1777179499849482015",
    campaign: process.env.SMS_CAMPAIGN_TRIP_START || "Trip Start OTP",
    message: (name = "Dilip", cab = "ka01aa0611", service = "outstation", to = "mysore", km = 525856, otp = 854856) =>
      `Dear ${name} Your cab ${cab} for the ${service} to ${to} is arrived with meter reading as ${km} Check the opening km in the cab odometer and share the OTP ${otp} to start your trip. Happy Journey, Team Grab Rentals India`
  },
  {
    num: 4,
    name: "Booking Completion",
    templateId: process.env.SMS_TEMPLATE_COMPLETION_ID || "1777179499870166237",
    campaign: process.env.SMS_CAMPAIGN_COMPLETION || "Booking Completion",
    message: (name = "Dilip", ref = "GR1001", service = "Outstation", to = "Mysore", amount = 25500) =>
      `Dear ${name} Your booking ${ref} for the ${service} to ${to} is completed successfully. Your total amount for the trip is ${amount} See you Soon! Team Grab Rentals India`
  },
  {
    num: 5,
    name: "Booking Confirmation",
    templateId: process.env.SMS_TEMPLATE_CONFIRMATION_ID || "1777179500140963463",
    campaign: process.env.SMS_CAMPAIGN_CONFIRMATION || "Booking Confirmation",
    message: (name = "Dilip", ref = "GR1001", service = "Outstation", to = "Mysore") =>
      `Dear ${name} Your booking ${ref} for the ${service} to ${to} is confirmed. Cab details and driver details will be shared shortly. Regards, Team Grab Rentals India`
  }
];

function sendSms(tmpl) {
  return new Promise((resolve) => {
    const msg = tmpl.message();
    const query = [
      `api_key=${encodeURIComponent(API_KEY)}`,
      `sender_id=${encodeURIComponent(SENDER_ID)}`,
      `template_id=${encodeURIComponent(tmpl.templateId)}`,
      `dcs=0`,
      `priority=0`,
      `number=${encodeURIComponent(targetNumber)}`,
      `message=${encodeURIComponent(msg)}`,
      `campaign_name=${encodeURIComponent(tmpl.campaign)}`
    ].join("&");

    const url = `${BASE_URL}?${query}`;

    console.log(`\n============================================================`);
    console.log(`[${tmpl.num}/5] Testing: ${tmpl.name}`);
    console.log(`------------------------------------------------------------`);
    console.log(`Sender ID   : ${SENDER_ID}`);
    console.log(`Template ID : ${tmpl.templateId}`);
    console.log(`Campaign    : ${tmpl.campaign}`);
    console.log(`Recipient   : ${targetNumber}`);
    console.log(`Message     : "${msg}"`);
    console.log(`Sending GET request...`);

    const t0 = Date.now();
    https
      .get(url, (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          const ms = Date.now() - t0;
          console.log(`Status      : ${res.statusCode} (${ms}ms)`);
          try {
            const json = JSON.parse(body);
            console.log(`Response    :`, JSON.stringify(json, null, 2));
            if (json.code === "000" || json.status === "success") {
              console.log(`Result      : ✅ SUCCESS (Job ID: ${json.jobId || "OK"})`);
            } else {
              console.log(`Result      : ⚠️ Gateway returned non-000 code (${json.code})`);
            }
          } catch {
            console.log(`Response    : ${body}`);
          }
          resolve();
        });
      })
      .on("error", (err) => {
        console.error(`Result      : ❌ Request error: ${err.message}`);
        resolve();
      });
  });
}

async function run() {
  console.log("============================================================");
  console.log("     Grab Rentals - WeFormSolution SMS DLT Tester");
  console.log("============================================================");
  console.log(`Target Phone: ${targetNumber} (${tenDigit})`);
  console.log(`Sender ID   : ${SENDER_ID}`);

  let selected = templates;
  if (targetSelection !== "all") {
    const num = parseInt(targetSelection, 10);
    selected = templates.filter((t) => t.num === num);
    if (selected.length === 0) {
      console.error(`Invalid template choice: '${targetSelection}'. Enter 1, 2, 3, 4, 5, or 'all'.`);
      process.exit(1);
    }
  }

  for (const t of selected) {
    await sendSms(t);
  }

  console.log("\n============================================================");
  console.log("All selected tests completed! Check your handset for SMS.");
  console.log("============================================================\n");
}

run();
