import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/providers";
import { IOSInstallPrompt } from "@/components/shared/IOSInstallPrompt";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CleanOnes Next level cleaning service",
  description: "Cleaning workforce management on one platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CleanOnes Next level cleaning service",
  },
  icons: {
    icon: [
      { url: "/fav.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/fav.svg",
    apple: "/fav.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} antialiased h-full`}
    >
      <body className="min-h-full bg-slate-100 text-slate-800">
        <Providers>
          {children}
          <IOSInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
