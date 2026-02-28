"use client";

/**
 * NFTsSection - Genesis Babies Collection & Mint
 *
 * NFT management with:
 * - Sub-tabs: Collection | Mint New
 * - Collection grid with stats
 * - Random mint (no preview - surprise!)
 * - Info panel showing what you could get
 */

import { useState, useCallback } from "react";
import {
  NFTGrid,
  NFTStats,
  NFTCard,
  NFTInfoPanel,
  HelpTooltip,
  type BabyNFTState,
} from "@bitcoinbaby/ui";
import { useNFTStore, useWalletStore, useNFTSale } from "@bitcoinbaby/core";
import { useMintNFT } from "@/hooks/useMintNFT";

type SubTab = "collection" | "mint";
type MintState = "info" | "minting" | "revealing" | "success";

export function NFTsSection() {
  const [activeTab, setActiveTab] = useState<SubTab>("collection");
  const [mintState, setMintState] = useState<MintState>("info");
  const [evolvingIds, setEvolvingIds] = useState<Set<number>>(new Set());

  const { ownedNFTs, isLoading, setOwnedNFTs } = useNFTStore();
  const wallet = useWalletStore((s) => s.wallet);

  const {
    isLoading: isMinting,
    error: mintError,
    lastMinted,
    txid,
    mint,
    reset: resetMint,
    canMint,
    isDemo,
  } = useMintNFT();

  // NFT Sale hook for pricing
  const { formattedPrice } = useNFTSale({
    buyerAddress: wallet?.address,
    buyerBalance: 0n,
  });

  // Handle mint - truly random, no preview
  const handleMint = useCallback(async () => {
    setMintState("minting");

    const result = await mint();

    if (result.success && result.nft) {
      // Show reveal animation
      setMintState("revealing");

      // Wait for reveal animation
      await new Promise((r) => setTimeout(r, 2000));

      // Add to collection
      setOwnedNFTs([result.nft, ...ownedNFTs]);
      setMintState("success");
    } else {
      setMintState("info");
    }
  }, [mint, setOwnedNFTs, ownedNFTs]);

  const handleMintAnother = useCallback(() => {
    setMintState("info");
    resetMint();
  }, [resetMint]);

  const handleViewCollection = useCallback(() => {
    setMintState("info");
    resetMint();
    setActiveTab("collection");
  }, [resetMint]);

  const nfts = ownedNFTs;

  const handleEvolve = async (nft: BabyNFTState) => {
    setEvolvingIds((prev) => new Set(prev).add(nft.tokenId));
    await new Promise((r) => setTimeout(r, 2000));
    setEvolvingIds((prev) => {
      const next = new Set(prev);
      next.delete(nft.tokenId);
      return next;
    });
  };

  return (
    <div className="p-4 md:p-8 bg-pixel-bg-dark min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-pixel text-xl md:text-2xl text-pixel-primary">
              GENESIS BABIES
            </h2>
            <HelpTooltip
              content="Genesis Babies are NFTs that boost your mining rewards. Each NFT has unique traits and rarity levels."
              title="NFT Collection"
              description="Higher rarity = Higher mining boost. Level up your NFTs by burning $BABY tokens."
              size="md"
            />
          </div>
          <p className="font-pixel-body text-sm text-pixel-text-muted">
            Mint NFTs to boost your mining rewards
          </p>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("collection")}
            className={`font-pixel text-[9px] uppercase px-4 py-2 border-4 transition-all ${
              activeTab === "collection"
                ? "bg-pixel-primary text-pixel-text-dark border-black shadow-[4px_4px_0_0_#000]"
                : "bg-pixel-bg-medium text-pixel-text border-pixel-border hover:border-pixel-primary"
            }`}
          >
            My Collection ({nfts.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("mint");
              setMintState("info");
            }}
            className={`font-pixel text-[9px] uppercase px-4 py-2 border-4 transition-all ${
              activeTab === "mint"
                ? "bg-pixel-success text-pixel-text-dark border-black shadow-[4px_4px_0_0_#000]"
                : "bg-pixel-bg-medium text-pixel-text border-pixel-border hover:border-pixel-success"
            }`}
          >
            Mint New
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "collection" ? (
          /* Collection View */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Stats Panel (Sidebar) */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <NFTStats
                nfts={nfts}
                isLoading={isLoading}
                showRarityBreakdown={true}
                className="sticky top-4"
              />

              {/* Mint CTA in sidebar */}
              <div className="mt-6 bg-pixel-bg-medium border-4 border-pixel-border p-4">
                <h3 className="font-pixel text-[8px] text-pixel-secondary uppercase mb-3">
                  Expand Collection
                </h3>
                <button
                  onClick={() => {
                    setActiveTab("mint");
                    setMintState("info");
                  }}
                  className="w-full font-pixel text-[8px] uppercase px-3 py-3 bg-pixel-success text-pixel-text-dark border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-transform"
                >
                  Mint New Baby
                </button>
                <p className="mt-2 font-pixel text-[7px] text-pixel-text-muted text-center">
                  {formattedPrice}
                </p>
              </div>
            </div>

            {/* NFT Grid (Main Content) */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              {nfts.length === 0 && !isLoading ? (
                <div className="bg-pixel-bg-medium border-4 border-pixel-border p-8 text-center">
                  <div className="text-6xl mb-4">👶</div>
                  <h3 className="font-pixel text-sm text-pixel-text mb-2">
                    No Genesis Babies Yet
                  </h3>
                  <p className="font-pixel-body text-sm text-pixel-text-muted mb-4">
                    Mint your first Genesis Baby to start earning mining boosts!
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab("mint");
                      setMintState("info");
                    }}
                    className="font-pixel text-[9px] uppercase px-6 py-3 bg-pixel-success text-pixel-text-dark border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-transform"
                  >
                    Mint Your First Baby
                  </button>
                </div>
              ) : (
                <NFTGrid
                  nfts={nfts}
                  columns={3}
                  onEvolve={handleEvolve}
                  evolvingIds={evolvingIds}
                  isLoading={isLoading}
                  skeletonCount={6}
                  showControls={true}
                />
              )}
            </div>
          </div>
        ) : (
          /* Mint View */
          <div className="max-w-2xl mx-auto">
            {/* Connection Warning */}
            {!wallet && (
              <div className="mb-6 p-4 bg-pixel-bg-medium border-4 border-pixel-warning text-center">
                <p className="font-pixel text-[9px] text-pixel-warning uppercase mb-2">
                  Demo Mode
                </p>
                <p className="font-pixel-body text-sm text-pixel-text-muted">
                  Connect your wallet for real minting on testnet4
                </p>
              </div>
            )}

            {/* Error Display */}
            {mintError && (
              <div className="mb-4 p-3 bg-pixel-error/20 border-4 border-pixel-error">
                <p className="font-pixel text-[8px] text-pixel-error uppercase">
                  {mintError}
                </p>
              </div>
            )}

            {/* Mint States */}
            {mintState === "info" && (
              <>
                {/* Price Banner */}
                <div className="bg-pixel-bg-medium border-4 border-pixel-success p-4 mb-6 text-center shadow-[4px_4px_0_0_#000]">
                  <p className="font-pixel text-[8px] text-pixel-text-muted uppercase mb-1">
                    Mint Price
                  </p>
                  <p className="font-pixel text-2xl text-pixel-success">
                    {formattedPrice}
                  </p>
                  <p className="font-pixel text-[7px] text-pixel-text-muted mt-1">
                    Random traits - it&apos;s a surprise!
                  </p>
                </div>

                {/* Info Panel */}
                <NFTInfoPanel className="mb-6" />

                {/* Mint Button */}
                <div className="text-center">
                  <button
                    onClick={handleMint}
                    disabled={!canMint}
                    className="font-pixel text-sm uppercase px-8 py-4 bg-pixel-success text-pixel-text-dark border-4 border-black shadow-[6px_6px_0_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_0_#000] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDemo ? "🎮 Mint (Demo)" : "💰 Mint Genesis Baby"}
                  </button>
                  <p className="mt-3 font-pixel text-[7px] text-pixel-text-muted">
                    {isDemo
                      ? "Demo mode - no real transaction"
                      : "Will open wallet to sign transaction"}
                  </p>
                </div>
              </>
            )}

            {mintState === "minting" && (
              <div className="bg-pixel-bg-medium border-4 border-pixel-border p-8 text-center">
                <div className="text-6xl animate-bounce mb-4">⛏️</div>
                <p className="font-pixel text-sm text-pixel-primary animate-pulse mb-2">
                  MINTING...
                </p>
                <p className="font-pixel-body text-sm text-pixel-text-muted">
                  {isDemo
                    ? "Creating your Baby..."
                    : "Please confirm in your wallet..."}
                </p>
              </div>
            )}

            {mintState === "revealing" && (
              <div className="bg-pixel-bg-medium border-4 border-pixel-primary p-8 text-center">
                <div className="relative">
                  {/* Egg animation */}
                  <div className="text-8xl animate-pulse mb-4">🥚</div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 border-4 border-pixel-primary rounded-full animate-ping opacity-50" />
                  </div>
                </div>
                <p className="font-pixel text-sm text-pixel-primary animate-pulse">
                  HATCHING...
                </p>
                <p className="font-pixel text-[8px] text-pixel-text-muted mt-2">
                  Your Genesis Baby is being born!
                </p>
              </div>
            )}

            {mintState === "success" && lastMinted && (
              <div className="bg-pixel-bg-medium border-4 border-pixel-success p-6 shadow-[8px_8px_0_0_#000]">
                <div className="text-center mb-4">
                  <p className="font-pixel text-sm text-pixel-success uppercase mb-2">
                    🎉 Congratulations! 🎉
                  </p>
                  <p className="font-pixel text-[8px] text-pixel-text-muted">
                    You got a new Genesis Baby!
                  </p>
                </div>

                {/* NFT Card */}
                <div className="mb-4">
                  <NFTCard nft={lastMinted} showTokenId />
                </div>

                {/* Traits Display */}
                <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-pixel-bg-dark border-2 border-pixel-border">
                  <div>
                    <span className="font-pixel text-[6px] text-pixel-text-muted uppercase">
                      Rarity
                    </span>
                    <p className="font-pixel text-[10px] text-pixel-secondary capitalize">
                      {lastMinted.rarityTier}
                    </p>
                  </div>
                  <div>
                    <span className="font-pixel text-[6px] text-pixel-text-muted uppercase">
                      Bloodline
                    </span>
                    <p className="font-pixel text-[10px] text-pixel-secondary capitalize">
                      {lastMinted.bloodline}
                    </p>
                  </div>
                  <div>
                    <span className="font-pixel text-[6px] text-pixel-text-muted uppercase">
                      Type
                    </span>
                    <p className="font-pixel text-[10px] text-pixel-secondary capitalize">
                      {lastMinted.baseType}
                    </p>
                  </div>
                  <div>
                    <span className="font-pixel text-[6px] text-pixel-text-muted uppercase">
                      Mining Boost
                    </span>
                    <p className="font-pixel text-[10px] text-pixel-success">
                      +{lastMinted.level * 10}%
                    </p>
                  </div>
                </div>

                {/* Transaction ID */}
                {txid && (
                  <div className="mb-4 p-2 bg-pixel-bg-dark border-2 border-pixel-border">
                    <p className="font-pixel text-[6px] text-pixel-text-muted uppercase mb-1">
                      Transaction
                    </p>
                    <p className="font-pixel-body text-[10px] text-pixel-text break-all">
                      {txid}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleViewCollection}
                    className="flex-1 font-pixel text-[8px] uppercase px-4 py-3 bg-pixel-bg-dark text-pixel-text border-2 border-pixel-border hover:border-pixel-primary transition-colors"
                  >
                    View Collection
                  </button>
                  <button
                    onClick={handleMintAnother}
                    className="flex-1 font-pixel text-[8px] uppercase px-4 py-3 bg-pixel-success text-pixel-text-dark border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-transform"
                  >
                    Mint Another
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default NFTsSection;
