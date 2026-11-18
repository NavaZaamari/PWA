import { toLatinDigits } from "./format";

/**
 * Normalize text for bilingual search: unify Arabic/Persian letters,
 * drop ZWNJ/diacritics/tatweel, convert digits, lowercase Latin.
 */
export function normalizeText(input: string): string {
  return toLatinDigits(input)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // Latin combining marks (é → e)
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "") // Arabic diacritics
    .replace(/[\u200c\u200d\u200e\u200f\u0640]/g, "") // ZWNJ, ZWJ, marks, tatweel
    .replace(/[يىئ]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[ةۀ]/g, "ه")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Find the [start, end) range of `query` inside `text` after normalization,
 * mapped back to original character offsets. Returns null if no match.
 */
export function findMatchRange(text: string, query: string): [number, number] | null {
  const q = normalizeText(query);
  if (!q) return null;
  // Build normalized string char-by-char with an index map back to the original.
  let norm = "";
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i] ?? "";
    let n = normalizeText(c);
    if (!n && /[\s\p{P}\p{S}]/u.test(c) && norm.length && !norm.endsWith(" ")) n = " ";
    for (const ch of n) {
      norm += ch;
      map.push(i);
    }
  }
  const idx = norm.indexOf(q);
  if (idx < 0) return null;
  const start = map[idx] ?? 0;
  const end = (map[idx + q.length - 1] ?? start) + 1;
  return [start, end];
}
