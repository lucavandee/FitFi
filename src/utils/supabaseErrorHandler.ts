export default function supabaseErrorHandler(err: unknown) {
  if (import.meta.env.DEV) console.warn("[supabaseError]", err);
  return { message: "Er ging iets mis", code: "UNKNOWN" };
}