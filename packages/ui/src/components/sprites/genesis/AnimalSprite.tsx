/**
 * Animal Baby Sprite - CUTE CREATURE DESIGN
 *
 * Adorable animal babies with big eyes and soft features.
 * Aesthetic: kawaii meets pixel art, natural and playful.
 *
 * Variants:
 * - Kitten: Fluffy cat baby with curious expression
 * - Puppy: Loyal dog baby with floppy ears
 * - Bunny: Soft rabbit with long ears
 * - Fox: Clever fox kit with bushy tail
 * - Bear: Cuddly bear cub with round features
 *
 * Common elements:
 * - Big expressive eyes
 * - Soft fur textures
 * - Natural animal features (ears, tails, paws)
 */

import { type FC } from "react";
import { type BabyState, type ColorPalette, parseDNA } from "./types";

interface AnimalSpriteProps {
  size?: number;
  state?: BabyState;
  dna?: string;
  colors?: Partial<ColorPalette>;
  className?: string;
}

type AnimalVariant = "kitten" | "puppy" | "bunny" | "fox" | "bear";

// Fur colors - natural animal tones
const FUR_COLORS = [
  { base: "#f5deb3", shadow: "#d4c4a3", highlight: "#fff8e7" }, // Cream
  { base: "#d4a574", shadow: "#b48554", highlight: "#e8c4a0" }, // Golden
  { base: "#8b6443", shadow: "#6b4423", highlight: "#a67c52" }, // Brown
  { base: "#4a4a4a", shadow: "#2a2a2a", highlight: "#6a6a6a" }, // Gray
  { base: "#1a1a1a", shadow: "#0a0a0a", highlight: "#3a3a3a" }, // Black
  { base: "#ff9966", shadow: "#dd7744", highlight: "#ffbb88" }, // Orange
  { base: "#ffffff", shadow: "#e0e0e0", highlight: "#ffffff" }, // White
  { base: "#c4956a", shadow: "#a47550", highlight: "#d4b58a" }, // Tan
];

// Eye colors
const EYE_COLORS = [
  "#1f2937", // Dark
  "#3b82f6", // Blue
  "#22c55e", // Green
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
];

// Nose colors
const NOSE_COLORS = [
  "#1a1a1a", // Black
  "#8b6443", // Brown
  "#ff9999", // Pink
];

interface VariantColors {
  fur: { base: string; shadow: string; highlight: string };
  eyes: string;
  nose: string;
  innerEar: string;
}

const getVariantColors = (dna: string): VariantColors => {
  const furIdx = parseInt(dna[0] || "0", 16) % FUR_COLORS.length;
  const eyeIdx = parseInt(dna[1] || "0", 16) % EYE_COLORS.length;
  const noseIdx = parseInt(dna[2] || "0", 16) % NOSE_COLORS.length;

  return {
    fur: FUR_COLORS[furIdx],
    eyes: EYE_COLORS[eyeIdx],
    nose: NOSE_COLORS[noseIdx],
    innerEar: "#ffcccc", // Soft pink inner ear
  };
};

const getVariant = (dna: string): AnimalVariant => {
  const variants: AnimalVariant[] = ["kitten", "puppy", "bunny", "fox", "bear"];
  return variants[parseInt(dna[3] || "0", 16) % 5];
};

