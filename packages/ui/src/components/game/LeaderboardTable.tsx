/**
 * LeaderboardTable - Pixel Art Leaderboard Display
 *
 * Displays ranking data in a retro pixel art style table.
 * Features: rank highlighting, badges, loading/empty states.
 */

import { type FC } from "react";
import { clsx } from "clsx";

export interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName?: string;
  score: number;
  badge?: LeaderboardBadge;
  isCurrentUser: boolean;
}

export type LeaderboardBadge =
  | "whale"
  | "diamond"
  | "gold"
  | "silver"
  | "bronze"
  | "newbie"
  | "veteran";

export type LeaderboardCategory = "miners" | "babies" | "earners";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  category: LeaderboardCategory;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (entry: LeaderboardEntry) => void;
  className?: string;
  formatScore?: (score: number, category: LeaderboardCategory) => string;
  truncateAddress?: (address: string, chars?: number) => string;
}

/**
 * Get badge display info
 */
function getBadgeInfo(badge?: LeaderboardBadge): {
  emoji: string;
  label: string;
  color: string;
} | null {
  if (!badge) return null;

  const badges: Record<
    LeaderboardBadge,
    { emoji: string; label: string; color: string }
  > = {
    whale: { emoji: "W", label: "Whale", color: "bg-pixel-secondary" },
    diamond: {
      emoji: "D",
      label: "Diamond",
      color: "bg-pixel-secondary-light",
    },
    gold: { emoji: "G", label: "Gold", color: "bg-pixel-primary" },
    silver: { emoji: "S", label: "Silver", color: "bg-pixel-text-muted" },
    bronze: { emoji: "B", label: "Bronze", color: "bg-pixel-primary-dark" },
    newbie: { emoji: "N", label: "Newbie", color: "bg-pixel-success" },
    veteran: { emoji: "V", label: "Veteran", color: "bg-pixel-primary-light" },
  };

  return badges[badge];
}

/**
 * Default score formatter
 */
function defaultFormatScore(
  score: number,
  category: LeaderboardCategory,
): string {
  if (category === "babies") {
    return `Lv.${score}`;
  }

  if (score >= 1e12) {
    return `${(score / 1e12).toFixed(2)}T`;
  }
  if (score >= 1e9) {
    return `${(score / 1e9).toFixed(2)}B`;
  }
  if (score >= 1e6) {
    return `${(score / 1e6).toFixed(2)}M`;
  }
  if (score >= 1e3) {
    return `${(score / 1e3).toFixed(2)}K`;
  }
  return score.toLocaleString();
}

/**
 * Default address truncator
 */
function defaultTruncateAddress(address: string, chars: number = 6): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Get rank display style
 */
function getRankStyle(rank: number): string {
  if (rank === 1) return "text-pixel-primary font-pixel";
  if (rank === 2) return "text-pixel-text-muted font-pixel";
  if (rank === 3) return "text-pixel-primary-dark font-pixel";
  return "text-pixel-text font-pixel-mono";
}

/**
 * Get rank medal emoji
 */
function getRankMedal(rank: number): string | null {
  if (rank === 1) return "1ST";
  if (rank === 2) return "2ND";
  if (rank === 3) return "3RD";
  return null;
}

/**
 * Loading skeleton row
 */
const SkeletonRow: FC = () => (
  <tr className="border-b-2 border-pixel-border animate-pulse">
    <td className="px-2 py-3">
      <div className="w-8 h-4 bg-pixel-border" />
    </td>
    <td className="px-2 py-3">
      <div className="w-24 h-4 bg-pixel-border" />
    </td>
    <td className="px-2 py-3">
      <div className="w-16 h-4 bg-pixel-border" />
    </td>
    <td className="px-2 py-3">
      <div className="w-6 h-6 bg-pixel-border" />
    </td>
  </tr>
);

/**
 * Category labels
 */
const categoryLabels: Record<LeaderboardCategory, string> = {
  miners: "HASHES",
  babies: "LEVEL",
  earners: "$BABY",
};

