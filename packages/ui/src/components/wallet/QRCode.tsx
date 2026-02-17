"use client";

/**
 * QRCode Component
 *
 * Real QR code generator with pixel art styling for Bitcoin addresses.
 * Uses qrcode.react library for reliable QR code generation.
 *
 * Features:
 * - Generates real, scannable QR codes
 * - Pixel art border styling
 * - Dark/light mode support via fgColor/bgColor
 * - Error handling with fallback display
 * - Configurable size and error correction level
 */

import { QRCodeSVG } from "qrcode.react";

export interface QRCodeProps {
  /** The data to encode (Bitcoin address, etc.) */
  data: string;
  /** Size of the QR code in pixels (default: 180) */
  size?: number;
  /** Foreground color (default: #000000) */
  fgColor?: string;
  /** Background color (default: #ffffff) */
  bgColor?: string;
  /** Error correction level: L (7%), M (15%), Q (25%), H (30%) */
  level?: "L" | "M" | "Q" | "H";
  /** Whether to include a margin inside the QR code */
  includeMargin?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Show address preview below QR code */
  showAddressPreview?: boolean;
  /** Number of characters to show in address preview (default: 20) */
  previewLength?: number;
}

/**
 * Pixel Art QR Code component for BitcoinBaby wallet
 */
export function QRCode({
  data,
  size = 180,
  fgColor = "#000000",
  bgColor = "#ffffff",
  level = "M",
  includeMargin = true,
  className = "",
  showAddressPreview = true,
  previewLength = 20,
}: QRCodeProps) {
  // Handle missing data - show placeholder
  if (!data) {
    return (
      <div
        className={`mx-auto ${className}`}
        style={{ width: size + 32, height: size + 32 }}
      >
        <div
          className="bg-white p-4 border-4 border-black shadow-[4px_4px_0_0_#000]"
          style={{ width: size + 32, height: size + 32 }}
        >
          <div className="w-full h-full flex items-center justify-center bg-pixel-bg-light border-2 border-dashed border-pixel-border">
            <span className="font-pixel text-[8px] text-pixel-error text-center px-2">
              NO DATA
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto ${className}`}>
      {/* Pixel art container with border */}
      <div
        className="bg-white p-4 border-4 border-black shadow-[4px_4px_0_0_#000] relative"
        style={{ width: size + 32 }}
      >
        {/* Pixel corner decorations */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-black" />
        <div className="absolute top-0 right-0 w-2 h-2 bg-black" />
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-black" />
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-black" />

        {/* QR Code */}
        <div className="flex justify-center">
          <QRCodeSVG
            value={data}
            size={size}
            fgColor={fgColor}
            bgColor={bgColor}
            level={level}
            includeMargin={includeMargin}
            style={{
              imageRendering: "pixelated",
            }}
          />
        </div>

        {/* Address preview */}
        {showAddressPreview && data && (
          <p className="font-pixel text-[6px] text-gray-600 mt-3 text-center break-all px-1">
            {data.length > previewLength
              ? `${data.substring(0, previewLength)}...`
              : data}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * QR Code with dark theme for dark backgrounds
 */
export function QRCodeDark(props: Omit<QRCodeProps, "fgColor" | "bgColor">) {
  return <QRCode {...props} fgColor="#f7931a" bgColor="#1a1a2e" />;
}

/**
 * QR Code variant with Bitcoin orange accent
 */
export function QRCodeBitcoin(props: Omit<QRCodeProps, "fgColor">) {
  return <QRCode {...props} fgColor="#f7931a" />;
}

export default QRCode;
