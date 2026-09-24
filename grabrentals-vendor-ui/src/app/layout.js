import "./globals.css";

export const metadata = {
  title: "Grab Rentals | B2B Management Portal",
  description: "Enterprise Vehicle Rental & Booking Management System for Vendors, Operations, and Administrators",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="min-h-full flex flex-col antialiased text-slate-900 bg-slate-50">
        {children}
      </body>
    </html>
  );
}
