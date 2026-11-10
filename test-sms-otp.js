/**
 * Grab Rentals - WeFormSolution SMS OTP Tester
 *
 * Usage:
 *   node test-sms-otp.js 9345004690
 *   node test-sms-otp.js 9790416823 123456
 */

const https = require("https");
const readline = require("readline");

const API_URL = "https://portal.weformsolution.com/sms/api/send-campaign";
const API_KEY = "sYAcUA9UFjzDFnm1qgEiD6uamY3XJf3mSSIzdPuU3_s";
const SENDER_ID = "GRABRE";
const TEMPLATE_ID = "1777179377548103665";

function cleanPhone(raw) {
  if (!raw) return "";
  const digits = raw.replace(/[^0-9]/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSms(phone, otp) {
  const targetPhone = cleanPhone(phone);
  if (targetPhone.length !== 10) {
    console.error(`\x1b[31m[ERROR] Invalid 10-digit phone number: "${phone}"\x1b[0m`);
    process.exit(1);
  }

  const messageText = `Hi, Welcome to GranRentals, The best cab rental service platform in India. Your One Time Password for Login is ${otp} For more details, log onto www.grabrentals.in`;

  console.log("\x1b[36m==========================================================\x1b[0m");
  console.log("\x1b[36m     Grab Rentals - WeFormSolution SMS OTP Tester         \x1b[0m");
  console.log("\x1b[36m==========================================================\x1b[0m");
  console.log(`Target Phone : \x1b[33m${targetPhone}\x1b[0m`);
  console.log(`Generated OTP: \x1b[32m${otp}\x1b[0m`);
  console.log(`Sender ID    : \x1b[33m${SENDER_ID}\x1b[0m`);
  console.log(`Template ID  : \x1b[33m${TEMPLATE_ID}\x1b[0m`);
  console.log(`Message Text : \x1b[90m"${messageText}"\x1b[0m`);
  console.log("\nSending SMS request to WeFormSolution gateway...");

  const payload = JSON.stringify({
    campaign_name: "API TEST",
    sender_id: SENDER_ID,
    template_id: TEMPLATE_ID,
    dcs: 0,
    messages: [
      {
        mobile: targetPhone,
        message: messageText,
      },
    ],
  });

  const url = new URL(API_URL);
  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  const startTime = Date.now();
  const req = https.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      const elapsed = Date.now() - startTime;
      console.log("\n\x1b[32m----------------- GATEWAY RESPONSE -----------------\x1b[0m");
      try {
        const parsed = JSON.parse(data);
        console.log(JSON.stringify(parsed, null, 2));
        console.log("\x1b[32m----------------------------------------------------\x1b[0m");
        console.log(`HTTP Status  : ${res.statusCode} (${elapsed} ms)`);

        if (parsed.code === "000") {
          console.log(`\n\x1b[32m[SUCCESS] Message submitted to gateway with Job ID: ${parsed.jobId}\x1b[0m`);
          console.log(`\x1b[33mCheck handset (${targetPhone}) for SMS with OTP: ${otp}\x1b[0m`);
          console.log("\x1b[33mNote: If not received within 30s, check Spam & Blocked folder in Messages app.\x1b[0m");
        } else {
          console.log(`\n\x1b[33m[WARNING] Gateway returned: ${data}\x1b[0m`);
        }
      } catch {
        console.log(data);
        console.log(`HTTP Status: ${res.statusCode} (${elapsed} ms)`);
      }
      console.log("\x1b[36m==========================================================\x1b[0m\n");
    });
  });

  req.on("error", (err) => {
    console.error(`\x1b[31m[FAILED] Request error: ${err.message}\x1b[0m`);
  });

  req.write(payload);
  req.end();
}

const args = process.argv.slice(2);
const phoneArg = args[0];
const otpArg = args[1] || generateOtp();

if (!phoneArg) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question("Enter recipient 10-digit mobile number: ", (ans) => {
    rl.close();
    sendSms(ans.trim(), otpArg);
  });
} else {
  sendSms(phoneArg, otpArg);
}

