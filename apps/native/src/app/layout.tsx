import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RootProvider } from "@/providers";

// Pixel Art Fonts
const fontUrl =
  "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Pixelify+Sans:wght@400;500;600;700&family=VT323&display=swap";

export const metadata: Metadata = {
  title: "BitcoinBaby",
  description: "Mine Bitcoin. Raise Your Baby. Watch It Evolve.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BitcoinBaby",
  },
  formatDetection: {
    telephone: false,
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href={fontUrl} rel="stylesheet" />
        {/* Capacitor viewport meta */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body className="min-h-screen bg-pixel-bg-dark text-pixel-text antialiased">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
