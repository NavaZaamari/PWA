import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate, type SearchSchemaInput } from "@tanstack/react-router";
import { KeyRound, Mail, MessageSquareText, Smartphone } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { CatWithBook, OliveBranch, Pomegranate } from "@/components/brand/doodles";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  onboardingQuery,
  usePasswordLogin,
  usePasswordSignup,
  useRequestOtp,
  useVerifyOtp,
} from "@/hooks/api";
import { fa, t } from "@/i18n/fa";
import { ApiError, type AuthIdentifier, type AuthMethod } from "@/lib/api";
import { redirectIfAuthed } from "@/lib/auth-guard";
import { faNum, formatIranPhone, isValidEmail, normalizeIranPhone, toLatinDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";
type Way = "password" | "otp";
type FieldErrors = Partial<Record<"name" | "id" | "password", string>>;

export const Route = createFileRoute("/auth")({
  validateSearch: (s: { mode?: Mode | undefined; email?: string | undefined } & SearchSchemaInput) => ({
    mode: s.mode === "signup" || s.mode === "login" ? s.mode : undefined,
    email: typeof s.email === "string" ? s.email : undefined,
  }),
  beforeLoad: redirectIfAuthed,
  loader: ({ context }) => context.queryClient.ensureQueryData(onboardingQuery()),
  head: () => ({
    meta: [
      { title: "ورود و ثبت‌نام | یوئین" },
      { name: "description", content: "با ایمیل یا شمارهٔ موبایل وارد یوئین شو یا حساب تازه بساز." },
      { property: "og:title", content: "ورود و ثبت‌نام | یوئین" },
      { property: "og:description", content: "با ایمیل یا شمارهٔ موبایل وارد یوئین شو یا حساب تازه بساز." },
    ],
  }),
  component: AuthPage,
});

function errorText(e: unknown): string {
  if (e instanceof ApiError) {
    const map: Partial<Record<string, string>> = {
      userExists: fa.auth.userExists,
      userMissing: fa.auth.userMissing,
      wrongCredentials: fa.auth.wrongCredentials,
      wrongOtp: fa.auth.wrongOtp,
    };
    return map[e.code] ?? fa.common.errorBody;
  }
  return fa.common.errorBody;
}

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { data: draft } = useSuspenseQuery(onboardingQuery());

  const prefillEmail = search.email ?? draft?.email ?? "";
  const mode: Mode = search.mode ?? (prefillEmail ? "signup" : "login");
  const [method, setMethod] = useState<AuthMethod>("email");
  const [way, setWay] = useState<Way>("password");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(prefillEmail);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpSentTo, setOtpSentTo] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const signup = usePasswordSignup();
  const login = usePasswordLogin();
  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();
  const pending = signup.isPending || login.isPending || requestOtp.isPending || verifyOtp.isPending;

  // reset the OTP step whenever the form context changes
  useEffect(() => {
    setOtpSentTo(null);
    setCode("");
    setErrors({});
    setFormError(null);
  }, [mode, method, way]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft]);

  const setMode = (m: Mode) =>
    navigate({ to: "/auth", search: { mode: m, email: search.email }, replace: true });

  const identifier = (): AuthIdentifier | null => {
    if (method === "email") return isValidEmail(email) ? { method, value: email.trim().toLowerCase() } : null;
    const p = normalizeIranPhone(phone);
    return p ? { method, value: p } : null;
  };

  const validate = () => {
    const next: FieldErrors = {};
    if (mode === "signup" && !name.trim()) next.name = fa.auth.nameRequired;
    if (!identifier()) next.id = method === "email" ? fa.auth.invalidEmail : fa.auth.invalidPhone;
    if (way === "password" && password.length < 6) next.password = fa.auth.shortPassword;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const done = (isNew: boolean) => {
    toast.success(isNew ? fa.auth.welcomeNew : fa.auth.welcomeBack);
    void navigate({ to: "/" });
  };

  const sendCode = async () => {
    const id = identifier();
    if (!id) return;
    const res = await requestOtp.mutateAsync(id);
    setOtpSentTo(res.sentTo);
    setSecondsLeft(res.resendAfterSec);
    setCode("");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!otpSentTo && !validate()) return;
    const id = identifier()!;
    try {
      if (way === "password") {
        if (mode === "signup") await signup.mutateAsync({ id, password, name });
        else await login.mutateAsync({ id, password });
        return done(mode === "signup");
      }
      if (!otpSentTo) return await sendCode();
      if (toLatinDigits(code).length !== 6) return setFormError(fa.auth.wrongOtp);
      await verifyOtp.mutateAsync(mode === "signup" ? { id, code, signup: { name } } : { id, code });
      done(mode === "signup");
    } catch (err) {
      setFormError(errorText(err));
    }
  };

  const sentLabel =
    otpSentTo && (method === "phone" ? formatIranPhone(otpSentTo) : otpSentTo);

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Decorative side panel (desktop) */}
      <aside className="relative hidden overflow-hidden bg-olive-dark p-12 text-cream lg:flex lg:flex-col lg:justify-between">
        <Logo size="md" className="self-start bg-cream/10" />
        <div className="relative z-10 max-w-md">
          <CatWithBook className="mb-8 h-44 w-auto animate-float" />
          <h2 className="text-3xl font-extrabold leading-snug text-cream">{fa.auth.sideTitle}</h2>
          <p className="mt-3 text-cream/75">{fa.auth.sideBody}</p>
        </div>
        <OliveBranch className="absolute -bottom-2 -start-4 h-28 w-auto text-cream opacity-40" />
        <Pomegranate className="absolute end-16 top-24 h-14 w-14 opacity-80" />
      </aside>

      <main className="flex items-center justify-center px-4 pb-10 pt-[calc(var(--safe-top)+2rem)]">
        <div className="w-full max-w-md animate-page-in">
          <div className="mb-6 flex flex-col items-center text-center lg:hidden">
            <Logo size="lg" />
          </div>
          <h1 className="text-center text-2xl font-extrabold lg:text-start">{fa.auth.title}</h1>
          <p className="mt-1 text-center text-sm text-olive-dark lg:text-start">{fa.auth.subtitle}</p>

          {/* signup / login */}
          <div className="mt-6 grid grid-cols-2 gap-1 rounded-2xl bg-straw p-1.5" role="tablist" aria-label={fa.auth.title}>
            {(["signup", "login"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={cn(
                  "tap rounded-xl text-sm font-bold transition-all",
                  mode === m ? "bg-cream text-pomegranate shadow-soft" : "text-olive-dark hover:text-night",
                )}
              >
                {m === "signup" ? fa.auth.signup : fa.auth.login}
              </button>
            ))}
          </div>

          <form onSubmit={submit} noValidate className="surface mt-4 space-y-4 p-5">
            {/* method: email / phone */}
            <fieldset>
              <legend className="mb-2 text-xs font-semibold text-olive-dark">{fa.auth.methodLabel}</legend>
              <div className="grid grid-cols-2 gap-2">
                <ChoiceChip active={method === "email"} onClick={() => setMethod("email")} icon={<Mail />}>
                  {fa.auth.email}
                </ChoiceChip>
                <ChoiceChip active={method === "phone"} onClick={() => setMethod("phone")} icon={<Smartphone />}>
                  {fa.auth.phone}
                </ChoiceChip>
              </div>
            </fieldset>

            {/* way: password / otp */}
            <fieldset>
              <legend className="mb-2 text-xs font-semibold text-olive-dark">{fa.auth.wayLabel}</legend>
              <div className="grid grid-cols-2 gap-2">
                <ChoiceChip active={way === "password"} onClick={() => setWay("password")} icon={<KeyRound />}>
                  {fa.auth.withPassword}
                </ChoiceChip>
                <ChoiceChip active={way === "otp"} onClick={() => setWay("otp")} icon={<MessageSquareText />}>
                  {fa.auth.withOtp}
                </ChoiceChip>
              </div>
            </fieldset>

            {!otpSentTo && (
              <>
                {mode === "signup" && (
                  <Field id="name" label={fa.auth.nameLabel} error={errors.name}>
                    <Input
                      id="name"
                      autoComplete="nickname"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={fa.auth.namePlaceholder}
                      aria-invalid={!!errors.name}
                      maxLength={40}
                    />
                  </Field>
                )}
                {method === "email" ? (
                  <Field id="email" label={fa.auth.emailLabel} error={errors.id}>
                    <Input
                      id="email"
                      type="email"
                      dir="ltr"
                      autoComplete="email"
                      inputMode="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={fa.auth.emailPlaceholder}
                      aria-invalid={!!errors.id}
                      className="font-latin text-start"
                    />
                  </Field>
                ) : (
                  <Field id="phone" label={fa.auth.phoneLabel} error={errors.id}>
                    <Input
                      id="phone"
                      type="tel"
                      dir="ltr"
                      autoComplete="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={fa.auth.phonePlaceholder}
                      aria-invalid={!!errors.id}
                      className="text-start tracking-wider"
                    />
                  </Field>
                )}
                {way === "password" && (
                  <Field id="password" label={fa.auth.passwordLabel} error={errors.password} hint={fa.auth.passwordHint}>
                    <Input
                      id="password"
                      type="password"
                      dir="ltr"
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={!!errors.password}
                    />
                  </Field>
                )}
                {way === "otp" && <p className="text-sm text-olive-dark">{fa.auth.otpIntro}</p>}
              </>
            )}

            {otpSentTo && (
              <div className="space-y-3">
                <p className="text-sm text-night">
                  {fa.auth.otpSentTo.split("{target}")[0]}
                  <bdi dir="ltr" className="font-bold">
                    {sentLabel}
                  </bdi>
                  {fa.auth.otpSentTo.split("{target}")[1]}{" "}
                  <button
                    type="button"
                    onClick={() => setOtpSentTo(null)}
                    className="font-semibold text-pomegranate underline-offset-4 hover:underline"
                  >
                    {fa.auth.changeTarget}
                  </button>
                </p>
                <label htmlFor="otp" className="block text-sm font-semibold text-olive-dark">
                  {fa.auth.otpLabel}
                </label>
                <div dir="ltr" className="flex justify-center">
                  <InputOTP
                    id="otp"
                    maxLength={6}
                    value={code}
                    onChange={(v) => setCode(toLatinDigits(v))}
                    inputMode="numeric"
                    pattern="^[0-9۰-۹٠-٩]*$"
                    autoFocus
                  >
                    <InputOTPGroup className="gap-1.5 sm:gap-2">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot key={i} index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="rounded-xl bg-olive/10 px-3 py-2 text-center text-xs font-semibold text-olive-dark">
                  {fa.auth.otpDemoHint}
                </p>
                <div className="text-center text-sm">
                  {secondsLeft > 0 ? (
                    <span className="text-olive-dark" aria-live="polite">
                      {t(fa.auth.resendIn, { s: faNum(secondsLeft) })}
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={async () => {
                        await sendCode();
                        toast(fa.auth.otpResent);
                      }}
                      className="tap font-semibold text-pomegranate underline-offset-4 hover:underline"
                    >
                      {fa.auth.resend}
                    </button>
                  )}
                </div>
              </div>
            )}

            {formError && (
              <p role="alert" className="rounded-xl bg-rose/10 px-3 py-2 text-sm font-semibold text-rose">
                {formError}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {way === "otp"
                ? otpSentTo
                  ? fa.auth.verify
                  : fa.auth.sendCode
                : mode === "signup"
                  ? fa.auth.submitSignup
                  : fa.auth.submitLogin}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-olive-dark">
            {fa.auth.newHere}{" "}
            <Link to="/welcome" className="font-bold text-pomegranate underline-offset-4 hover:underline">
              {fa.auth.startOnboarding}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function ChoiceChip({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "tap flex items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors [&_svg]:h-4 [&_svg]:w-4",
        active
          ? "border-pomegranate bg-pomegranate/8 text-pomegranate"
          : "border-border bg-cream/60 text-night hover:bg-cream",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-night">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-xs font-semibold text-rose">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-olive-dark">{hint}</p>
      ) : null}
    </div>
  );
}
