import { beforeEach, describe, expect, it } from "vitest";

import { setMockLatency, resetDb } from "@/lib/api/mock/db";
import {
  MOCK_OTP,
  applyShelfMove,
  countReadInYear,
  mockAuth,
  mockShelves,
  mockGoals,
  searchBooks,
} from "@/lib/api/mock";
import { SEED_BOOKS } from "@/lib/api/mock/seed-books";
import { jalaliYear, normalizeIranPhone } from "@/lib/format";

beforeEach(() => {
  setMockLatency(0);
  resetDb();
});

describe("auth", () => {
  it("accepts the mock OTP 123456", async () => {
    expect(MOCK_OTP).toBe("123456");
    const user = await mockAuth.verifyOtp({
      id: { method: "phone", value: "09123456789" },
      code: "123456",
      signup: { name: "مریم" },
    });
    expect(user.phone).toBe("09123456789");
    expect(mockAuth.hasSession()).toBe(true);
  });

  it("accepts the OTP typed with Persian digits", async () => {
    const user = await mockAuth.verifyOtp({
      id: { method: "email", value: "a@b.co" },
      code: "۱۲۳۴۵۶",
      signup: { name: "سارا" },
    });
    expect(user.email).toBe("a@b.co");
  });

  it("rejects any other OTP", async () => {
    await expect(
      mockAuth.verifyOtp({ id: { method: "email", value: "a@b.co" }, code: "000000", signup: { name: "x" } }),
    ).rejects.toMatchObject({ code: "wrongOtp" });
  });

  it("validates Iranian mobile numbers in 09xx xxx xxxx format", () => {
    expect(normalizeIranPhone("0912 345 6789")).toBe("09123456789");
    expect(normalizeIranPhone("۰۹۱۲۳۴۵۶۷۸۹")).toBe("09123456789");
    expect(normalizeIranPhone("+989123456789")).toBe("09123456789");
    expect(normalizeIranPhone("0812 345 6789")).toBeNull();
    expect(normalizeIranPhone("0912345678")).toBeNull();
  });

  it("keeps only 5 onboarding picks", async () => {
    const ids = SEED_BOOKS.slice(0, 7).map((b) => b.id);
    await mockAuth.saveOnboardingDraft({ favoriteBookIds: ids, email: "r@y.co" });
    expect((await mockAuth.getOnboardingDraft())?.favoriteBookIds).toHaveLength(5);
  });
});

describe("shelves", () => {
  it("keeps a book on exactly one shelf", async () => {
    await mockShelves.setShelf("u1", "blind-owl", "want");
    await mockShelves.setShelf("u1", "blind-owl", "reading");
    const rows = await mockShelves.list("u1");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.shelf).toBe("reading");
  });

  it("records finishedAt when a book lands on read and clears it when it leaves", () => {
    const now = new Date("2026-11-18T10:00:00Z");
    const reading = applyShelfMove(undefined, "u1", "b", "reading", now);
    expect(reading.finishedAt).toBeUndefined();
    const read = applyShelfMove(reading, "u1", "b", "read", now);
    expect(read.finishedAt).toBe(now.toISOString());
    const again = applyShelfMove(read, "u1", "b", "read", new Date("2026-12-01T00:00:00Z"));
    expect(again.finishedAt).toBe(now.toISOString());
    const dnf = applyShelfMove(read, "u1", "b", "dnf", now);
    expect(dnf.finishedAt).toBeUndefined();
  });
});

describe("yearly goal", () => {
  it("counts only books finished in the current Jalali year", () => {
    const year = jalaliYear(new Date("2026-11-18T10:00:00Z")); // 1405
    expect(year).toBe(1405);
    const base = { userId: "u1", addedAt: "", updatedAt: "" };
    const entries = [
      { ...base, bookId: "a", shelf: "read" as const, finishedAt: "2026-11-01T00:00:00Z" },
      { ...base, bookId: "b", shelf: "read" as const, finishedAt: "2025-11-01T00:00:00Z" }, // 1404
      { ...base, bookId: "c", shelf: "reading" as const },
    ];
    expect(countReadInYear(entries, 1405)).toBe(1);
  });

  it("drops a book from progress when it leaves Read", async () => {
    const y = jalaliYear();
    await mockGoals.set("u1", y, 10);
    await mockShelves.setShelf("u1", "blind-owl", "read");
    expect((await mockGoals.progress("u1", y)).read).toBe(1);
    await mockShelves.setShelf("u1", "blind-owl", "want");
    expect((await mockGoals.progress("u1", y)).read).toBe(0);
  });
});

describe("search", () => {
  it("matches Persian titles typed with Arabic letters", () => {
    expect(searchBooks(SEED_BOOKS, "بوف كور")[0]?.id).toBe("blind-owl");
  });
  it("matches English titles and authors", () => {
    expect(searchBooks(SEED_BOOKS, "little prince")[0]?.id).toBe("little-prince");
    expect(searchBooks(SEED_BOOKS, "hedayat").map((b) => b.id)).toContain("blind-owl");
  });
});
