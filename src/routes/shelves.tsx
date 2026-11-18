import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate, type SearchSchemaInput } from "@tanstack/react-router";
import { ArrowLeftRight, Check, MoreVertical, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { BookRowItem } from "@/components/books/BookCard";
import { SHELF_META } from "@/components/books/shelf-meta";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { booksQuery, meQuery, shelvesQuery, useMe, useRemoveFromShelf, useSetShelf } from "@/hooks/api";
import { fa, t } from "@/i18n/fa";
import { SHELVES, type Book, type ShelfEntry, type ShelfId } from "@/lib/api";
import { requireAuth } from "@/lib/auth-guard";
import { faNum, jalaliDate } from "@/lib/format";

const isShelf = (v: unknown): v is ShelfId => typeof v === "string" && (SHELVES as string[]).includes(v);

export const Route = createFileRoute("/shelves")({
  validateSearch: (s: { tab?: ShelfId | undefined } & SearchSchemaInput) => ({
    tab: isShelf(s.tab) ? s.tab : undefined,
  }),
  beforeLoad: requireAuth,
  loader: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQuery());
    await context.queryClient.ensureQueryData(booksQuery());
    if (me) void context.queryClient.prefetchQuery(shelvesQuery(me.id));
  },
  head: () => ({
    meta: [
      { title: "کتاب‌های من | یوئین" },
      { name: "description", content: "چهار قفسهٔ تو: می‌خوام بخونم، در حال خواندن، خوانده‌ام و نیمه‌کاره." },
      { property: "og:title", content: "کتاب‌های من | یوئین" },
      { property: "og:description", content: "چهار قفسهٔ تو: می‌خوام بخونم، در حال خواندن، خوانده‌ام و نیمه‌کاره." },
    ],
  }),
  component: ShelvesPage,
});

function ShelvesPage() {
  const me = useMe();
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const { data: books } = useSuspenseQuery(booksQuery());
  const { data: entries, isLoading } = useQuery(shelvesQuery(me.id));
  const byId = new Map(books.map((b) => [b.id, b]));
  const active: ShelfId = tab ?? "want";

  const grouped = Object.fromEntries(
    SHELVES.map((s) => [s, (entries ?? []).filter((e) => e.shelf === s)]),
  ) as Record<ShelfId, ShelfEntry[]>;

  return (
    <AppShell>
      <PageHeader title={fa.shelves.title} />
      <Tabs
        value={active}
        onValueChange={(v) => navigate({ to: "/shelves", search: { tab: v as ShelfId }, replace: true })}
        dir="rtl"
      >
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        <TabsList className="w-max justify-start">
          {SHELVES.map((s) => {
            const { label, icon: Icon } = SHELF_META[s];
            return (
              <TabsTrigger key={s} value={s} className="shrink-0">
                <Icon className="h-4 w-4" aria-hidden />
                {label}
                <span className="rounded-full bg-cream/70 px-1.5 text-[0.7rem] font-extrabold">
                  {entries ? faNum(grouped[s].length) : "…"}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        </div>

        {SHELVES.map((s) => (
          <TabsContent key={s} value={s} className="mt-5 focus-visible:outline-none">
            {isLoading ? (
              <div className="grid gap-3 lg:grid-cols-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-2xl" />
                ))}
              </div>
            ) : grouped[s].length === 0 ? (
              <EmptyState
                title={SHELF_META[s].label}
                body={fa.shelves.empty[s]}
                action={
                  <Button asChild>
                    <Link to="/search" search={{}}>
                      <Search aria-hidden />
                      {fa.shelves.findBooks}
                    </Link>
                  </Button>
                }
              />
            ) : (
              <ul className="grid gap-3 lg:grid-cols-2">
                {grouped[s].map((e) => {
                  const b = byId.get(e.bookId);
                  return b ? (
                    <li key={e.bookId}>
                      <ShelfRow book={b} entry={e} uid={me.id} />
                    </li>
                  ) : null;
                })}
              </ul>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </AppShell>
  );
}

function ShelfRow({ book, entry, uid }: { book: Book; entry: ShelfEntry; uid: string }) {
  const setShelf = useSetShelf(uid);
  const remove = useRemoveFromShelf(uid);
  const date =
    entry.shelf === "read" && entry.finishedAt
      ? t(fa.shelves.finishedOn, { date: jalaliDate(entry.finishedAt) })
      : t(fa.shelves.addedOn, { date: jalaliDate(entry.addedAt) });

  return (
    <BookRowItem
      book={book}
      meta={<span className="ms-1 truncate before:me-1 before:text-sage before:content-['·']">{date}</span>}
      trailing={
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t(fa.shelves.actionsFor, { title: book.titleFa })}>
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-2 text-xs text-olive-dark">
              <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden />
              {fa.shelves.moveTo}
            </DropdownMenuLabel>
            {SHELVES.map((s) => {
              const { label, icon: Icon } = SHELF_META[s];
              const current = s === entry.shelf;
              return (
                <DropdownMenuItem
                  key={s}
                  disabled={current}
                  className="min-h-11 gap-2"
                  onSelect={() =>
                    setShelf.mutate(
                      { bookId: book.id, shelf: s },
                      { onSuccess: () => toast.success(t(fa.shelves.moved, { shelf: label })) },
                    )
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span className="flex-1">{label}</span>
                  {current && <Check className="h-4 w-4 text-pomegranate" aria-hidden />}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="min-h-11 gap-2 text-rose focus:text-rose"
              onSelect={() => remove.mutate(book.id, { onSuccess: () => toast(fa.shelves.removed) })}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              {fa.shelves.remove}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    />
  );
}
