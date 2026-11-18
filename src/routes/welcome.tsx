import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Search, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { BookCover } from "@/components/books/BookCover";
import { CatWithBook } from "@/components/brand/doodles";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { booksQuery, onboardingQuery, useSaveOnboarding, useSearch } from "@/hooks/api";
import { fa, t } from "@/i18n/fa";
import type { Book } from "@/lib/api";
import { redirectIfAuthed } from "@/lib/auth-guard";
import { ONBOARDING_PICKS } from "@/lib/constants";
import { faNum, isValidEmail } from "@/lib/format";
import { useDebounced } from "@/hooks/use-debounced";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/welcome")({
  beforeLoad: redirectIfAuthed,
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(booksQuery()),
      context.queryClient.ensureQueryData(onboardingQuery()),
    ]),
  head: () => ({
    meta: [
      { title: "شروع با یوئین | ۵ کتاب محبوبت" },
      { name: "description", content: "پنج کتاب محبوبت را انتخاب کن تا یوئین قفسه و پیشنهادهایت را بچیند." },
      { property: "og:title", content: "شروع با یوئین | ۵ کتاب محبوبت" },
      { property: "og:description", content: "پنج کتاب محبوبت را انتخاب کن تا یوئین قفسه و پیشنهادهایت را بچیند." },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const navigate = useNavigate();
  const { data: books } = useSuspenseQuery(booksQuery());
  const { data: draft } = useSuspenseQuery(onboardingQuery());
  const save = useSaveOnboarding();

  const [step, setStep] = useState<1 | 2>(1);
  const [picks, setPicks] = useState<string[]>(draft?.favoriteBookIds ?? []);
  const [email, setEmail] = useState(draft?.email ?? "");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const q = useDebounced(query, 200);
  const results = useSearch(q);

  const byId = useMemo(() => new Map(books.map((b) => [b.id, b])), [books]);
  const shown: Book[] = q.trim() ? (results.data ?? []) : books;
  const full = picks.length >= ONBOARDING_PICKS;

  const toggle = (id: string) => {
    setPicks((p) => {
      if (p.includes(id)) return p.filter((x) => x !== id);
      if (p.length >= ONBOARDING_PICKS) {
        toast(fa.onboarding.maxReached);
        return p;
      }
      return [...p, id];
    });
  };

  const finish = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return setEmailError(fa.auth.invalidEmail);
    const clean = email.trim().toLowerCase();
    await save.mutateAsync({ favoriteBookIds: picks, email: clean });
    void navigate({ to: "/auth", search: { mode: "signup", email: clean } });
  };

  return (
    <div className="mx-auto min-h-dvh w-full max-w-3xl px-4 pb-36 pt-[calc(var(--safe-top)+1.25rem)] lg:px-6">
      <header className="flex items-center justify-between gap-3">
        <Logo size="sm" />
        <span className="rounded-full bg-straw px-3 py-1 text-xs font-bold text-olive-dark">
          {t(fa.onboarding.step, { n: faNum(step) })}
        </span>
      </header>

      {step === 1 ? (
        <section key="s1" className="mt-6 animate-page-in" aria-labelledby="pick-title">
          <h1 id="pick-title" className="text-2xl font-extrabold">
            {fa.onboarding.pickTitle}
          </h1>
          <p className="mt-1 text-sm text-olive-dark">{fa.onboarding.pickSubtitle}</p>

          <div className="relative mt-5">
            <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-olive-dark/70" aria-hidden />
            <label htmlFor="pick-search" className="sr-only">
              {fa.search.label}
            </label>
            <Input
              id="pick-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={fa.onboarding.searchPlaceholder}
              className="ps-12"
              autoComplete="off"
            />
          </div>

          {shown.length === 0 ? (
            <p className="mt-10 text-center text-sm text-olive-dark">{fa.onboarding.noResults}</p>
          ) : (
            <ul className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-5">
              {shown.map((b) => {
                const selected = picks.includes(b.id);
                return (
                  <li key={b.id}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggle(b.id)}
                      className={cn(
                        "group flex w-full flex-col gap-1.5 rounded-xl p-1 text-start transition-opacity",
                        full && !selected && "opacity-55",
                      )}
                    >
                      <span className="relative block">
                        <BookCover
                          book={b}
                          size="md"
                          className={cn(
                            "w-full transition-all",
                            selected ? "ring-4 ring-pomegranate ring-offset-2 ring-offset-cream" : "group-hover:-translate-y-0.5",
                          )}
                        />
                        {selected && (
                          <span className="absolute -end-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-pomegranate text-cream shadow-card">
                            <Check className="h-4 w-4" aria-hidden />
                          </span>
                        )}
                      </span>
                      <span className="line-clamp-2 text-xs font-bold leading-5 text-night">{b.titleFa}</span>
                      <span className="-mt-1 line-clamp-1 text-[0.7rem] text-olive-dark">{b.authorFa}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : (
        <section key="s2" className="mt-8 animate-page-in" aria-labelledby="email-title">
          <CatWithBook className="mx-auto h-32 w-auto animate-float" />
          <h1 id="email-title" className="mt-4 text-center text-2xl font-extrabold">
            {fa.onboarding.emailTitle}
          </h1>
          <p className="mt-1 text-center text-sm text-olive-dark">{fa.onboarding.emailSubtitle}</p>
          <div className="mx-auto mt-5 flex max-w-sm justify-center -space-x-3 rtl:space-x-reverse">
            {picks.map((id) => {
              const b = byId.get(id);
              return b ? <BookCover key={id} book={b} size="xs" className="w-12 ring-2 ring-cream" /> : null;
            })}
          </div>
          <form id="email-form" onSubmit={finish} noValidate className="mx-auto mt-6 max-w-sm">
            <label htmlFor="welcome-email" className="mb-1.5 block text-sm font-semibold">
              {fa.auth.emailLabel}
            </label>
            <Input
              id="welcome-email"
              type="email"
              dir="ltr"
              inputMode="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
              placeholder={fa.auth.emailPlaceholder}
              aria-invalid={!!emailError}
              className="font-latin text-start"
            />
            {emailError && (
              <p role="alert" className="mt-1 text-xs font-semibold text-rose">
                {emailError}
              </p>
            )}
          </form>
        </section>
      )}

      {/* sticky footer: picks tray + actions */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-cream/95 pb-[calc(var(--safe-bottom)+0.75rem)] pt-3 shadow-lift backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 lg:px-6">
          {step === 1 ? (
            <>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-olive-dark">{fa.onboarding.selected}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 text-xs font-extrabold",
                      full ? "bg-olive text-cream" : "bg-straw text-pomegranate",
                    )}
                    aria-live="polite"
                  >
                    {t(fa.onboarding.pickCounter, { n: faNum(picks.length) })}
                  </span>
                </div>
                <div className="no-scrollbar mt-1.5 flex gap-1.5 overflow-x-auto">
                  {picks.length === 0 && (
                    <span className="py-1 text-xs text-olive-dark/80">{fa.onboarding.selectedEmpty}</span>
                  )}
                  {picks.map((id) => {
                    const b = byId.get(id);
                    if (!b) return null;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggle(id)}
                        aria-label={t(fa.onboarding.removePick, { title: b.titleFa })}
                        className="flex shrink-0 items-center gap-1 rounded-full bg-pomegranate/10 py-1 pe-1.5 ps-2.5 text-xs font-semibold text-pomegranate hover:bg-pomegranate/15"
                      >
                        <span className="max-w-28 truncate">{b.titleFa}</span>
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button size="lg" disabled={!full} onClick={() => setStep(2)}>
                {fa.onboarding.next}
                <ArrowLeft aria-hidden />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="lg" onClick={() => setStep(1)}>
                <ArrowRight aria-hidden />
                {fa.common.back}
              </Button>
              <Button type="submit" form="email-form" size="lg" className="flex-1" disabled={save.isPending}>
                {fa.onboarding.toSignup}
              </Button>
            </>
          )}
        </div>
        {step === 1 && (
          <p className="mx-auto mt-2 max-w-3xl px-4 text-xs text-olive-dark lg:px-6">
            {fa.onboarding.haveAccount}{" "}
            <Link to="/auth" search={{ mode: "login" }} className="font-bold text-pomegranate hover:underline">
              {fa.auth.toLogin}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
