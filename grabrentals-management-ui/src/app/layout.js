import "./globals.css";

export const metadata = {
  title: "Grab Rentals | Operations & Admin Management System",
  description: "Enterprise operations dispatch and administrative command center for Car, Van, and Bus fleet rentals.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className="min-h-full flex flex-col text-slate-900 bg-slate-50 selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
