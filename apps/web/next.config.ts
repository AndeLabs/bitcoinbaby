import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  // Service worker source file location
  swSrc: "src/app/sw.ts",
  // Output location for the compiled service worker
  swDest: "public/sw.js",
  // Disable PWA in development to avoid caching issues
  disable: process.env.NODE_ENV === "development",
  // Reload page when coming back online (false to prevent data loss)
  reloadOnOnline: false,
  // Enable caching on navigation (next/link)
  cacheOnNavigation: true,
});

const nextConfig: NextConfig = {
  // Enable WebAssembly support (required for bitcoinjs-lib / tiny-secp256k1)
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    return config;
  },
  // Security headers for PWA
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
