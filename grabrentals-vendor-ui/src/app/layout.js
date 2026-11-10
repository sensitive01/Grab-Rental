import "./globals.css";
import Script from "next/script";
import { LanguageProvider } from "@/context/LanguageContext";
import LanguageLoadingOverlay from "@/components/ui/LanguageLoadingOverlay";

export const metadata = {
  title: "Grab Rentals",
  description: "Enterprise Vehicle Rental & Booking Management System for Vendors, Operations, and Administrators",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Grab Vendor",
  },
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
};

export const viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-50" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Grab Vendor" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* DOM Reconciliation Patch for React 19 Google Translate Mutations */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof Node === 'function' && Node.prototype && !window.__dom_translate_patched) {
                window.__dom_translate_patched = true;
                var origRemoveChild = Node.prototype.removeChild;
                Node.prototype.removeChild = function(child) {
                  if (child.parentNode !== this) {
                    if (child.parentNode) {
                      return child.parentNode.removeChild(child);
                    }
                    return child;
                  }
                  return origRemoveChild.apply(this, arguments);
                };
                var origInsertBefore = Node.prototype.insertBefore;
                Node.prototype.insertBefore = function(newNode, refNode) {
                  if (refNode && refNode.parentNode !== this) {
                    if (refNode.parentNode) {
                      return refNode.parentNode.insertBefore(newNode, refNode);
                    }
                    return newNode;
                  }
                  return origInsertBefore.apply(this, arguments);
                };
              }
            `,
          }}
        />

        {/* Anti-FOUC Language Preloader Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var m = document.cookie.match(/(^| )googtrans=([^;]+)/);
                  if (m && m[2] && m[2] !== '/en/en' && m[2] !== 'en') {
                    document.documentElement.classList.add('lang-preloading');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased text-slate-900 bg-slate-50" suppressHydrationWarning>
        {/* Hidden Google Translate Mount Container */}
        <div id="google_translate_element" style={{ display: "none" }} />

        {/* Google Translate Callback & Script */}
        <Script
          id="google-translate-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.googleTranslateElementInit = function() {
                if (window.google && window.google.translate) {
                  new window.google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'en,kn,hi,ta,te,ml',
                    autoDisplay: false
                  }, 'google_translate_element');
                }
              };
            `,
          }}
        />
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />

        <LanguageProvider>
          <LanguageLoadingOverlay />
          {children}
        </LanguageProvider>

        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function(err) {
                  console.debug('ServiceWorker registration omitted:', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
