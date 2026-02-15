import { clsx } from 'clsx';

/**
 * PixelProgress - Barra de progreso estilo Pixel Art
 *
 * Perfecta para mostrar:
 * - Progreso de mining
 * - Experiencia del Baby
 * - Carga de modelos AI
 */

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'mining';
  showLabel?: boolean;
}

export function Progress({
  value,
  max = 100,
  variant = 'default',
  showLabel = false,
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const barColors = {
    default: 'bg-pixel-primary',
    success: 'bg-pixel-success',
    warning: 'bg-[#f59e0b]',
    error: 'bg-pixel-error',
    mining: 'bg-pixel-success animate-[pixel-pulse_1s_ease-in-out_infinite]',
  };

  return (
    <div className={clsx('relative', className)} {...props}>
      {/* Container */}
      <div
        className={clsx(
          'w-full h-6',
          'bg-pixel-bg-dark',
          'border-4 border-pixel-border',
          'overflow-hidden'
        )}
      >
        {/* Bar */}
        <div
          className={clsx(
            'h-full',
            barColors[variant],
            'transition-[width] duration-300',
            // Step animation for pixel feel
            '[transition-timing-function:steps(10)]'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-pixel-mono text-lg text-white drop-shadow-[2px_2px_0_#000]">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

// Alias
export { Progress as PixelProgress };
