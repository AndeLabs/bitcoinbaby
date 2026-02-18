"use client";

/**
 * usePlatform Hook
 *
 * Detects the current platform and provides useful information
 * for conditional rendering and platform-specific behavior.
 */

import { useState, useEffect } from "react";

export type Platform = "ios" | "android" | "web" | "pwa";

export interface PlatformInfo {
  /** Current platform */
  platform: Platform;
  /** Running inside Capacitor native app */
  isNative: boolean;
  /** Running as installed PWA */
  isPWA: boolean;
  /** Running on mobile device (native or mobile browser) */
  isMobile: boolean;
  /** Capacitor is available */
  isCapacitor: boolean;
  /** Platform detection is complete */
  isReady: boolean;
  /** Safe area insets for notch/home indicator */
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export function usePlatform(): PlatformInfo {
  const [info, setInfo] = useState<PlatformInfo>({
    platform: "web",
    isNative: false,
    isPWA: false,
    isMobile: false,
    isCapacitor: false,
    isReady: false,
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  useEffect(() => {
    async function detect() {
      let platform: Platform = "web";
      let isNative = false;
      let isCapacitor = false;

      // Detect Capacitor
      try {
        const { Capacitor } = await import("@capacitor/core");
        isCapacitor = true;
        isNative = Capacitor.isNativePlatform();
        if (isNative) {
          platform = Capacitor.getPlatform() as "ios" | "android";
        }
      } catch {
        // Capacitor not available
      }

      // Detect PWA (installed web app)
      const isPWA =
        !isNative &&
        (window.matchMedia("(display-mode: standalone)").matches ||
          // @ts-expect-error - Safari specific
          window.navigator.standalone === true);

      if (isPWA) platform = "pwa";

      // Detect mobile browser
      const isMobile =
        isNative ||
        isPWA ||
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
        (window.innerWidth <= 768 && "ontouchstart" in window);

      // Get safe area insets from CSS environment variables
      const computedStyle = getComputedStyle(document.documentElement);
      const safeAreaInsets = {
        top: parseInt(
          computedStyle.getPropertyValue("--safe-area-inset-top") || "0",
          10,
        ),
        bottom: parseInt(
          computedStyle.getPropertyValue("--safe-area-inset-bottom") || "0",
          10,
        ),
        left: parseInt(
          computedStyle.getPropertyValue("--safe-area-inset-left") || "0",
          10,
        ),
        right: parseInt(
          computedStyle.getPropertyValue("--safe-area-inset-right") || "0",
          10,
        ),
      };

      setInfo({
        platform,
        isNative,
        isPWA,
        isMobile,
        isCapacitor,
        isReady: true,
        safeAreaInsets,
      });
    }

    detect();
  }, []);

  return info;
}
