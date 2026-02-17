/**
 * Tutorial Component
 *
 * Interactive tutorial overlay for first-time users.
 * - Step-by-step guide with highlights
 * - Pointer animations to UI elements
 * - Progress tracking with Next/Skip buttons
 */

"use client";

import { type FC, useEffect, useState, useRef, useCallback } from "react";
import { clsx } from "clsx";
import { Button } from "../button";
import { Progress } from "../progress";

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  icon?: string;
}

interface TutorialProps {
  steps: TutorialStep[];
  currentStep: number;
  isActive: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
  className?: string;
}

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Get position for tooltip based on target element
 */
function getTooltipPosition(
  rect: HighlightRect | null,
  position: TutorialStep["position"],
  tooltipWidth: number = 320,
  tooltipHeight: number = 200,
): { top: number; left: number } {
  // Center position when no target
  if (!rect || position === "center") {
    return {
      top: Math.max(20, (window.innerHeight - tooltipHeight) / 2),
      left: Math.max(20, (window.innerWidth - tooltipWidth) / 2),
    };
  }

  const padding = 16;
  let top = rect.top;
  let left = rect.left;

  switch (position) {
    case "top":
      top = rect.top - tooltipHeight - padding;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      break;
    case "bottom":
      top = rect.top + rect.height + padding;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      break;
    case "left":
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.left - tooltipWidth - padding;
      break;
    case "right":
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.left + rect.width + padding;
      break;
  }

  // Ensure tooltip stays within viewport
  top = Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20));
  left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20));

  return { top, left };
}

/**
 * Pointer Arrow Component
 */
