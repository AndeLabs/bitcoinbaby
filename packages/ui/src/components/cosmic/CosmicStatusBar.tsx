"use client";

/**
 * CosmicStatusBar - Displays current cosmic conditions
 *
 * Shows moon phase, season, active events, and time until next event.
 * Updates in real-time based on astronomical data.
 */

import { type FC } from "react";
import { clsx } from "clsx";
import type { MoonData, SeasonData, CosmicEvent } from "@bitcoinbaby/core";

// Re-export for consumers
export type { MoonData, SeasonData, CosmicEvent };

export interface CosmicStatusBarProps {
  /** Current moon data */
  moon: MoonData | null;
  /** Current season data */
  season: SeasonData | null;
  /** Currently active cosmic event */
  currentEvent: CosmicEvent | null;
  /** Upcoming events */
  upcomingEvents: CosmicEvent[];
  /** Time until next event in ms */
  timeUntilNextEvent: number | null;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Error message */
  error?: string | null;
  /** Callback when refresh is requested */
  onRefresh?: () => void;
  /** Layout variant */
  variant?: "full" | "compact" | "minimal";
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format time remaining
 */
function formatTimeRemaining(ms: number): string {
  if (ms < 0) return "Now";

  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }

  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
}

/**
 * Moon Phase Badge
 */
const MoonPhaseBadge: FC<{ moon: MoonData }> = ({ moon }) => (
  <div
    className={clsx(
      "flex items-center gap-2 px-3 py-2",
      "border-2 border-black",
      "bg-[#1a1a2e]",
    )}
  >
    <span className="text-2xl">{moon.emoji}</span>
    <div className="flex flex-col">
      <span className="font-pixel text-[8px] text-pixel-text-muted uppercase">
        Moon Phase
      </span>
      <span className="font-pixel text-[10px] text-pixel-text">
        {capitalize(moon.phase)}
      </span>
      <span className="font-pixel text-[6px] text-pixel-secondary">
        {Math.round(moon.illumination * 100)}% Illuminated
      </span>
    </div>
  </div>
);

/**
 * Season Badge
 */
const SeasonBadge: FC<{ season: SeasonData }> = ({ season }) => (
  <div
    className={clsx(
      "flex items-center gap-2 px-3 py-2",
      "border-2 border-black",
      "bg-[#1a2e1a]",
    )}
  >
    <span className="text-2xl">{season.emoji}</span>
    <div className="flex flex-col">
      <span className="font-pixel text-[8px] text-pixel-text-muted uppercase">
        Season
      </span>
      <span className="font-pixel text-[10px] text-pixel-text">
        {capitalize(season.current)}
      </span>
      <span className="font-pixel text-[6px] text-pixel-success">
        {season.daysUntilNext} days to {capitalize(season.nextSeason)}
      </span>
    </div>
  </div>
);

/**
 * Active Event Banner
 */
const ActiveEventBanner: FC<{ event: CosmicEvent }> = ({ event }) => {
  const remaining = event.endTime.getTime() - Date.now();

  return (
    <div
      className={clsx(
        "flex items-center gap-3 px-4 py-2",
        "border-2 border-pixel-primary",
        "bg-pixel-primary/20",
        "animate-pulse",
      )}
    >
      <span className="text-3xl">{event.emoji}</span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-xs text-pixel-primary">
            {event.name}
          </span>
          <span className="font-pixel text-[8px] text-pixel-text-muted uppercase px-1 border border-pixel-primary">
            ACTIVE
          </span>
        </div>
        <span className="font-pixel text-[8px] text-pixel-text-muted">
          {event.description}
        </span>
      </div>
      <div className="text-right">
        <span className="font-pixel text-[8px] text-pixel-text-muted uppercase">
          Ends in
        </span>
        <div className="font-pixel text-[10px] text-pixel-secondary">
          {formatTimeRemaining(remaining)}
        </div>
      </div>
    </div>
  );
};

/**
 * Upcoming Events List
 */
