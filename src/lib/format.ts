const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Render any Latin digits in a value as Persian digits. */
export function faNum(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

/** Convert Persian/Arabic digits to Latin digits (for parsing input). */
export function toLatinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
}

export function faDecimal(value: number, digits = 1): string {
  return faNum(value.toFixed(digits)).replace(".", "٫");
}

export function faCompact(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value);
}

/** Current year in the Jalali (Persian) calendar. */
export function jalaliYear(date: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US-u-ca-persian", { year: "numeric" }).formatToParts(
    date,
  );
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  return Number(toLatinDigits(y).replace(/\D/g, ""));
}

/** e.g. «۲۷ آبان ۱۴۰۵» */
export function jalaliDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function jalaliMonthYear(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { month: "long", year: "numeric" }).format(
    d,
  );
}

/** Normalize an Iranian mobile number to 09xxxxxxxxx, or null if invalid. */
export function normalizeIranPhone(input: string): string | null {
  let s = toLatinDigits(input).replace(/[\s\-()]/g, "");
  if (s.startsWith("+98")) s = "0" + s.slice(3);
  else if (s.startsWith("0098")) s = "0" + s.slice(4);
  else if (s.startsWith("98") && s.length === 12) s = "0" + s.slice(2);
  else if (s.startsWith("9") && s.length === 10) s = "0" + s;
  return /^09\d{9}$/.test(s) ? s : null;
}

export function formatIranPhone(phone: string): string {
  const p = normalizeIranPhone(phone) ?? phone;
  return faNum(`${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7)}`);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
