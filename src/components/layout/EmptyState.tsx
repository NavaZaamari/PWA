import type { ReactNode } from "react";

import { CatWithBook } from "@/components/brand/doodles";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  body,
  action,
  className,
  art,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
  art?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-3xl border border-dashed border-sage px-6 py-10 text-center",
        className,
      )}
    >
      {art ?? <CatWithBook className="h-28 w-auto animate-float" />}
      <h3 className="mt-4 text-base font-bold">{title}</h3>
      {body && <p className="mt-1 max-w-xs text-sm text-olive-dark">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
