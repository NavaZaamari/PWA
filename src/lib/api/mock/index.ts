import { jalaliYear, toLatinDigits } from "@/lib/format";
import { normalizeText } from "@/lib/search";
import { ApiError } from "../errors";
import type {
  Api,
  AuthRepository,
  BooksRepository,
  GoalsRepository,
  ProfileRepository,
  ReviewsRepository,
  ShelvesRepository,
} from "../repositories";
import type { AuthIdentifier, Book, BookStats, ShelfEntry, User } from "../types";
import { delay, publicUser, readDb, uid, updateDb, type StoredUser } from "./db";
import { SEED_BOOKS } from "./seed-books";
import { SEED_READERS } from "./seed-social";

/** Mock OTP: any request accepts this code. */
export const MOCK_OTP = "123456";

const bookById = new Map(SEED_BOOKS.map((b) => [b.id, b]));
const isSeedUser = (userId: string) => userId.startsWith("r-");

function findUser(users: StoredUser[], id: AuthIdentifier) {
  const v = id.method === "email" ? id.value.trim().toLowerCase() : id.value;
  return users.find((u) => (id.method === "email" ? u.email === v : u.phone === v));
}

function createUser(
  id: AuthIdentifier,
  name: string,
  favoriteBookIds: string[] = [],
  password?: string,
): StoredUser {
  return {
    id: uid("u"),
    name: name.trim(),
    email: id.method === "email" ? id.value.trim().toLowerCase() : undefined,
    phone: id.method === "phone" ? id.value : undefined,
    bio: "",
    favoriteBookIds: favoriteBookIds.slice(0, 5),
    createdAt: new Date().toISOString(),
    // Mock only: a real backend must never store plaintext passwords.
    password,
  };
}

function requireSessionUser(): StoredUser {
  const db = readDb();
  const u = db.session && db.users.find((x) => x.id === db.session!.userId);
  if (!u) throw new ApiError("unauthorized");
  return u;
}

/* ---------------- auth ---------------- */

export const mockAuth: AuthRepository = {
  async getSession() {
    return delay(readDb().session);
  },
  hasSession() {
    const db = readDb();
    return !!db.session && db.users.some((u) => u.id === db.session!.userId);
  },
  async signUpWithPassword({ id, password, name, favoriteBookIds }) {
    const user = updateDb((db) => {
      if (findUser(db.users, id)) throw new ApiError("userExists");
      const u = createUser(id, name, favoriteBookIds ?? db.onboarding?.favoriteBookIds, password);
      db.users.push(u);
      db.session = { userId: u.id, createdAt: new Date().toISOString() };
      db.onboarding = null;
      return u;
    });
    return delay(publicUser(user));
  },
  async loginWithPassword({ id, password }) {
    const db = readDb();
    const u = findUser(db.users, id);
    if (!u || !u.password || u.password !== password) {
      await delay(null);
      throw new ApiError("wrongCredentials");
    }
    updateDb((d) => (d.session = { userId: u.id, createdAt: new Date().toISOString() }));
    return delay(publicUser(u));
  },
  async requestOtp(id) {
    return delay({ sentTo: id.value, resendAfterSec: 60 });
  },
  async verifyOtp({ id, code, signup }) {
    await delay(null);
    if (toLatinDigits(code).trim() !== MOCK_OTP) throw new ApiError("wrongOtp");
    const user = updateDb((db) => {
      let u = findUser(db.users, id);
      if (signup) {
        if (u) throw new ApiError("userExists");
        u = createUser(id, signup.name, signup.favoriteBookIds ?? db.onboarding?.favoriteBookIds);
        db.users.push(u);
        db.onboarding = null;
      }
      if (!u) throw new ApiError("userMissing");
      db.session = { userId: u.id, createdAt: new Date().toISOString() };
      return u;
    });
    return publicUser(user);
  },
  async logout() {
    updateDb((db) => (db.session = null));
    return delay(undefined);
  },
  async saveOnboardingDraft(d) {
    updateDb((db) => (db.onboarding = { ...d, favoriteBookIds: d.favoriteBookIds.slice(0, 5) }));
    return delay(undefined);
  },
  async getOnboardingDraft() {
    return delay(readDb().onboarding);
  },
};

/* ---------------- books ---------------- */

/** Every reader's "read" set: seeded community + real users' read shelves & favorites. */
function readerSets(): string[][] {
  const db = readDb();
  const sets = SEED_READERS.map((r) => r.read);
  for (const u of db.users) {
    const read = db.shelves
      .filter((s) => s.userId === u.id && s.shelf === "read")
      .map((s) => s.bookId);
    sets.push([...new Set([...read, ...u.favoriteBookIds])]);
  }
  return sets;
}

