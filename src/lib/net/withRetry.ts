export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseMs = 400,
): Promise<T> {
  let attempt = 0;
  let lastErr: unknown;
  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      attempt++;
      if (attempt >= maxAttempts) break;
      const backoff = baseMs * 2 ** (attempt - 1);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastErr;
}
