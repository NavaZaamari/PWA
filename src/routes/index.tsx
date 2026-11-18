import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Search } from "lucide-react";
import { useState } from "react";

import { BookCarousel } from "@/components/books/BookCarousel";
import { BookCover } from "@/components/books/BookCover";
import { OliveBranch } from "@/components/brand/doodles";
import { GoalCard } from "@/components/goal/GoalCard";
import { AppShell } from "@/components/layout/AppShell";
import { SectionTitle } from "@/components/layout/PageHeader";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { booksQuery, discoverQuery, meQuery, shelvesQuery, useMe } from "@/hooks/api";
import { fa } from "@/i18n/fa";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/")({
  beforeLoad: requireAuth,
  loader: async ({ context }) => {
    const qc = context.queryClient;
    const [me] = await Promise.all([qc.ensureQueryData(meQuery()), qc.ensureQueryData(booksQuery())]);
    if (me) {
      void qc.prefetchQuery(shelvesQuery(me.id));
      void qc.prefetchQuery(discoverQuery(me.id));
    }
  },
  head: () => ({
    meta: [
      { title: "یوئین | کتابخانهٔ گرم و دنج تو" },
      { name: "description", content: "کتاب‌هایی که می‌خوانی، هدف مطالعهٔ امسال و پیشنهادهای تازه، همه در یوئین." },
      { property: "og:title", content: "یوئین | کتابخانهٔ گرم و دنج تو" },
      { property: "og:description", content: "کتاب‌هایی که می‌خوانی، هدف مطالعهٔ امسال و پیشنهادهای تازه، همه در یوئین." },
    ],
  }),
  component: HomePage,
});

function greeting(h: number) {
  if (h >= 5 && h < 12) return fa.home.greetingMorning;
  if (h >= 12 && h < 17) return fa.home.greetingDay;
  if (h >= 17 && h < 21) return fa.home.greetingEvening;
  return fa.home.greetingNight;
}

function HomePage() {
  const me = useMe();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { data: books } = useSuspenseQuery(booksQuery());
  const shelves = useQuery(shelvesQuery(me.id));
  const discover = useQuery(discoverQuery(me.id));
  const byId = new Map(books.map((b) => [b.id, b]));
  const reading = (shelves.data ?? [])
    .filter((s) => s.shelf === "reading")
    .map((s) => byId.get(s.bookId))
    .filter((b) => !!b);

  return (
    <AppShell>
      <header className="flex items-center gap-3">
        <Link to="/profile" className="rounded-full" aria-label={fa.nav.profile}>
          <UserAvatar src={me.avatar} name={me.name} className="h-12 w-12" />
        </Link>
        <div className="min-w-0">
          <p className="text-sm text-olive-dark">{greeting(new Date().getHours())}</p>
          <h1 className="truncate text-2xl font-extrabold">{me.name}</h1>
        </div>
        <OliveBranch className="ms-auto h-10 w-auto opacity-80" />
      </header>

      <form
        role="search"
        className="relative mt-5"
        onSubmit={(e) => {
          e.preventDefault();
          void navigate({ to: "/search", search: { q: q.trim() || undefined } });
        }}
      >
        <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-olive-dark/70" aria-hidden />
        <label htmlFor="home-q" className="sr-only">
          {fa.search.label}
        </label>
        <Input
          id="home-q"
          type="search"
          dir="auto"
          enterKeyHint="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={fa.home.searchPlaceholder}
          className="h-14 rounded-2xl ps-12 text-start shadow-soft"
        />
      </form>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <section aria-label={fa.home.currentlyReading} className="min-w-0">
          <SectionTitle
            title={fa.home.currentlyReading}
            action={
              <Button asChild variant="link" size="sm" className="px-0">
                <Link to="/shelves" search={{ tab: "reading" }}>
                  {fa.home.toShelves}
                  <ChevronLeft aria-hidden />
                </Link>
              </Button>
            }
          />
          {shelves.isLoading ? (
            <Skeleton className="h-36 w-full rounded-2xl" />
          ) : reading.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-sage p-5 text-sm text-olive-dark">{fa.home.noCurrent}</p>
          ) : (
            <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0">
              {reading.map((b) => (
                <li key={b.id} className="shrink-0">
                  <Link
                    to="/book/$id"
                    params={{ id: b.id }}
                    className="surface flex w-72 items-center gap-3 p-3 transition-transform hover:-translate-y-0.5"
                  >
                    <BookCover book={b} size="sm" className="w-16" />
                    <span className="min-w-0">
                      <span className="line-clamp-2 font-bold leading-7 text-night">{b.titleFa}</span>
                      <span className="block truncate text-sm text-olive-dark">{b.authorFa}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <GoalCard uid={me.id} />
      </div>

      <section className="mt-10" aria-label={fa.home.discover}>
        <SectionTitle title={fa.home.discover} hint={fa.home.discoverHint} />
        <BookCarousel books={discover.data} loading={discover.isLoading} label={fa.home.discover} />
      </section>
    </AppShell>
  );
}
