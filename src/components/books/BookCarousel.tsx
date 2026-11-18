import type { Book } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { BookCard } from "./BookCard";

export function BookCarousel({
  books,
  loading,
  label,
}: {
  books?: Book[] | undefined;
  loading?: boolean | undefined;
  label: string;
}) {
  return (
    <div
      role="list"
      aria-label={label}
      className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 lg:-mx-2 lg:px-2"
    >
      {loading || !books
        ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-28 shrink-0 space-y-2 p-1">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="h-3.5 w-4/5" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        : books.map((b) => (
            <div role="listitem" key={b.id} className="snap-start">
              <BookCard book={b} />
            </div>
          ))}
    </div>
  );
}
