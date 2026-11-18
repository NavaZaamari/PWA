import { cn } from "@/lib/utils";

/** Official Yoin logo image used consistently across the app. */
export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-9 w-9 rounded-lg",
    md: "h-11 w-11 rounded-xl",
    lg: "h-16 w-16 rounded-2xl",
  };

  return (
    <img
      src="/yoin-logo.png"
      alt="یوئین | Yoin"
      dir="ltr"
      className={cn("inline-block shrink-0 object-contain shadow-soft", sizes[size], className)}
      width={300}
      height={300}
    />
  );
}
