import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Capacitor
  output: "export",

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Trailing slashes for proper routing in Capacitor
  trailingSlash: true,

  // Base path (empty for Capacitor)
  basePath: "",

  // Transpile workspace packages
  transpilePackages: [
    "@bitcoinbaby/ui",
    "@bitcoinbaby/core",
    "@bitcoinbaby/bitcoin",
  ],
};

export default nextConfig;
