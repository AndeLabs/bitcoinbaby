"use client";

/**
 * HelpTooltip - Contextual help icon with tooltip
 *
 * Best practices implemented:
 * - Small ? icon that doesn't clutter UI
 * - Hover on desktop, click on mobile
 * - Rich tooltip with formatting support
 * - Positioned to not block content
 * - Dismissible
 *
 * @see https://uxpatterns.dev/patterns/content-management/tooltip
 */

import { useState, useRef, useEffect } from "react";
// Simple className merge utility
const cn = (...classes: (string | undefined | false)[]) =>
  classes.filter(Boolean).join(" ");

// =============================================================================
// TYPES
// =============================================================================

interface HelpTooltipProps {
  /** Short help text */
  content: string;
  /** Optional title for rich tooltip */
  title?: string;
  /** Optional longer description */
  description?: string;
  /** Position of tooltip */
  position?: "top" | "bottom" | "left" | "right";
  /** Size of the help icon */
  size?: "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
  /** Icon style */
  variant?: "question" | "info";
}

// =============================================================================
// COMPONENT
// =============================================================================

export function HelpTooltip({
  content,
  title,
  description,
  position = "top",
  size = "sm",
  className,
  variant = "question",
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(hover: none)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const sizeClasses = {
    sm: "w-4 h-4 text-[8px]",
    md: "w-5 h-5 text-[10px]",
    lg: "w-6 h-6 text-xs",
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-pixel-bg-medium border-x-transparent border-b-transparent",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-b-pixel-bg-medium border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-pixel-bg-medium border-y-transparent border-r-transparent",
    right:
      "right-full top-1/2 -translate-y-1/2 border-r-pixel-bg-medium border-y-transparent border-l-transparent",
  };

  const hasRichContent = title || description;

  return (
    <div className={cn("relative inline-flex", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => isMobile && setIsOpen(!isOpen)}
        onMouseEnter={() => !isMobile && setIsOpen(true)}
        onMouseLeave={() => !isMobile && setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => !isMobile && setIsOpen(false)}
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          "bg-pixel-bg-medium border border-pixel-border",
          "text-pixel-text-muted hover:text-pixel-primary hover:border-pixel-primary",
          "transition-colors cursor-help",
          sizeClasses[size],
        )}
        aria-label="Help"
        aria-describedby={isOpen ? "tooltip-content" : undefined}
      >
        {variant === "question" ? "?" : "i"}
      </button>

      {/* Tooltip */}
      {isOpen && (
        <div
          ref={tooltipRef}
          id="tooltip-content"
          role="tooltip"
          className={cn(
            "absolute z-50",
            "bg-pixel-bg-medium border-2 border-pixel-border",
            "shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]",
            "animate-in fade-in-0 zoom-in-95 duration-150",
            hasRichContent ? "p-3 min-w-[200px] max-w-[280px]" : "px-2 py-1",
            positionClasses[position],
          )}
        >
          {/* Arrow */}
          <div
            className={cn("absolute w-0 h-0 border-4", arrowClasses[position])}
          />

          {/* Content */}
          {hasRichContent ? (
            <div>
              {title && (
                <p className="font-pixel text-[9px] text-pixel-primary uppercase mb-1">
                  {title}
                </p>
              )}
              <p className="font-pixel-body text-xs text-pixel-text leading-relaxed">
                {content}
              </p>
              {description && (
                <p className="font-pixel-body text-[10px] text-pixel-text-muted mt-2 leading-relaxed">
                  {description}
                </p>
              )}
              {isMobile && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-2 font-pixel text-[7px] text-pixel-text-muted hover:text-pixel-primary uppercase"
                >
                  Got it
                </button>
              )}
            </div>
          ) : (
            <p className="font-pixel-body text-[10px] text-pixel-text whitespace-nowrap">
              {content}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// INFO LABEL - Label with help tooltip
// =============================================================================

interface InfoLabelProps {
  /** Label text */
  label: string;
  /** Help content */
  help: string;
  /** Optional help title */
  helpTitle?: string;
  /** Additional className */
  className?: string;
  /** Required indicator */
  required?: boolean;
}

export function InfoLabel({
  label,
  help,
  helpTitle,
  className,
  required,
}: InfoLabelProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span className="font-pixel text-[8px] text-pixel-text-muted uppercase">
        {label}
        {required && <span className="text-pixel-error ml-0.5">*</span>}
      </span>
      <HelpTooltip content={help} title={helpTitle} size="sm" />
    </div>
  );
}

// =============================================================================
// STAT WITH HELP - Stat display with contextual help
// =============================================================================

interface StatWithHelpProps {
  /** Stat label */
  label: string;
  /** Stat value */
  value: string | number;
  /** Help content */
  help: string;
  /** Value color */
  valueColor?: "primary" | "secondary" | "success" | "warning" | "error";
  /** Additional className */
  className?: string;
}

export function StatWithHelp({
  label,
  value,
  help,
  valueColor = "secondary",
  className,
}: StatWithHelpProps) {
  const colorClasses = {
    primary: "text-pixel-primary",
    secondary: "text-pixel-secondary",
    success: "text-pixel-success",
    warning: "text-pixel-warning",
    error: "text-pixel-error",
  };

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-1">
        <span className="font-pixel text-[7px] text-pixel-text-muted uppercase">
          {label}
        </span>
        <HelpTooltip content={help} size="sm" />
      </div>
      <span className={cn("font-pixel text-[9px]", colorClasses[valueColor])}>
        {value}
      </span>
    </div>
  );
}

export default HelpTooltip;
