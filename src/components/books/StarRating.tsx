import { Star } from "lucide-react";
import { useState } from "react";

import { faNum } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Read-only star display (supports fractional values). */
export function Stars({
  value,
  className,
  size = "sm",
}: {
  value: number;
  className?: string;
  size?: "xs" | "sm" | "md";
}) {
  const px = { xs: "h-3.5 w-3.5", sm: "h-4 w-4", md: "h-5 w-5" }[size];
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${faNum(value.toFixed(1))} از ۵ ستاره`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className={cn("relative", px)}>
            <Star className={cn("absolute inset-0 fill-sage text-sage", px)} strokeWidth={0} />
            <span
              className="absolute inset-y-0 start-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star className={cn("fill-pomegranate text-pomegranate", px)} strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Interactive 1–5 rating, keyboard accessible as a radio group. */
export function StarInput({
  value,
  onChange,
  label,
  size = "lg",
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  size?: "md" | "lg";
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  const px = size === "lg" ? "h-9 w-9" : "h-7 w-7";
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex items-center gap-0.5"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${faNum(i)} ستاره`}
          tabIndex={value === i || (value === 0 && i === 1) ? 0 : -1}
          onMouseEnter={() => setHover(i)}
          onClick={() => onChange(i)}
          onKeyDown={(e) => {
            // RTL: ArrowLeft moves "forward"
            if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
              e.preventDefault();
              onChange(Math.min(5, (value || 0) + 1));
            } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
              e.preventDefault();
              onChange(Math.max(1, (value || 1) - 1));
            }
          }}
          className="tap inline-flex items-center justify-center rounded-lg transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              px,
              "transition-colors",
              i <= shown ? "fill-pomegranate text-pomegranate" : "fill-sage/60 text-sage",
            )}
            strokeWidth={0}
          />
        </button>
      ))}
    </div>
  );
}
