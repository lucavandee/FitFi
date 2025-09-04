import { useState } from "react";
import { signUp } from "@/services/auth";
import { validateEmail, validatePassword } from "@/utils/validation/auth";
import useNav from "@/hooks/useNav";

function RegisterPage() {
  const nav = useNav();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<{ email?: string; password?: string }>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setFieldErr({ email: eErr || undefined, password: pErr || undefined });
    if (eErr || pErr) return;

    setBusy(true);
    const res = await signUp(email, password);
    setBusy(false);
    if (!res.ok) {
      setErr(res.error || "Registratie mislukt");
      try {
        // @ts-ignore
        track?.("auth:register:fail", { email });
      } catch {}
      return;
    }
    setMsg("Check je inbox om je account te bevestigen.");
    try {
      // @ts-ignore
      track?.("auth:register:success", { email });
    } catch {}
    // optioneel direct naar home
    // nav.to("/", { source: "register" }, true);
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-10">
      <h1 className="mb-6 font-heading text-2xl text-midnight">Account aanmaken</h1>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <label className="block text-sm">
          E-mail
          <input
            type="email"
            required
            aria-invalid={Boolean(fieldErr.email)}
            aria-describedby={fieldErr.email ? "register-email-err" : undefined}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
          />
        </label>
        {fieldErr.email && (
          <p id="register-email-err" className="text-sm text-red-600" role="alert" aria-live="polite">
            {fieldErr.email}
          </p>
        )}

        <label className="block text-sm">
          Wachtwoord
          <input
            type="password"
            required
            minLength={8}
            aria-invalid={Boolean(fieldErr.password)}
            aria-describedby={fieldErr.password ? "register-password-err" : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
          />
        </label>
        {fieldErr.password && (
          <p id="register-password-err" className="text-sm text-red-600" role="alert" aria-live="polite">
            {fieldErr.password}
          </p>
        )}

        {err && (
          <p className="text-sm text-red-600" role="alert" aria-live="polite">
            {err}
          </p>
        )}
        {msg && <p className="text-sm text-green-600">{msg}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-2xl bg-midnight px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Bezig…" : "Registreren"}
        </button>
      </form>
    </main>
  );
}
export default RegisterPage;