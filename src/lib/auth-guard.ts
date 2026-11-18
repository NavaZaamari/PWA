import { redirect } from "@tanstack/react-router";

import { api } from "@/lib/api";

/** beforeLoad guard for app routes (client-only: routes run with ssr: false). */
export function requireAuth() {
  if (!api.auth.hasSession()) throw redirect({ to: "/auth", search: { mode: "login" } });
}

/** beforeLoad guard for /auth and /welcome: signed-in users go home. */
export function redirectIfAuthed() {
  if (api.auth.hasSession()) throw redirect({ to: "/" });
}
