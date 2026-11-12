/**
 * Grab Rentals - WeFormSolution SMS OTP (GET API) Tester
 *
 * Usage:
 *   node test-sms-get.js 9345004690
 *   node test-sms-get.js 9345004690 123456
 */

const https = require("https");

const API_KEY = process.env.SMS_API_KEY || "sYAcUA9UFjzDFnm1qgEiD6uamY3XJf3mSSIzdPuU3_s";
const SENDER_ID = process.env.SMS_SENDER_ID || "GBRNTL";
const TEMPLATE_ID = process.env.SMS_TEMPLATE_ID || "1777179377548103665";
const BASE_URL = "https://portal.weformsolution.com/sms/api/send-campaign";

const cleanDigits = (process.argv[2] || "9345004690").replace(/[^0-9]/g, "");
const tenDigitPhone = cleanDigits.slice(-10);
const targetNumber = `91${tenDigitPhone}`;
const otp = process.argv[3] || Math.floor(100000 + Math.random() * 900000).toString();

if (tenDigitPhone.length !== 10) {
  console.error("Invalid 10-digit mobile number:", process.argv[2]);
  process.exit(1);
}

const messageText = `Hi, Welcome to GranRentals, The best cab rental service platform in India. Your One Time Password for Login is ${otp} For more details, log onto www.grabrentals.in`;

const query = [
  `api_key=${encodeURIComponent(API_KEY)}`,
  `sender_id=${encodeURIComponent(SENDER_ID)}`,
  `template_id=${encodeURIComponent(TEMPLATE_ID)}`,
  `dcs=0`,
  `priority=0`,
  `number=${encodeURIComponent(targetNumber)}`,
  `message=${encodeURIComponent(messageText)}`,
  `campaign_name=${encodeURIComponent("API TEST")}`,
].join("&");

const url = `${BASE_URL}?${query}`;

console.log("==========================================================");
console.log("     Grab Rentals - WeFormSolution SMS OTP (GET API)      ");
console.log("==========================================================");
console.log(`Target Number: ${targetNumber}`);
console.log(`Generated OTP: ${otp}`);
console.log(`Sender ID    : ${SENDER_ID}`);
console.log(`Template ID  : ${TEMPLATE_ID}`);
console.log(`Message Text : "${messageText}"\n`);
console.log("Dispatching GET request...");

const startTime = Date.now();
https.get(url, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    const elapsed = Date.now() - startTime;
    console.log("\n----------------- GATEWAY RESPONSE -----------------");
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      console.log("----------------------------------------------------");
      console.log(`HTTP Status  : ${res.statusCode} (${elapsed} ms)`);

      if (parsed.code === "000") {
        console.log(`\n[SUCCESS] Message submitted with Job ID: ${parsed.jobId}`);
        console.log(`Check handset (${tenDigitPhone}) for SMS from ${SENDER_ID} with OTP: ${otp}`);
      } else {
        console.log(`\n[WARNING] Gateway returned: ${data}`);
      }
    } catch {
      console.log(data);
      console.log(`HTTP Status: ${res.statusCode} (${elapsed} ms)`);
    }
    console.log("==========================================================\n");
  });
}).on("error", (err) => {
  console.error(`[FAILED] Request error: ${err.message}`);
});
