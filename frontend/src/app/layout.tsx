import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Grab Rentals | Chauffeur & Intercity",
  description: "India's premier intercity and local car rental service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
