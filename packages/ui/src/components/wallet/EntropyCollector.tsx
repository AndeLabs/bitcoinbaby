"use client";

/**
 * EntropyCollector - Visual entropy collection from mouse movements
 *
 * Collects mouse movement data to supplement crypto.getRandomValues()
 * for wallet generation. This provides psychological security and
 * additional entropy mixing.
 *
 * Based on best practices from:
 * - Electrum wallet
 * - Keybase more-entropy
 * - BIP39 implementations
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { clsx } from "clsx";

interface EntropyCollectorProps {
  /** Target entropy bits to collect (default: 256) */
  targetBits?: number;
  /** Callback when entropy collection is complete */
  onComplete: (entropy: Uint8Array) => void;
  /** Optional callback to cancel */
  onCancel?: () => void;
  /** Additional CSS classes */
  className?: string;
}

interface MousePoint {
  x: number;
  y: number;
  timestamp: number;
}

/**
 * Estimate bits of entropy from a mouse movement
 * Conservative estimate: ~2 bits per movement with significant delta
 */
function estimateMovementEntropy(
  current: MousePoint,
  previous: MousePoint | null,
): number {
  if (!previous) return 0;

  const dx = Math.abs(current.x - previous.x);
  const dy = Math.abs(current.y - previous.y);
  const dt = current.timestamp - previous.timestamp;

  // Only count movements with reasonable delta
  if (dx < 3 && dy < 3) return 0;
  if (dt < 10) return 0; // Too fast, likely programmatic

  // Conservative estimate: 1-2 bits per movement
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < 10) return 1;
  if (distance < 50) return 1.5;
  return 2;
}

/**
 * Mix entropy sources using SHA-256
 */
async function mixEntropy(
  mouseData: Uint8Array,
  systemEntropy: Uint8Array,
): Promise<Uint8Array> {
  // Combine mouse entropy with system CSPRNG
  const combined = new Uint8Array(mouseData.length + systemEntropy.length);
  combined.set(mouseData);
  combined.set(systemEntropy, mouseData.length);

  // Hash to produce final entropy
  const hashBuffer = await crypto.subtle.digest("SHA-256", combined);
  return new Uint8Array(hashBuffer);
}

