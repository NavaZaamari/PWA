import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Camera, LogOut, Pencil, Trash2 } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { BookCarousel } from "@/components/books/BookCarousel";
import { SHELF_META } from "@/components/books/shelf-meta";
import { GoalCard } from "@/components/goal/GoalCard";
import { AppShell } from "@/components/layout/AppShell";
import { SectionTitle } from "@/components/layout/PageHeader";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  booksQuery,
  meQuery,
  shelvesQuery,
  useLogout,
  useMe,
  userReviewsQuery,
  useUpdateProfile,
} from "@/hooks/api";
import { fa, t } from "@/i18n/fa";
import { SHELVES } from "@/lib/api";
import { requireAuth } from "@/lib/auth-guard";
import { MAX_AVATAR_BYTES } from "@/lib/constants";
import { faNum, formatIranPhone, jalaliMonthYear } from "@/lib/format";
import { imageFileToDataUrl } from "@/lib/image";

export const Route = createFileRoute("/profile")({
  beforeLoad: requireAuth,
  loader: async ({ context }) => {
    const qc = context.queryClient;
    const [me] = await Promise.all([qc.ensureQueryData(meQuery()), qc.ensureQueryData(booksQuery())]);
    if (me) {
      void qc.prefetchQuery(shelvesQuery(me.id));
      void qc.prefetchQuery(userReviewsQuery(me.id));
    }
  },
  head: () => ({
    meta: [
      { title: "پروفایل من | یوئین" },
      { name: "description", content: "عکس، معرفی، قفسه‌ها، هدف سالانه و نقدهای تو در یوئین." },
      { property: "og:title", content: "پروفایل من | یوئین" },
      { property: "og:description", content: "عکس، معرفی، قفسه‌ها، هدف سالانه و نقدهای تو در یوئین." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const me = useMe();
  const navigate = useNavigate();
  const { data: books } = useSuspenseQuery(booksQuery());
  const shelves = useQuery(shelvesQuery(me.id));
  const reviews = useQuery(userReviewsQuery(me.id));
  const update = useUpdateProfile(me.id);
  const logout = useLogout();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(me.name);
  const [bio, setBio] = useState(me.bio);

  const byId = new Map(books.map((b) => [b.id, b]));
  const favorites = me.favoriteBookIds.map((id) => byId.get(id)).filter((b) => !!b);

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(fa.profile.photoInvalid);
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error(fa.profile.photoTooLarge);
      return;
    }
    try {
      const avatar = await imageFileToDataUrl(file);
      update.mutate({ avatar }, { onSuccess: () => toast.success(fa.profile.photoSaved) });
    } catch {
      toast.error(fa.profile.photoInvalid);
    }
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(fa.auth.nameRequired);
      return;
    }
    update.mutate(
      { name: name.trim(), bio: bio.trim() },
      {
        onSuccess: () => {
          toast.success(fa.profile.saved);
          setEditing(false);
        },
      },
    );
  };

  return (
    <AppShell>
      <h1 className="sr-only">{fa.profile.title}</h1>

      <section className="surface relative overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-olive-dark/90" aria-hidden />
        <div className="relative flex flex-col items-center gap-3 text-center sm:flex-row sm:items-end sm:text-start">
          <div className="relative">
            <UserAvatar src={me.avatar} name={me.name} className="h-28 w-28 border-4 border-straw shadow-card" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label={fa.profile.changePhoto}
              className="tap absolute -bottom-1 -end-1 inline-flex items-center justify-center rounded-full bg-pomegranate text-cream shadow-card hover:bg-night"
            >
              <Camera className="h-5 w-5" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(e) => {
                void onPhoto(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
          <div className="min-w-0 flex-1 sm:pb-1">
            {!editing && (
              <>
                <h2 className="truncate text-2xl font-extrabold">{me.name}</h2>
                <p className="text-xs text-olive-dark">
                  {t(fa.profile.memberSince, { date: jalaliMonthYear(me.createdAt) })}
                  <span className="mx-1.5 text-sage">·</span>
                  <bdi dir="ltr" className="font-latin">
                    {me.email ?? (me.phone ? formatIranPhone(me.phone) : "")}
                  </bdi>
                </p>
              </>
            )}
          </div>
          {!editing && (
            <div className="flex gap-1">
              {me.avatar && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose hover:text-rose"
                  onClick={() => update.mutate({ avatar: undefined })}
                >
                  <Trash2 />
                  {fa.profile.removePhoto}
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                <Pencil />
                {fa.profile.edit}
              </Button>
            </div>
          )}
        </div>

        {editing ? (
          <form onSubmit={save} className="relative mt-5 space-y-4">
            <div>
              <label htmlFor="p-name" className="mb-1.5 block text-sm font-semibold">
                {fa.profile.nameLabel}
              </label>
              <Input id="p-name" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} className="bg-cream/70" />
            </div>
            <div>
              <label htmlFor="p-bio" className="mb-1.5 block text-sm font-semibold">
                {fa.profile.bioLabel}
              </label>
              <Textarea
                id="p-bio"
                dir="auto"
                value={bio}
                maxLength={280}
                onChange={(e) => setBio(e.target.value)}
                placeholder={fa.profile.bioPlaceholder}
                className="bg-cream/70"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={update.isPending}>
                {fa.common.save}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setName(me.name);
                  setBio(me.bio);
                  setEditing(false);
                }}
              >
                {fa.common.cancel}
              </Button>
            </div>
          </form>
        ) : (
          <p className="relative mt-4 whitespace-pre-line text-center text-[0.95rem] leading-8 text-night sm:text-start" dir="auto">
            {me.bio || <span className="text-olive-dark">{fa.profile.noBio}</span>}
          </p>
        )}
      </section>

      <section className="mt-8" aria-label={fa.profile.shelfCounts}>
        <SectionTitle title={fa.profile.shelfCounts} />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SHELVES.map((s) => {
            const { label, icon: Icon } = SHELF_META[s];
            const count = shelves.data?.filter((e) => e.shelf === s).length;
            return (
              <li key={s}>
                <Link
                  to="/shelves"
                  search={{ tab: s }}
                  className="surface flex h-full flex-col gap-1 p-4 transition-transform hover:-translate-y-0.5"
                >
                  <Icon className="h-5 w-5 text-olive" aria-hidden />
                  <span className="text-3xl font-extrabold text-pomegranate">
                    {count === undefined ? "…" : faNum(count)}
                  </span>
                  <span className="text-xs font-semibold text-olive-dark">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-8">
        <GoalCard uid={me.id} />
      </div>

      {favorites.length > 0 && (
        <section className="mt-10" aria-label={fa.profile.favorites}>
          <SectionTitle title={fa.profile.favorites} />
          <BookCarousel books={favorites} label={fa.profile.favorites} />
        </section>
      )}

      <section className="mt-10" aria-label={fa.profile.myReviews}>
        <SectionTitle title={fa.profile.myReviews} />
        {reviews.isLoading ? (
          <Skeleton className="h-32 w-full rounded-2xl" />
        ) : !reviews.data?.length ? (
          <p className="rounded-2xl border border-dashed border-sage p-5 text-center text-sm text-olive-dark">
            {fa.profile.noReviews}
          </p>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {reviews.data.map((r) => {
              const b = byId.get(r.bookId);
              return (
                <li key={r.id}>
                  <ReviewCard
                    review={r}
                    heading={
                      b && (
                        <Link
                          to="/book/$id"
                          params={{ id: b.id }}
                          className="mb-3 block border-b border-border pb-2 text-sm font-bold text-pomegranate hover:text-olive"
                        >
                          {b.titleFa}
                        </Link>
                      )
                    }
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="mt-10 flex justify-center">
        <Button
          variant="outline"
          disabled={logout.isPending}
          onClick={() =>
            logout.mutate(undefined, {
              onSuccess: () => {
                toast(fa.profile.loggedOut);
                void navigate({ to: "/auth", search: { mode: "login" } });
              },
            })
          }
        >
          <LogOut />
          {fa.profile.logout}
        </Button>
      </div>
    </AppShell>
  );
}
