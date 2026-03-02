/**
 * ReceiveSheet
 *
 * Receive Bitcoin interface wrapped in a Sheet for overlay display.
 * Shows QR code and address for receiving funds.
 */

"use client";

import { SheetHeader, SheetTitle, SheetDescription } from "@bitcoinbaby/ui";
import { ReceiveSection } from "../receive/ReceiveSection";

export function ReceiveSheet() {
  return (
    <div className="flex flex-col h-full">
      <SheetHeader>
        <SheetTitle>Receive Bitcoin</SheetTitle>
        <SheetDescription>
          Share your address or QR code to receive BTC
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 mt-6 -mx-6 px-6 overflow-y-auto">
        <ReceiveSection />
      </div>
    </div>
  );
}

export default ReceiveSheet;
