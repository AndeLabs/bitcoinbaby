"use client";

/**
 * NFTsSection - Genesis Babies Collection
 *
 * NFT management with:
 * - Collection grid
 * - Stats panel
 * - Mint modal
 * - Evolution
 */

import { useState, useCallback } from "react";
import {
  NFTGrid,
  NFTStats,
  NFTCard,
  type BabyNFTState,
  type RarityTier,
  type Bloodline,
  type BaseType,
} from "@bitcoinbaby/ui";
import { useNFTStore, useWalletStore } from "@bitcoinbaby/core";
import { useMintNFT } from "@/hooks/useMintNFT";

// Demo NFT generator
function generateDemoNFT(tokenId: number): BabyNFTState {
  const bloodlines: Bloodline[] = ["royal", "warrior", "rogue", "mystic"];
  const baseTypes: BaseType[] = ["human", "animal", "robot", "mystic", "alien"];
  const rarities: RarityTier[] = [
    "common",
    "common",
    "common",
    "uncommon",
    "uncommon",
    "rare",
    "rare",
    "epic",
    "legendary",
    "mythic",
  ];

  const seed = tokenId * 7919;
  const pick = <T,>(arr: T[], offset = 0) =>
    arr[(seed + offset) % arr.length] as T;

  const level = (seed % 10) + 1;
  const xp = (seed % 500) + 100;
  const workCount = (seed % 1000) + 50;

  return {
    tokenId,
    dna: seed.toString(16).padStart(32, "0").slice(0, 32),
    bloodline: pick(bloodlines, 1),
    baseType: pick(baseTypes, 2),
    rarityTier: pick(rarities, 3),
    genesisBlock: 800000 + (seed % 10000),
    level,
    xp,
    totalXp: xp + level * 500,
    workCount,
    lastWorkBlock: 850000 - (seed % 1000),
    evolutionCount: Math.max(0, level - 1),
    tokensEarned: BigInt(workCount * 1000),
  };
}

