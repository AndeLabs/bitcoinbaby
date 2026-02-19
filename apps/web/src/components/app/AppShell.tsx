"use client";

/**
 * AppShell - Main application shell
 *
 * Unified dashboard with:
 * - Persistent header with mining status
 * - Tab navigation
 * - Content area that switches without unmounting mining
 */

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/**
 * Reset all app data - clears IndexedDB and localStorage
 */
async function resetAllData() {
  // Clear localStorage keys
  const keysToRemove = [
    "bitcoinbaby-nft-store",
    "bitcoinbaby-mining-store",
    "bitcoinbaby-baby-store",
    "bitcoinbaby-wallet-store",
    "bitcoinbaby-network",
    "bitcoinbaby-settings",
    "bitcoinbaby-leaderboard",
    "bitcoinbaby-tutorial",
    "bitcoinbaby-game",
    "bitcoinbaby_game_state",
  ];
  keysToRemove.forEach((key) => localStorage.removeItem(key));

  // Clear IndexedDB
  if (typeof indexedDB !== "undefined") {
    try {
      const databases = await indexedDB.databases();
      for (const db of databases) {
        if (db.name?.includes("bitcoinbaby")) {
          indexedDB.deleteDatabase(db.name);
        }
      }
    } catch {
      // Fallback for browsers that don't support databases()
      indexedDB.deleteDatabase("bitcoinbaby");
    }
  }

  // Reload
  window.location.reload();
}
import { clsx } from "clsx";
import { AppHeader } from "./AppHeader";
import { TabNavigation, type TabType } from "./TabNavigation";

// Lazy load sections for better performance
import dynamic from "next/dynamic";

const BabySection = dynamic(
  () => import("../sections/BabySection").then((m) => m.BabySection),
  { ssr: false },
);
const MiningSection = dynamic(
  () => import("../sections/MiningSection").then((m) => m.MiningSection),
  { ssr: false },
);
const NFTsSection = dynamic(
  () => import("../sections/NFTsSection").then((m) => m.NFTsSection),
  { ssr: false },
);
const WalletSection = dynamic(
  () => import("../sections/WalletSection").then((m) => m.WalletSection),
  { ssr: false },
);
const MoreSection = dynamic(
  () => import("../sections/MoreSection").then((m) => m.MoreSection),
  { ssr: false },
);

// Loading placeholder
function SectionLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="font-pixel text-xs text-pixel-text-muted animate-pulse">
        Loading...
      </div>
    </div>
  );
}

// Inner component that uses searchParams
function AppShellInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get tab from URL or default to "baby"
  const urlTab = searchParams.get("tab") as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(urlTab || "baby");

  // Sync URL with tab
  const handleTabChange = useCallback(
    (tab: TabType) => {
      setActiveTab(tab);
      // Update URL without full navigation
      const url = tab === "baby" ? "/" : `/?tab=${tab}`;
      router.push(url, { scroll: false });
    },
    [router],
  );

  // Sync tab from URL changes (back/forward navigation)
  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    } else if (!urlTab && activeTab !== "baby") {
      setActiveTab("baby");
    }
  }, [urlTab, activeTab]);

  // Quick navigation handlers
  const goToMining = useCallback(
    () => handleTabChange("mining"),
    [handleTabChange],
  );
  const goToWallet = useCallback(
    () => handleTabChange("wallet"),
    [handleTabChange],
  );

  return (
    <div className="min-h-screen flex flex-col bg-pixel-bg-dark">
      {/* Persistent Header */}
      <AppHeader onMiningClick={goToMining} onWalletClick={goToWallet} />

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Content Area */}
      <main className="flex-1 overflow-auto">
        <Suspense fallback={<SectionLoader />}>
          {activeTab === "baby" && <BabySection />}
          {activeTab === "mining" && <MiningSection />}
          {activeTab === "nfts" && <NFTsSection />}
          {activeTab === "wallet" && <WalletSection />}
          {activeTab === "more" && <MoreSection />}
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="px-4 py-3 border-t-2 border-pixel-border bg-pixel-bg-medium">
        <div className="flex items-center justify-between">
          <p className="font-pixel text-[6px] text-pixel-text-muted uppercase">
            BitcoinBaby v0.1.0 - Testnet4
          </p>
          <button
            onClick={() => {
              if (confirm("Delete ALL data and start fresh?")) {
                resetAllData();
              }
            }}
            className="font-pixel text-[6px] text-pixel-error hover:text-pixel-error/80 uppercase"
          >
            Reset All
          </button>
        </div>
      </footer>
    </div>
  );
}

// Main export with Suspense boundary for searchParams
export function AppShell() {
  return (
    <Suspense fallback={<SectionLoader />}>
      <AppShellInner />
    </Suspense>
  );
}

export default AppShell;