export const AnimalSprite: FC<AnimalSpriteProps> = ({
  size = 64,
  state = "idle",
  dna = "0000000000000000",
  className = "",
}) => {
  const colors = getVariantColors(dna);
  const variant = getVariant(dna);
  const { fur, eyes, nose, innerEar } = colors;

  const stateClasses: Record<BabyState, string> = {
    idle: "animate-[float_3s_ease-in-out_infinite]",
    happy: "animate-bounce",
    sleeping: "",
    hungry: "animate-[shake_0.5s_ease-in-out_infinite]",
    mining: "animate-pulse",
    learning: "",
    evolving: "animate-spin",
    thriving: "animate-pulse",
    struggling: "animate-[shake_1s_ease-in-out_infinite]",
  };

  // Render Kitten variant
  const renderKitten = () => (
    <>
      {/* ===== BODY ===== */}
      <ellipse cx="16" cy="22" rx="7" ry="6" fill={fur.base} />
      <ellipse
        cx="16"
        cy="22"
        rx="5"
        ry="4"
        fill={fur.highlight}
        opacity="0.3"
      />

      {/* ===== HEAD ===== */}
      <circle cx="16" cy="12" r="8" fill={fur.base} />
      <circle cx="16" cy="13" r="6" fill={fur.highlight} opacity="0.2" />

      {/* ===== EARS (triangular cat ears) ===== */}
      <polygon points="6,8 9,4 12,10" fill={fur.base} />
      <polygon points="7,8 9,5 11,9" fill={innerEar} />
      <polygon points="20,10 23,4 26,8" fill={fur.base} />
      <polygon points="21,9 23,5 25,8" fill={innerEar} />

      {/* ===== EYES (big cat eyes) ===== */}
      <ellipse cx="12" cy="11" rx="2.5" ry="2" fill="#ffffff" />
      <ellipse cx="20" cy="11" rx="2.5" ry="2" fill="#ffffff" />
      <ellipse cx="12" cy="11" rx="1.5" ry="1.5" fill={eyes} />
      <ellipse cx="20" cy="11" rx="1.5" ry="1.5" fill={eyes} />
      {/* Eye highlights */}
      <circle cx="11" cy="10" r="0.6" fill="#ffffff" />
      <circle cx="19" cy="10" r="0.6" fill="#ffffff" />

      {/* ===== NOSE ===== */}
      <polygon points="15,14 17,14 16,15.5" fill={nose} />

      {/* ===== MOUTH ===== */}
      <path
        d="M14 16 Q16 17 18 16"
        fill="none"
        stroke={fur.shadow}
        strokeWidth="0.5"
      />

      {/* ===== WHISKERS ===== */}
      <line
        x1="8"
        y1="14"
        x2="4"
        y2="13"
        stroke={fur.shadow}
        strokeWidth="0.3"
      />
      <line
        x1="8"
        y1="15"
        x2="4"
        y2="15"
        stroke={fur.shadow}
        strokeWidth="0.3"
      />
      <line
        x1="24"
        y1="14"
        x2="28"
        y2="13"
        stroke={fur.shadow}
        strokeWidth="0.3"
      />
      <line
        x1="24"
        y1="15"
        x2="28"
        y2="15"
        stroke={fur.shadow}
        strokeWidth="0.3"
      />

      {/* ===== PAWS ===== */}
      <ellipse cx="11" cy="27" rx="2" ry="1.5" fill={fur.shadow} />
      <ellipse cx="21" cy="27" rx="2" ry="1.5" fill={fur.shadow} />

      {/* ===== TAIL ===== */}
      <path
        d="M23 22 Q28 20 26 14"
        fill="none"
        stroke={fur.base}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  );

  // Render Puppy variant
  const renderPuppy = () => (
    <>
      {/* ===== BODY ===== */}
      <ellipse cx="16" cy="22" rx="7" ry="6" fill={fur.base} />

      {/* ===== HEAD ===== */}
      <circle cx="16" cy="12" r="8" fill={fur.base} />

      {/* ===== EARS (floppy dog ears) ===== */}
      <ellipse cx="7" cy="12" rx="3" ry="5" fill={fur.base} />
      <ellipse cx="7" cy="13" rx="2" ry="3" fill={fur.shadow} opacity="0.3" />
      <ellipse cx="25" cy="12" rx="3" ry="5" fill={fur.base} />
      <ellipse cx="25" cy="13" rx="2" ry="3" fill={fur.shadow} opacity="0.3" />

      {/* ===== EYES ===== */}
      <circle cx="12" cy="11" r="2.5" fill="#ffffff" />
      <circle cx="20" cy="11" r="2.5" fill="#ffffff" />
      <circle cx="12" cy="11" r="1.5" fill={eyes} />
      <circle cx="20" cy="11" r="1.5" fill={eyes} />
      <circle cx="11" cy="10" r="0.6" fill="#ffffff" />
      <circle cx="19" cy="10" r="0.6" fill="#ffffff" />

      {/* ===== SNOUT ===== */}
      <ellipse cx="16" cy="15" rx="3" ry="2" fill={fur.highlight} />
      <ellipse cx="16" cy="14" rx="1.5" ry="1" fill={nose} />

      {/* ===== TONGUE ===== */}
      <ellipse cx="16" cy="17" rx="1" ry="1.5" fill="#ff9999" />

      {/* ===== PAWS ===== */}
      <ellipse cx="11" cy="27" rx="2.5" ry="1.5" fill={fur.shadow} />
      <ellipse cx="21" cy="27" rx="2.5" ry="1.5" fill={fur.shadow} />

      {/* ===== TAIL (wagging) ===== */}
      <ellipse cx="25" cy="20" rx="2" ry="3" fill={fur.base} />
    </>
  );

  // Render Bunny variant
  const renderBunny = () => (
    <>
      {/* ===== BODY ===== */}
      <ellipse cx="16" cy="22" rx="6" ry="6" fill={fur.base} />

      {/* ===== HEAD ===== */}
      <circle cx="16" cy="12" r="7" fill={fur.base} />

      {/* ===== EARS (long rabbit ears) ===== */}
      <ellipse cx="11" cy="2" rx="2" ry="6" fill={fur.base} />
      <ellipse cx="11" cy="2" rx="1" ry="4" fill={innerEar} />
      <ellipse cx="21" cy="2" rx="2" ry="6" fill={fur.base} />
      <ellipse cx="21" cy="2" rx="1" ry="4" fill={innerEar} />

      {/* ===== EYES ===== */}
      <circle cx="12" cy="11" r="2" fill="#ffffff" />
      <circle cx="20" cy="11" r="2" fill="#ffffff" />
      <circle cx="12" cy="11" r="1.2" fill={eyes} />
      <circle cx="20" cy="11" r="1.2" fill={eyes} />
      <circle cx="11.5" cy="10.5" r="0.4" fill="#ffffff" />
      <circle cx="19.5" cy="10.5" r="0.4" fill="#ffffff" />

      {/* ===== NOSE ===== */}
      <ellipse cx="16" cy="14" rx="1" ry="0.8" fill={nose} />

      {/* ===== CHEEKS ===== */}
      <circle cx="10" cy="14" r="1.5" fill="#ffcccc" opacity="0.5" />
      <circle cx="22" cy="14" r="1.5" fill="#ffcccc" opacity="0.5" />

      {/* ===== WHISKERS ===== */}
      <line
        x1="10"
        y1="14"
        x2="6"
        y2="13"
        stroke={fur.shadow}
        strokeWidth="0.3"
      />
      <line
        x1="10"
        y1="15"
        x2="6"
        y2="15"
        stroke={fur.shadow}
        strokeWidth="0.3"
      />
      <line
        x1="22"
        y1="14"
        x2="26"
        y2="13"
        stroke={fur.shadow}
        strokeWidth="0.3"
      />
      <line
        x1="22"
        y1="15"
        x2="26"
        y2="15"
        stroke={fur.shadow}
        strokeWidth="0.3"
      />

      {/* ===== FEET ===== */}
      <ellipse cx="12" cy="28" rx="3" ry="1.5" fill={fur.shadow} />
      <ellipse cx="20" cy="28" rx="3" ry="1.5" fill={fur.shadow} />

      {/* ===== TAIL (fluffy ball) ===== */}
      <circle cx="23" cy="24" r="2" fill={fur.highlight} />
    </>
  );

  // Render Fox variant
  const renderFox = () => (
    <>
      {/* ===== BODY ===== */}
      <ellipse cx="16" cy="22" rx="6" ry="5" fill={fur.base} />
      <ellipse cx="16" cy="24" rx="4" ry="2" fill={fur.highlight} />

      {/* ===== HEAD ===== */}
      <circle cx="16" cy="12" r="7" fill={fur.base} />
      {/* White face marking */}
      <path d="M16 8 L12 16 L16 18 L20 16 Z" fill={fur.highlight} />

      {/* ===== EARS (pointed fox ears) ===== */}
      <polygon points="7,10 10,2 13,10" fill={fur.base} />
      <polygon points="8,9 10,4 12,9" fill={fur.shadow} />
      <polygon points="19,10 22,2 25,10" fill={fur.base} />
      <polygon points="20,9 22,4 24,9" fill={fur.shadow} />

      {/* ===== EYES (sly fox eyes) ===== */}
      <ellipse cx="12" cy="11" rx="2" ry="1.5" fill="#ffffff" />
      <ellipse cx="20" cy="11" rx="2" ry="1.5" fill="#ffffff" />
      <ellipse cx="12" cy="11" rx="1.2" ry="1" fill={eyes} />
      <ellipse cx="20" cy="11" rx="1.2" ry="1" fill={eyes} />
      <circle cx="11.5" cy="10.5" r="0.4" fill="#ffffff" />
      <circle cx="19.5" cy="10.5" r="0.4" fill="#ffffff" />

      {/* ===== NOSE ===== */}
      <ellipse cx="16" cy="15" rx="1.5" ry="1" fill={nose} />

      {/* ===== PAWS ===== */}
      <ellipse cx="11" cy="27" rx="2" ry="1.5" fill={fur.shadow} />
      <ellipse cx="21" cy="27" rx="2" ry="1.5" fill={fur.shadow} />

      {/* ===== TAIL (bushy fox tail) ===== */}
      <ellipse cx="26" cy="20" rx="4" ry="3" fill={fur.base} />
      <ellipse cx="28" cy="19" rx="2" ry="1.5" fill={fur.highlight} />
    </>
  );

  // Render Bear variant
  const renderBear = () => (
    <>
      {/* ===== BODY ===== */}
      <ellipse cx="16" cy="22" rx="8" ry="7" fill={fur.base} />

      {/* ===== HEAD ===== */}
      <circle cx="16" cy="11" r="8" fill={fur.base} />

      {/* ===== EARS (round bear ears) ===== */}
      <circle cx="8" cy="6" r="3" fill={fur.base} />
      <circle cx="8" cy="6" r="1.5" fill={fur.shadow} />
      <circle cx="24" cy="6" r="3" fill={fur.base} />
      <circle cx="24" cy="6" r="1.5" fill={fur.shadow} />

      {/* ===== SNOUT ===== */}
      <ellipse cx="16" cy="14" rx="4" ry="3" fill={fur.highlight} />

      {/* ===== EYES ===== */}
      <circle cx="12" cy="10" r="2" fill="#ffffff" />
      <circle cx="20" cy="10" r="2" fill="#ffffff" />
      <circle cx="12" cy="10" r="1.2" fill={eyes} />
      <circle cx="20" cy="10" r="1.2" fill={eyes} />
      <circle cx="11.5" cy="9.5" r="0.4" fill="#ffffff" />
      <circle cx="19.5" cy="9.5" r="0.4" fill="#ffffff" />

      {/* ===== NOSE ===== */}
      <ellipse cx="16" cy="13" rx="2" ry="1.5" fill={nose} />

      {/* ===== MOUTH ===== */}
      <path
        d="M14 15 Q16 17 18 15"
        fill="none"
        stroke={fur.shadow}
        strokeWidth="0.5"
      />

      {/* ===== PAWS ===== */}
      <ellipse cx="10" cy="28" rx="3" ry="2" fill={fur.shadow} />
      <ellipse cx="22" cy="28" rx="3" ry="2" fill={fur.shadow} />
    </>
  );

  // Render based on variant
  const renderVariant = () => {
    switch (variant) {
      case "kitten":
        return renderKitten();
      case "puppy":
        return renderPuppy();
      case "bunny":
        return renderBunny();
      case "fox":
        return renderFox();
      case "bear":
        return renderBear();
      default:
        return renderKitten();
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={`${stateClasses[state]} ${className}`}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Background */}
      <rect width="32" height="32" fill="transparent" />

      {/* Render variant */}
      {renderVariant()}
    </svg>
  );
};

export default AnimalSprite;
