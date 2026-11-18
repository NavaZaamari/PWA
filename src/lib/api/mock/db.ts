import type { OnboardingDraft, ReadingGoal, Review, Session, ShelfEntry, User } from "../types";
import { SEED_READERS, SEED_REVIEWS } from "./seed-social";

export interface StoredUser extends User {
  password?: string | undefined;
}

export interface MockDb {
  version: number;
  users: StoredUser[];
  session: Session | null;
  shelves: ShelfEntry[];
  reviews: Review[];
  goals: ReadingGoal[];
  onboarding: OnboardingDraft | null;
}

const KEY = "yoin:mock-db";
const VERSION = 1;
let memory: MockDb | null = null;
let latencyMs = 220;

/** Tests set this to 0. */
export function setMockLatency(ms: number) {
  latencyMs = ms;
}

export function delay<T>(value: T): Promise<T> {
  if (latencyMs <= 0) return Promise.resolve(value);
  const jitter = Math.round(latencyMs * (0.6 + Math.random() * 0.8));
  return new Promise((r) => setTimeout(() => r(value), jitter));
}

function seed(): MockDb {
  const now = Date.now();
  const nameOf = (id: string) => SEED_READERS.find((r) => r.id === id)?.name ?? "کتاب‌خوان";
  return {
    version: VERSION,
    users: [],
    session: null,
    shelves: [],
    goals: [],
    onboarding: null,
    reviews: SEED_REVIEWS.map((r, i) => {
      const at = new Date(now - r.daysAgo * 86_400_000).toISOString();
      return {
        id: `seed-${i}`,
        bookId: r.bookId,
        userId: r.readerId,
        userName: nameOf(r.readerId),
        rating: r.rating,
        text: r.text,
        spoiler: r.spoiler,
        createdAt: at,
        updatedAt: at,
      };
    }),
  };
}

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function readDb(): MockDb {
  const ls = storage();
  if (!ls) return (memory ??= seed());
  const raw = ls.getItem(KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as MockDb;
      if (parsed.version === VERSION) return parsed;
    } catch {
      /* fall through to reseed */
    }
  }
  const fresh = seed();
  ls.setItem(KEY, JSON.stringify(fresh));
  return fresh;
}

export function writeDb(db: MockDb) {
  const ls = storage();
  if (!ls) {
    memory = db;
    return;
  }
  ls.setItem(KEY, JSON.stringify(db));
}

export function updateDb<T>(fn: (db: MockDb) => T): T {
  const db = readDb();
  const result = fn(db);
  writeDb(db);
  return result;
}

export function resetDb() {
  memory = null;
  storage()?.removeItem(KEY);
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Sanitized user without the password. */
export function publicUser(u: StoredUser): User {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = u;
  return rest;
}
