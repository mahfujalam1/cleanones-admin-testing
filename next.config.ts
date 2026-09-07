import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const targetApi = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://18.198.109.196:8080").replace(/\/$/, "");

const nextConfig: NextConfig = {
  turbopack: {},
  allowedDevOrigins: ["10.10.28.193"],
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${targetApi}/:path*`,
      },
    ];
  },
};

export default withPWA(nextConfig);