export function EntropyCollector({
  targetBits = 256,
  onComplete,
  onCancel,
  className,
}: EntropyCollectorProps) {
  const [collectedBits, setCollectedBits] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [mouseTrail, setMouseTrail] = useState<{ x: number; y: number }[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseDataRef = useRef<number[]>([]);
  const lastPointRef = useRef<MousePoint | null>(null);
  const collectedBitsRef = useRef(0);

  // Handle mouse movement
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isComplete) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const point: MousePoint = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        timestamp: Date.now(),
      };

      // Estimate entropy from this movement
      const bits = estimateMovementEntropy(point, lastPointRef.current);
      lastPointRef.current = point;

      if (bits > 0) {
        // Add position data (mixed with timing)
        mouseDataRef.current.push(
          point.x ^ (point.timestamp & 0xff),
          point.y ^ ((point.timestamp >> 8) & 0xff),
          (point.timestamp >> 16) & 0xff,
        );

        collectedBitsRef.current += bits;
        setCollectedBits(Math.min(collectedBitsRef.current, targetBits));

        // Update visual trail (limited to last 50 points)
        setMouseTrail((prev) => [
          ...prev.slice(-49),
          { x: point.x, y: point.y },
        ]);
      }

      // Check if we have enough entropy
      if (collectedBitsRef.current >= targetBits && !isComplete) {
        setIsComplete(true);
        finalizeEntropy();
      }
    },
    [isComplete, targetBits],
  );

  // Finalize entropy collection
  const finalizeEntropy = useCallback(async () => {
    // Convert collected mouse data to Uint8Array
    const mouseBytes = new Uint8Array(mouseDataRef.current.slice(0, 64));

    // Get system CSPRNG entropy
    const systemEntropy = crypto.getRandomValues(new Uint8Array(32));

    // Mix both sources
    const finalEntropy = await mixEntropy(mouseBytes, systemEntropy);

    // Clear sensitive data
    mouseDataRef.current = [];

    // Callback with final entropy
    onComplete(finalEntropy);
  }, [onComplete]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  // Calculate progress
  const progress = Math.min((collectedBits / targetBits) * 100, 100);

  return (
    <div className={clsx("relative", className)}>
      {/* Instructions */}
      <div className="text-center mb-4">
        <h3 className="font-pixel text-sm text-pixel-primary mb-2">
          GENERATE WALLET ENTROPY
        </h3>
        <p className="font-pixel-body text-xs text-pixel-text-muted">
          Move your mouse randomly in the box below to generate secure
          randomness for your wallet
        </p>
      </div>

      {/* Entropy collection area */}
      <div
        ref={containerRef}
        className={clsx(
          "relative w-full h-64 overflow-hidden cursor-crosshair",
          "border-4 border-black",
          "bg-pixel-bg-dark",
          isComplete && "cursor-default",
        )}
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #4fc3f7 1px, transparent 1px),
              linear-gradient(to bottom, #4fc3f7 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Mouse trail visualization */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {mouseTrail.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={Math.max(2, 8 - (mouseTrail.length - i) * 0.15)}
              fill={isComplete ? "#10b981" : "#4fc3f7"}
              opacity={Math.max(0.1, 1 - (mouseTrail.length - i) * 0.02)}
            />
          ))}
        </svg>

        {/* Center instruction */}
        {!isComplete && collectedBits < 10 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center animate-pulse">
              <div className="font-pixel text-4xl text-pixel-text-muted mb-2">
                +
              </div>
              <p className="font-pixel text-[10px] text-pixel-text-muted">
                MOVE MOUSE HERE
              </p>
            </div>
          </div>
        )}

        {/* Completion indicator */}
        {isComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-pixel-success/20">
            <div className="text-center">
              <div className="font-pixel text-4xl text-pixel-success mb-2">
                ✓
              </div>
              <p className="font-pixel text-xs text-pixel-success">
                ENTROPY COLLECTED!
              </p>
            </div>
          </div>
        )}

        {/* Entropy bits counter */}
        <div className="absolute top-2 right-2">
          <span
            className={clsx(
              "font-pixel text-[10px]",
              isComplete ? "text-pixel-success" : "text-pixel-secondary",
            )}
          >
            {Math.floor(collectedBits)}/{targetBits} bits
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="h-4 border-2 border-black bg-pixel-bg-light overflow-hidden">
          <div
            className={clsx(
              "h-full transition-all duration-200",
              isComplete ? "bg-pixel-success" : "bg-pixel-secondary",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-pixel text-[8px] text-pixel-text-muted">
            {progress.toFixed(0)}% complete
          </span>
          <span className="font-pixel text-[8px] text-pixel-text-muted">
            {isComplete ? "Ready!" : "Keep moving..."}
          </span>
        </div>
      </div>

      {/* Security info */}
      <div className="mt-4 p-3 bg-pixel-bg-light border-2 border-pixel-border">
        <p className="font-pixel text-[8px] text-pixel-text-muted">
          <span className="text-pixel-success">●</span> Your mouse movements are
          combined with system randomness (crypto.getRandomValues) for maximum
          security. Nothing is sent to any server.
        </p>
      </div>

      {/* Cancel button */}
      {onCancel && !isComplete && (
        <button
          onClick={onCancel}
          className="mt-4 w-full py-2 font-pixel text-[10px] text-pixel-text-muted hover:text-pixel-error border-2 border-pixel-border hover:border-pixel-error transition-colors"
        >
          CANCEL
        </button>
      )}
    </div>
  );
}

export default EntropyCollector;
