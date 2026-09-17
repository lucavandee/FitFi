import { describe, expect, it } from "vitest";
import { leesEnv, parseDotEnv } from "../env";

describe("parseDotEnv", () => {
  it("leest KEY=waarde, met en zonder aanhalingstekens, en slaat commentaar over", () => {
    const uit = parseDotEnv(`# commentaar\nSUPABASE_URL="https://x.supabase.co"\nFOO=bar\n\nlower=nee\n`);
    expect(uit).toEqual({ SUPABASE_URL: "https://x.supabase.co", FOO: "bar" });
  });
});

describe("leesEnv", () => {
  it("geeft de drie sleutels terug en valt terug op VITE_SUPABASE_URL", () => {
    const uit = leesEnv({
      VITE_SUPABASE_URL: "https://x.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "sleutel",
      ANTHROPIC_API_KEY: "sk-ant",
    });
    expect(uit.SUPABASE_URL).toBe("https://x.supabase.co");
    expect(uit.SUPABASE_SERVICE_ROLE_KEY).toBe("sleutel");
    expect(uit.ANTHROPIC_API_KEY).toBe("sk-ant");
  });

  it("noemt alleen de namen van wat ontbreekt, nooit waarden", () => {
    expect(() => leesEnv({ SUPABASE_URL: "https://x.supabase.co" })).toThrow(
      "Ontbrekende omgevingsvariabelen: SUPABASE_SERVICE_ROLE_KEY"
    );
  });

  it("laat ANTHROPIC_API_KEY optioneel als je dat vraagt", () => {
    const uit = leesEnv({ SUPABASE_URL: "u", SUPABASE_SERVICE_ROLE_KEY: "k" }, { anthropic: false });
    expect(uit.ANTHROPIC_API_KEY).toBeUndefined();
  });
});
