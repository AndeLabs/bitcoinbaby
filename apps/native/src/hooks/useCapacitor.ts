"use client";

/**
 * useCapacitor Hook
 *
 * Provides access to Capacitor native features with graceful fallbacks.
 */

import { useCallback, useEffect, useState } from "react";

interface CapacitorState {
  isNative: boolean;
  platform: "ios" | "android" | "web";
  isReady: boolean;
}

interface CapacitorActions {
  /** Trigger haptic feedback */
  haptic: (type?: "light" | "medium" | "heavy") => Promise<void>;
  /** Show/hide keyboard */
  hideKeyboard: () => Promise<void>;
  /** Set status bar style */
  setStatusBarStyle: (style: "light" | "dark") => Promise<void>;
  /** Get device info */
  getDeviceInfo: () => Promise<{
    model: string;
    platform: string;
    osVersion: string;
  } | null>;
}

type UseCapacitorReturn = CapacitorState & CapacitorActions;

export function useCapacitor(): UseCapacitorReturn {
  const [state, setState] = useState<CapacitorState>({
    isNative: false,
    platform: "web",
    isReady: false,
  });

  useEffect(() => {
    async function init() {
      try {
        const { Capacitor } = await import("@capacitor/core");

        setState({
          isNative: Capacitor.isNativePlatform(),
          platform: Capacitor.getPlatform() as "ios" | "android" | "web",
          isReady: true,
        });
      } catch {
        setState((prev) => ({ ...prev, isReady: true }));
      }
    }

    init();
  }, []);

  const haptic = useCallback(
    async (type: "light" | "medium" | "heavy" = "medium") => {
      if (!state.isNative) return;

      try {
        const { Haptics, ImpactStyle } = await import("@capacitor/haptics");

        const styleMap = {
          light: ImpactStyle.Light,
          medium: ImpactStyle.Medium,
          heavy: ImpactStyle.Heavy,
        };

        await Haptics.impact({ style: styleMap[type] });
      } catch {
        // Haptics not available
      }
    },
    [state.isNative],
  );

  const hideKeyboard = useCallback(async () => {
    if (!state.isNative) return;

    try {
      const { Keyboard } = await import("@capacitor/keyboard");
      await Keyboard.hide();
    } catch {
      // Keyboard not available
    }
  }, [state.isNative]);

  const setStatusBarStyle = useCallback(
    async (style: "light" | "dark") => {
      if (!state.isNative) return;

      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({
          style: style === "dark" ? Style.Dark : Style.Light,
        });
      } catch {
        // StatusBar not available
      }
    },
    [state.isNative],
  );

  const getDeviceInfo = useCallback(async () => {
    try {
      const { Capacitor } = await import("@capacitor/core");

      return {
        model: "Unknown",
        platform: Capacitor.getPlatform(),
        osVersion: "Unknown",
      };
    } catch {
      return null;
    }
  }, []);

  return {
    ...state,
    haptic,
    hideKeyboard,
    setStatusBarStyle,
    getDeviceInfo,
  };
}

export default useCapacitor;
