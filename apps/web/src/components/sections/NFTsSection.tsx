"use client";

/**
 * NFTsSection - Genesis Babies Collection & Mint
 *
 * NFT management with:
 * - Sub-tabs: Collection | Mint New
 * - Collection grid with stats
 * - Mint UI with fixed BTC pricing (50,000 sats)
 * - Evolution system
 */

import { useState, useCallback } from "react";
import { NFTGrid, NFTStats, NFTCard, type BabyNFTState } from "@bitcoinbaby/ui";
import { useNFTStore, useWalletStore, useNFTSale } from "@bitcoinbaby/core";
import { useMintNFT } from "@/hooks/useMintNFT";

type SubTab = "collection" | "mint";

export function NFTsSection() {
  const [activeTab, setActiveTab] = useState<SubTab>("collection");
  const [demoNFTs, setDemoNFTs] = useState<BabyNFTState[]>([]);
  const [evolvingIds, setEvolvingIds] = useState<Set<number>>(new Set());
  const [mintPreview, setMintPreview] = useState<BabyNFTState | null>(null);
  const [showMintSuccess, setShowMintSuccess] = useState(false);

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

  // NFT Sale hook for pricing (simple: 50,000 sats fixed)
  const { formattedPrice, validation } = useNFTSale({
    buyerAddress: wallet?.address,
    buyerBalance: 0n, // TODO: Get real balance
  });

  const handlePreview = useCallback(() => {
    const previewNFT = preview();
    setMintPreview(previewNFT);
  }, [preview]);

  const handleReroll = useCallback(() => {
    const previewNFT = preview();
    setMintPreview(previewNFT);
  }, [preview]);

  const handleMint = useCallback(async () => {
    const result = await mint();
    if (result.success && result.nft) {
      setOwnedNFTs([result.nft, ...ownedNFTs]);
      setShowMintSuccess(true);
    }
  }, [mint, setOwnedNFTs, ownedNFTs]);

  const handleCloseMintSuccess = useCallback(() => {
    setShowMintSuccess(false);
    setMintPreview(null);
    resetMint();
    setActiveTab("collection");
  }, [resetMint]);

  const nfts = ownedNFTs;

  const handleEvolve = async (nft: BabyNFTState) => {
    setEvolvingIds((prev) => new Set(prev).add(nft.tokenId));
    await new Promise((r) => setTimeout(r, 2000));
    // TODO: Real evolution
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
          <h2 className="font-pixel text-xl md:text-2xl text-pixel-primary mb-2">
            GENESIS BABIES
          </h2>
          <p className="font-pixel-body text-sm text-pixel-text-muted">
            Mint and collect NFTs with mining boosts
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
              if (!mintPreview) handlePreview();
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

        {/* Connection Warning */}
        {!wallet && (
          <div className="mb-6 p-4 bg-pixel-bg-medium border-4 border-pixel-warning text-center">
            <p className="font-pixel text-[9px] text-pixel-warning uppercase mb-2">
              Wallet Not Connected
            </p>
            <p className="font-pixel-body text-sm text-pixel-text-muted mb-2">
              Connect your wallet to mint and manage Genesis Babies.
            </p>
            <p className="font-pixel text-[8px] text-pixel-primary">
              Go to Wallet tab to connect
            </p>
          </div>
        )}

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
                    if (!mintPreview) handlePreview();
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
                      if (!mintPreview) handlePreview();
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
            {/* Price Banner */}
            <div className="bg-pixel-bg-medium border-4 border-pixel-success p-4 mb-6 text-center shadow-[4px_4px_0_0_#000]">
              <p className="font-pixel text-[8px] text-pixel-text-muted uppercase mb-1">
                Fixed Price
              </p>
              <p className="font-pixel text-2xl text-pixel-success">
                {formattedPrice}
              </p>
              <p className="font-pixel text-[7px] text-pixel-text-muted mt-1">
                ≈ €50 • Price stable in BTC
              </p>
            </div>

            {/* Mint Card */}
            <div className="bg-pixel-bg-medium border-4 border-pixel-border p-6 shadow-[8px_8px_0_0_#000]">
              {/* Error Display */}
              {mintError && (
                <div className="mb-4 p-3 bg-pixel-error/20 border-2 border-pixel-error">
                  <p className="font-pixel text-[7px] text-pixel-error uppercase">
                    {mintError}
                  </p>
                </div>
              )}

              {/* Success State */}
              {showMintSuccess && lastMinted ? (
                <div className="text-center">
                  <div className="mb-4">
                    <NFTCard nft={lastMinted} showTokenId />
                  </div>
                  <div className="bg-pixel-success/20 border-2 border-pixel-success p-3 mb-4">
                    <p className="font-pixel text-[9px] text-pixel-success uppercase">
                      Successfully Minted!
                    </p>
                  </div>
                  {txid && (
                    <p className="font-pixel-body text-xs text-pixel-text-muted break-all mb-4">
                      TX: {txid.slice(0, 20)}...
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleCloseMintSuccess}
                      className="flex-1 font-pixel text-[8px] uppercase px-4 py-2 bg-pixel-bg-dark text-pixel-text border-2 border-pixel-border hover:border-pixel-primary transition-colors"
                    >
                      View Collection
                    </button>
                    <button
                      onClick={() => {
                        setShowMintSuccess(false);
                        resetMint();
                        handlePreview();
                      }}
                      className="flex-1 font-pixel text-[8px] uppercase px-4 py-2 bg-pixel-success text-pixel-text-dark border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-transform"
                    >
                      Mint Another
                    </button>
                  </div>
                </div>
              ) : mintPreview ? (
                /* Preview State */
                <div>
                  <h3 className="font-pixel text-[10px] text-pixel-primary uppercase text-center mb-4">
                    Preview Your Baby
                  </h3>

                  <div className="mb-4">
                    <NFTCard nft={mintPreview} showTokenId />
                  </div>

                  {/* Traits Display */}
                  <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-pixel-bg-dark border-2 border-pixel-border">
                    <div>
                      <span className="font-pixel text-[6px] text-pixel-text-muted uppercase">
                        Rarity
                      </span>
                      <p className="font-pixel text-[8px] text-pixel-secondary capitalize">
                        {mintPreview.rarityTier}
                      </p>
                    </div>
                    <div>
                      <span className="font-pixel text-[6px] text-pixel-text-muted uppercase">
                        Bloodline
                      </span>
                      <p className="font-pixel text-[8px] text-pixel-secondary capitalize">
                        {mintPreview.bloodline}
                      </p>
                    </div>
                    <div>
                      <span className="font-pixel text-[6px] text-pixel-text-muted uppercase">
                        Type
                      </span>
                      <p className="font-pixel text-[8px] text-pixel-secondary capitalize">
                        {mintPreview.baseType}
                      </p>
                    </div>
                    <div>
                      <span className="font-pixel text-[6px] text-pixel-text-muted uppercase">
                        Mining Boost
                      </span>
                      <p className="font-pixel text-[8px] text-pixel-success">
                        +{mintPreview.level * 10}%
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleReroll}
                      disabled={isMinting}
                      className="flex-1 font-pixel text-[8px] uppercase px-3 py-3 bg-pixel-bg-dark text-pixel-text border-2 border-pixel-border hover:border-pixel-secondary transition-colors disabled:opacity-50"
                    >
                      🎲 Reroll
                    </button>
                    <button
                      onClick={handleMint}
                      disabled={isMinting || !canMint}
                      className="flex-1 font-pixel text-[8px] uppercase px-3 py-3 bg-pixel-success text-pixel-text-dark border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isMinting ? "Minting..." : `Mint for ${formattedPrice}`}
                    </button>
                  </div>

                  {/* Validation Warnings */}
                  {validation.warnings.length > 0 && (
                    <div className="mt-3 p-2 bg-pixel-warning/10 border border-pixel-warning">
                      {validation.warnings.map((w, i) => (
                        <p
                          key={i}
                          className="font-pixel text-[6px] text-pixel-warning"
                        >
                          ⚠ {w}
                        </p>
                      ))}
                    </div>
                  )}

                  {!wallet && (
                    <p className="mt-3 font-pixel text-[7px] text-pixel-warning text-center">
                      Connect wallet to mint
                    </p>
                  )}
                </div>
              ) : (
                /* Loading State */
                <div className="text-center py-8">
                  <div className="text-4xl animate-bounce mb-4">👶</div>
                  <p className="font-pixel text-[8px] text-pixel-text-muted animate-pulse">
                    Generating preview...
                  </p>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-pixel-bg-medium border-4 border-pixel-border">
              <h4 className="font-pixel text-[8px] text-pixel-secondary uppercase mb-2">
                About Genesis Babies
              </h4>
              <ul className="space-y-1 font-pixel-body text-xs text-pixel-text-muted">
                <li>• Max supply: 10,000 NFTs</li>
                <li>• Each NFT provides mining boost (10-120%)</li>
                <li>• Level up by burning $BABY tokens</li>
                <li>• Rarer NFTs = higher base boost</li>
                <li>• Price is fixed in BTC (no USD fluctuation)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NFTsSection;
