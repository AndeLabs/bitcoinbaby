"use client";

/**
 * BabySection - Main baby display and interaction
 *
 * Contains the core game loop:
 * - Baby sprite with status
 * - Stats HUD (energy, happiness, hunger, health)
 * - Action buttons (feed, play, sleep, mine)
 * - Mining stats and controls
 * - Achievements
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  useGlobalMining,
  useGameLoop,
  useAchievements,
  useNetworkStore,
  formatHashrate,
} from "@bitcoinbaby/core";
import { useBabyState } from "@/hooks/useBabyState";
import { useMiningSubmitter } from "@/hooks/useMiningSubmitter";
import { useWallet } from "@/hooks/useWallet";
import { useTokenBalance, formatTokenBalance } from "@/hooks/useTokenBalance";
import {
  LevelSprite,
  GameHUD,
  ActionButtons,
  AchievementPopup,
  EvolutionModal,
  DeathModal,
  MiningRewardPanel,
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

export function BabySection() {
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

  // Mining hook - uses global singleton (persistent across navigation)
  const mining = useGlobalMining({
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

    if (!lastShare || wallet.isLocked || !submitter.isReady) {
      return;
    }

    const shareKey = `${lastShare.hash}-${lastShare.nonce}`;
    if (lastSubmittedRef.current === shareKey) {
      return;
    }

    if (!submitter.canMine) {
      console.warn("[Mining] Insufficient balance for mining fees");
      setTimeout(() => {
        setSubmissionNotification({
          type: "error",
          message: "Fondos insuficientes para fees de mineria",
        });
      }, 0);
      return;
    }

    const submitToBlockchain = async () => {
      try {
        lastSubmittedRef.current = shareKey;
        const reward = submitter.calculateReward(lastShare.difficulty);

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
          tokenBalance.addPendingTokens(reward);

          setSubmissionNotification({
            type: "success",
            message: "Transaccion enviada!",
            txid: result.txid,
            reward,
          });
        } else if (result.success && !result.txid) {
          console.log("[Mining] PSBT created, awaiting signature");
          setSubmissionNotification({
            type: "pending",
            message: "PSBT creado, desbloquea wallet para firmar",
            reward,
          });
        } else {
          console.error("[Mining] Submission failed:", result.error);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mining.isRunning, game.baby, game.isDead, game.setMining]);

  // Record mining progress
  useEffect(() => {
    if (mining.shares > 0 && game.baby && !game.isDead) {
      game.recordMiningProgress(mining.totalHashes, mining.shares);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">⛏️</div>
          <p className="font-pixel text-pixel-text-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
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
              onClick={() => mining.toggle()}
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
                <p className="mt-3 text-center font-pixel text-[10px] text-pixel-primary">
                  Ve al tab Wallet para conectar
                </p>
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
              <div className="text-2xl">
                {submissionNotification.type === "success"
                  ? "+"
                  : submissionNotification.type === "error"
                    ? "!"
                    : "..."}
              </div>

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
    </div>
  );
}

export default BabySection;
