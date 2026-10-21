/**
 * De anonieme dagteller (src/utils/teller.ts): een telling per gebeurtenis
 * per paginalading, niets op het apparaat, en stil als het misgaat.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
vi.mock("@/lib/supabaseClient", () => ({ supabase: () => ({ rpc }) }));

import { _vergeetTellingen, tel } from "../teller";

describe("tel", () => {
  beforeEach(() => {
    rpc.mockReset();
    rpc.mockResolvedValue({ data: null, error: null });
    _vergeetTellingen();
  });

  it("roept tel_gebeurtenis aan met de gebeurtenis", () => {
    tel("quiz_start");
    expect(rpc).toHaveBeenCalledWith("tel_gebeurtenis", { p_gebeurtenis: "quiz_start" });
  });

  it("telt een gebeurtenis maar een keer per paginalading", () => {
    tel("home");
    tel("home");
    tel("quiz_af");
    expect(rpc).toHaveBeenCalledTimes(2);
  });

  it("blijft stil als de aanroep mislukt", async () => {
    rpc.mockRejectedValue(new Error("weg"));
    expect(() => tel("home")).not.toThrow();
    await new Promise((r) => setTimeout(r, 0));
  });

  it("schrijft niets op het apparaat: geen opslag, geen cookie", () => {
    const bron = readFileSync(join(__dirname, "../teller.ts"), "utf8");
    expect(bron).not.toMatch(/localStorage|sessionStorage|document\.cookie|indexedDB/);
  });
});
