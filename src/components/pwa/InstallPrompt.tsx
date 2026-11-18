import { Share, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { fa } from "@/i18n/fa";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "yoin:install-dismissed";
const DISMISS_DAYS = 14;

function recentlyDismissed() {
  const at = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
  return Date.now() - at < DISMISS_DAYS * 86_400_000;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosSafari() {
  const ua = navigator.userAgent;
  const ios = /iphone|ipad|ipod/i.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  const safari = /safari/i.test(ua) && !/crios|fxios|edgios|opios/i.test(ua);
  return ios && safari;
}

/** Persian "Add to Home Screen" prompt: native prompt on Android/desktop, instructions on iOS Safari. */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;
    // Don't nag inside the editor preview iframe.
    if (window.self !== window.top) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    const t = window.setTimeout(() => setIos(isIosSafari()), 2500);
    const onInstalled = () => setDeferred(null);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.clearTimeout(t);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDeferred(null);
    setIos(false);
  };

  if (!deferred && !ios) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="install-title"
      className="fixed inset-x-3 bottom-[calc(var(--safe-bottom)+var(--nav-height)+0.75rem)] z-50 mx-auto max-w-md animate-page-in rounded-3xl border border-border bg-cream p-4 shadow-lift lg:bottom-6"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label={fa.pwa.dismiss}
        className="tap absolute end-1 top-1 inline-flex items-center justify-center rounded-full text-olive-dark hover:text-night"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pe-8">
        <Logo size="sm" />
        <div className="min-w-0">
          <h2 id="install-title" className="text-sm font-bold">
            {deferred ? fa.pwa.installTitle : fa.pwa.iosTitle}
          </h2>
          <p className="mt-0.5 text-xs leading-6 text-olive-dark">
            {deferred ? (
              fa.pwa.installBody
            ) : (
              <>
                <Share className="mx-0.5 inline h-3.5 w-3.5 align-[-2px] text-pomegranate" aria-hidden />
                {fa.pwa.iosBody}
              </>
            )}
          </p>
        </div>
      </div>
      {deferred && (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={async () => {
              await deferred.prompt();
              await deferred.userChoice.catch(() => undefined);
              setDeferred(null);
            }}
          >
            {fa.pwa.install}
          </Button>
          <Button size="sm" variant="ghost" onClick={dismiss}>
            {fa.pwa.later}
          </Button>
        </div>
      )}
    </div>
  );
}
