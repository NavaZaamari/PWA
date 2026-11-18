import { useMemo } from "react";

import { CatWithBook } from "@/components/brand/doodles";

const COLORS = ["bg-pomegranate", "bg-olive", "bg-rose", "bg-sage", "bg-straw", "bg-olive-dark"];

/** Doodle cat + palette confetti burst, shown when the yearly goal is reached. */
export function Celebration({ label, burst = true }: { label: string; burst?: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, i) => ({
        color: COLORS[i % COLORS.length],
        left: 50 + (Math.random() * 30 - 15),
        dx: `${Math.round(Math.random() * 220 - 110)}px`,
        dy: `${Math.round(Math.random() * 140 + 60)}px`,
        rot: `${Math.round(Math.random() * 540 - 270)}deg`,
        delay: Math.random() * 0.25,
        shape: i % 3 === 0 ? "rounded-full h-2 w-2" : "h-3 w-1.5 rounded-sm",
      })),
    [],
  );
  return (
    <div className="pointer-events-none relative flex flex-col items-center" role="status" aria-live="polite">
      <div className="absolute inset-x-0 top-0 h-0">
        {burst && pieces.map((p, i) => (
          <span
            key={i}
            className={`absolute top-6 ${p.color} ${p.shape} animate-confetti`}
            style={
              {
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                "--dx": p.dx,
                "--dy": p.dy,
                "--rot": p.rot,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <CatWithBook className="h-24 w-auto animate-float" />
      <p className="mt-1 text-sm font-bold text-olive">{label}</p>
    </div>
  );
}
