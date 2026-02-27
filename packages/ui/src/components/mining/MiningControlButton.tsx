"use client";

/**
 * MiningControlButton - Start/Stop/Pause mining controls
 *
 * Provides various control layouts for mining operations.
 * Used in MiningSection for full control.
 */

import { clsx } from "clsx";

export interface MiningControlButtonProps {
  /** Whether mining is currently running */
  isRunning: boolean;
  /** Whether mining is paused */
  isPaused?: boolean;
  /** Start mining handler */
  onStart: () => void;
  /** Stop mining handler */
  onStop: () => void;
  /** Pause mining handler */
  onPause?: () => void;
  /** Resume mining handler */
  onResume?: () => void;
  /** Whether controls are disabled */
  disabled?: boolean;
  /** Control layout variant */
  variant?: "toggle" | "multi-button";
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
}

const sizeClasses = {
  sm: {
    button: "px-3 py-2",
    text: "text-[10px]",
    icon: "text-xs",
  },
  md: {
    button: "px-4 py-3",
    text: "text-xs",
    icon: "text-sm",
  },
  lg: {
    button: "px-6 py-4",
    text: "text-sm",
    icon: "text-base",
  },
};

interface ControlButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant: "start" | "stop" | "pause" | "resume";
  size: "sm" | "md" | "lg";
  className?: string;
}

function ControlButton({
  onClick,
  disabled,
  variant,
  size,
  className,
}: ControlButtonProps) {
  const sizes = sizeClasses[size];

  const variants = {
    start: {
      bg: "bg-pixel-success hover:bg-pixel-success-dark",
      text: "text-pixel-text-dark",
      label: "START",
      icon: "▶",
    },
    stop: {
      bg: "bg-pixel-error hover:bg-pixel-error-dark",
      text: "text-pixel-text",
      label: "STOP",
      icon: "■",
    },
    pause: {
      bg: "bg-pixel-warning hover:bg-pixel-warning-dark",
      text: "text-pixel-text-dark",
      label: "PAUSE",
      icon: "❚❚",
    },
    resume: {
      bg: "bg-pixel-secondary hover:bg-pixel-secondary-dark",
      text: "text-pixel-text-dark",
      label: "RESUME",
      icon: "▶",
    },
  };

  const v = variants[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        sizes.button,
        "border-4 border-black",
        "shadow-[4px_4px_0_0_#000]",
        "transition-all",
        "active:translate-y-1 active:shadow-[2px_2px_0_0_#000]",
        v.bg,
        v.text,
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      type="button"
    >
      <span
        className={clsx("font-pixel", sizes.text, "flex items-center gap-2")}
      >
        <span className={sizes.icon}>{v.icon}</span>
        <span>{v.label}</span>
      </span>
    </button>
  );
}

export function MiningControlButton({
  isRunning,
  isPaused = false,
  onStart,
  onStop,
  onPause,
  onResume,
  disabled = false,
  variant = "toggle",
  size = "md",
  className,
}: MiningControlButtonProps) {
  // Toggle variant - single button that changes based on state
  if (variant === "toggle") {
    if (!isRunning) {
      return (
        <ControlButton
          onClick={onStart}
          disabled={disabled}
          variant="start"
          size={size}
          className={clsx("w-full", className)}
        />
      );
    }

    if (isPaused && onResume) {
      return (
        <ControlButton
          onClick={onResume}
          disabled={disabled}
          variant="resume"
          size={size}
          className={clsx("w-full", className)}
        />
      );
    }

    return (
      <ControlButton
        onClick={onStop}
        disabled={disabled}
        variant="stop"
        size={size}
        className={clsx("w-full", className)}
      />
    );
  }

  // Multi-button variant - shows all available controls
  return (
    <div className={clsx("flex gap-2", className)}>
      {!isRunning ? (
        <ControlButton
          onClick={onStart}
          disabled={disabled}
          variant="start"
          size={size}
          className="flex-1"
        />
      ) : (
        <>
          {/* Pause/Resume button */}
          {onPause && onResume && (
            <ControlButton
              onClick={isPaused ? onResume : onPause}
              disabled={disabled}
              variant={isPaused ? "resume" : "pause"}
              size={size}
              className="flex-1"
            />
          )}

          {/* Stop button */}
          <ControlButton
            onClick={onStop}
            disabled={disabled}
            variant="stop"
            size={size}
            className="flex-1"
          />
        </>
      )}
    </div>
  );
}

/**
 * MiningQuickToggle - Minimal toggle for inline use
 */
export function MiningQuickToggle({
  isRunning,
  onToggle,
  disabled = false,
  className,
}: {
  isRunning: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={clsx(
        "w-12 h-6",
        "border-2 border-black",
        "relative",
        "transition-colors",
        isRunning ? "bg-pixel-success" : "bg-pixel-bg-light",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      type="button"
      role="switch"
      aria-checked={isRunning}
      aria-label={isRunning ? "Stop mining" : "Start mining"}
    >
      <span
        className={clsx(
          "absolute top-0.5 w-4 h-4",
          "border-2 border-black",
          "bg-pixel-text",
          "transition-all",
          isRunning ? "left-6" : "left-0.5",
        )}
      />
    </button>
  );
}
