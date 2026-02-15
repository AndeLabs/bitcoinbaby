import type { Metadata, Viewport } from "next";
import "./globals.css";

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
      <body className="min-h-screen bg-pixel-bg-dark text-pixel-text antialiased">
        {/* Scanline overlay for CRT effect */}
        <div className="pointer-events-none fixed inset-0 z-50 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1),rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)] opacity-30" />

        {children}
      </body>
    </html>
  );
}
