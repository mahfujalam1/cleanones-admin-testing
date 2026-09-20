import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import { API_PREFIX } from "./src/utils/baseUrl";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  reloadOnOnline: false,
});


const backendUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
const targetUrl = (() => {
  try {
    return backendUrl ? new URL(backendUrl) : null;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  turbopack: {},
  experimental: {
    staleTimes: { dynamic: 30, static: 180 },
  },
  async rewrites() {
    if (!backendUrl) return [];
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${backendUrl}${API_PREFIX}/:path*`,
      },
      {
        source: "/socket.io/:path*",
        destination: `${backendUrl}/socket.io/:path*`,
      },
    ];
  },
  allowedDevOrigins: ["10.10.28.194", "10.10.28.195", "cleanones.vercel.app", "https://cleanones-admin-testing.vercel.app"],
  images: {
    remotePatterns: [
      ...(targetUrl
        ? [
          {
            protocol: (targetUrl.protocol.replace(":", "") || "http") as "http" | "https",
            hostname: targetUrl.hostname,
            port: targetUrl.port || undefined,
            pathname: "/**",
          },
        ]
        : []),
      { protocol: "https", hostname: "cleanones-bucket.s3.eu-central-1.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "*.s3.eu-central-1.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "*.amazonaws.com", pathname: "/**" },
    ],
  },
};

export default withPWA(nextConfig);
