/**
 * SettingsSheet
 *
 * Settings interface wrapped in a Sheet for overlay display.
 * Quick access to common settings without leaving the current page.
 */

"use client";

import { SheetHeader, SheetTitle, SheetDescription } from "@bitcoinbaby/ui";
import { SettingsSection } from "../settings/SettingsSection";

export function SettingsSheet() {
  return (
    <div className="flex flex-col h-full">
      <SheetHeader>
        <SheetTitle>Settings</SheetTitle>
        <SheetDescription>
          Configure mining, display, and security options
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 mt-6 -mx-6 px-6 overflow-y-auto">
        <SettingsSection />
      </div>
    </div>
  );
}

export default SettingsSheet;
