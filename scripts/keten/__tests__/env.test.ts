import { describe, expect, it } from "vitest";
import { leesEnv, parseDotEnv } from "../env";

describe("parseDotEnv", () => {
  it("leest KEY=waarde, met en zonder aanhalingstekens, en slaat commentaar over", () => {
    const uit = parseDotEnv(`# commentaar\nSUPABASE_URL="https://x.supabase.co"\nFOO=bar\n\nlower=nee\n`);
    expect(uit).toEqual({ SUPABASE_URL: "https://x.supabase.co", FOO: "bar" });
  });

  it("knipt inline commentaar na witruimte, maar laat een # zonder witruimte ervoor in de waarde staan", () => {
    const uit = parseDotEnv(
      "SUPABASE_URL=https://x.supabase.co # inline commentaar\n" + "WACHTWOORD=een#wachtwoord\n"
    );
    expect(uit.SUPABASE_URL).toBe("https://x.supabase.co");
    expect(uit.WACHTWOORD).toBe("een#wachtwoord");
  });

  it("laat een # binnen aanhalingstekens ongemoeid, ook als het op commentaar lijkt", () => {
    const uit = parseDotEnv(`FOO="waarde # dit is geen commentaar"\n`);
    expect(uit.FOO).toBe("waarde # dit is geen commentaar");
  });

  it("laat geen \\r achter in de waarde bij een CRLF-bestand", () => {
    const uit = parseDotEnv("FOO=bar\r\n");
    expect(uit.FOO).toBe("bar");
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

  it("valt terug op VITE_SUPABASE_URL als SUPABASE_URL leeg is, niet alleen als hij ontbreekt", () => {
    const uit = leesEnv({
      SUPABASE_URL: "",
      VITE_SUPABASE_URL: "https://echte-waarde.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "k",
      ANTHROPIC_API_KEY: "a",
    });
    expect(uit.SUPABASE_URL).toBe("https://echte-waarde.supabase.co");
  });
});
