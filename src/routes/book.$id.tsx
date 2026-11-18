import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { ArrowRight, BookPlus, ExternalLink, PenLine } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { BookCarousel } from "@/components/books/BookCarousel";
import { BookCover } from "@/components/books/BookCover";
import { ShelfSheet } from "@/components/books/ShelfSheet";
import { SHELF_META } from "@/components/books/shelf-meta";
import { Stars } from "@/components/books/StarRating";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/layout/EmptyState";
import { SectionTitle } from "@/components/layout/PageHeader";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  alsoReadQuery,
  bookQuery,
  bookReviewsQuery,
  bookStatsQuery,
  meQuery,
  shelvesQuery,
  useDeleteReview,
  useMe,
} from "@/hooks/api";
import { fa, t } from "@/i18n/fa";
import type { BookStats } from "@/lib/api";
import { requireAuth } from "@/lib/auth-guard";
import { BUY_BOOK_URL } from "@/lib/constants";
import { faCompact, faDecimal, faNum } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/book/$id")({
  beforeLoad: requireAuth,
  loader: async ({ context, params }) => {
    const qc = context.queryClient;
    const [book] = await Promise.all([
      qc.ensureQueryData(bookQuery(params.id)),
      qc.ensureQueryData(meQuery()),
    ]);
    if (!book) throw notFound();
    void qc.prefetchQuery(bookStatsQuery(params.id));
    void qc.prefetchQuery(bookReviewsQuery(params.id));
    void qc.prefetchQuery(alsoReadQuery(params.id));
    return { titleFa: book.titleFa, titleEn: book.titleEn, authorFa: book.authorFa };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.titleFa} | یوئین` : "کتاب | یوئین";
    const desc = loaderData
      ? `${loaderData.titleFa} (${loaderData.titleEn}) نوشتهٔ ${loaderData.authorFa}؛ امتیاز، نقدها و کتاب‌های مشابه در یوئین.`
      : "جزئیات کتاب، امتیازها و نقدها در یوئین.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "book" },
      ],
    };
  },
  notFoundComponent: () => (
    <AppShell>
      <EmptyState title={fa.book.notFound} body={fa.common.notFoundBody} className="mt-10" />
    </AppShell>
  ),
  component: BookPage,
});

function BookPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const me = useMe();
  const { data: book } = useSuspenseQuery(bookQuery(id));
  const stats = useQuery(bookStatsQuery(id));
  const reviews = useQuery(bookReviewsQuery(id));
  const alsoRead = useQuery(alsoReadQuery(id));
  const shelves = useQuery(shelvesQuery(me.id));
  const del = useDeleteReview(me.id);

  const [shelfOpen, setShelfOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!book) return null;
  const current = shelves.data?.find((s) => s.bookId === id)?.shelf ?? null;
  const CurrentIcon = current ? SHELF_META[current].icon : BookPlus;
  const mine = reviews.data?.find((r) => r.userId === me.id) ?? null;
  const others = reviews.data?.filter((r) => r.userId !== me.id) ?? [];
  const s = stats.data;

  return (
    <AppShell>
      <Button
        variant="ghost"
        size="sm"
        className="-ms-2 mb-3"
        onClick={() => (window.history.length > 1 ? router.history.back() : router.navigate({ to: "/" }))}
      >
        <ArrowRight aria-hidden />
        {fa.common.back}
      </Button>

      <div className="grid gap-8 lg:grid-cols-[18rem_1fr] lg:gap-12">
        {/* cover + primary actions */}
        <div className="flex flex-col items-center gap-4 lg:sticky lg:top-24 lg:self-start">
          <BookCover book={book} size="xl" className="shadow-lift" />
          <div className="flex w-full max-w-xs flex-col gap-2">
            <Button
              size="lg"
              variant={current ? "secondary" : "default"}
              onClick={() => setShelfOpen(true)}
              aria-haspopup="dialog"
            >
              <CurrentIcon aria-hidden />
              {current ? t(fa.book.onShelf, { shelf: SHELF_META[current].label }) : fa.book.addToShelf}
            </Button>
            <Button asChild variant="outline">
              <a href={`${BUY_BOOK_URL}${encodeURIComponent(book.id)}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden />
                {fa.book.buy}
              </a>
            </Button>
          </div>
        </div>

        <div className="min-w-0">
          <h1 className="text-center text-3xl font-extrabold leading-snug lg:text-start">{book.titleFa}</h1>
          <p className="mt-1 text-center lg:text-start">
            <bdi dir="ltr" lang="en" className="font-latin text-lg italic text-olive-dark">
              {book.titleEn}
            </bdi>
          </p>
          <p className="mt-3 text-center text-sm text-night lg:text-start">
            {fa.book.by} <span className="font-bold">{book.authorFa}</span>
            <span className="mx-1.5 text-sage">·</span>
            <bdi dir="ltr" className="font-latin text-olive-dark">
              {book.authorEn}
            </bdi>
            <span className="mx-1.5 text-sage">·</span>
            <span className="text-olive-dark">
              {fa.book.year} {faNum(book.year)}
            </span>
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 lg:justify-start">
            {s ? (
              <>
                <Stars value={s.avgRating} size="md" />
                <span className="text-2xl font-extrabold text-pomegranate">{faDecimal(s.avgRating)}</span>
                <span className="text-sm text-olive-dark">
                  {t(fa.book.ratings, { n: faCompact(s.ratingsCount) })}
                  {reviews.data && (
                    <>
                      <span className="mx-1.5 text-sage">·</span>
                      {t(fa.book.reviewsCount, { n: faNum(reviews.data.length) })}
                    </>
                  )}
                </span>
              </>
            ) : (
              <Skeleton className="h-7 w-56" />
            )}
          </div>

          <section className="mt-8" aria-labelledby="about">
            <SectionTitle title={fa.book.about} />
            <p id="about" className="text-[0.98rem] leading-8 text-night">
              {book.description}
            </p>
          </section>

          <section className="surface mt-8 p-5" aria-labelledby="dist-title">
            <h2 id="dist-title" className="mb-3 text-base font-bold">
              {fa.book.distribution}
            </h2>
            {s ? <Distribution stats={s} /> : <Skeleton className="h-32 w-full" />}
          </section>

          <section className="mt-10">
            <SectionTitle title={fa.book.reviews} />

            <div className="mb-5">
              {mine && !editing ? (
                <ReviewCard
                  review={mine}
                  mine
                  onEdit={() => setEditing(true)}
                  onDelete={() => setConfirmDelete(true)}
                />
              ) : reviews.isLoading ? (
                <Skeleton className="h-48 w-full rounded-2xl" />
              ) : (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-night">
                    <PenLine className="h-4 w-4 text-pomegranate" aria-hidden />
                    {mine ? fa.book.editReview : fa.book.writeReview}
                  </div>
                  <ReviewForm
                    key={mine?.id ?? "new"}
                    uid={me.id}
                    bookId={id}
                    existing={mine}
                    onDone={() => setEditing(false)}
                  />
                </div>
              )}
            </div>

            {reviews.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            ) : others.length === 0 ? (
              !mine && <p className="rounded-2xl border border-dashed border-sage p-5 text-center text-sm text-olive-dark">{fa.book.noReviews}</p>
            ) : (
              <ul className="space-y-3">
                {others.map((r) => (
                  <li key={r.id}>
                    <ReviewCard review={r} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <section className="mt-12" aria-labelledby="also-title">
        <h2 id="also-title" className="mb-3 text-lg font-bold">
          {fa.book.readersAlsoRead}
        </h2>
        <BookCarousel books={alsoRead.data} loading={alsoRead.isLoading} label={fa.book.readersAlsoRead} />
      </section>

      <ShelfSheet book={book} uid={me.id} current={current} open={shelfOpen} onOpenChange={setShelfOpen} />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{fa.review.confirmDelete}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel>{fa.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={() =>
                mine &&
                del.mutate(
                  { reviewId: mine.id, bookId: id },
                  { onSuccess: () => toast(fa.review.deleted) },
                )
              }
            >
              {fa.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function Distribution({ stats }: { stats: BookStats }) {
  const max = Math.max(1, ...stats.distribution);
  const total = Math.max(1, stats.ratingsCount);
  return (
    <ul className="space-y-2">
      {[5, 4, 3, 2, 1].map((n) => {
        const count = stats.distribution[n - 1] ?? 0;
        return (
          <li key={n} className="flex items-center gap-3 text-sm">
            <span className="w-14 shrink-0 text-olive-dark">{t(fa.book.stars, { n: faNum(n) })}</span>
            <div
              className="h-3 flex-1 overflow-hidden rounded-full bg-cream"
              role="meter"
              aria-label={t(fa.book.stars, { n: faNum(n) })}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={count}
            >
              <div
                className={cn("h-full rounded-full transition-all duration-700", n >= 4 ? "bg-pomegranate" : n === 3 ? "bg-rose" : "bg-olive")}
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <span className="w-12 shrink-0 text-end text-xs text-olive-dark">
              {faNum(Math.round((count / total) * 100))}٪
            </span>
          </li>
        );
      })}
    </ul>
  );
}
