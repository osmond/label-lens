import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "Label Lens — AI Ingredient Decoder",
  description: "Decode food labels and detect hidden allergens with AI",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Label Lens",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased min-h-screen bg-slate-50">
        <ServiceWorkerRegistrar />
        {/* Top nav — hidden on mobile */}
        <Nav />
        <main className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-8">{children}</main>
        {/* Bottom nav — only on mobile */}
        <BottomNav />
      </body>
    </html>
  );
}
