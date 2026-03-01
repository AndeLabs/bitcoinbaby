import type { Metadata, Viewport } from "next";
import { Press_Start_2P, Pixelify_Sans, VT323 } from "next/font/google";
import "./globals.css";
import { RootProvider } from "@/providers";

// Pixel Art Fonts - optimized loading via next/font
const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pixel",
  preload: true,
});

const pixelifySans = Pixelify_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pixel-body",
  preload: true,
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-vt323",
  preload: true,
});

export const metadata: Metadata = {
  title: "BitcoinBaby | Mine Bitcoin While Your Baby Evolves",
  description:
    "Raise your AI-powered pixel baby that grows with Bitcoin mining. Built on BitcoinOS with Charms Protocol.",
  keywords: [
    "bitcoin",
    "mining",
    "nft",
    "ai",
    "tamagotchi",
    "pixel art",
    "web3",
  ],
  authors: [{ name: "BitcoinBaby Team" }],
  // PWA configuration
  applicationName: "BitcoinBaby",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BitcoinBaby",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "BitcoinBaby",
    description: "Mine Bitcoin. Raise Your Baby. Watch It Evolve.",
    type: "website",
    siteName: "BitcoinBaby",
  },
  twitter: {
    card: "summary_large_image",
    title: "BitcoinBaby",
    description: "Mine Bitcoin. Raise Your Baby. Watch It Evolve.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f0f1b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pressStart2P.variable} ${pixelifySans.variable} ${vt323.variable}`}
    >
      <head>
        {/* PWA Icons */}
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/icon-152x152.svg"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/icon-192x192.svg"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/icons/icon-192x192.svg"
        />
        {/* Apple splash screens would go here */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-pixel-bg-dark text-pixel-text antialiased">
        {/* CRT scanline effect - subtle overlay for retro feel */}
        {/* Uses reduced opacity for readability, only visible on larger screens */}
        <div
          className="pointer-events-none fixed inset-0 z-50 hidden md:block"
          aria-hidden="true"
          style={{
            background:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 3px)",
            mixBlendMode: "multiply",
          }}
        />
        {/* Subtle vignette for depth */}
        <div
          className="pointer-events-none fixed inset-0 z-40 hidden lg:block"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.15) 100%)",
          }}
        />

        <RootProvider>
          {/* Main content with safe areas */}
          <div className="safe-top">{children}</div>
        </RootProvider>
      </body>
    </html>
  );
}
