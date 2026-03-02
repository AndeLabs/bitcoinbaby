/**
 * Sheet Component
 *
 * A slide-out panel that overlays the current content without
 * navigating away from the page. Perfect for actions like
 * withdraw, send, settings that shouldn't interrupt background processes.
 *
 * Based on shadcn/ui Sheet pattern with Radix Dialog primitives.
 * @see https://ui.shadcn.com/docs/components/radix/sheet
 */

"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

// =============================================================================
// SHEET ROOT
// =============================================================================

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

// =============================================================================
// SHEET OVERLAY
// =============================================================================

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

// =============================================================================
// SHEET CONTENT VARIANTS
// =============================================================================

const sheetVariants = cva(
  cn(
    "fixed z-50 gap-4 bg-pixel-bg-dark border-pixel-border p-6 shadow-lg",
    "transition ease-in-out",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:duration-300 data-[state=open]:duration-500",
  ),
  {
    variants: {
      side: {
        top: cn(
          "inset-x-0 top-0 border-b-4",
          "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        ),
        bottom: cn(
          "inset-x-0 bottom-0 border-t-4",
          "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        ),
        left: cn(
          "inset-y-0 left-0 h-full w-3/4 border-r-4 sm:max-w-sm",
          "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        ),
        right: cn(
          "inset-y-0 right-0 h-full w-3/4 border-l-4 sm:max-w-md",
          "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
        ),
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

// =============================================================================
// SHEET CONTENT
// =============================================================================

interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {/* Close button */}
      <DialogPrimitive.Close
        className={cn(
          "absolute right-4 top-4 p-2",
          "bg-pixel-bg-medium border-2 border-pixel-border",
          "hover:border-pixel-primary hover:bg-pixel-primary/10",
          "focus:outline-none focus:ring-2 focus:ring-pixel-primary",
          "transition-colors",
        )}
      >
        <XIcon className="h-4 w-4 text-pixel-text" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
      {children}
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

// =============================================================================
// SHEET HEADER
// =============================================================================

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left mb-6",
      className,
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

// =============================================================================
// SHEET FOOTER
// =============================================================================

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6",
      className,
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

// =============================================================================
// SHEET TITLE
// =============================================================================

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "font-pixel text-lg text-pixel-primary uppercase tracking-wider",
      className,
    )}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

// =============================================================================
// SHEET DESCRIPTION
// =============================================================================

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("font-pixel-body text-sm text-pixel-text-muted", className)}
    {...props}
  />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

// =============================================================================
// X ICON (inline to avoid extra dependencies)
// =============================================================================

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
