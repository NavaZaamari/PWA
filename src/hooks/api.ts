import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { api, type ShelfId, type User } from "@/lib/api";
import { jalaliYear } from "@/lib/format";

/* ---------- query options (shared by loaders and components) ---------- */

export const qk = {
  me: ["me"] as const,
  books: ["books"] as const,
  book: (id: string) => ["book", id] as const,
  stats: (id: string) => ["book", id, "stats"] as const,
  alsoRead: (id: string) => ["book", id, "also-read"] as const,
  search: (q: string) => ["search", q] as const,
  discover: (uid: string) => ["discover", uid] as const,
  shelves: (uid: string) => ["shelves", uid] as const,
  goal: (uid: string, year: number) => ["goal", uid, year] as const,
  bookReviews: (id: string) => ["reviews", "book", id] as const,
  userReviews: (uid: string) => ["reviews", "user", uid] as const,
  onboarding: ["onboarding"] as const,
};

export const meQuery = () => queryOptions({ queryKey: qk.me, queryFn: () => api.profile.me() });
export const booksQuery = () =>
  queryOptions({ queryKey: qk.books, queryFn: () => api.books.list(), staleTime: Infinity });
export const bookQuery = (id: string) =>
  queryOptions({ queryKey: qk.book(id), queryFn: () => api.books.get(id), staleTime: Infinity });
export const bookStatsQuery = (id: string) =>
  queryOptions({ queryKey: qk.stats(id), queryFn: () => api.books.getStats(id) });
export const alsoReadQuery = (id: string) =>
  queryOptions({ queryKey: qk.alsoRead(id), queryFn: () => api.books.readersAlsoRead(id) });
export const discoverQuery = (uid: string) =>
  queryOptions({ queryKey: qk.discover(uid), queryFn: () => api.books.discover(uid) });
export const shelvesQuery = (uid: string) =>
  queryOptions({ queryKey: qk.shelves(uid), queryFn: () => api.shelves.list(uid) });
export const goalQuery = (uid: string, year = jalaliYear()) =>
  queryOptions({ queryKey: qk.goal(uid, year), queryFn: () => api.goals.progress(uid, year) });
export const bookReviewsQuery = (id: string) =>
  queryOptions({ queryKey: qk.bookReviews(id), queryFn: () => api.reviews.listForBook(id) });
export const userReviewsQuery = (uid: string) =>
  queryOptions({ queryKey: qk.userReviews(uid), queryFn: () => api.reviews.listForUser(uid) });

/* ---------- reads ---------- */

/** Signed-in user. Only use under routes guarded by requireAuth. */
export function useMe(): User {
  const { data } = useSuspenseQuery(meQuery());
  if (!data) throw new Error("Not signed in");
  return data;
}

export function useSearch(q: string) {
  return useQuery({
    queryKey: qk.search(q),
    queryFn: () => api.books.search(q),
    enabled: q.trim().length > 0,
    placeholderData: (prev) => prev,
    staleTime: Infinity,
  });
}

/* ---------- mutations ---------- */

export function useSetShelf(uid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, shelf }: { bookId: string; shelf: ShelfId }) =>
      api.shelves.setShelf(uid, bookId, shelf),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: qk.shelves(uid) });
      qc.invalidateQueries({ queryKey: ["goal", uid] });
      qc.invalidateQueries({ queryKey: qk.discover(uid) });
      qc.invalidateQueries({ queryKey: qk.alsoRead(v.bookId) });
    },
  });
}

export function useRemoveFromShelf(uid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => api.shelves.remove(uid, bookId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.shelves(uid) });
      qc.invalidateQueries({ queryKey: ["goal", uid] });
      qc.invalidateQueries({ queryKey: qk.discover(uid) });
    },
  });
}

export function useSetGoal(uid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ target, year = jalaliYear() }: { target: number; year?: number }) =>
      api.goals.set(uid, year, target),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goal", uid] }),
  });
}

export function useUpsertReview(uid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { bookId: string; rating: number; text: string; spoiler: boolean }) =>
      api.reviews.upsert({ userId: uid, ...v }),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: qk.bookReviews(v.bookId) });
      qc.invalidateQueries({ queryKey: qk.userReviews(uid) });
      qc.invalidateQueries({ queryKey: qk.stats(v.bookId) });
    },
  });
}

export function useDeleteReview(uid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { reviewId: string; bookId: string }) => api.reviews.remove(uid, v.reviewId),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: qk.bookReviews(v.bookId) });
      qc.invalidateQueries({ queryKey: qk.userReviews(uid) });
      qc.invalidateQueries({ queryKey: qk.stats(v.bookId) });
    },
  });
}

export function useUpdateProfile(uid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Pick<User, "name" | "bio" | "avatar">>) =>
      api.profile.update(uid, patch),
    onSuccess: (user) => {
      qc.setQueryData(qk.me, user);
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

/* ---------- auth & onboarding ---------- */

export const onboardingQuery = () =>
  queryOptions({ queryKey: qk.onboarding, queryFn: () => api.auth.getOnboardingDraft() });

/** After any successful sign-in/up: cache the user and drop stale per-user data. */
function useOnSignedIn() {
  const qc = useQueryClient();
  return (user: User) => {
    qc.removeQueries({ predicate: (q) => q.queryKey[0] !== "books" && q.queryKey[0] !== "book" });
    qc.setQueryData(qk.me, user);
  };
}

export function usePasswordSignup() {
  const onSignedIn = useOnSignedIn();
  return useMutation({
    mutationFn: (v: Parameters<typeof api.auth.signUpWithPassword>[0]) =>
      api.auth.signUpWithPassword(v),
    onSuccess: onSignedIn,
  });
}

export function usePasswordLogin() {
  const onSignedIn = useOnSignedIn();
  return useMutation({
    mutationFn: (v: Parameters<typeof api.auth.loginWithPassword>[0]) =>
      api.auth.loginWithPassword(v),
    onSuccess: onSignedIn,
  });
}

export function useRequestOtp() {
  return useMutation({
    mutationFn: (id: Parameters<typeof api.auth.requestOtp>[0]) => api.auth.requestOtp(id),
  });
}

export function useVerifyOtp() {
  const onSignedIn = useOnSignedIn();
  return useMutation({
    mutationFn: (v: Parameters<typeof api.auth.verifyOtp>[0]) => api.auth.verifyOtp(v),
    onSuccess: onSignedIn,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.auth.logout(),
    onSuccess: () => {
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== "books" && q.queryKey[0] !== "book" });
    },
  });
}

export function useSaveOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (draft: Parameters<typeof api.auth.saveOnboardingDraft>[0]) =>
      api.auth.saveOnboardingDraft(draft),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.onboarding }),
  });
}
