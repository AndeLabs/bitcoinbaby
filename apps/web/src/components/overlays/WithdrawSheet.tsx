/**
 * WithdrawSheet
 *
 * Withdrawal interface wrapped in a Sheet for overlay display.
 * Reuses the existing WithdrawSection component.
 */

"use client";

import { SheetHeader, SheetTitle, SheetDescription } from "@bitcoinbaby/ui";
import { WithdrawSection } from "../withdraw/WithdrawSection";

export function WithdrawSheet() {
  return (
    <div className="flex flex-col h-full">
      <SheetHeader>
        <SheetTitle>Withdraw $BABY</SheetTitle>
        <SheetDescription>
          Convert your virtual $BABY tokens to on-chain tokens
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 mt-6 -mx-6 px-6 overflow-y-auto">
        <WithdrawSection />
      </div>
    </div>
  );
}

export default WithdrawSheet;