const UpcomingEventsList: FC<{
  events: CosmicEvent[];
  timeUntilNext: number | null;
}> = ({ events, timeUntilNext }) => {
  if (events.length === 0) return null;

  return (
    <div className="space-y-1">
      <div className="font-pixel text-[8px] text-pixel-text-muted uppercase px-2">
        Upcoming Events
      </div>
      <div className="flex gap-2 px-2 overflow-x-auto">
        {events.slice(0, 3).map((event, index) => (
          <div
            key={event.id}
            className={clsx(
              "flex items-center gap-2 px-2 py-1",
              "border border-black",
              "bg-pixel-bg-light",
              "shrink-0",
            )}
          >
            <span className="text-lg">{event.emoji}</span>
            <div>
              <div className="font-pixel text-[8px] text-pixel-text">
                {event.name}
              </div>
              <div className="font-pixel text-[6px] text-pixel-text-muted">
                {index === 0 && timeUntilNext
                  ? `In ${formatTimeRemaining(timeUntilNext)}`
                  : event.startTime.toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Main CosmicStatusBar Component
 */
export const CosmicStatusBar: FC<CosmicStatusBarProps> = ({
  moon,
  season,
  currentEvent,
  upcomingEvents,
  timeUntilNextEvent,
  isLoading = false,
  error,
  onRefresh,
  variant = "full",
  className,
}) => {
  if (isLoading) {
    return (
      <div
        className={clsx(
          "border-4 border-black",
          "bg-pixel-bg-dark",
          "p-4",
          className,
        )}
      >
        <div className="font-pixel text-xs text-pixel-text-muted animate-pulse text-center">
          Loading cosmic data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={clsx(
          "border-4 border-black",
          "bg-pixel-bg-dark",
          "p-4",
          className,
        )}
      >
        <div className="font-pixel text-xs text-pixel-error text-center">
          {error}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="font-pixel text-[8px] text-pixel-secondary hover:underline mt-2 block mx-auto"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  // Minimal variant - just moon emoji and active event indicator
  if (variant === "minimal") {
    return (
      <div className={clsx("flex items-center gap-2", className)}>
        {moon && <span className="text-xl">{moon.emoji}</span>}
        {season && <span className="text-xl">{season.emoji}</span>}
        {currentEvent && (
          <span className="text-xl animate-pulse">{currentEvent.emoji}</span>
        )}
      </div>
    );
  }

  // Compact variant - horizontal strip
  if (variant === "compact") {
    return (
      <div
        className={clsx(
          "flex items-center gap-3 px-3 py-2",
          "border-2 border-black",
          "bg-pixel-bg-dark",
          className,
        )}
      >
        {moon && (
          <div className="flex items-center gap-1">
            <span className="text-lg">{moon.emoji}</span>
            <span className="font-pixel text-[8px] text-pixel-text">
              {Math.round(moon.illumination * 100)}%
            </span>
          </div>
        )}
        {season && (
          <div className="flex items-center gap-1">
            <span className="text-lg">{season.emoji}</span>
            <span className="font-pixel text-[8px] text-pixel-text">
              {capitalize(season.current)}
            </span>
          </div>
        )}
        {currentEvent && (
          <div className="flex items-center gap-1 px-2 border-l border-pixel-text-muted">
            <span className="text-lg animate-pulse">{currentEvent.emoji}</span>
            <span className="font-pixel text-[8px] text-pixel-primary">
              {currentEvent.name}
            </span>
          </div>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="ml-auto font-pixel text-[6px] text-pixel-text-muted hover:text-pixel-secondary"
          >
            Refresh
          </button>
        )}
      </div>
    );
  }

  // Full variant - complete status panel
  return (
    <div
      className={clsx(
        "border-4 border-black",
        "bg-pixel-bg-dark",
        "shadow-[4px_4px_0_0_#000]",
        className,
      )}
    >
      {/* Header */}
      <div
        className={clsx(
          "flex items-center justify-between",
          "px-3 py-2",
          "border-b-2 border-black",
          "bg-gradient-to-r from-[#1a1a2e] to-[#16213e]",
        )}
      >
        <h3 className="font-pixel text-[10px] text-pixel-text uppercase">
          Cosmic Status
        </h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="font-pixel text-[8px] text-pixel-text-muted hover:text-pixel-secondary"
          >
            Refresh
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Active Event */}
        {currentEvent && <ActiveEventBanner event={currentEvent} />}

        {/* Moon & Season Grid */}
        <div className="grid grid-cols-2 gap-2">
          {moon && <MoonPhaseBadge moon={moon} />}
          {season && <SeasonBadge season={season} />}
        </div>

        {/* Upcoming Events */}
        {!currentEvent && upcomingEvents.length > 0 && (
          <UpcomingEventsList
            events={upcomingEvents}
            timeUntilNext={timeUntilNextEvent}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Compact cosmic indicator for headers/navbars
 */
export const CosmicIndicator: FC<{
  moonEmoji: string;
  seasonEmoji: string;
  hasActiveEvent: boolean;
  eventEmoji?: string;
  onClick?: () => void;
  className?: string;
}> = ({
  moonEmoji,
  seasonEmoji,
  hasActiveEvent,
  eventEmoji,
  onClick,
  className,
}) => (
  <button
    onClick={onClick}
    className={clsx(
      "flex items-center gap-1 px-2 py-1",
      "border-2 border-black",
      "bg-pixel-bg-dark",
      "hover:bg-pixel-bg-light transition-colors",
      className,
    )}
  >
    <span className="text-sm">{moonEmoji}</span>
    <span className="text-sm">{seasonEmoji}</span>
    {hasActiveEvent && eventEmoji && (
      <span className="text-sm animate-pulse">{eventEmoji}</span>
    )}
  </button>
);

export default CosmicStatusBar;
