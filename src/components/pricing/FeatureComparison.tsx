import React from "react";

export type Row = {
  label: string;
  starter: boolean | string;
  pro: boolean | string;
  elite: boolean | string;
};

type Props = {
  rows: Row[];
  headers?: [string, string, string, string]; // default: Functie, Starter, Pro, Elite
  caption?: string;
};

function CellValue({ v }: { v: boolean | string }) {
  if (typeof v === "boolean") {
    return (
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden
          className="inline-block h-4 w-4 rounded-full border border-[#E5E5E5]"
        >
          {/* gevuld bij true via pseudo-indicatie */}
        </span>
        <span className="sr-only">{v ? "Ja" : "Nee"}</span>
        {v ? "Ja" : "—"}
      </span>
    );
  }
  return <span>{v}</span>;
}

export default function FeatureComparison({
  rows,
  headers = ["Functie", "Starter", "Pro", "Elite"],
  caption = "Overzicht van functies per abonnement",
}: Props) {
  return (
    <div className="rounded-2xl border border-[#E5E5E5] bg-[#FFFFFF] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left">
          <caption className="sr-only">{caption}</caption>

          <thead>
            <tr className="bg-[#FFFFFF]">
              {headers.map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={[
                    "px-4 py-3 text-sm font-semibold text-[#1A1A1A]/80 border-b border-[#E5E5E5]",
                    i === 0
                      ? "lg:sticky lg:left-0 z-10 bg-[#FFFFFF]"
                      : "",
                  ].join(" ")}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E5E5E5]">
            {rows.map((r, idx) => (
              <tr
                key={idx}
                className="even:bg-[color-mix(in oklab, #FFFFFF 92%, #FAFAF8)]"
              >
                <th
                  scope="row"
                  className="px-4 py-3 font-medium text-[#1A1A1A] lg:sticky lg:left-0 z-10 bg-[inherit]"
                >
                  {r.label}
                </th>
                <td className="px-4 py-3 text-[#1A1A1A]/90">
                  <CellValue v={r.starter} />
                </td>
                <td className="px-4 py-3 text-[#1A1A1A]/90">
                  <CellValue v={r.pro} />
                </td>
                <td className="px-4 py-3 text-[#1A1A1A]/90">
                  <CellValue v={r.elite} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* legenda */}
      <div className="border-t border-[#E5E5E5] px-4 py-3 text-sm text-[#1A1A1A]/60">
        ✓ = inbegrepen · — = niet van toepassing
      </div>
    </div>
  );
}