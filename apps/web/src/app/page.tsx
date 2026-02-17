"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useMining } from "../hooks/useMining";
import { useGameLoop } from "../hooks/useGameLoop";
import { useBabyState } from "../hooks/useBabyState";
import { useAchievements } from "../hooks/useAchievements";
import { useMiningSubmitter } from "../hooks/useMiningSubmitter";
import { useWallet } from "../hooks/useWallet";
import { useTokenBalance, formatTokenBalance } from "../hooks/useTokenBalance";
import { useNetworkStore } from "@bitcoinbaby/core";
import {
  LevelSprite,
  GameHUD,
  ActionButtons,
  AchievementPopup,
  EvolutionModal,
  DeathModal,
  MiningRewardPanel,
  WalletStatusCompact,
  NetworkBadge,
  type GameAction,
} from "@bitcoinbaby/ui";
import { Button, Input, Card, CardHeader, CardContent } from "@bitcoinbaby/ui";
import type { GameEvent, MiningResult } from "@bitcoinbaby/core";

// Mining Stats Component
function MiningStats({
  hashrate,
  effectiveHashrate,
  nftBoost,
  isActive,
}: {
  hashrate: number;
  effectiveHashrate?: number;
  nftBoost?: number;
  isActive: boolean;
}) {
  const hasBoost = nftBoost && nftBoost > 0;
  const displayRate =
    hasBoost && effectiveHashrate ? effectiveHashrate : hashrate;

  return (
    <div className="bg-pixel-bg-medium border-4 border-pixel-border p-4 shadow-[8px_8px_0_0_#000]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-4 h-4 ${isActive ? "bg-pixel-success animate-pulse" : "bg-pixel-border"}`}
          />
          <span className="font-pixel text-xs text-pixel-text-muted">
            {isActive ? "MINING" : "IDLE"}
          </span>
        </div>
        {hasBoost && (
          <span className="font-pixel text-[8px] text-[#fbbf24] bg-[#78350f] px-2 py-1 border-2 border-black">
            +{nftBoost}% NFT BOOST
          </span>
        )}
      </div>
      <div className="font-pixel-mono text-4xl text-pixel-success">
        {displayRate.toLocaleString()}{" "}
        <span className="text-lg text-pixel-text-muted">H/s</span>
      </div>
      {hasBoost && (
        <div className="mt-2 font-pixel text-[8px] text-pixel-text-muted">
          Base: {hashrate.toLocaleString()} H/s
        </div>
      )}
    </div>
  );
}

