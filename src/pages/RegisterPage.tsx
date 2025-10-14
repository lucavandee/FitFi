import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  Eye, EyeOff, AlertCircle, CheckCircle2,
  Mail, Lock, User, Sparkles, Shield,
  ArrowRight, Loader2, Zap, Heart, TrendingUp
} from "lucide-react";
import Button from "@/components/ui/Button";
import Seo from "@/components/Seo";
import { useUser } from "@/context/UserContext";
import toast from "react-hot-toast";

/** Email validation */
function isEmail(v: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
}

/** Enhanced password strength calculator */
function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  score = Math.min(score, 4);

  const labels = ["Zeer zwak", "Zwak", "Oké", "Sterk", "Zeer sterk"] as const;
  const colors = ["#ef4444", "#f59e0b", "#eab308", "#22c55e", "#10b981"] as const;
  const emojis = ["😟", "😐", "🙂", "😊", "🎉"] as const;

  return {
    score,
    label: labels[score],
    color: colors[score],
    emoji: emojis[score],
    percentage: [20, 40, 60, 80, 100][score]
  };
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const pwStrength = password ? passwordStrength(password) : null;

  const emailError = touched.email && !email
    ? "E-mail is verplicht"
    : touched.email && !isEmail(email)
    ? "Voer een geldig e-mailadres in"
    : null;

  const pwError = touched.password && password.length < 8
    ? "Minimaal 8 tekens"
    : null;

  const canSubmit = isEmail(email) && password.length >= 8 && accepted && !loading;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setError(null);

    if (!canSubmit) {
      setError("Vul je gegevens correct in en accepteer de voorwaarden.");
      return;
    }

    setLoading(true);

    try {
      console.log('📝 [RegisterPage] Attempting registration for:', email);
      const success = await register(email, password, name || email.split('@')[0]);

      if (success) {
        console.log('✅ [RegisterPage] Registration successful');
        toast.success('Account aangemaakt! Je bent nu ingelogd.');

        setTimeout(() => {
          navigate('/onboarding');
        }, 500);
      } else {
        console.error('❌ [RegisterPage] Registration failed');
        setError('Er ging iets mis bij het aanmaken van je account. Probeer het opnieuw.');
        toast.error('Account aanmaken mislukt');
      }
    } catch (err) {
      console.error('❌ [RegisterPage] Registration exception:', err);
      setError('Er is een fout opgetreden. Controleer je internetverbinding en probeer het opnieuw.');
      toast.error('Onverwachte fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--color-bg)] to-[var(--ff-color-primary-50)] flex items-center justify-center px-4 py-12">
      <Seo
        title="Registreren — FitFi"
        description="Maak een gratis FitFi account en ontdek outfits die écht bij je passen."
        path="/registreren"
      />

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] backdrop-blur-sm border border-[var(--color-border)] rounded-full text-sm font-semibold text-[var(--ff-color-primary-600)] mb-4 shadow-sm">
            <Sparkles className="w-4 h-4" />
            Gratis account
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--ff-color-text)] mb-3">
            Start in 1 minuut
          </h1>
          <p className="text-lg text-[var(--color-text)]/70">
            Outfits die écht bij je passen
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 text-center shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mx-auto mb-2">
              <Heart className="w-5 h-5 text-[var(--ff-color-primary-700)]" />
            </div>
            <p className="text-xs font-semibold text-[var(--ff-color-text)]">Bewaar outfits</p>
          </div>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 text-center shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5 text-[var(--ff-color-primary-700)]" />
            </div>
            <p className="text-xs font-semibold text-[var(--ff-color-text)]">Verdien punten</p>
          </div>
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 text-center shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-[var(--ff-color-primary-700)]" />
            </div>
            <p className="text-xs font-semibold text-[var(--ff-color-text)]">Beter advies</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden">
          {/* Form */}
          <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">{error}</p>
                </div>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[var(--ff-color-text)] mb-2">
                Naam <span className="text-gray-400 font-normal">(optioneel)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jouw naam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-base rounded-xl border-2 border-gray-200 transition-all focus:border-[var(--ff-color-primary-600)] focus:ring-4 focus:ring-[var(--ff-color-primary-100)] outline-none"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[var(--ff-color-text)] mb-2">
                E-mailadres
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="jij@voorbeeld.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  className={`w-full pl-11 pr-4 py-3 text-base rounded-xl border-2 transition-all ${
                    emailError
                      ? "border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-100"
                      : "border-gray-200 focus:border-[var(--ff-color-primary-600)] focus:ring-4 focus:ring-[var(--ff-color-primary-100)]"
                  } outline-none`}
                  disabled={loading}
                  required
                />
              </div>
              {emailError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[var(--ff-color-text)] mb-2">
                Wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Minimaal 8 tekens"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  className={`w-full pl-11 pr-12 py-3 text-base rounded-xl border-2 transition-all ${
                    pwError
                      ? "border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-100"
                      : "border-gray-200 focus:border-[var(--ff-color-primary-600)] focus:ring-4 focus:ring-[var(--ff-color-primary-100)]"
                  } outline-none`}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label={showPw ? "Verberg wachtwoord" : "Toon wachtwoord"}
                >
                  {showPw ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password && pwStrength && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 ease-out"
                      style={{
                        width: `${pwStrength.percentage}%`,
                        backgroundColor: pwStrength.color,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium" style={{ color: pwStrength.color }}>
                      {pwStrength.label}
                    </span>
                    <span className="text-lg">{pwStrength.emoji}</span>
                  </div>
                </div>
              )}

              {pwError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {pwError}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-2 border-gray-300 text-[var(--ff-color-primary-600)] focus:ring-[var(--ff-color-primary-600)] transition-all"
                required
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                Ik ga akkoord met de{" "}
                <NavLink to="/voorwaarden" className="text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] underline font-semibold">
                  voorwaarden
                </NavLink>{" "}
                en{" "}
                <NavLink to="/privacy" className="text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] underline font-semibold">
                  privacy
                </NavLink>
                .
              </span>
            </label>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white py-3.5 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Account aanmaken...
                </>
              ) : (
                <>
                  Maak gratis account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">of</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Al een account?
              </p>
              <NavLink
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[var(--ff-color-primary-600)] text-[var(--ff-color-primary-700)] font-semibold rounded-xl hover:bg-[var(--ff-color-primary-50)] transition-all"
              >
                Log in
              </NavLink>
            </div>
          </form>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span>GDPR-compliant</span>
          </div>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-green-600" />
            <span>Veilige opslag</span>
          </div>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Geen spam</span>
          </div>
        </div>

        {/* Help Link */}
        <div className="mt-6 text-center">
          <NavLink
            to="/contact"
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Vragen? Neem contact op
          </NavLink>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