/** Count how often each book co-occurs with any of the `seeds` across readers. */
export function coOccurrence(seeds: string[], sets: string[][]): Map<string, number> {
  const seedSet = new Set(seeds);
  const counts = new Map<string, number>();
  for (const set of sets) {
    const overlap = set.filter((b) => seedSet.has(b)).length;
    if (!overlap) continue;
    for (const b of set) {
      if (seedSet.has(b)) continue;
      counts.set(b, (counts.get(b) ?? 0) + overlap);
    }
  }
  return counts;
}

function rankByCounts(counts: Map<string, number>, exclude: Set<string>, limit: number): Book[] {
  const ranked = [...counts.entries()]
    .filter(([id]) => !exclude.has(id) && bookById.has(id))
    .sort((a, b) => b[1] - a[1] || (bookById.get(b[0])?.avgRating ?? 0) - (bookById.get(a[0])?.avgRating ?? 0))
    .map(([id]) => bookById.get(id)!);
  if (ranked.length < limit) {
    const taken = new Set([...exclude, ...ranked.map((b) => b.id)]);
    const filler = [...SEED_BOOKS]
      .filter((b) => !taken.has(b.id))
      .sort((a, b) => b.ratingsCount * b.avgRating - a.ratingsCount * a.avgRating);
    ranked.push(...filler.slice(0, limit - ranked.length));
  }
  return ranked.slice(0, limit);
}

export function searchBooks(books: Book[], query: string): Book[] {
  const q = normalizeText(query);
  if (!q) return [];
  const scored: { b: Book; s: number }[] = [];
  for (const b of books) {
    const titles = [normalizeText(b.titleFa), normalizeText(b.titleEn)];
    const authors = [normalizeText(b.authorFa), normalizeText(b.authorEn)];
    let s = 0;
    if (titles.some((t) => t === q)) s = 100;
    else if (titles.some((t) => t.startsWith(q))) s = 80;
    else if (titles.some((t) => t.split(" ").some((w) => w.startsWith(q)))) s = 60;
    else if (titles.some((t) => t.includes(q))) s = 50;
    else if (authors.some((a) => a.startsWith(q) || a.split(" ").some((w) => w.startsWith(q))))
      s = 40;
    else if (authors.some((a) => a.includes(q))) s = 30;
    if (s) scored.push({ b, s: s + b.avgRating });
  }
  return scored.sort((a, b) => b.s - a.s).map((x) => x.b);
}

export const mockBooks: BooksRepository = {
  async list() {
    return delay(SEED_BOOKS);
  },
  async get(id) {
    return delay(bookById.get(id) ?? null);
  },
  async search(query) {
    return delay(searchBooks(SEED_BOOKS, query));
  },
  async getStats(id) {
    const b = bookById.get(id);
    if (!b) throw new ApiError("notFound");
    const dist = [...b.ratingDistribution] as BookStats["distribution"];
    const db = readDb();
    // seeded reviews are already part of the base counts; add real users' ratings
    for (const r of db.reviews) {
      if (r.bookId === id && !isSeedUser(r.userId) && r.rating >= 1) dist[r.rating - 1] = (dist[r.rating - 1] ?? 0) + 1;
    }
    const count = dist.reduce((a, c) => a + c, 0);
    const sum = dist.reduce((a, c, i) => a + c * (i + 1), 0);
    return delay({ avgRating: count ? sum / count : 0, ratingsCount: count, distribution: dist });
  },
  async readersAlsoRead(id, limit = 8) {
    const counts = coOccurrence([id], readerSets());
    return delay(rankByCounts(counts, new Set([id]), limit));
  },
  async discover(userId, limit = 10) {
    const db = readDb();
    const user = db.users.find((u) => u.id === userId);
    const mine = db.shelves.filter((s) => s.userId === userId).map((s) => s.bookId);
    const seeds = [...new Set([...(user?.favoriteBookIds ?? []), ...mine])];
    const counts = coOccurrence(seeds, SEED_READERS.map((r) => r.read));
    return delay(rankByCounts(counts, new Set(seeds), limit));
  },
};

/* ---------------- shelves ---------------- */

/** Pure shelf transition: records finishedAt on entering "read", clears it on leaving. */
export function applyShelfMove(
  existing: ShelfEntry | undefined,
  userId: string,
  bookId: string,
  shelf: ShelfEntry["shelf"],
  now: Date = new Date(),
): ShelfEntry {
  const iso = now.toISOString();
  const wasRead = existing?.shelf === "read";
  return {
    userId,
    bookId,
    shelf,
    addedAt: existing?.addedAt ?? iso,
    updatedAt: iso,
    finishedAt: shelf === "read" ? (wasRead ? existing?.finishedAt : iso) : undefined,
  };
}

