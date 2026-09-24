import "./globals.css";
import AppShell from "@/components/layout/AppShell";

export const metadata = {
  title: "Grab Rentals | Chauffeur & Intercity",
  description: "India's premier intercity and local car rental service.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className="antialiased overflow-x-hidden max-w-[100vw]">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