// Baby Creation Form
function CreateBabyForm({ onCreate }: { onCreate: (name: string) => void }) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h2 className="font-pixel text-lg text-pixel-primary text-center">
            CREAR TU BABY
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-pixel text-xs text-pixel-text-muted mb-2">
                NOMBRE
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mi BitcoinBaby"
                maxLength={20}
              />
            </div>
            <Button type="submit" className="w-full" disabled={!name.trim()}>
              CREAR BABY
            </Button>
          </form>
          <p className="font-pixel text-[10px] text-pixel-text-muted text-center mt-4">
            Tu Baby minara $BABY tokens contigo!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Home() {
  // Game state
  const [evolutionData, setEvolutionData] = useState<{
    isOpen: boolean;
    fromStage: string;
    toStage: string;
    newLevel: number;
    stageName: string;
    miningBonus: number;
  } | null>(null);

  // Game event handler
  const handleGameEvent = useCallback((event: GameEvent) => {
    if (event.type === "evolved") {
      // Show evolution modal with data from the event
      setEvolutionData({
        isOpen: true,
        fromStage: event.data.fromStage,
        toStage: event.data.toStage,
        newLevel: event.data.newLevel,
        stageName: event.data.stageName,
        miningBonus: event.data.miningBonus,
      });
    }
  }, []);

  // Game loop hook
  const game = useGameLoop({
    autoStart: true,
    onEvent: handleGameEvent,
  });

  // Baby state derived values
  const babyState = useBabyState(game.baby);

  // Achievements
  const achievements = useAchievements({
    gameState: game.state,
  });

  // Mining hook
  const mining = useMining({
    difficulty: 16,
    minerAddress: "baby-miner-001",
  });

  // Wallet hook
  const wallet = useWallet();

  // Network store
  const { network, config } = useNetworkStore();

  // Token balance hook
  const tokenBalance = useTokenBalance({ address: wallet.wallet?.address });

  // Mining submitter hook - connects mining to blockchain
  const submitter = useMiningSubmitter({
    tokenTicker: "BABY",
    refreshInterval: 30000,
  });

  // Track last submitted share to avoid duplicates
  const lastSubmittedRef = useRef<string | null>(null);

  // Submission notification state
  const [submissionNotification, setSubmissionNotification] = useState<{
    type: "success" | "error" | "pending";
    message: string;
    txid?: string;
    reward?: bigint;
  } | null>(null);

  // Auto-dismiss submission notification
  useEffect(() => {
    if (submissionNotification) {
      const timer = setTimeout(() => {
        setSubmissionNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submissionNotification]);

  // Submit mining proofs to blockchain when shares are found
  useEffect(() => {
    const lastShare = mining.lastShare as MiningResult | null;

    // Skip if no share, wallet not ready, or submitter not ready
    if (!lastShare || wallet.isLocked || !submitter.isReady) {
      return;
    }

    // Skip if already submitted this share
    const shareKey = `${lastShare.hash}-${lastShare.nonce}`;
    if (lastSubmittedRef.current === shareKey) {
      return;
    }

    // Check if we can mine (have balance for fees)
    if (!submitter.canMine) {
      console.warn("[Mining] Insufficient balance for mining fees");
      setSubmissionNotification({
        type: "error",
        message: "Fondos insuficientes para fees de mineria",
      });
      return;
    }

    // Submit the proof to blockchain
    const submitToBlockchain = async () => {
      try {
        lastSubmittedRef.current = shareKey;
        const reward = submitter.calculateReward(lastShare.difficulty);

        // Show pending notification
        setSubmissionNotification({
          type: "pending",
          message: "Enviando prueba al blockchain...",
          reward,
        });

        const result = await submitter.submitProof({
          hash: lastShare.hash,
          nonce: lastShare.nonce,
          difficulty: lastShare.difficulty,
          blockData: lastShare.blockData || "",
          timestamp: lastShare.timestamp,
        });

        if (result.success && result.txid) {
          console.log("[Mining] Proof submitted and broadcast:", result.txid);
          // Add tokens to pending balance (will be confirmed when tx is mined)
          tokenBalance.addPendingTokens(reward);

          // Show success notification
          setSubmissionNotification({
            type: "success",
            message: "Transaccion enviada!",
            txid: result.txid,
            reward,
          });
        } else if (result.success && !result.txid) {
          // PSBT created but not broadcast (wallet locked during process)
          console.log("[Mining] PSBT created, awaiting signature");
          setSubmissionNotification({
            type: "pending",
            message: "PSBT creado, desbloquea wallet para firmar",
            reward,
          });
        } else {
          console.error("[Mining] Submission failed:", result.error);
          // Allow retry on next share
          lastSubmittedRef.current = null;
          setSubmissionNotification({
            type: "error",
            message: result.error || "Error al enviar prueba",
          });
        }
      } catch (error) {
        console.error("[Mining] Submission error:", error);
        lastSubmittedRef.current = null;
        setSubmissionNotification({
          type: "error",
          message: error instanceof Error ? error.message : "Error desconocido",
        });
      }
    };

    submitToBlockchain();
  }, [
    mining.lastShare,
    wallet.isLocked,
    submitter.isReady,
    submitter.canMine,
    submitter.submitProof,
    submitter.calculateReward,
    tokenBalance.addPendingTokens,
  ]);

  // Sync mining state with game
  useEffect(() => {
    if (game.baby && !game.isDead) {
      game.setMining(mining.isRunning);
    }
  }, [mining.isRunning, game.baby, game.isDead, game.setMining]);

  // Record mining progress
  useEffect(() => {
    if (mining.shares > 0 && game.baby && !game.isDead) {
      game.recordMiningProgress(mining.totalHashes, mining.shares);
    }
  }, [
    mining.shares,
    mining.totalHashes,
    game.baby,
    game.isDead,
    game.recordMiningProgress,
  ]);

  // Handle actions
  const handleAction = (action: GameAction) => {
    if (action === "mine") {
      mining.toggle();
    } else {
      game.performAction(action);
    }
  };

  // Loading state
  if (game.isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">⛏️</div>
          <p className="font-pixel text-pixel-text-muted">Cargando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pixel-primary border-2 border-black flex items-center justify-center">
              <span className="font-pixel text-pixel-text-dark text-xs">B</span>
            </div>
            <h1 className="font-pixel text-lg md:text-xl text-pixel-primary">
              BITCOIN<span className="text-pixel-secondary">BABY</span>
            </h1>
          </div>

          <nav className="flex items-center gap-2">
            {/* Network Badge */}
            <NetworkBadge network={network} />

            <a
              href="/mine"
              className="px-3 py-2 font-pixel text-[8px] text-pixel-primary hover:text-pixel-secondary transition-colors"
            >
              MINE
            </a>

            <a
              href="/nfts"
              className="px-3 py-2 font-pixel text-[8px] text-pixel-text-muted hover:text-pixel-primary transition-colors"
            >
              NFTS
            </a>

            <a
              href="/leaderboard"
              className="px-3 py-2 font-pixel text-[8px] text-pixel-text-muted hover:text-pixel-primary transition-colors"
            >
              LEADERBOARD
            </a>

            <a
              href="/characters"
              className="px-3 py-2 font-pixel text-[8px] text-pixel-text-muted hover:text-pixel-primary transition-colors"
            >
              CHARS
            </a>

            {/* Wallet Status */}
            {wallet.wallet ? (
              <WalletStatusCompact
                address={wallet.wallet.address}
                isLocked={wallet.isLocked}
                onClick={() => (window.location.href = "/wallet")}
              />
            ) : (
              <a
                href="/wallet"
                className="px-3 py-2 font-pixel text-[8px] bg-pixel-primary text-pixel-text-dark border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#000] transition-all"
              >
                CONNECT
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      {!game.baby ? (
        <div className="max-w-4xl mx-auto">
          <CreateBabyForm onCreate={game.createBaby} />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Left: Baby Display */}
          <div className="flex flex-col items-center">
            {/* Baby Card */}
            <div className="bg-pixel-bg-medium border-4 border-pixel-border p-8 shadow-[8px_8px_0_0_#000] w-full max-w-sm">
              {/* Name & Stage */}
              <div className="flex justify-between items-center mb-4">
                <span className="font-pixel text-sm text-pixel-primary">
                  {game.baby.name}
                </span>
                <span className="font-pixel text-[10px] text-pixel-text-muted">
                  {babyState?.visualState.toUpperCase() || "IDLE"}
                </span>
              </div>

              {/* Baby Sprite */}
              <div className="flex justify-center mb-6">
                <LevelSprite
                  level={babyState?.level || 1}
                  state={babyState?.visualState || "idle"}
                  size={192}
                />
              </div>

              {/* Stats HUD */}
              {babyState && (
                <GameHUD
                  stats={{
                    energy: babyState.energy,
                    happiness: babyState.happiness,
                    hunger: babyState.hunger,
                    health: babyState.health,
                  }}
                  progression={{
                    level: babyState.level,
                    xp: babyState.xp,
                    xpToNextLevel: babyState.xpToNextLevel,
                    stageName: babyState.stageName,
                  }}
                  isMining={babyState.isMining}
                  miningBonus={babyState.miningBonus}
                  daysUntilDecay={game.daysUntilDecay ?? undefined}
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 w-full max-w-sm">
              <ActionButtons
                onAction={handleAction}
                isSleeping={babyState?.isSleeping}
                isMining={mining.isRunning}
                disabled={game.isDead}
                energy={babyState?.energy}
              />
            </div>
          </div>

          {/* Right: Mining Panel */}
          <div className="space-y-6">
            {/* Mining Stats */}
            <MiningStats
              hashrate={mining.hashrate}
              effectiveHashrate={mining.effectiveHashrate}
              nftBoost={mining.nftBoost}
              isActive={mining.isRunning}
            />

            {/* Mining Control */}
            <button
              onClick={mining.toggle}
              disabled={game.isDead || babyState?.isSleeping}
              className={`w-full py-4 font-pixel text-sm border-4 border-black shadow-[4px_4px_0_0_#000] transition-all
                ${
                  mining.isRunning
                    ? "bg-pixel-error text-white hover:bg-pixel-error-dark"
                    : "bg-pixel-success text-pixel-text-dark hover:bg-pixel-success-dark"
                }
                active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000]
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {mining.isRunning ? "STOP MINING" : "START MINING"}
            </button>

            {/* Mining Info Card */}
            <div className="bg-pixel-bg-medium border-4 border-pixel-border p-4 shadow-[8px_8px_0_0_#000]">
              <h3 className="font-pixel text-xs text-pixel-primary mb-4">
                MINING INFO
              </h3>

              <div className="space-y-3 font-pixel-body text-sm">
                <div className="flex justify-between">
                  <span className="text-pixel-text-muted">Worker</span>
                  <span className="text-pixel-text font-pixel-mono">
                    {mining.minerType?.toUpperCase() || "CPU"}-1
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pixel-text-muted">Difficulty</span>
                  <span className="text-pixel-text font-pixel-mono">
                    {mining.difficulty}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pixel-text-muted">Total Hashes</span>
                  <span className="text-pixel-text font-pixel-mono">
                    {mining.totalHashes.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pixel-text-muted">Shares</span>
                  <span className="text-pixel-success font-pixel-mono">
                    {mining.shares}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pixel-text-muted">$BABY Balance</span>
                  <span className="text-pixel-primary font-pixel-mono">
                    {formatTokenBalance(tokenBalance.balance)}
                  </span>
                </div>
                {babyState && babyState.miningBonus > 1 && (
                  <div className="flex justify-between">
                    <span className="text-pixel-text-muted">Mining Bonus</span>
                    <span className="text-pixel-success font-pixel-mono">
                      {babyState.miningBonusDisplay}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Blockchain Submissions Panel */}
            {wallet.wallet && (
              <MiningRewardPanel
                canMine={submitter.canMine}
                btcBalance={submitter.balance}
                pendingRewards={submitter.pendingRewards}
                confirmedRewards={submitter.confirmedRewards}
                submissions={submitter.pendingSubmissions.map((sub) => ({
                  id: sub.id,
                  hash: sub.hash,
                  reward: submitter.calculateReward(sub.difficulty),
                  status: sub.status as
                    | "pending"
                    | "submitted"
                    | "confirmed"
                    | "failed"
                    | "expired",
                  txid: sub.txid,
                }))}
                feeEstimates={submitter.feeEstimates ?? undefined}
                isLoading={submitter.isLoading}
                isSubmitting={submitter.isSubmitting}
                error={submitter.error}
                network={network}
                getTxUrl={(txid) => `${config.explorerUrl}/tx/${txid}`}
              />
            )}

            {/* Wallet Required Warning */}
            {!wallet.wallet && (
              <div className="bg-pixel-bg-medium border-4 border-pixel-warning p-4">
                <p className="font-pixel text-[10px] text-pixel-warning text-center">
                  Conecta tu wallet para recibir $BABY en Bitcoin
                </p>
                <a
                  href="/wallet"
                  className="block mt-3 text-center font-pixel text-[10px] text-pixel-primary underline"
                >
                  Crear/Conectar Wallet
                </a>
              </div>
            )}

            {/* Achievement Progress */}
            <div className="bg-pixel-bg-light border-4 border-pixel-border p-4">
              <h3 className="font-pixel text-xs text-pixel-primary mb-2">
                LOGROS
              </h3>
              <div className="flex justify-between items-center">
                <span className="font-pixel text-[10px] text-pixel-text-muted">
                  {achievements.unlockedAchievements.length}/
                  {achievements.totalAchievements}
                </span>
                <div className="flex gap-1">
                  {achievements.unlockedAchievements.slice(-5).map((a) => (
                    <span key={a.id} className="text-lg" title={a.name}>
                      {a.icon}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Popup */}
      {achievements.notification && (
        <AchievementPopup
          achievement={{
            id: achievements.notification.achievement.id,
            name: achievements.notification.achievement.name,
            description: achievements.notification.achievement.description,
            icon: achievements.notification.achievement.icon,
            xpReward: achievements.notification.achievement.reward.xp,
          }}
          onDismiss={achievements.dismissNotification}
        />
      )}

      {/* Submission Notification Toast */}
      {submissionNotification && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-5">
          <div
            className={`
              p-4 border-4 border-black shadow-[4px_4px_0_0_#000]
              ${
                submissionNotification.type === "success"
                  ? "bg-pixel-success"
                  : submissionNotification.type === "error"
                    ? "bg-pixel-error"
                    : "bg-pixel-secondary"
              }
            `}
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="text-2xl">
                {submissionNotification.type === "success"
                  ? "+"
                  : submissionNotification.type === "error"
                    ? "!"
                    : "..."}
              </div>

              {/* Content */}
              <div>
                <p className="font-pixel text-[10px] text-pixel-text-dark">
                  {submissionNotification.message}
                </p>
                {submissionNotification.reward && (
                  <p className="font-pixel text-xs text-pixel-text-dark mt-1">
                    +{submissionNotification.reward.toString()} $BABY
                  </p>
                )}
                {submissionNotification.txid && (
                  <a
                    href={`${config.explorerUrl}/tx/${submissionNotification.txid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-pixel text-[8px] text-pixel-text-dark underline mt-1 block"
                  >
                    Ver TX: {submissionNotification.txid.slice(0, 8)}...
                  </a>
                )}
              </div>

              {/* Dismiss button */}
              <button
                onClick={() => setSubmissionNotification(null)}
                className="font-pixel text-pixel-text-dark text-lg hover:opacity-70"
              >
                X
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evolution Modal */}
      {evolutionData?.isOpen && (
        <EvolutionModal
          isOpen={evolutionData.isOpen}
          fromStage={evolutionData.fromStage}
          toStage={evolutionData.toStage}
          newLevel={evolutionData.newLevel}
          stageName={evolutionData.stageName}
          miningBonus={evolutionData.miningBonus}
          onComplete={() => setEvolutionData(null)}
        />
      )}

      {/* Death Modal */}
      <DeathModal
        isOpen={game.isDead}
        babyName={game.baby?.name || "Baby"}
        onRevive={game.revive}
      />

      {/* Footer */}
      <footer className="max-w-4xl mx-auto mt-12 pt-6 border-t-2 border-pixel-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-pixel-body text-sm text-pixel-text-muted">
            Built on Bitcoin with Charms Protocol
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="font-pixel text-[8px] text-pixel-text-muted hover:text-pixel-primary"
            >
              DOCS
            </a>
            <a
              href="#"
              className="font-pixel text-[8px] text-pixel-text-muted hover:text-pixel-primary"
            >
              GITHUB
            </a>
            <a
              href="#"
              className="font-pixel text-[8px] text-pixel-text-muted hover:text-pixel-primary"
            >
              DISCORD
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