export const mockShelves: ShelvesRepository = {
  async list(userId) {
    const rows = readDb().shelves.filter((s) => s.userId === userId);
    return delay(rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  },
  async getEntry(userId, bookId) {
    return delay(readDb().shelves.find((s) => s.userId === userId && s.bookId === bookId) ?? null);
  },
  async setShelf(userId, bookId, shelf) {
    if (!bookById.has(bookId)) throw new ApiError("notFound");
    const entry = updateDb((db) => {
      const idx = db.shelves.findIndex((s) => s.userId === userId && s.bookId === bookId);
      const next = applyShelfMove(idx >= 0 ? db.shelves[idx] : undefined, userId, bookId, shelf);
      if (idx >= 0) db.shelves[idx] = next;
      else db.shelves.push(next);
      return next;
    });
    return delay(entry);
  },
  async remove(userId, bookId) {
    updateDb((db) => {
      db.shelves = db.shelves.filter((s) => !(s.userId === userId && s.bookId === bookId));
    });
    return delay(undefined);
  },
};

/* ---------------- goals ---------------- */

export function countReadInYear(entries: ShelfEntry[], year: number): number {
  return entries.filter((e) => e.shelf === "read" && e.finishedAt && jalaliYear(new Date(e.finishedAt)) === year)
    .length;
}

export const mockGoals: GoalsRepository = {
  async get(userId, year) {
    return delay(readDb().goals.find((g) => g.userId === userId && g.year === year) ?? null);
  },
  async set(userId, year, target) {
    const t = Math.max(1, Math.min(999, Math.round(target)));
    const goal = updateDb((db) => {
      const g = { userId, year, target: t };
      const idx = db.goals.findIndex((x) => x.userId === userId && x.year === year);
      if (idx >= 0) db.goals[idx] = g;
      else db.goals.push(g);
      return g;
    });
    return delay(goal);
  },
  async progress(userId, year) {
    const db = readDb();
    const goal = db.goals.find((g) => g.userId === userId && g.year === year);
    const read = countReadInYear(
      db.shelves.filter((s) => s.userId === userId),
      year,
    );
    return delay({ year, target: goal?.target ?? null, read });
  },
};

/* ---------------- reviews ---------------- */

export const mockReviews: ReviewsRepository = {
  async listForBook(bookId) {
    const rows = readDb().reviews.filter((r) => r.bookId === bookId);
    return delay(rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },
  async listForUser(userId) {
    const rows = readDb().reviews.filter((r) => r.userId === userId);
    return delay(rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  },
  async getMine(userId, bookId) {
    return delay(readDb().reviews.find((r) => r.userId === userId && r.bookId === bookId) ?? null);
  },
  async upsert({ userId, bookId, rating, text, spoiler }) {
    if (rating < 1 || rating > 5) throw new ApiError("invalid");
    const review = updateDb((db) => {
      const user = db.users.find((u) => u.id === userId);
      if (!user) throw new ApiError("unauthorized");
      const now = new Date().toISOString();
      const idx = db.reviews.findIndex((r) => r.userId === userId && r.bookId === bookId);
      const base = idx >= 0 ? db.reviews[idx] : null;
      const r = {
        id: base?.id ?? uid("rv"),
        bookId,
        userId,
        userName: user.name,
        userAvatar: user.avatar,
        rating: Math.round(rating),
        text: text.trim(),
        spoiler,
        createdAt: base?.createdAt ?? now,
        updatedAt: now,
      };
      if (idx >= 0) db.reviews[idx] = r;
      else db.reviews.push(r);
      return r;
    });
    return delay(review);
  },
  async remove(userId, reviewId) {
    updateDb((db) => {
      db.reviews = db.reviews.filter((r) => !(r.id === reviewId && r.userId === userId));
    });
    return delay(undefined);
  },
};

/* ---------------- profile ---------------- */

export const mockProfile: ProfileRepository = {
  async me() {
    const db = readDb();
    const u = db.session && db.users.find((x) => x.id === db.session!.userId);
    return delay(u ? publicUser(u) : null);
  },
  async update(userId, patch) {
    const me = requireSessionUser();
    if (me.id !== userId) throw new ApiError("unauthorized");
    const user = updateDb((db) => {
      const u = db.users.find((x) => x.id === userId)!;
      Object.assign(u, patch);
      if (patch.name !== undefined) u.name = patch.name.trim() || u.name;
      // keep denormalized names/avatars on reviews in sync
      for (const r of db.reviews) {
        if (r.userId === userId) {
          r.userName = u.name;
          r.userAvatar = u.avatar;
        }
      }
      return u;
    });
    return delay(publicUser(user) as User);
  },
};

export const mockApi: Api = {
  auth: mockAuth,
  books: mockBooks,
  shelves: mockShelves,
  goals: mockGoals,
  reviews: mockReviews,
  profile: mockProfile,
};
