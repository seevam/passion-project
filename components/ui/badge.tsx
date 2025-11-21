import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-primary-100 text-primary-700 hover:bg-primary-200',
        secondary:
          'bg-secondary-100 text-secondary-700 hover:bg-secondary-200',
        accent:
          'bg-accent-100 text-accent-700 hover:bg-accent-200',
        danger:
          'bg-danger-100 text-danger-700 hover:bg-danger-200',
        outline: 'border-2 border-gray-300 text-gray-700',
        xp: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700',
        streak: 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
