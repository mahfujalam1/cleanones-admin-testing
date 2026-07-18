import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/providers";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CleanOnes Dashboard",
  description: "Cleaning workforce management on one platform",
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
        </Providers>
      </body>
    </html>
  );
}
