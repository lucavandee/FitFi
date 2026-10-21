/**
 * De uitvoer van `claude -p --output-format stream-json --verbose` lezen. Puur;
 * het starten van het proces gebeurt in scripts/keten/claudeStream.ts.
 *
 * Waarom de stream en niet `--output-format json`: de stream begint met een
 * init-regel die zegt welk model er echt draait (achter de alias "sonnet" kan
 * een ander model komen) en hoe er betaald wordt (apiKeySource: abonnement of
 * API-sleutel), en geeft onderweg de stand van de limieten. Het resultaat aan
 * het eind is hetzelfde object als bij json.
 */

export interface ClaudeResultaat {
  is_error?: boolean;
  subtype?: string;
  result?: string;
  total_cost_usd?: number;
  duration_ms?: number;
  num_turns?: number;
  usage?: unknown;
  modelUsage?: Record<string, { outputTokens?: number } & Record<string, unknown>>;
  [key: string]: unknown;
}

export interface StreamUitslag {
  result: ClaudeResultaat | null;
  /** Uit de init-regel, of anders het model met de meeste uitvoer in modelUsage. */
  model: string | null;
  apiKeySource: string | null;
  rateLimits: unknown[];
  /** Een limiet die de aanroep weigerde: status rejected in de stream, of HTTP 429. */
  afgewezen: boolean;
  /** Regels die geen JSON zijn, zoals een limietmelding in platte tekst. */
  overigeTekst: string;
}

export function leesStream(stdout: string): StreamUitslag {
  let result: ClaudeResultaat | null = null;
  let model: string | null = null;
  let apiKeySource: string | null = null;
  const rateLimits: unknown[] = [];
  let afgewezen = false;
  const overig: string[] = [];
  for (const regel of String(stdout ?? "").split("\n")) {
    const r = regel.trim();
    if (!r) continue;
    let ev: Record<string, unknown>;
    try {
      ev = JSON.parse(r);
    } catch {
      overig.push(r);
      continue;
    }
    if (ev.type === "system" && ev.subtype === "init") {
      if (typeof ev.model === "string") model = ev.model;
      if (typeof ev.apiKeySource === "string") apiKeySource = ev.apiKeySource;
    } else if (ev.type === "rate_limit_event") {
      const info = (ev.rate_limit_info ?? ev) as { status?: unknown };
      rateLimits.push(info);
      if (info.status === "rejected") afgewezen = true;
    } else if (ev.type === "result") {
      result = ev as ClaudeResultaat;
      if (result.api_error_status === 429) afgewezen = true;
    }
  }
  if (!model && result?.modelUsage) {
    const [hoofd] = Object.entries(result.modelUsage).sort((a, b) => (b[1]?.outputTokens ?? 0) - (a[1]?.outputTokens ?? 0));
    if (hoofd) model = hoofd[0];
  }
  return { result, model, apiKeySource, rateLimits, afgewezen, overigeTekst: overig.join("\n") };
}

/** Wat de nacht van een aanroep wil weten. */
export interface AanroepUitkomst {
  /** Er is een resultaat zonder is_error en met tekst. */
  ok: boolean;
  /** Het antwoord van de agent, of bij een fout alles wat er aan tekst is. */
  tekst: string;
  timeout: boolean;
  model: string | null;
  apiKeySource: string | null;
  duration_ms: number | null;
  total_cost_usd: number | null;
  usage: unknown;
  modelUsage: unknown;
  num_turns: number | null;
  rateLimits: unknown[];
  /** De aanroep liep op een limiet, ook als de tekst dat niet zegt. */
  afgewezen: boolean;
}

export function naarUitkomst(
  s: StreamUitslag,
  p: { stderr: string; timeout: boolean; onderbroken: boolean; exitFout: boolean; timeoutMs?: number }
): AanroepUitkomst {
  const r = s.result;
  const basis = {
    model: s.model,
    apiKeySource: s.apiKeySource,
    duration_ms: typeof r?.duration_ms === "number" ? r.duration_ms : null,
    total_cost_usd: typeof r?.total_cost_usd === "number" ? r.total_cost_usd : null,
    usage: r?.usage ?? null,
    modelUsage: r?.modelUsage ?? null,
    num_turns: typeof r?.num_turns === "number" ? r.num_turns : null,
    rateLimits: s.rateLimits,
    afgewezen: s.afgewezen,
  };
  if (p.onderbroken) return { ...basis, ok: false, timeout: false, tekst: "onderbroken" };
  if (p.timeout) return { ...basis, ok: false, timeout: true, tekst: `time-out na ${Math.round((p.timeoutMs ?? 0) / 1000)} s` };
  const antwoord = typeof r?.result === "string" ? r.result : "";
  if (r && !r.is_error && !p.exitFout && antwoord.trim()) return { ...basis, ok: true, timeout: false, tekst: antwoord };
  // Bij error_during_execution staat de oorzaak in errors[], niet in result.
  const fouten = Array.isArray(r?.errors) ? r.errors.map(String).join("\n") : "";
  const tekst = [antwoord, fouten, s.overigeTekst, p.stderr.trim(), r?.subtype && !antwoord ? String(r.subtype) : ""].filter(Boolean).join("\n");
  return { ...basis, ok: false, timeout: false, tekst: tekst || "geen uitvoer" };
}
