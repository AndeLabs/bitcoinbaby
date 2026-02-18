/**
 * PixelIcon - 8-bit style icons for game UI
 *
 * Replaces emojis with consistent pixel art icons.
 * All icons are 16x16 grid, scalable SVGs.
 */

import { type FC, type ReactNode, type CSSProperties } from "react";
import { clsx } from "clsx";

export type IconName =
  | "bolt" // Energy ⚡
  | "heart" // Health ❤️
  | "food" // Hunger 🍖
  | "happy" // Happiness 😊
  | "pickaxe" // Mining ⛏️
  | "gamepad" // Play 🎮
  | "book" // Learn 📚
  | "sun" // Wake ☀️
  | "moon" // Sleep 😴
  | "warning" // Alert ⚠️
  | "clock" // Timer ⏰
  | "star" // Star ⭐
  | "diamond" // Rare 💎
  | "skull" // Death 💀
  | "sparkle" // Effect ✨
  | "coin"; // Token 🪙

interface PixelIconProps {
  name: IconName;
  size?: number;
  className?: string;
  animate?: boolean;
  style?: CSSProperties;
}

/**
 * SVG pixel art icons - 16x16 grid
 */
const ICONS: Record<IconName, ReactNode> = {
  bolt: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M9 0h2v2h2v2h-2v2h-2v2H7v2H5v2H3v2H1v2h2v-2h2v-2h2V8h2V6h2V4H9z" />
    </svg>
  ),

  heart: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 4h2V2h4v2h2V2h4v2h2v4h-2v2h-2v2h-2v2H8v2H6v-2H4v-2H2v-2H0V4h2z" />
    </svg>
  ),

  food: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M6 2h4v2h2v2h2v4h-2v4H4v-4H2V6h2V4h2zm0 4v2h4V6z" />
    </svg>
  ),

  happy: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 0h8v2h2v2h2v8h-2v2h-2v2H4v-2H2v-2H0V4h2V2h2zm2 6v2h2V6zm4 0v2h2V6zM4 10v2h2v2h4v-2h2v-2z" />
    </svg>
  ),

  pickaxe: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M10 0h4v2h2v4h-2V4h-2v2h-2v2H8v2H6v2H4v2H2v2H0v-2h2v-2h2v-2h2V8h2V6h2V4h2V2h-2z" />
    </svg>
  ),

  gamepad: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 4h12v2h2v6h-2v2H2v-2H0V6h2zm3 4H3v2h2zm2-2h2v4H7zm4 2h2v2h-2z" />
    </svg>
  ),

  book: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 2h12v2h2v10h-2v2H2v-2H0V4h2zm2 2v10h10V4zm2 2h6v2H6zm0 4h6v2H6z" />
    </svg>
  ),

  sun: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M7 0h2v2H7zm4 2h2v2h-2zm2 4h2v2h-2zM5 2H3v2h2zm-4 4H1v2H1zM3 12h2v2H3zm8 0h2v2h-2zM7 14h2v2H7zM5 5h6v2h2v4h-2v2H5v-2H3V7h2z" />
    </svg>
  ),

  moon: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M6 2h2v2h2v2h2v4h-2v2H8v2H4v-2H2V8h2V4h2zm0 2v4h2v2h2V8H8V4z" />
    </svg>
  ),

  warning: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M6 2h4v2h2v4h2v4h2v4H0v-4h2V8h2V4h2zm1 4v4h2V6zm0 6v2h2v-2z" />
    </svg>
  ),

  clock: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 0h8v2h2v2h2v8h-2v2h-2v2H4v-2H2v-2H0V4h2V2h2zm0 4v8h8V4zm3 1h2v3h2v2H7z" />
    </svg>
  ),

  star: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M7 0h2v4h4v2h-2v2h2v2h-2v4h-2v-2H7v2H5v-4H3v-2h2V6H3V4h4z" />
    </svg>
  ),

  diamond: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2h8v2h2v2h2v4h-2v2h-2v2H4v-2H2v-2H0V6h2V4h2z" />
    </svg>
  ),

  skull: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2h8v2h2v8h-2v2h-2v2H6v-2H4v-2H2V4h2zm0 4v4h2v-2h4v2h2V6h-2V4H6v2z" />
    </svg>
  ),

  sparkle: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M7 0h2v3H7zM3 3h2v2H3zm8 0h2v2h-2zM7 5h2v2H7zM0 7h3v2H0zm5 0h2v2H5zm4 0h2v2H9zm4 0h3v2h-3zM7 9h2v2H7zm-4 2h2v2H3zm8 0h2v2h-2zM7 13h2v3H7z" />
    </svg>
  ),

  coin: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2h8v2h2v8h-2v2H4v-2H2V4h2zm2 2v2h4V4zm0 6h4v2H6z" />
    </svg>
  ),
};

export const PixelIcon: FC<PixelIconProps> = ({
  name,
  size = 16,
  className,
  animate = false,
  style,
}) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center",
        animate && "animate-pulse",
        className,
      )}
      style={{ width: size, height: size, ...style }}
    >
      {ICONS[name]}
    </span>
  );
};

/**
 * Mapping from semantic names to icon names
 */
export const STAT_ICONS: Record<string, IconName> = {
  energy: "bolt",
  health: "heart",
  hunger: "food",
  happiness: "happy",
};

export const ACTION_ICONS: Record<string, IconName> = {
  feed: "food",
  play: "gamepad",
  learn: "book",
  mine: "pickaxe",
  sleep: "moon",
  wake: "sun",
};

export default PixelIcon;
