import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// Detect if building for native (Capacitor)
const isNativeBuild = process.env.BUILD_TARGET === "native";

const withSerwist = withSerwistInit({
  // Service worker source file location
  swSrc: "src/app/sw.ts",
  // Output location for the compiled service worker
  swDest: "public/sw.js",
  // Disable PWA in development AND in native builds (Capacitor handles this)
  disable: process.env.NODE_ENV === "development" || isNativeBuild,
  // Reload page when coming back online (false to prevent data loss)
  reloadOnOnline: false,
  // Enable caching on navigation (next/link)
  cacheOnNavigation: true,
});

const nextConfig: NextConfig = {
  // Turbopack only for dev and SSR (not static export)
  ...(isNativeBuild ? {} : { turbopack: {} }),

  // Static export ONLY for Capacitor builds
  ...(isNativeBuild ? { output: "export" } : {}),

  // Images unoptimized for static export
  images: {
    unoptimized: isNativeBuild,
  },

  // Trailing slash required for Capacitor file:// routing
  ...(isNativeBuild ? { trailingSlash: true } : {}),

  // Transpile monorepo packages
  transpilePackages: [
    "@bitcoinbaby/ui",
    "@bitcoinbaby/core",
    "@bitcoinbaby/bitcoin",
    "@bitcoinbaby/ai",
  ],

  // Enable WebAssembly support (required for bitcoinjs-lib / tiny-secp256k1)
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    return config;
  },

  // Security headers (only for SSR, not static export)
  ...(isNativeBuild
    ? {}
    : {
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
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
                {
                  key: "Content-Security-Policy",
                  value: [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                    "font-src 'self' https://fonts.gstatic.com",
                    "img-src 'self' data: blob:",
                    "connect-src 'self' https://mempool.space https://scrolls.charms.dev wss://mempool.space",
                    "worker-src 'self' blob:",
                    "frame-ancestors 'none'",
                  ].join("; "),
                },
                {
                  key: "Permissions-Policy",
                  value: "camera=(), microphone=(), geolocation=()",
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
      }),
};

// PWA wrapper only for web builds
export default isNativeBuild ? nextConfig : withSerwist(nextConfig);
