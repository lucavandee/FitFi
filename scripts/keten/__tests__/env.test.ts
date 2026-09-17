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

  // Let op wat deze test wel en niet bewaakt (fixronde 2, bevinding 3): met
  // alleen `FOO="waarde # ..."` áls hele regel slaagt dit ook met de heel
  // oorspronkelijke, kapotte regex uit de brief (die combineerde alles in
  // één patroon en sloot "?([^"\n]*)"? toevallig quotes uit, dus een # die
  // binnen quotes staat en waarvan de sluitende quote het laatste teken van
  // de regel is, kwam daar ook goed uit). Wat deze test dus WEL bewaakt: dat
  // quote-parsing voorrang heeft over commentaar-stripping en precies tot de
  // sluitende aanhalingsteken loopt. De toegevoegde " # nu wel commentaar"
  // ná de sluitende quote maakt hem tot een echte regressiewacht tegen een
  // volledige terugval naar die oorspronkelijke regex: die faalt op zo'n
  // regel volledig (kan '\s*$' na de sluitende quote niet meer matchen) en
  // laat FOO dan stilzwijgend helemaal weg in plaats van "waarde # dit is
  // geen commentaar" te geven.
  it("laat een # binnen aanhalingstekens ongemoeid en negeert wat ná de sluitende aanhalingsteken volgt", () => {
    const uit = parseDotEnv(`FOO="waarde # dit is geen commentaar" # nu wel commentaar\n`);
    expect(uit.FOO).toBe("waarde # dit is geen commentaar");
  });

  it("laat geen \\r achter in de waarde bij een CRLF-bestand", () => {
    const uit = parseDotEnv("FOO=bar\r\n");
    expect(uit.FOO).toBe("bar");
  });

  // Fixronde 2, bevinding 1: enkele aanhalingstekens moeten symmetrisch met
  // dubbele behandeld worden. Vóór deze fix viel `'...'` op het onaangehaalde
  // pad en knipte het spatie-hekje de waarde stilzwijgend doormidden
  // ("foo # bar" -> "foo").
  it("behandelt enkele aanhalingstekens net als dubbele: een # erbinnen is geen commentaar", () => {
    const uit = parseDotEnv(`KEY='foo # bar'\n`);
    expect(uit.KEY).toBe("foo # bar");
  });

  // Fixronde 2, bevinding 2: een niet-afgesloten aanhalingsteken wordt
  // geweigerd in plaats van geraden. Vóór deze fix bleef de openende `"`
  // stilzwijgend in de waarde staan ('"unterminated' in plaats van een fout).
  it("weigert een niet-afgesloten aanhalingsteken in plaats van de waarde af te kappen of te raden", () => {
    expect(() => parseDotEnv('KEY="geheime-waarde-xyz\n')).toThrow(/KEY/);
  });

  it("noemt in die foutmelding nooit de waarde zelf", () => {
    expect(() => parseDotEnv('KEY="geheime-waarde-xyz\n')).not.toThrow(/geheime-waarde-xyz/);
  });

  // Fixronde 3: ná de sluitende aanhalingsteken mag alleen witruimte en
  // eventueel commentaar staan. Vóór deze fix negeerde ontleedWaarde()
  // alles ná de sluitende quote, dus KEY="foo" BAR="baz" gaf stilzwijgend
  // alleen { KEY: "foo" } terug: BAR bestond dan gewoon niet, zonder
  // melding. Dat is precies het geval waarbij iemand denkt twee variabelen
  // op één regel te zetten en er stilzwijgend maar één krijgt.
  it("weigert tekst na de sluitende aanhalingsteken die geen commentaar is, ook een tweede KEY= op dezelfde regel", () => {
    expect(() => parseDotEnv('KEY="foo" BAR="baz"\n')).toThrow(/KEY/);
    expect(() => parseDotEnv('KEY="foo"rommel\n')).toThrow(/KEY/);
    expect(() => parseDotEnv('KEY="foo" rommel\n')).toThrow(/KEY/);
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
