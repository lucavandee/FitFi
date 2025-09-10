/**
 * Lightweight telemetry helper met veilige fallbacks.
 * - Named export `track` (vereist door diverse pages)
 * - Optionele helpers: `identify`, `setContext`
 * - Geen externe deps; werkt ook zonder CMP/analytics
 */

export type TelemetryProps = Record<string, unknown>;

type ExternalAnalytics =
  | ((...args: any[]) => void) // bv. gtag
  | {
      track?: (name: string, props?: TelemetryProps) => void;
      identify?: (id: string, traits?: TelemetryProps) => void;
    };

let userId: string | null = null;
let context: TelemetryProps = {};

function nowISO() {
  return new Date().toISOString();
}

function emitBrowserEvent(name: string, detail: any) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  try {
    document.dispatchEvent(new CustomEvent(name, { detail }));
  } catch {
    // ignore
  }
}

function tryExternalTrack(name: string, props?: TelemetryProps) {
  if (typeof window === "undefined") return false;

  // 1) gtag-style
  const gtag = (window as any).gtag as ExternalAnalytics | undefined;
  if (typeof gtag === "function") {
    try {
      (gtag as Function)("event", name, props ?? {});
      return true;
    } catch {
      /* ignore */
    }
  }

  // 2) generic analytics object met .track
  const analytics = (window as any).analytics as ExternalAnalytics | undefined;
  if (analytics && typeof (analytics as any).track === "function") {
    try {
      (analytics as any).track(name, props ?? {});
      return true;
    } catch {
      /* ignore */
    }
  }

  // 3) postMessage naar parent (bij embed/preview)
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        { type: "fitfi:track", name, props: props ?? {}, ts: nowISO() },
        "*"
      );
      return true;
    }
  } catch {
    /* ignore */
  }

  return false;
}

/**
 * Named export die overal gebruikt kan worden.
 * Valt terug op console.debug + CustomEvent wanneer geen analytics aanwezig is.
 */
export function track(name: string, props?: TelemetryProps): void {
  const payload = {
    ...context,
    ...(props ?? {}),
    userId: userId ?? undefined,
    ts: nowISO(),
  };

  const sent = tryExternalTrack(name, payload);
  if (!sent) {
    // Fallback: CustomEvent voor eventuele listeners en console debug
    emitBrowserEvent("fitfi:analytics", { name, payload });
    if (import.meta?.env?.DEV) {
      // In dev tonen we het, in prod blijven we stil.
      // eslint-disable-next-line no-console
      console.debug(`[fitfi:track] ${name}`, payload);
    }
  }
}

/** Optioneel: stel (anonieme) gebruikers-id in voor scopes/traits. */
export function identify(id: string | null, traits?: TelemetryProps): void {
  userId = id;
  if (traits && Object.keys(traits).length) {
    context = { ...context, ...traits };
  }
  // Beste poging naar externe tools
  if (typeof window !== "undefined") {
    const analytics = (window as any).analytics;
    if (analytics?.identify) {
      try {
        analytics.identify?.(id ?? "anonymous", traits ?? {});
      } catch {
        /* ignore */
      }
    }
  }
}

/** Optioneel: context (session/page) toevoegen aan alle events. */
export function setContext(additional: TelemetryProps): void {
  context = { ...context, ...additional };
}

/** Convenience default export voor brede compatibiliteit. */
const telemetry = { track, identify, setContext };
export default telemetry;