/**
 * UI Utilities
 *
 * Common utility functions for UI components.
 * Based on shadcn/ui patterns.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with Tailwind CSS conflict resolution
 *
 * Combines clsx for conditional classes with tailwind-merge
 * to properly handle Tailwind CSS class conflicts.
 *
 * @example
 * cn("px-4 py-2", condition && "bg-red-500", "px-6")
 * // Returns "py-2 px-6 bg-red-500" (px-6 overrides px-4)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
