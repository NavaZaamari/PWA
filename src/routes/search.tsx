import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, type SearchSchemaInput } from "@tanstack/react-router";
import { Search as SearchIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { BookRowItem } from "@/components/books/BookCard";
import { BookCarousel } from "@/components/books/BookCarousel";
import { Highlight } from "@/components/books/Highlight";
import { EmptyState } from "@/components/layout/EmptyState";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, SectionTitle } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { booksQuery, useSearch } from "@/hooks/api";
import { useDebounced } from "@/hooks/use-debounced";
import { fa, t } from "@/i18n/fa";
import { requireAuth } from "@/lib/auth-guard";
import { faCompact, faNum } from "@/lib/format";

export const Route = createFileRoute("/search")({
  validateSearch: (s: { q?: string | undefined } & SearchSchemaInput) => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
  }),
  beforeLoad: requireAuth,
  loader: ({ context }) => context.queryClient.ensureQueryData(booksQuery()),
  head: () => ({
    meta: [
      { title: "جستجوی کتاب | یوئین" },
      { name: "description", content: "کتاب‌ها را با عنوان یا نویسنده، به فارسی یا انگلیسی پیدا کن." },
      { property: "og:title", content: "جستجوی کتاب | یوئین" },
      { property: "og:description", content: "کتاب‌ها را با عنوان یا نویسنده، به فارسی یا انگلیسی پیدا کن." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q: initial } = Route.useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState(initial ?? "");
  const q = useDebounced(query.trim(), 180);
  const { data, isFetching } = useSearch(q);
  const { data: books } = useSuspenseQuery(booksQuery());
  const inputRef = useRef<HTMLInputElement>(null);

  // keep the URL in sync so results survive refresh/back
  useEffect(() => {
    void navigate({ to: "/search", search: { q: q || undefined }, replace: true });
  }, [q, navigate]);

  const popular = [...books].sort((a, b) => b.ratingsCount - a.ratingsCount).slice(0, 10);
  const results = q ? data : undefined;

  return (
    <AppShell>
      <PageHeader title={fa.search.title} />
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
        <SearchIcon className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-olive-dark/70" aria-hidden />
        <label htmlFor="q" className="sr-only">
          {fa.search.label}
        </label>
        <Input
          ref={inputRef}
          id="q"
          type="search"
          dir="auto"
          autoFocus
          autoComplete="off"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={fa.search.placeholder}
          className="h-14 rounded-2xl pe-12 ps-12 text-start text-base shadow-soft [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label={fa.search.clear}
            className="tap absolute end-1 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-xl text-olive-dark hover:text-night"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </form>

      <div className="mt-6" aria-live="polite">
        {!q ? (
          <>
            <p className="mb-6 text-sm text-olive-dark">{fa.search.idle}</p>
            <SectionTitle title={fa.search.popular} />
            <BookCarousel books={popular} label={fa.search.popular} />
          </>
        ) : !results ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <EmptyState title={fa.search.empty} body={fa.search.emptyBody} />
        ) : (
          <>
            <p className="mb-3 text-xs font-semibold text-olive-dark">
              {t(fa.search.results, { n: faNum(results.length) })}
              {isFetching && <span className="ms-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-rose" />}
            </p>
            <ul className="grid gap-3 lg:grid-cols-2">
              {results.map((b) => (
                <li key={b.id}>
                  <BookRowItem
                    book={b}
                    title={<Highlight text={b.titleFa} query={q} />}
                    titleEn={<Highlight text={b.titleEn} query={q} />}
                    author={
                      <>
                        <Highlight text={b.authorFa} query={q} />
                        <span className="mx-1 text-sage">·</span>
                        <bdi dir="ltr" className="font-latin text-xs">
                          <Highlight text={b.authorEn} query={q} />
                        </bdi>
                      </>
                    }
                    meta={<span>({faCompact(b.ratingsCount)})</span>}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </AppShell>
  );
}
