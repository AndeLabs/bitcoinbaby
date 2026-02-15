import type { Metadata, Viewport } from "next";
import "./globals.css";

// Pixel Art Fonts
const fontUrl = "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Pixelify+Sans:wght@400;500;600;700&family=VT323&display=swap";

export const metadata: Metadata = {
  title: "BitcoinBaby | Mine Bitcoin While Your Baby Evolves",
  description: "Raise your AI-powered pixel baby that grows with Bitcoin mining. Built on BitcoinOS with Charms Protocol.",
  keywords: ["bitcoin", "mining", "nft", "ai", "tamagotchi", "pixel art", "web3"],
  authors: [{ name: "BitcoinBaby Team" }],
  openGraph: {
    title: "BitcoinBaby",
    description: "Mine Bitcoin. Raise Your Baby. Watch It Evolve.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f0f1b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontUrl} rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-pixel-bg-dark text-pixel-text antialiased">
        {/* Scanline overlay for CRT effect */}
        <div className="pointer-events-none fixed inset-0 z-50 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1),rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)] opacity-30" />

        {children}
      </body>
    </html>
  );
}
