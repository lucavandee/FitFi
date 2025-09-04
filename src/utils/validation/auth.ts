/**
 * Eenvoudige, toegankelijke validatie zonder extra dependencies.
 * 
 * Valideer e-mail en wachtwoord (min 8 tekens).
 * Lever foutmeldingen terug voor aria-live usage.
 */
export function validateEmail(email: string): string | null {
  const value = (email || "").trim();
  if (!value) return "E-mail is verplicht";
  // simpele RFC-achtige check
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  return ok ? null : "Voer een geldig e-mailadres in";
}

export function validatePassword(pwd: string, min = 8): string | null {
  const value = (pwd || "").trim();
  if (!value) return "Wachtwoord is verplicht";
  if (value.length < min) return `Wachtwoord moet minimaal ${min} tekens bevatten`;
  return null;
}