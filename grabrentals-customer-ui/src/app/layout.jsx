import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata = {
  title: "Grab Rentals | Chauffeur & Intercity",
  description: "India's premier intercity and local car rental service.",
  other: {
    "facebook-domain-verification": "g56khqjzb5fgm0q6a1k8h8z0ck35m6",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className="antialiased overflow-x-hidden max-w-[100vw]">
        <LanguageProvider>
          <AppShell>
            {children}
          </AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
