import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <motion.div
        className={cn(
          'border-4 border-muted rounded-full border-t-primary',
          sizeStyles[size]
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.h1
          className="text-6xl font-display text-gradient mb-6"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          MATRIX GYM
        </motion.h1>
        <LoadingSpinner size="lg" />
      </motion.div>
    </div>
  );
}
