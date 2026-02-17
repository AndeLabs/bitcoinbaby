"use client";

/**
 * RootProvider for Native App
 *
 * Handles Zustand store hydration and Capacitor plugin initialization.
 */

import { useEffect, useState, type ReactNode } from "react";

interface RootProviderProps {
  children: ReactNode;
}

/**
 * RootProvider Component
 */
export function RootProvider({ children }: RootProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCapacitorReady, setIsCapacitorReady] = useState(false);

  // Hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Capacitor initialization
  useEffect(() => {
    async function initCapacitor() {
      try {
        // Check if running in Capacitor
        const { Capacitor } = await import("@capacitor/core");

        if (Capacitor.isNativePlatform()) {
          // Initialize native plugins
          const { SplashScreen } = await import("@capacitor/splash-screen");
          const { StatusBar, Style } = await import("@capacitor/status-bar");

          // Configure status bar
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: "#0f0f1b" });

          // Hide splash screen after app is ready
          setTimeout(async () => {
            await SplashScreen.hide();
          }, 500);
        }

        setIsCapacitorReady(true);
      } catch (error) {
        // Not running in Capacitor (web browser)
        console.log("Running in web browser mode");
        setIsCapacitorReady(true);
      }
    }

    initCapacitor();
  }, []);

  // Loading state
  if (!isHydrated || !isCapacitorReady) {
    return (
      <div className="min-h-screen bg-pixel-bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pixel-float">&#128118;</div>
          <div className="font-pixel text-pixel-primary text-xs animate-pulse">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default RootProvider;
