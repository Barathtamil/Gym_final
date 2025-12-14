import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  prefix?: string;
  suffix?: string;
  delay?: number;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  prefix = '',
  suffix = '',
  delay = 0,
  variant = 'default',
}: KpiCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const variantStyles = {
    default: 'border-border hover:border-muted-foreground/30',
    primary: 'border-primary/30 hover:border-primary/60 hover:shadow-[0_0_30px_hsla(0,85%,55%,0.2)]',
    secondary: 'border-secondary/30 hover:border-secondary/60 hover:shadow-[0_0_30px_hsla(220,70%,55%,0.2)]',
    accent: 'border-accent/30 hover:border-accent/60 hover:shadow-[0_0_30px_hsla(200,100%,60%,0.2)]',
  };

  const iconStyles = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={cn(
        'glass-card p-6 border transition-all duration-300',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            {title}
          </p>
          <motion.p
            className="text-4xl font-display text-foreground tabular-nums"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
          >
            {prefix}
            {displayValue.toLocaleString()}
            {suffix}
          </motion.p>
          {trend && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.4 }}
              className={cn(
                'text-sm mt-2 flex items-center gap-1',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              {trend.value}% from last month
            </motion.p>
          )}
        </div>
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          className={cn(
            'p-3 rounded-xl bg-muted/50',
            iconStyles[variant]
          )}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
      </div>
    </motion.div>
  );
}
