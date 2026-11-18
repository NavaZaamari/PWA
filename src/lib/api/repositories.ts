import type {
  AuthIdentifier,
  Book,
  BookStats,
  GoalProgress,
  OnboardingDraft,
  ReadingGoal,
  Review,
  Session,
  ShelfEntry,
  ShelfId,
  User,
} from "./types";

/**
 * Repository contracts. The UI only talks to these interfaces (through the
 * TanStack Query hooks in src/hooks/api.ts); swap the mock implementation
 * for an HTTP one to connect a real backend.
 */

export interface AuthRepository {
  getSession(): Promise<Session | null>;
  /** synchronous peek used by route guards */
  hasSession(): boolean;
  signUpWithPassword(input: {
    id: AuthIdentifier;
    password: string;
    name: string;
    favoriteBookIds?: string[];
  }): Promise<User>;
  loginWithPassword(input: { id: AuthIdentifier; password: string }): Promise<User>;
  requestOtp(id: AuthIdentifier): Promise<{ sentTo: string; resendAfterSec: number }>;
  /** verifies the code; creates the account if `signup` is set and the user does not exist */
  verifyOtp(input: {
    id: AuthIdentifier;
    code: string;
    signup?: { name: string; favoriteBookIds?: string[] };
  }): Promise<User>;
  logout(): Promise<void>;
  saveOnboardingDraft(draft: OnboardingDraft): Promise<void>;
  getOnboardingDraft(): Promise<OnboardingDraft | null>;
}

export interface BooksRepository {
  list(): Promise<Book[]>;
  get(id: string): Promise<Book | null>;
  search(query: string): Promise<Book[]>;
  getStats(id: string): Promise<BookStats>;
  /** non-AI co-occurrence: books most often read together with `id` */
  readersAlsoRead(id: string, limit?: number): Promise<Book[]>;
  /** discover row seeded from the user's favorites/shelves */
  discover(userId: string, limit?: number): Promise<Book[]>;
}

export interface ShelvesRepository {
  list(userId: string): Promise<ShelfEntry[]>;
  getEntry(userId: string, bookId: string): Promise<ShelfEntry | null>;
  /** places the book on exactly one shelf (moving it if needed) */
  setShelf(userId: string, bookId: string, shelf: ShelfId): Promise<ShelfEntry>;
  remove(userId: string, bookId: string): Promise<void>;
}

export interface GoalsRepository {
  get(userId: string, year: number): Promise<ReadingGoal | null>;
  set(userId: string, year: number, target: number): Promise<ReadingGoal>;
  progress(userId: string, year: number): Promise<GoalProgress>;
}

export interface ReviewsRepository {
  listForBook(bookId: string): Promise<Review[]>;
  listForUser(userId: string): Promise<Review[]>;
  getMine(userId: string, bookId: string): Promise<Review | null>;
  upsert(input: {
    userId: string;
    bookId: string;
    rating: number;
    text: string;
    spoiler: boolean;
  }): Promise<Review>;
  remove(userId: string, reviewId: string): Promise<void>;
}

export interface ProfileRepository {
  me(): Promise<User | null>;
  update(
    userId: string,
    patch: Partial<Pick<User, "name" | "bio" | "avatar" | "favoriteBookIds">>,
  ): Promise<User>;
}

export interface Api {
  auth: AuthRepository;
  books: BooksRepository;
  shelves: ShelvesRepository;
  goals: GoalsRepository;
  reviews: ReviewsRepository;
  profile: ProfileRepository;
}
