import React from "react";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

interface NewsletterSignupProps {
  variant?: "light" | "dark";
  className?: string;
}

export default function NewsletterSignup({ variant = "dark", className = "" }: NewsletterSignupProps) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("Vul een geldig e-mailadres in");
      return;
    }

    setStatus("loading");

    try {
      const { supabase } = await import("@/lib/supabase");

      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert([{
          email: email.toLowerCase().trim(),
          subscribed_at: new Date().toISOString(),
          source: "footer"
        }]);

      if (error) {
        if (error.code === "23505") {
          setStatus("success");
          setMessage("Je bent al ingeschreven!");
        } else {
          throw error;
        }
      } else {
        setStatus("success");
        setMessage("Bedankt voor je inschrijving!");
        setEmail("");
      }
    } catch (error) {
      console.error("Newsletter signup error:", error);
      setStatus("error");
      setMessage("Er ging iets mis. Probeer het opnieuw.");
    }
  };

  const isDark = variant === "dark";
  const inputBg = isDark ? "bg-white/10" : "bg-[var(--color-surface)]";
  const inputBorder = isDark ? "border-white/20" : "border-[var(--color-border)]";
  const inputText = isDark ? "text-white placeholder:text-white/60" : "text-[var(--color-text)] placeholder:text-[var(--color-text)]/60";
  const buttonBg = isDark ? "bg-white text-[var(--color-text)]" : "bg-[var(--ff-color-primary-700)] text-white";
  const buttonHover = isDark ? "hover:bg-white/90" : "hover:bg-[var(--ff-color-primary-600)]";

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <Mail className={`h-4 w-4 ${isDark ? "text-white/80" : "text-[var(--color-text)]/80"}`} aria-hidden />
        <strong className={isDark ? "text-white" : "text-[var(--color-text)]"}>
          Blijf op de hoogte
        </strong>
      </div>

      <p className={`text-sm mb-4 ${isDark ? "text-white/70" : "text-[var(--color-text)]/70"}`}>
        Ontvang tips over stijl, nieuwe features en exclusieve aanbiedingen.
      </p>

      {status === "success" ? (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="je@email.nl"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setStatus("idle");
              }}
              disabled={status === "loading"}
              className={`
                flex-1 px-4 py-2.5 rounded-xl border
                ${inputBg} ${inputBorder} ${inputText}
                focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-transparent
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              aria-label="E-mailadres voor nieuwsbrief"
              required
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className={`
                px-5 py-2.5 rounded-xl font-semibold text-sm
                ${buttonBg} ${buttonHover}
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                whitespace-nowrap
              `}
            >
              {status === "loading" ? "Bezig..." : "Inschrijven"}
            </button>
          </div>

          {status === "error" && (
            <div className="flex items-center gap-2 text-sm text-[var(--ff-color-error-600)]">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p>{message}</p>
            </div>
          )}

          <p className={`text-xs ${isDark ? "text-white/50" : "text-[var(--color-text)]/50"}`}>
            We respecteren je privacy. Uitschrijven kan altijd.
          </p>
        </form>
      )}
    </div>
  );
}
