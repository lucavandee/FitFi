import { describe, expect, it } from "vitest";
import { leesStream, naarUitkomst } from "../claudeUitvoer";

const init = { type: "system", subtype: "init", model: "claude-sonnet-test", apiKeySource: "none", cwd: "/x" };
const limiet = { type: "rate_limit_event", rate_limit_info: { status: "allowed", rateLimitType: "five_hour", resetsAt: 1792626600 } };
const result = {
  type: "result",
  subtype: "success",
  is_error: false,
  result: '{"oordelen":[]}',
  duration_ms: 95000,
  num_turns: 1,
  total_cost_usd: 0.27,
  usage: { input_tokens: 10 },
  modelUsage: { "claude-sonnet-test": { outputTokens: 900 }, "claude-haiku-test": { outputTokens: 20 } },
};
const regels = (...xs: unknown[]) => xs.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join("\n");

describe("stream-uitvoer van claude -p", () => {
  it("haalt model, betaalroute, limieten en het resultaat eruit", () => {
    const s = leesStream(regels(init, { type: "assistant", message: {} }, limiet, result));
    expect(s.model).toBe("claude-sonnet-test");
    expect(s.apiKeySource).toBe("none");
    expect(s.rateLimits).toEqual([limiet.rate_limit_info]);
    expect(s.result?.result).toBe('{"oordelen":[]}');
    expect(s.overigeTekst).toBe("");
  });

  it("neemt het model uit modelUsage als init ontbreekt: het model met de meeste uitvoer", () => {
    expect(leesStream(regels(result)).model).toBe("claude-sonnet-test");
  });

  it("bewaart tekst die geen JSON is, voor de limietherkenning", () => {
    const s = leesStream("You've hit your limit · resets 4am (Europe/Amsterdam)\n");
    expect(s.result).toBeNull();
    expect(s.overigeTekst).toContain("hit your limit");
  });

  it("maakt een geslaagde uitkomst met de cijfers van de aanroep", () => {
    const u = naarUitkomst(leesStream(regels(init, result)), { stderr: "", timeout: false, onderbroken: false, exitFout: false });
    expect(u).toMatchObject({ ok: true, tekst: '{"oordelen":[]}', model: "claude-sonnet-test", duration_ms: 95000, total_cost_usd: 0.27, num_turns: 1, timeout: false });
  });

  it("maakt van een fout resultaat een mislukte uitkomst met de fouttekst", () => {
    const fout = { ...result, is_error: true, result: "API Error: 529 overloaded" };
    const u = naarUitkomst(leesStream(regels(init, fout)), { stderr: "", timeout: false, onderbroken: false, exitFout: true });
    expect(u.ok).toBe(false);
    expect(u.tekst).toContain("529 overloaded");
  });

  it("geeft bij een exitcode zonder resultaat de losse tekst en stderr terug", () => {
    const u = naarUitkomst(leesStream("You've hit your limit · resets 4am (Europe/Amsterdam)"), { stderr: "", timeout: false, onderbroken: false, exitFout: true });
    expect(u.ok).toBe(false);
    expect(u.tekst).toContain("hit your limit");
  });

  it("meldt een time-out en een onderbreking als zodanig", () => {
    expect(naarUitkomst(leesStream(""), { stderr: "", timeout: true, onderbroken: false, exitFout: true, timeoutMs: 360000 })).toMatchObject({ ok: false, timeout: true, tekst: "time-out na 360 s" });
    expect(naarUitkomst(leesStream(""), { stderr: "", timeout: false, onderbroken: true, exitFout: true })).toMatchObject({ ok: false, timeout: false, tekst: "onderbroken" });
  });

  it("noemt een resultaat zonder fout maar zonder tekst mislukt", () => {
    const leeg = { ...result, result: undefined };
    expect(naarUitkomst(leesStream(regels(init, leeg)), { stderr: "", timeout: false, onderbroken: false, exitFout: false }).ok).toBe(false);
  });
});
