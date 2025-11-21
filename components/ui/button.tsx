import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary-500 text-white shadow-duo hover:bg-primary-600 hover:shadow-duo-hover active:translate-y-1 active:shadow-none',
        secondary:
          'bg-secondary-500 text-white shadow-duo hover:bg-secondary-600 hover:shadow-duo-hover active:translate-y-1 active:shadow-none',
        accent:
          'bg-accent-500 text-white shadow-duo hover:bg-accent-600 hover:shadow-duo-hover active:translate-y-1 active:shadow-none',
        danger:
          'bg-danger-500 text-white shadow-duo hover:bg-danger-600 hover:shadow-duo-hover active:translate-y-1 active:shadow-none',
        outline:
          'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100',
        ghost: 'hover:bg-gray-100 active:bg-gray-200',
        link: 'text-primary-500 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-9 px-4 py-2 text-xs',
        lg: 'h-14 px-8 py-4 text-base',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
