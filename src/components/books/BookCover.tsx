import type { Book } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Motif } from "@/components/brand/doodles";

/** Generated placeholder covers — palette-colored, title typeset, tiny doodle. No real cover art. */
const PALETTES = [
  { bg: "bg-pomegranate", fg: "text-cream", accent: "text-straw", frame: "border-cream/30" },
  { bg: "bg-olive-dark", fg: "text-cream", accent: "text-sage", frame: "border-sage/40" },
  { bg: "bg-straw", fg: "text-night", accent: "text-pomegranate", frame: "border-pomegranate/25" },
  { bg: "bg-night", fg: "text-straw", accent: "text-rose", frame: "border-straw/25" },
  { bg: "bg-olive", fg: "text-cream", accent: "text-straw", frame: "border-cream/35" },
  { bg: "bg-rose", fg: "text-cream", accent: "text-straw", frame: "border-cream/35" },
];

const SIZES = {
  xs: "w-12",
  sm: "w-20",
  md: "w-28",
  lg: "w-36 sm:w-44",
  xl: "w-44 sm:w-52",
};

export function BookCover({
  book,
  size = "md",
  className,
}: {
  book: Pick<Book, "titleFa" | "authorFa" | "cover">;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const p = PALETTES[book.cover.palette % PALETTES.length] ?? PALETTES[0]!;
  const tiny = size === "xs";
  return (
    <div
      role="img"
      aria-label={`جلد کتاب ${book.titleFa}`}
      className={cn(
        "@container relative aspect-[2/3] shrink-0 overflow-hidden rounded-lg shadow-card",
        p.bg,
        p.fg,
        SIZES[size],
        className,
      )}
    >
      {/* paper grain + light */}
      <div className="pointer-events-none absolute inset-0 bg-[image:var(--paper-grain)] opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cream/15 via-transparent to-night/20" />
      {/* spine on the start edge (Persian books bind on the right) */}
      <div className="pointer-events-none absolute inset-y-0 start-0 w-[7%] bg-night/20" />
      {!tiny && (
        <div
          className={cn(
            "absolute inset-[7%] start-[12%] flex flex-col items-center justify-between rounded-[4px] border py-[10%] text-center",
            p.frame,
          )}
        >
          <Motif kind={book.cover.motif} className={cn("h-[18cqw] w-[18cqw]", p.accent)} />
          <span className="line-clamp-4 px-[6%] text-[13cqw] font-extrabold leading-[1.35] text-balance">
            {book.titleFa}
          </span>
          <span className="line-clamp-2 px-[6%] text-[8.5cqw] font-medium leading-snug opacity-85">
            {book.authorFa}
          </span>
        </div>
      )}
      {tiny && (
        <div className="absolute inset-0 flex items-center justify-center ps-[7%]">
          <Motif kind={book.cover.motif} className={cn("h-[40%] w-[40%]", p.accent)} />
        </div>
      )}
    </div>
  );
}
