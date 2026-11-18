import { CatWithBook } from "@/components/brand/doodles";
import { Logo } from "@/components/brand/Logo";
import { fa } from "@/i18n/fa";

/** Shown while a page's data loads in the browser. */
export function LoadingScreen() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-4 px-6 text-center" role="status">
      <CatWithBook className="h-28 w-auto animate-float" />
      <Logo size="sm" />
      <p className="text-sm text-olive-dark">{fa.common.appLoading}</p>
    </div>
  );
}
