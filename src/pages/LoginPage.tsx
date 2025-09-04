import { useState } from "react";
import { signIn } from "@/services/auth";
import { validateEmail, validatePassword } from "@/utils/validation/auth";
import { fieldA11y } from "@/utils/validation/forms";
import useNav from "@/hooks/useNav";

function LoginPage() {
  const nav = useNav();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<{ email?: string; password?: string }>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setFieldErr({ email: eErr || undefined, password: pErr || undefined });
    if (eErr || pErr) return;

    setBusy(true);
    const res = await signIn(email, password);
    setBusy(false);
    if (!res.ok) {
      setErr(res.error || "Inloggen mislukt");
      try {
        // @ts-ignore
        track?.("auth:login:fail", { email });
      } catch {}
      return;
    }
    try {
      // @ts-ignore
      track?.("auth:login:success", { email });
    } catch {}
    nav.to("/", { source: "login" }, true);
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-10">
      <h1 className="mb-6 font-heading text-2xl text-midnight">Inloggen</h1>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <label className="block text-sm">
          E-mail
          <input
            type="email"
            required
            {...fieldA11y("login-email", fieldErr.email)}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
          />
        </label>
        {fieldErr.email && (
          <p id="login-email-err" className="text-sm text-red-600" role="alert" aria-live="polite">
            {fieldErr.email}
          </p>
        )}

        <label className="block text-sm">
          Wachtwoord
          <input
            type="password"
            required
            minLength={8}
            {...fieldA11y("login-password", fieldErr.password)}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
          />
        </label>
        {fieldErr.password && (
          <p id="login-password-err" className="text-sm text-red-600" role="alert" aria-live="polite">
            {fieldErr.password}
          </p>
        )}

        {err && (
          <p className="text-sm text-red-600" role="alert" aria-live="polite">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-2xl bg-midnight px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Bezig…" : "Log in"}
        </button>
        <div className="text-center text-sm">
          <a href="/forgot-password" className="text-accent hover:underline">
            Wachtwoord vergeten?
          </a>
        </div>
      </form>
    </main>
  );
}
export default LoginPage;