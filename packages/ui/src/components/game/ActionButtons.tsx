/**
 * ActionButtons - Game Action Controls
 *
 * Buttons for interacting with your BitcoinBaby:
 * - Feed, Play, Sleep, Learn, Mine
 */

import { type FC } from "react";
import { clsx } from "clsx";
import { Button } from "../button";
import { PixelIcon, type IconName } from "../sprites";

export type GameAction = "feed" | "play" | "sleep" | "wake" | "learn" | "mine";

interface ActionButtonsProps {
  onAction: (action: GameAction) => void;
  isSleeping?: boolean;
  isMining?: boolean;
  disabled?: boolean;
  energy?: number;
  className?: string;
}

interface ActionConfig {
  action: GameAction;
  icon: IconName;
  label: string;
  variant: "default" | "secondary" | "outline";
  disabledIf?: (props: ActionButtonsProps) => boolean;
}

const ACTIONS: ActionConfig[] = [
  {
    action: "feed",
    icon: "food",
    label: "FEED",
    variant: "default",
    disabledIf: (p) => p.isSleeping === true,
  },
  {
    action: "play",
    icon: "gamepad",
    label: "PLAY",
    variant: "secondary",
    disabledIf: (p) => p.isSleeping === true || (p.energy ?? 100) < 10,
  },
  {
    action: "learn",
    icon: "book",
    label: "LEARN",
    variant: "outline",
    disabledIf: (p) => p.isSleeping === true || (p.energy ?? 100) < 15,
  },
];

export const ActionButtons: FC<ActionButtonsProps> = (props) => {
  const {
    onAction,
    isSleeping = false,
    isMining = false,
    disabled = false,
    className,
  } = props;

  return (
    <div className={clsx("space-y-3", className)}>
      {/* Main Actions */}
      <div className="flex gap-2 justify-center flex-wrap">
        {ACTIONS.map((config) => {
          const isDisabled = disabled || config.disabledIf?.(props);

          return (
            <Button
              key={config.action}
              variant={config.variant}
              size="sm"
              disabled={isDisabled}
              onClick={() => onAction(config.action)}
              className="min-w-[80px]"
            >
              <PixelIcon name={config.icon} size={14} className="mr-1" />
              {config.label}
            </Button>
          );
        })}
      </div>

      {/* Sleep/Wake Toggle */}
      <div className="flex justify-center">
        <Button
          variant={isSleeping ? "default" : "outline"}
          size="sm"
          disabled={disabled || isMining}
          onClick={() => onAction(isSleeping ? "wake" : "sleep")}
          className="min-w-[100px]"
        >
          <PixelIcon
            name={isSleeping ? "sun" : "moon"}
            size={14}
            className="mr-1"
          />
          {isSleeping ? "WAKE" : "SLEEP"}
        </Button>
      </div>

      {/* Mine Button (Larger, prominent) */}
      <div className="flex justify-center">
        <Button
          variant={isMining ? "secondary" : "default"}
          size="lg"
          disabled={disabled || isSleeping}
          onClick={() => onAction("mine")}
          className={clsx("min-w-[140px]", isMining && "animate-pulse")}
        >
          <PixelIcon
            name="pickaxe"
            size={18}
            className="mr-2"
            animate={isMining}
          />
          {isMining ? "MINING..." : "MINE"}
        </Button>
      </div>

      {/* Helper text */}
      {isSleeping && (
        <p className="text-center font-pixel text-xs text-pixel-text-muted">
          Zzz... Baby está durmiendo
        </p>
      )}
    </div>
  );
};

export default ActionButtons;
