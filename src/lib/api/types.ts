export type ShelfId = "want" | "reading" | "read" | "dnf";
export const SHELVES: ShelfId[] = ["want", "reading", "read", "dnf"];

export interface User {
  id: string;
  name: string;
  email?: string | undefined;
  phone?: string | undefined;
  bio: string;
  /** data URL from a device upload, or undefined for the default doodle avatar */
  avatar?: string | undefined;
  favoriteBookIds: string[];
  createdAt: string;
}

export interface Book {
  id: string;
  titleFa: string;
  titleEn: string;
  authorFa: string;
  authorEn: string;
  year: number;
  /** Persian description */
  description: string;
  avgRating: number;
  ratingsCount: number;
  /** counts for 1..5 stars (index 0 = 1 star) */
  ratingDistribution: [number, number, number, number, number];
  /** visual seed for the generated placeholder cover */
  cover: { palette: number; motif: CoverMotif };
}

export type CoverMotif = "pomegranate" | "olive" | "cat" | "moon" | "leaf" | "teacup" | "star";

export interface ShelfEntry {
  userId: string;
  bookId: string;
  shelf: ShelfId;
  addedAt: string;
  updatedAt: string;
  /** set when the book lands on "read"; cleared if it leaves "read" */
  finishedAt?: string | undefined;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userAvatar?: string | undefined;
  rating: number;
  text: string;
  spoiler: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingGoal {
  userId: string;
  /** Jalali year, e.g. 1405 */
  year: number;
  target: number;
}

export interface GoalProgress {
  year: number;
  target: number | null;
  read: number;
}

export interface BookStats {
  avgRating: number;
  ratingsCount: number;
  distribution: [number, number, number, number, number];
}

export type AuthMethod = "email" | "phone";

export interface AuthIdentifier {
  method: AuthMethod;
  /** email address or normalized 09xxxxxxxxx */
  value: string;
}

export interface Session {
  userId: string;
  createdAt: string;
}

/** Picks collected on /welcome before the account exists. */
export interface OnboardingDraft {
  favoriteBookIds: string[];
  email: string;
}
