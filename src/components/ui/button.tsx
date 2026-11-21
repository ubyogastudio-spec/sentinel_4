import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground rounded-sm font-bold hover:brightness-110 active:scale-[0.97]',
        navCta:
          'text-foreground bg-nav-button hover:bg-nav-button/80 active:scale-[0.97] rounded-lg uppercase text-xs tracking-widest',
        hero:
          'bg-primary text-primary-foreground rounded-sm font-bold hover:brightness-110 active:scale-[0.97]',
        heroOutline:
          'border border-field-border bg-transparent text-foreground rounded-sm hover:border-foreground/60 hover:bg-secondary/60 active:scale-[0.97]',
        light:
          'bg-white text-background rounded-sm font-bold hover:brightness-90 active:scale-[0.97]',
        outline:
          'border border-field-border bg-hero-bg text-foreground rounded-md hover:border-[hsl(0_0%_60%)] hover:bg-secondary/40 active:scale-[0.97]',
        ghost:
          'text-muted-foreground hover:text-foreground hover:bg-secondary/40 rounded-md',
        link:
          'text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'min-h-11 px-6 py-3 text-sm',
        sm: 'min-h-11 px-4 py-2 text-xs',
        lg: 'min-h-11 px-6 py-3 text-sm',
        hero: 'min-h-11 px-6 py-3 md:px-8 md:py-4 text-sm',
        icon: 'h-11 w-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
  },
);
Button.displayName = 'Button';

export { buttonVariants };
