import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold cursor-pointer select-none transition-all duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pomegranate disabled:pointer-events-none disabled:opacity-55 [&_svg]:pointer-events-none [&_svg]:size-[1.15em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:bg-night hover:shadow-card",
        secondary: "bg-straw text-night border border-border hover:bg-sage/40",
        outline:
          "border border-pomegranate/40 bg-transparent text-pomegranate hover:bg-pomegranate/8 hover:border-pomegranate",
        ghost: "text-night hover:bg-straw/80",
        olive: "bg-olive-dark text-cream hover:bg-olive shadow-soft",
        soft: "bg-pomegranate/10 text-pomegranate hover:bg-pomegranate/15",
        destructive: "bg-rose text-cream hover:bg-rose/90",
        link: "text-pomegranate underline-offset-4 hover:underline hover:text-olive",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-10 px-3.5 text-[0.8rem]",
        lg: "h-12 px-7 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
