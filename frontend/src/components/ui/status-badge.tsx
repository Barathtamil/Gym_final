import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-success/20 text-success border-success/30',
  warning: 'bg-warning/20 text-warning border-warning/30',
  danger: 'bg-destructive/20 text-destructive border-destructive/30',
  info: 'bg-secondary/20 text-secondary border-secondary/30',
  default: 'bg-muted text-muted-foreground border-border',
};

export function StatusBadge({ variant, children, pulse }: StatusBadgeProps) {
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border',
        variantStyles[variant],
        pulse && 'animate-pulse'
      )}
    >
      {(variant === 'success' || variant === 'danger') && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'success' ? 'bg-success' : 'bg-destructive'
          )}
        />
      )}
      {children}
    </motion.span>
  );
}
