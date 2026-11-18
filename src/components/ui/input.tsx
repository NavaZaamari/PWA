import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-input bg-straw/70 px-4 text-base text-night transition-colors placeholder:text-olive-dark/60 focus-visible:outline-none focus-visible:border-pomegranate focus-visible:ring-2 focus-visible:ring-pomegranate/25 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-rose",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
