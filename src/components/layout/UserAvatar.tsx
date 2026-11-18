import { CatAvatar } from "@/components/brand/doodles";
import { cn } from "@/lib/utils";

export function UserAvatar({
  src,
  name,
  className,
}: {
  src?: string | undefined;
  name: string;
  className?: string | undefined;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 overflow-hidden rounded-full border border-border bg-straw",
        className ?? "h-10 w-10",
      )}
    >
      {src ? (
        <img src={src} alt={`عکس ${name}`} className="h-full w-full object-cover" />
      ) : (
        <CatAvatar className="h-full w-full" role="img" aria-hidden={false} aria-label={`آواتار ${name}`} />
      )}
    </span>
  );
}
