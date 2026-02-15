import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

/**
 * PixelBadge - Badge estilo Pixel Art
 *
 * Usado para:
 * - Estado del Baby (sleeping, happy, etc.)
 * - Nivel del Baby
 * - Estado de mining
 * - Notificaciones
 */
const badgeVariants = cva(
  [
    'inline-flex items-center justify-center',
    'font-pixel text-[8px] uppercase',
    'px-2 py-1',
    'border-2 border-black',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-pixel-primary text-pixel-text-dark',
        secondary: 'bg-pixel-secondary text-pixel-text-dark',
        success: 'bg-pixel-success text-pixel-text-dark',
        error: 'bg-pixel-error text-white',
        warning: 'bg-[#f59e0b] text-pixel-text-dark',
        // Baby states
        sleeping: 'bg-[#6366f1] text-white',
        hungry: 'bg-[#f97316] text-white',
        happy: 'bg-[#fbbf24] text-pixel-text-dark',
        learning: 'bg-[#8b5cf6] text-white',
        evolving: 'bg-[#ec4899] text-white animate-[pixel-pulse_0.5s_ease-in-out_infinite]',
        // Mining states
        mining: 'bg-pixel-success text-pixel-text-dark animate-[pixel-blink_1s_steps(1)_infinite]',
        idle: 'bg-pixel-text-muted text-pixel-text-dark',
      },
      size: {
        default: 'text-[8px] px-2 py-1',
        sm: 'text-[6px] px-1 py-0.5',
        lg: 'text-[10px] px-3 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={clsx(badgeVariants({ variant, size }), className)} {...props} />
  );
}

// Alias
export { Badge as PixelBadge };
