import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Stars } from "@/components/books/StarRating";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { Button } from "@/components/ui/button";
import { fa } from "@/i18n/fa";
import type { Review } from "@/lib/api";
import { jalaliDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ReviewCard({
  review,
  mine,
  onEdit,
  onDelete,
  heading,
}: {
  review: Review;
  mine?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  /** optional context line, e.g. the book title on the profile page */
  heading?: React.ReactNode;
}) {
  const [revealed, setRevealed] = useState(false);
  const hidden = review.spoiler && !revealed;
  const edited = review.updatedAt !== review.createdAt;

  return (
    <article
      className={cn(
        "rounded-2xl border bg-straw/70 p-4",
        mine ? "border-pomegranate/30" : "border-border",
      )}
    >
      {heading}
      <header className="flex items-center gap-3">
        <UserAvatar src={review.userAvatar} name={review.userName} className="h-10 w-10" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-bold text-night">{review.userName}</span>
            {mine && (
              <span className="rounded-full bg-pomegranate/10 px-2 text-[0.7rem] font-bold text-pomegranate">
                {fa.review.you}
              </span>
            )}
            {review.spoiler && (
              <span className="rounded-full bg-rose px-2 text-[0.7rem] font-bold text-cream">
                {fa.review.spoilerChip}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-olive-dark">
            <Stars value={review.rating} size="xs" />
            <time dateTime={review.createdAt}>{jalaliDate(review.createdAt)}</time>
            {edited && <span>· {fa.review.edited}</span>}
          </div>
        </div>
      </header>

      {review.text && (
        <div className="relative mt-3">
          <p
            className={cn(
              "whitespace-pre-line text-[0.95rem] leading-8 text-night transition-[filter] duration-300",
              hidden && "spoiler-blur",
            )}
            aria-hidden={hidden}
          >
            {review.text}
          </p>
          {hidden && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button variant="soft" size="sm" className="bg-cream shadow-soft" onClick={() => setRevealed(true)}>
                <Eye />
                {fa.review.revealSpoiler}
              </Button>
            </div>
          )}
        </div>
      )}

      {mine && (onEdit || onDelete) && (
        <div className="mt-3 flex justify-end gap-1">
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil />
              {fa.common.edit}
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" className="text-rose hover:text-rose" onClick={onDelete}>
              <Trash2 />
              {fa.common.delete}
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
