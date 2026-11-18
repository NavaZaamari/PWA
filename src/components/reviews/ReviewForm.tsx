import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { StarInput } from "@/components/books/StarRating";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useUpsertReview } from "@/hooks/api";
import { fa } from "@/i18n/fa";
import type { Review } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ReviewForm({
  uid,
  bookId,
  existing,
  onDone,
}: {
  uid: string;
  bookId: string;
  existing: Review | null;
  onDone?: () => void;
}) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [text, setText] = useState(existing?.text ?? "");
  const [spoiler, setSpoiler] = useState(existing?.spoiler ?? false);
  const [error, setError] = useState<string | null>(null);
  const upsert = useUpsertReview(uid);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return setError(fa.review.ratingRequired);
    setError(null);
    upsert.mutate(
      { bookId, rating, text, spoiler },
      {
        onSuccess: () => {
          toast.success(fa.review.saved);
          onDone?.();
        },
      },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-straw/60 p-4">
      <div>
        <div className="mb-1 text-sm font-semibold text-olive-dark">{fa.book.yourRating}</div>
        <StarInput value={rating} onChange={(v) => (setRating(v), setError(null))} label={fa.book.rateIt} />
        {error && (
          <p role="alert" className="mt-1 text-sm font-semibold text-rose">
            {error}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`review-${bookId}`} className="mb-1.5 block text-sm font-semibold text-olive-dark">
          {fa.review.label}
        </label>
        <Textarea
          id={`review-${bookId}`}
          dir="auto"
          value={text}
          maxLength={4000}
          onChange={(e) => setText(e.target.value)}
          placeholder={fa.review.placeholder}
          className="bg-cream/70"
        />
      </div>

      {/* Spoiler toggle — essential, so it gets its own clearly visible row */}
      <label
        htmlFor={`spoiler-${bookId}`}
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
          spoiler ? "border-rose bg-rose/10" : "border-border bg-cream/60",
        )}
      >
        <TriangleAlert className={cn("h-5 w-5 shrink-0", spoiler ? "text-rose" : "text-olive-dark")} aria-hidden />
        <span className="flex-1">
          <span className="block font-bold text-night">
            {fa.review.spoiler}{" "}
            <bdi lang="en" className="font-latin text-xs font-semibold text-rose">
              {fa.review.spoilerAlert}
            </bdi>
          </span>
          <span className="block text-xs text-olive-dark">{fa.review.spoilerHint}</span>
        </span>
        <Switch id={`spoiler-${bookId}`} checked={spoiler} onCheckedChange={setSpoiler} />
      </label>

      <div className="flex gap-2">
        <Button type="submit" disabled={upsert.isPending} className="flex-1 sm:flex-none">
          {existing ? fa.review.update : fa.review.submit}
        </Button>
        {onDone && existing && (
          <Button type="button" variant="ghost" onClick={onDone}>
            {fa.common.cancel}
          </Button>
        )}
      </div>
    </form>
  );
}
