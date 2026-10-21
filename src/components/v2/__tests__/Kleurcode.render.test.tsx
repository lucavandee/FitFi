/**
 * De kleurcode (src/components/v2/Kleurcode.tsx): een balk per kleur, een
 * naam voor schermlezers, en een rand zodat wit of zwart niet in de
 * ondergrond verdwijnt.
 */
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Kleurcode } from "../Kleurcode";

const kleuren = [
  { hex: "#FFFFFF", naam: "Zuiver wit" },
  { hex: "#000000", naam: "Zwart" },
  { hex: "#6A1B4D", naam: "Bourgogne" },
];

describe("Kleurcode", () => {
  it("noemt de kleuren voor schermlezers", () => {
    const html = renderToString(<Kleurcode kleuren={kleuren} />);
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Kleurcode: zuiver wit, zwart, bourgogne"');
  });

  it("tekent een balk per kleur, de basis breder dan de accenten", () => {
    const html = renderToString(<Kleurcode kleuren={kleuren} />);
    expect(html.match(/background-color/g)).toHaveLength(3);
    expect(html).toMatch(/background-color:#FFFFFF;flex-grow:3/);
    expect(html).toMatch(/background-color:#6A1B4D;flex-grow:2/);
  });

  it("heeft een rand die bij de ondergrond past", () => {
    expect(renderToString(<Kleurcode kleuren={kleuren} />)).toContain("border-[#E5E5E5]");
    expect(renderToString(<Kleurcode kleuren={kleuren} rand="donker" />)).toContain("border-[#4A4A4A]");
  });
});
