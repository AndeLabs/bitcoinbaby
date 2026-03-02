/**
 * HistorySheet
 *
 * Transaction history interface wrapped in a Sheet for overlay display.
 * Quick access to view transaction history without leaving the current page.
 */

"use client";

import { SheetHeader, SheetTitle, SheetDescription } from "@bitcoinbaby/ui";
import { HistorySection } from "../history/HistorySection";

export function HistorySheet() {
  return (
    <div className="flex flex-col h-full">
      <SheetHeader>
        <SheetTitle>Transaction History</SheetTitle>
        <SheetDescription>View your Bitcoin transactions</SheetDescription>
      </SheetHeader>

      <div className="flex-1 mt-6 -mx-6 px-6 overflow-y-auto">
        <HistorySection />
      </div>
    </div>
  );
}

export default HistorySheet;
