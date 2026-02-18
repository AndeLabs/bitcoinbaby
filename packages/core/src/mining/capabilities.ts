/**
 * Device Capabilities Detection
 *
 * Detects device capabilities for optimal mining configuration.
 */

import type { DeviceCapabilities, NavigatorExtended } from "./types";

/**
 * Get navigator with extended types (safe cast)
 * Combines standard Navigator with non-standard extensions
 */
export function getNavigator(): (Navigator & NavigatorExtended) | null {
  if (typeof navigator === "undefined") return null;
  return navigator as Navigator & NavigatorExtended;
}

/**
 * Detect WebGPU support
 */
export async function detectWebGPU(): Promise<boolean> {
  const nav = getNavigator();
  if (!nav) return false;

  try {
    const gpu = nav.gpu;
    if (!gpu) return false;

    const adapter = await gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}

/**
 * Detect WebGL support and get GPU info
 */
export function detectWebGL(): {
  supported: boolean;
  vendor?: string;
  renderer?: string;
} {
  if (typeof document === "undefined") {
    return { supported: false };
  }

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    if (!gl) {
      return { supported: false };
    }

    const debugInfo = (gl as WebGLRenderingContext).getExtension(
      "WEBGL_debug_renderer_info",
    );
    if (debugInfo) {
      return {
        supported: true,
        vendor: (gl as WebGLRenderingContext).getParameter(
          debugInfo.UNMASKED_VENDOR_WEBGL,
        ),
        renderer: (gl as WebGLRenderingContext).getParameter(
          debugInfo.UNMASKED_RENDERER_WEBGL,
        ),
      };
    }

    return { supported: true };
  } catch {
    return { supported: false };
  }
}

/**
 * Detect Web Worker support
 */
export function detectWorkers(): boolean {
  return typeof Worker !== "undefined";
}

/**
 * Get number of CPU cores
 */
export function getCPUCores(): number {
  if (typeof navigator !== "undefined" && navigator.hardwareConcurrency) {
    return navigator.hardwareConcurrency;
  }
  return 4; // Default fallback
}

/**
 * Get device memory (if available)
 */
export function getDeviceMemory(): number | undefined {
  const nav = getNavigator();
  if (nav?.deviceMemory) {
    return nav.deviceMemory * 1024; // Convert GB to MB
  }
  return undefined;
}

/**
 * Check if device is on battery
 */
export async function isOnBattery(): Promise<boolean> {
  const nav = getNavigator();
  if (!nav) return false;

  try {
    const battery = await nav.getBattery?.();
    if (battery) {
      return !battery.charging;
    }
  } catch {
    // Battery API not available
  }

  return false;
}

/**
 * Check if page is visible
 */
export function isPageVisible(): boolean {
  if (typeof document === "undefined") return true;
  return document.visibilityState === "visible";
}

/**
 * Detect all device capabilities
 */
export async function detectCapabilities(): Promise<DeviceCapabilities> {
  const [webgpu, webgl] = await Promise.all([
    detectWebGPU(),
    Promise.resolve(detectWebGL()),
  ]);

  return {
    webgpu,
    webgl: webgl.supported,
    workers: detectWorkers(),
    cores: getCPUCores(),
    memory: getDeviceMemory(),
    gpu: webgl.supported
      ? {
          vendor: webgl.vendor || "unknown",
          renderer: webgl.renderer || "unknown",
        }
      : undefined,
  };
}

/**
 * Get recommended mining configuration based on device
 */
export async function getRecommendedConfig(): Promise<{
  useWebGPU: boolean;
  workerCount: number;
  throttle: number;
}> {
  const caps = await detectCapabilities();
  const onBattery = await isOnBattery();

  // Determine worker count (leave 1-2 cores free for UI)
  const workerCount = Math.max(1, caps.cores - 2);

  // Determine throttle based on power status
  const throttle = onBattery ? 50 : 100;

  return {
    useWebGPU: caps.webgpu,
    workerCount,
    throttle,
  };
}
