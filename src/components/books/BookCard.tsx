import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import type { Book } from "@/lib/api";
import { faDecimal } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BookCover } from "./BookCover";
import { Stars } from "./StarRating";

/** Vertical cover + title card used in carousels and grids. */
export function BookCard({
  book,
  className,
  size = "md",
}: {
  book: Book;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <Link
      to="/book/$id"
      params={{ id: book.id }}
      className={cn(
        "group flex shrink-0 flex-col gap-2 rounded-xl p-1 transition-transform hover:-translate-y-0.5",
        size === "md" ? "w-28" : "w-20",
        className,
      )}
    >
      <BookCover book={book} size={size} className="transition-shadow group-hover:shadow-lift" />
      <span className="line-clamp-2 text-sm font-bold leading-6 text-night">{book.titleFa}</span>
      <span className="-mt-1.5 line-clamp-1 text-xs text-olive-dark">{book.authorFa}</span>
    </Link>
  );
}

/** Horizontal list row: cover, titles, author, rating, optional trailing actions. */
export function BookRowItem({
  book,
  title,
  titleEn,
  author,
  trailing,
  meta,
}: {
  book: Book;
  title?: ReactNode;
  titleEn?: ReactNode;
  author?: ReactNode;
  trailing?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="surface flex items-center gap-3 p-3">
      <Link to="/book/$id" params={{ id: book.id }} className="shrink-0 rounded-lg">
        <BookCover book={book} size="sm" className="w-16" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          to="/book/$id"
          params={{ id: book.id }}
          className="block font-bold leading-7 text-night hover:text-pomegranate"
        >
          {title ?? book.titleFa}
        </Link>
        <bdi dir="ltr" className="font-latin block truncate text-xs text-olive-dark/80">
          {titleEn ?? book.titleEn}
        </bdi>
        <div className="mt-0.5 text-sm text-olive-dark">{author ?? book.authorFa}</div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-olive-dark">
          <Stars value={book.avgRating} size="xs" />
          <span>{faDecimal(book.avgRating)}</span>
          {meta}
        </div>
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}