export const LeaderboardTable: FC<LeaderboardTableProps> = ({
  entries,
  category,
  isLoading = false,
  emptyMessage = "No data available",
  onRowClick,
  className,
  formatScore = defaultFormatScore,
  truncateAddress = defaultTruncateAddress,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div
        className={clsx(
          "bg-pixel-bg-medium border-4 border-pixel-border",
          "shadow-[8px_8px_0_0_#000]",
          className,
        )}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b-4 border-pixel-border bg-pixel-bg-dark">
              <th className="px-2 py-3 text-left font-pixel text-xs text-pixel-text-muted">
                #
              </th>
              <th className="px-2 py-3 text-left font-pixel text-xs text-pixel-text-muted">
                PLAYER
              </th>
              <th className="px-2 py-3 text-right font-pixel text-xs text-pixel-text-muted">
                {categoryLabels[category]}
              </th>
              <th className="px-2 py-3 text-center font-pixel text-xs text-pixel-text-muted w-12">
                RANK
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state
  if (entries.length === 0) {
    return (
      <div
        className={clsx(
          "bg-pixel-bg-medium border-4 border-pixel-border p-8",
          "shadow-[8px_8px_0_0_#000] text-center",
          className,
        )}
      >
        <div className="text-4xl mb-4">-</div>
        <p className="font-pixel text-xs text-pixel-text-muted">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "bg-pixel-bg-medium border-4 border-pixel-border",
        "shadow-[8px_8px_0_0_#000] overflow-hidden",
        className,
      )}
    >
      <table className="w-full">
        <thead>
          <tr className="border-b-4 border-pixel-border bg-pixel-bg-dark">
            <th className="px-2 py-3 text-left font-pixel text-xs text-pixel-text-muted">
              #
            </th>
            <th className="px-2 py-3 text-left font-pixel text-xs text-pixel-text-muted">
              PLAYER
            </th>
            <th className="px-2 py-3 text-right font-pixel text-xs text-pixel-text-muted">
              {categoryLabels[category]}
            </th>
            <th className="px-2 py-3 text-center font-pixel text-xs text-pixel-text-muted w-12">
              RANK
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const badgeInfo = getBadgeInfo(entry.badge);
            const rankMedal = getRankMedal(entry.rank);

            return (
              <tr
                key={`${entry.address}-${entry.rank}`}
                onClick={() => onRowClick?.(entry)}
                className={clsx(
                  "border-b-2 border-pixel-border transition-colors",
                  entry.isCurrentUser
                    ? "bg-pixel-primary/20 border-pixel-primary"
                    : "hover:bg-pixel-bg-light",
                  onRowClick && "cursor-pointer",
                )}
              >
                {/* Rank */}
                <td className="px-2 py-3">
                  <span className={getRankStyle(entry.rank)}>
                    {rankMedal || entry.rank}
                  </span>
                </td>

                {/* Player */}
                <td className="px-2 py-3">
                  <div className="flex items-center gap-2">
                    {entry.isCurrentUser && (
                      <span className="w-2 h-2 bg-pixel-primary animate-pulse" />
                    )}
                    <div>
                      {entry.displayName ? (
                        <>
                          <div className="font-pixel text-xs text-pixel-text">
                            {entry.displayName}
                          </div>
                          <div className="font-pixel-mono text-[10px] text-pixel-text-muted">
                            {truncateAddress(entry.address, 4)}
                          </div>
                        </>
                      ) : (
                        <div className="font-pixel-mono text-xs text-pixel-text">
                          {truncateAddress(entry.address)}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Score */}
                <td className="px-2 py-3 text-right">
                  <span
                    className={clsx(
                      "font-pixel-mono text-sm",
                      entry.isCurrentUser
                        ? "text-pixel-primary"
                        : "text-pixel-success",
                    )}
                  >
                    {formatScore(entry.score, category)}
                  </span>
                </td>

                {/* Badge */}
                <td className="px-2 py-3 text-center">
                  {badgeInfo && (
                    <span
                      className={clsx(
                        "inline-flex items-center justify-center",
                        "w-6 h-6 font-pixel text-[8px]",
                        "border-2 border-black text-pixel-text-dark",
                        badgeInfo.color,
                      )}
                      title={badgeInfo.label}
                    >
                      {badgeInfo.emoji}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Leaderboard pagination component
 */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const LeaderboardPagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible);

  if (end - start < maxVisible) {
    start = Math.max(0, end - maxVisible);
  }

  for (let i = start; i < end; i++) {
    pages.push(i);
  }

  return (
    <div className={clsx("flex items-center justify-center gap-2", className)}>
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={clsx(
          "px-3 py-2 font-pixel text-xs",
          "border-2 border-black shadow-[2px_2px_0_0_#000]",
          "transition-all",
          currentPage === 0
            ? "bg-pixel-border text-pixel-text-muted cursor-not-allowed"
            : "bg-pixel-bg-light text-pixel-text hover:bg-pixel-bg-medium active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000]",
        )}
      >
        {"<"}
      </button>

      {/* Page numbers */}
      {start > 0 && (
        <>
          <button
            onClick={() => onPageChange(0)}
            className="px-3 py-2 font-pixel text-xs bg-pixel-bg-light text-pixel-text border-2 border-black shadow-[2px_2px_0_0_#000] hover:bg-pixel-bg-medium"
          >
            1
          </button>
          {start > 1 && (
            <span className="font-pixel text-xs text-pixel-text-muted">
              ...
            </span>
          )}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={clsx(
            "px-3 py-2 font-pixel text-xs",
            "border-2 border-black shadow-[2px_2px_0_0_#000]",
            "transition-all",
            page === currentPage
              ? "bg-pixel-primary text-pixel-text-dark"
              : "bg-pixel-bg-light text-pixel-text hover:bg-pixel-bg-medium active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000]",
          )}
        >
          {page + 1}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="font-pixel text-xs text-pixel-text-muted">
              ...
            </span>
          )}
          <button
            onClick={() => onPageChange(totalPages - 1)}
            className="px-3 py-2 font-pixel text-xs bg-pixel-bg-light text-pixel-text border-2 border-black shadow-[2px_2px_0_0_#000] hover:bg-pixel-bg-medium"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className={clsx(
          "px-3 py-2 font-pixel text-xs",
          "border-2 border-black shadow-[2px_2px_0_0_#000]",
          "transition-all",
          currentPage === totalPages - 1
            ? "bg-pixel-border text-pixel-text-muted cursor-not-allowed"
            : "bg-pixel-bg-light text-pixel-text hover:bg-pixel-bg-medium active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000]",
        )}
      >
        {">"}
      </button>
    </div>
  );
};

/**
 * User rank summary card
 */
interface UserRankSummaryProps {
  rank: number;
  totalPlayers: number;
  score: number;
  category: LeaderboardCategory;
  formatScore?: (score: number, category: LeaderboardCategory) => string;
  className?: string;
}

export const UserRankSummary: FC<UserRankSummaryProps> = ({
  rank,
  totalPlayers,
  score,
  category,
  formatScore = defaultFormatScore,
  className,
}) => {
  const percentile =
    rank > 0 ? Math.round(((totalPlayers - rank + 1) / totalPlayers) * 100) : 0;

  return (
    <div
      className={clsx(
        "bg-pixel-bg-medium border-4 border-pixel-primary p-4",
        "shadow-[8px_8px_0_0_#000]",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-pixel text-xs text-pixel-text-muted mb-1">
            YOUR RANK
          </div>
          <div className="font-pixel text-2xl text-pixel-primary">
            {rank > 0 ? `#${rank}` : "---"}
          </div>
        </div>

        <div className="text-right">
          <div className="font-pixel text-xs text-pixel-text-muted mb-1">
            SCORE
          </div>
          <div className="font-pixel-mono text-lg text-pixel-success">
            {formatScore(score, category)}
          </div>
        </div>

        {rank > 0 && (
          <div className="text-right">
            <div className="font-pixel text-xs text-pixel-text-muted mb-1">
              TOP
            </div>
            <div className="font-pixel text-lg text-pixel-secondary">
              {percentile}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardTable;
