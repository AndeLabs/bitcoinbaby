"use client";

/**
 * Main entry point - Dashboard with unified tabs
 *
 * All content is rendered through AppShell which manages:
 * - Persistent header with mining status
 * - Tab navigation (Baby, Mining, NFTs, Wallet, More)
 * - Content switching without page reloads
 * - Mining never interrupts when changing tabs
 */

import { AppShell } from "@/components/app";

export default function Home() {
  return <AppShell />;
}