const PointerArrow: FC<{
  targetRect: HighlightRect | null;
  position: TutorialStep["position"];
}> = ({ targetRect, position }) => {
  if (!targetRect || position === "center") return null;

  const arrowSize = 24;
  let arrowStyle: React.CSSProperties = {};
  let rotation = 0;

  switch (position) {
    case "top":
      arrowStyle = {
        top: targetRect.top - arrowSize - 8,
        left: targetRect.left + targetRect.width / 2 - arrowSize / 2,
      };
      rotation = 180;
      break;
    case "bottom":
      arrowStyle = {
        top: targetRect.top + targetRect.height + 8,
        left: targetRect.left + targetRect.width / 2 - arrowSize / 2,
      };
      rotation = 0;
      break;
    case "left":
      arrowStyle = {
        top: targetRect.top + targetRect.height / 2 - arrowSize / 2,
        left: targetRect.left - arrowSize - 8,
      };
      rotation = 90;
      break;
    case "right":
      arrowStyle = {
        top: targetRect.top + targetRect.height / 2 - arrowSize / 2,
        left: targetRect.left + targetRect.width + 8,
      };
      rotation = -90;
      break;
  }

  return (
    <div
      className="fixed z-[60] pointer-events-none animate-bounce"
      style={arrowStyle}
    >
      <svg
        width={arrowSize}
        height={arrowSize}
        viewBox="0 0 24 24"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <path
          d="M12 4L4 16h16L12 4z"
          fill="var(--pixel-primary)"
          stroke="black"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

export const Tutorial: FC<TutorialProps> = ({
  steps,
  currentStep,
  isActive,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  className,
}) => {
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(
    null,
  );
  const tooltipRef = useRef<HTMLDivElement>(null);
  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  /**
   * Update highlight position based on target element
   */
  const updateHighlight = useCallback(() => {
    if (!step?.targetSelector) {
      setHighlightRect(null);
      return;
    }

    const targetElement = document.querySelector(step.targetSelector);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setHighlightRect({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      });
    } else {
      setHighlightRect(null);
    }
  }, [step?.targetSelector]);

  // Update highlight on step change and window resize
  useEffect(() => {
    if (!isActive) return;

    updateHighlight();
    window.addEventListener("resize", updateHighlight);
    window.addEventListener("scroll", updateHighlight);

    // Re-check periodically for dynamically rendered elements
    const interval = setInterval(updateHighlight, 500);

    return () => {
      window.removeEventListener("resize", updateHighlight);
      window.removeEventListener("scroll", updateHighlight);
      clearInterval(interval);
    };
  }, [isActive, updateHighlight]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onSkip();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        if (isLastStep) {
          onComplete();
        } else {
          onNext();
        }
      } else if (e.key === "ArrowLeft" && !isFirstStep) {
        onPrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isActive,
    isFirstStep,
    isLastStep,
    onNext,
    onPrevious,
    onSkip,
    onComplete,
  ]);

  if (!isActive || !step) {
    return null;
  }

  const tooltipPosition = getTooltipPosition(highlightRect, step.position);

  return (
    <div className={clsx("fixed inset-0 z-50", className)}>
      {/* Overlay with cutout for highlighted element */}
      <div className="absolute inset-0">
        {/* Dark overlay */}
        <div
          className="absolute inset-0 bg-black/80 transition-opacity duration-300"
          onClick={onSkip}
        />

        {/* Highlight cutout */}
        {highlightRect && (
          <div
            className="absolute border-4 border-pixel-primary bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.8)] transition-all duration-300"
            style={{
              top: highlightRect.top,
              left: highlightRect.left,
              width: highlightRect.width,
              height: highlightRect.height,
              boxShadow: `
                0 0 0 4px var(--pixel-primary),
                0 0 0 9999px rgba(0,0,0,0.8)
              `,
            }}
          >
            {/* Pulse animation */}
            <div className="absolute inset-0 border-4 border-pixel-primary animate-ping opacity-50" />
          </div>
        )}
      </div>

      {/* Pointer Arrow */}
      <PointerArrow targetRect={highlightRect} position={step.position} />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={clsx(
          "fixed z-[61] w-80",
          "bg-pixel-bg-dark border-4 border-pixel-border",
          "shadow-[8px_8px_0_0_#000]",
          "animate-[scale-in_0.3s_ease-out]",
        )}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Header */}
        <div className="bg-pixel-bg-medium border-b-4 border-pixel-border p-4">
          <div className="flex items-center gap-3">
            {step.icon && <span className="text-3xl">{step.icon}</span>}
            <div>
              <div className="font-pixel text-xs text-pixel-text-muted">
                Paso {currentStep + 1} de {steps.length}
              </div>
              <h3 className="font-pixel text-sm text-pixel-primary">
                {step.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="font-pixel-body text-sm text-pixel-text leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-2">
          <Progress value={progress} variant="default" className="h-2" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 pt-2 border-t-2 border-pixel-border">
          <button
            onClick={onSkip}
            className="font-pixel text-[10px] text-pixel-text-muted hover:text-pixel-error transition-colors"
          >
            SALTAR
          </button>

          <div className="flex gap-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                className="font-pixel text-[10px]"
              >
                ANTERIOR
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={isLastStep ? onComplete : onNext}
              className="font-pixel text-[10px]"
            >
              {isLastStep ? "EMPEZAR!" : "SIGUIENTE"}
            </Button>
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="px-4 pb-3">
          <p className="font-pixel text-[8px] text-pixel-text-muted text-center">
            Usa las flechas o Enter para navegar
          </p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-[61]">
        {steps.map((_, index) => (
          <div
            key={index}
            className={clsx(
              "w-3 h-3 border-2 border-pixel-border transition-colors",
              index === currentStep
                ? "bg-pixel-primary"
                : index < currentStep
                  ? "bg-pixel-success"
                  : "bg-pixel-bg-dark",
            )}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Tutorial Trigger Button
 *
 * Button to manually start/restart the tutorial
 */
export const TutorialTrigger: FC<{
  onClick: () => void;
  className?: string;
}> = ({ onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-3 py-2",
        "font-pixel text-[8px] text-pixel-text-muted",
        "hover:text-pixel-primary transition-colors",
        className,
      )}
      title="Ver tutorial"
    >
      ?
    </button>
  );
};

export default Tutorial;
