/**
 * SendSheet
 *
 * Send Bitcoin interface wrapped in a Sheet for overlay display.
 * Reuses the existing SendSection component.
 */

"use client";

import { SheetHeader, SheetTitle, SheetDescription } from "@bitcoinbaby/ui";
import { SendSection } from "../send/SendSection";

interface SendSheetProps {
  initialData?: {
    recipientAddress?: string;
    amount?: string;
  };
}

export function SendSheet({ initialData }: SendSheetProps) {
  return (
    <div className="flex flex-col h-full">
      <SheetHeader>
        <SheetTitle>Send Bitcoin</SheetTitle>
        <SheetDescription>Send BTC to any Bitcoin address</SheetDescription>
      </SheetHeader>

      <div className="flex-1 mt-6 -mx-6 px-6 overflow-y-auto">
        <SendSection
          initialRecipient={initialData?.recipientAddress}
          initialAmount={initialData?.amount}
        />
      </div>
    </div>
  );
}

export default SendSheet;
