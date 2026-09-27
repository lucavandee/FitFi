import { describe, expect, it } from "vitest";
import { isGroen, legeCellen, type Matrix } from "../poort";

const vol = (n: number): Matrix => {
  const m: Matrix = {};
  for (const g of ["male", "female"]) {
    m[g] = {};
    for (const o of ["work", "casual", "formal", "date", "travel", "sport", "party"]) {
      m[g][o] = { tot50: n, "50tot100": n, "100tot200": 0, boven200: 0 };
    }
  }
  return m;
};

describe("legeCellen", () => {
  it("kijkt alleen naar de banden tot50 en 50tot100", () => {
    expect(legeCellen(vol(3))).toEqual([]);
  });

  it("noemt elke lege cel als gender/gelegenheid/band", () => {
    const m = vol(3);
    m.female.formal.tot50 = 0;
    m.male.party["50tot100"] = 0;
    expect(legeCellen(m)).toEqual(["male/party/50tot100", "female/formal/tot50"]);
  });

  it("telt een ontbrekende cel als leeg", () => {
    const m = vol(3);
    delete m.male.work;
    expect(legeCellen(m)).toContain("male/work/tot50");
  });
});

describe("isGroen", () => {
  it("is alleen groen als de matrix vol is en de persona-run exit 0 gaf", () => {
    expect(isGroen([], { overgeslagen: false, exit_code: 0 })).toBe(true);
    expect(isGroen(["male/work/tot50"], { overgeslagen: false, exit_code: 0 })).toBe(false);
    expect(isGroen([], { overgeslagen: false, exit_code: 1 })).toBe(false);
    expect(isGroen([], { overgeslagen: true })).toBe(false);
  });
});
