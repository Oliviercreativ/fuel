import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Footer } from "@/components/footer";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "FuelTrack — Suivi carburant",
  description: "Suivi de consommation carburant et prix en temps réel",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FuelTrack",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "theme-color": "#E8520A",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <PwaRegister />
        {children}
        <Footer />
      </body>
    </html>
  );
}
