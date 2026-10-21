import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { leesSleutel } from "../sleutel";

const map = mkdtempSync(join(tmpdir(), "sleutel-"));
afterAll(() => rmSync(map, { recursive: true, force: true }));

function bestand(naam: string, inhoud: string, rechten: number): string {
  const pad = join(map, naam);
  writeFileSync(pad, inhoud);
  chmodSync(pad, rechten);
  return pad;
}

describe("de API-sleutel", () => {
  it("leest een sleutel die alleen voor de eigenaar leesbaar is", () => {
    expect(leesSleutel(bestand("goed", "sk-ant-test\n", 0o600))).toBe("sk-ant-test");
  });

  it("weigert een bestand dat anderen kunnen lezen, zonder de sleutel te noemen", () => {
    expect(() => leesSleutel(bestand("open", "sk-ant-geheim", 0o644))).toThrow(/chmod 600/);
    expect(() => leesSleutel(bestand("open2", "sk-ant-geheim", 0o644))).not.toThrow(/geheim/);
  });

  it("weigert iets wat geen Anthropic-sleutel is, en een ontbrekend bestand", () => {
    expect(() => leesSleutel(bestand("raar", "hallo", 0o600))).toThrow(/geen Anthropic-sleutel/);
    expect(() => leesSleutel(join(map, "bestaat-niet"))).toThrow(/Geen sleutel/);
  });
});
