// Test sending WhatsApp Invoice Template via Pinbot API
const https = require('https');
const fs = require('fs');
const path = require('path');

// Read env for apikey
let apiKey = '7b261e83-c94a-11f1-afb3-02c8a5e042bd';
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/WHATSAPP_API_KEY=([^\r\n]+)/);
    if (match) apiKey = match[1].trim();
  }
} catch (e) {}

const payload = {
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to: "919345004690",
  type: "template",
  template: {
    name: "invoice",
    language: {
      code: "en"
    },
    components: [
      {
        type: "header",
        parameters: [
          {
            type: "document",
            document: {
              link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              filename: "GrabRentals_Invoice.pdf"
            }
          }
        ]
      },
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: "Ramesh Kumar"
          },
          {
            type: "text",
            text: "Mysore to Bangalore"
          },
          {
            type: "text",
            text: "4500"
          }
        ]
      }
    ]
  }
};

const data = JSON.stringify(payload);

const options = {
  hostname: 'partnersv1.pinbot.ai',
  port: 443,
  path: '/v3/1356346880903273/messages',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': apiKey,
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('Dispatching WhatsApp invoice message to: 917760693359...');
console.log('Endpoint: https://partnersv1.pinbot.ai/v3/1356346880903273/messages');
console.log('API Key:', apiKey ? (apiKey.slice(0, 8) + '...') : 'NONE');

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  res.on('end', () => {
    console.log(`\nResponse Status Code: ${res.statusCode}`);
    console.log(`Response Body: ${responseData}`);
  });
});

req.on('error', (error) => {
  console.error('\nRequest Error:', error);
});

req.write(data);
req.end();
