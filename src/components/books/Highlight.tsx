import { findMatchRange } from "@/lib/search";

/** Highlights the (normalized) search match inside `text`. */
export function Highlight({ text, query }: { text: string; query: string }) {
  const range = query ? findMatchRange(text, query) : null;
  if (!range) return <>{text}</>;
  const [s, e] = range;
  return (
    <>
      {text.slice(0, s)}
      <mark className="rounded-[4px] bg-rose/20 px-0.5 text-pomegranate">{text.slice(s, e)}</mark>
      {text.slice(e)}
    </>
  );
}