export function NFTsSection() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDemo, _setIsDemo] = useState(false);
  const [demoNFTs, setDemoNFTs] = useState<BabyNFTState[]>([]);
  const [evolvingIds, setEvolvingIds] = useState<Set<number>>(new Set());
  const [showMintModal, setShowMintModal] = useState(false);
  const [mintPreview, setMintPreview] = useState<BabyNFTState | null>(null);

  const { ownedNFTs, isLoading, setOwnedNFTs } = useNFTStore();
  const wallet = useWalletStore((s) => s.wallet);

  const {
    isLoading: isMinting,
    error: mintError,
    lastMinted,
    txid,
    mint,
    preview,
    reset: resetMint,
    canMint,
  } = useMintNFT();

  const handleOpenMint = useCallback(() => {
    const previewNFT = preview();
    setMintPreview(previewNFT);
    setShowMintModal(true);
  }, [preview]);

  const handleReroll = useCallback(() => {
    const previewNFT = preview();
    setMintPreview(previewNFT);
  }, [preview]);

  const handleMint = useCallback(async () => {
    const result = await mint();
    if (result.success && result.nft) {
      if (isDemo) {
        setDemoNFTs((prev) => [result.nft!, ...prev]);
      } else {
        setOwnedNFTs([result.nft, ...ownedNFTs]);
      }
    }
  }, [mint, isDemo, setOwnedNFTs, ownedNFTs]);

  const handleCloseMint = useCallback(() => {
    setShowMintModal(false);
    setMintPreview(null);
    resetMint();
  }, [resetMint]);

  const nfts = isDemo ? demoNFTs : ownedNFTs;

  const handleEvolve = async (nft: BabyNFTState) => {
    if (!isDemo) return;

    setEvolvingIds((prev) => new Set(prev).add(nft.tokenId));
    await new Promise((r) => setTimeout(r, 2000));

    setDemoNFTs((prev) =>
      prev.map((n) =>
        n.tokenId === nft.tokenId
          ? {
              ...n,
              level: n.level + 1,
              xp: 0,
              totalXp: n.totalXp + n.xp,
            }
          : n,
      ),
    );

    setEvolvingIds((prev) => {
      const next = new Set(prev);
      next.delete(nft.tokenId);
      return next;
    });
  };

  return (
    <div className="p-4 md:p-8 bg-pixel-bg-dark">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="font-pixel text-xl md:text-2xl text-pixel-primary mb-2">
            GENESIS BABIES
          </h2>
          <p className="font-pixel-body text-sm text-pixel-text-muted">
            Your NFT collection with mining boosts
          </p>
        </div>

        {/* Connection Warning */}
        {!wallet && (
          <div className="mb-8 p-4 bg-pixel-bg-medium border-4 border-pixel-warning text-center">
            <p className="font-pixel text-[9px] text-pixel-warning uppercase mb-2">
              Wallet Not Connected
            </p>
            <p className="font-pixel-body text-sm text-pixel-text-muted mb-4">
              Connect your wallet to view your Genesis Babies.
            </p>
            <p className="font-pixel text-[8px] text-pixel-primary">
              Go to Wallet tab to connect
            </p>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Stats Panel (Sidebar) */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <NFTStats
              nfts={nfts}
              isLoading={isLoading && !isDemo}
              showRarityBreakdown={true}
              className="sticky top-4"
            />

            {/* Quick Actions */}
            {nfts.length > 0 && (
              <div className="mt-6 bg-pixel-bg-medium border-4 border-pixel-border p-4">
                <h3 className="font-pixel text-[8px] text-pixel-secondary uppercase mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={handleOpenMint}
                    disabled={!canMint && !isDemo}
                    className={`w-full font-pixel text-[8px] uppercase px-3 py-2 border-2 transition-colors ${
                      canMint || isDemo
                        ? "bg-pixel-primary text-pixel-text-dark border-black hover:bg-pixel-secondary"
                        : "bg-pixel-bg-dark text-pixel-text-muted border-pixel-border cursor-not-allowed"
                    }`}
                  >
                    Mint New Baby
                  </button>
                  <button
                    className="w-full font-pixel text-[8px] uppercase px-3 py-2 bg-pixel-bg-dark text-pixel-text border-2 border-pixel-border hover:border-pixel-primary transition-colors"
                    disabled
                  >
                    Batch Evolve
                  </button>
                </div>
                <p className="font-pixel text-[6px] text-pixel-text-muted mt-2 text-center">
                  Coming soon on mainnet
                </p>
              </div>
            )}
          </div>

          {/* NFT Grid (Main Content) */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <NFTGrid
              nfts={nfts}
              columns={3}
              onEvolve={isDemo ? handleEvolve : undefined}
              evolvingIds={evolvingIds}
              isLoading={isLoading && !isDemo}
              skeletonCount={6}
              showControls={true}
            />
          </div>
        </div>

        {/* Mint Modal */}
        {showMintModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="bg-pixel-bg-medium border-4 border-pixel-border p-6 max-w-md w-full mx-4 shadow-[8px_8px_0_0_#000]">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-pixel text-[10px] text-pixel-primary uppercase">
                  {lastMinted ? "Minted!" : "Mint Genesis Baby"}
                </h2>
                <button
                  onClick={handleCloseMint}
                  className="font-pixel text-[8px] text-pixel-text-muted hover:text-pixel-text"
                >
                  X
                </button>
              </div>

              {/* Content */}
              {mintError && (
                <div className="mb-4 p-3 bg-pixel-error/20 border-2 border-pixel-error">
                  <p className="font-pixel text-[7px] text-pixel-error uppercase">
                    {mintError}
                  </p>
                </div>
              )}

              {lastMinted ? (
                <div className="text-center">
                  <div className="mb-4">
                    <NFTCard nft={lastMinted} showTokenId />
                  </div>
                  <p className="font-pixel text-[7px] text-pixel-success uppercase mb-2">
                    Successfully Minted!
                  </p>
                  {txid && (
                    <p className="font-pixel-body text-xs text-pixel-text-muted break-all">
                      TX: {txid}
                    </p>
                  )}
                  <button
                    onClick={handleCloseMint}
                    className="mt-4 font-pixel text-[8px] uppercase px-4 py-2 bg-pixel-primary text-pixel-text-dark border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-transform"
                  >
                    Close
                  </button>
                </div>
              ) : mintPreview ? (
                <div>
                  <div className="mb-4">
                    <NFTCard nft={mintPreview} showTokenId />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleReroll}
                      disabled={isMinting}
                      className="flex-1 font-pixel text-[8px] uppercase px-3 py-2 bg-pixel-bg-dark text-pixel-text border-2 border-pixel-border hover:border-pixel-secondary transition-colors disabled:opacity-50"
                    >
                      Reroll
                    </button>
                    <button
                      onClick={handleMint}
                      disabled={isMinting || (!canMint && !isDemo)}
                      className="flex-1 font-pixel text-[8px] uppercase px-3 py-2 bg-pixel-primary text-pixel-text-dark border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isMinting ? "Minting..." : "Mint Now"}
                    </button>
                  </div>

                  {isDemo && (
                    <p className="mt-3 font-pixel text-[6px] text-pixel-text-muted text-center">
                      Demo mode - no real transaction
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="font-pixel text-[8px] text-pixel-text-muted animate-pulse">
                    Loading...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NFTsSection;
