import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata = {
  metadataBase: new URL("https://grabrentals.in"),
  title: "Grab Rentals | Cab Rental Service | Outstation Roundtrips | Oneway Drops | Hourly Cab Rentals | Airport Transfers",
  description:
    "GrabRentals is a vehicle rental service focused on making personal, family, business, and group travel convenient through chauffeur-driven transportation solutions. The brand caters to outstation journeys, Hourly Cab Rentals, airport transfers, corporate transportation, and group travel requirements varies from Hatchback, Sedan, SUV, Urbania, Tempo Traveller, Bus,etc.",
  applicationName: "Grab Rentals",
  keywords: [
    "Grab Rentals",
    "Cab Rental Service",
    "Outstation Roundtrips",
    "Oneway Drops",
    "Hourly Cab Rentals",
    "Airport Transfers",
    "Car Rental",
    "Tempo Traveller",
    "Urbania",
    "Bus Rental",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Grab Rentals | Cab Rental Service | Outstation Roundtrips | Oneway Drops | Hourly Cab Rentals | Airport Transfers",
    description:
      "GrabRentals is a vehicle rental service focused on making personal, family, business, and group travel convenient through chauffeur-driven transportation solutions. The brand caters to outstation journeys, Hourly Cab Rentals, airport transfers, corporate transportation, and group travel requirements varies from Hatchback, Sedan, SUV, Urbania, Tempo Traveller, Bus,etc.",
    url: "https://grabrentals.in",
    siteName: "Grab Rentals",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/brand-logo.png",
        width: 607,
        height: 378,
        alt: "Grab Rentals Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grab Rentals | Cab Rental Service | Outstation Roundtrips | Oneway Drops | Hourly Cab Rentals | Airport Transfers",
    description:
      "GrabRentals is a vehicle rental service focused on making personal, family, business, and group travel convenient through chauffeur-driven transportation solutions. The brand caters to outstation journeys, Hourly Cab Rentals, airport transfers, corporate transportation, and group travel requirements varies from Hatchback, Sedan, SUV, Urbania, Tempo Traveller, Bus,etc.",
    images: ["/images/brand-logo.png"],
  },
  manifest: "/manifest.json",
  other: {
    "facebook-domain-verification": "g56khqjzb5fgm0q6a1k8h8z0ck35m6",
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Grab Rentals",
    alternateName: ["GrabRentals", "Grab Rentals India"],
    url: "https://grabrentals.in",
  };

  return (
    <html lang="en" className="overflow-x-clip" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased overflow-x-clip max-w-[100vw]" suppressHydrationWarning>
        <LanguageProvider>
          <AppShell>
            {children}
          </AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
